use std::{
    io::{self, ErrorKind},
    net::SocketAddr,
    sync::{Arc, LazyLock},
};

use rustls::{ClientConfig, RootCertStore, pki_types::ServerName};
use tokio::{
    io::{AsyncReadExt, AsyncWriteExt},
    net::{TcpStream, lookup_host},
};
use tokio_rustls::{TlsConnector, client::TlsStream};

use crate::policy::is_public_ip;

use super::{ByteStream, Writes};

pub(super) async fn connect_tcp_unchecked(addr: SocketAddr) -> Result<TcpStream, String> {
    let stream = TcpStream::connect(addr)
        .await
        .map_err(|error| error.to_string())?;
    stream
        .set_nodelay(true)
        .map_err(|error| error.to_string())?;
    Ok(stream)
}

pub(super) async fn connect_public(host: &str, port: u16) -> Result<TcpStream, String> {
    let addresses: Vec<_> = lookup_host((host, port))
        .await
        .map_err(|error| format!("DNS lookup failed: {error}"))?
        .collect();
    if addresses.is_empty() || addresses.iter().any(|addr| !is_public_ip(addr.ip())) {
        return Err("all resolved addresses must be public unicast addresses".into());
    }
    // Connect to the exact addresses already checked, without resolving the name again.
    let mut last_error = String::new();
    for addr in addresses {
        match connect_tcp_unchecked(addr).await {
            Ok(stream) => return Ok(stream),
            Err(error) => last_error = error,
        }
    }
    Err(last_error)
}

pub(super) async fn connect_tls(host: &str, port: u16) -> Result<TlsStream<TcpStream>, String> {
    static TLS: LazyLock<TlsConnector> = LazyLock::new(|| {
        let roots = RootCertStore::from_iter(webpki_roots::TLS_SERVER_ROOTS.iter().cloned());
        TlsConnector::from(Arc::new(
            ClientConfig::builder()
                .with_root_certificates(roots)
                .with_no_client_auth(),
        ))
    });
    let server_name =
        ServerName::try_from(host.to_ascii_lowercase()).map_err(|error| error.to_string())?;
    let stream = connect_public(host, port).await?;
    TLS.connect(server_name, stream)
        .await
        .map_err(|error| format!("TLS handshake failed: {error}"))
}

pub(super) async fn run(
    stream: impl ByteStream,
    mut writes: Writes,
    on_data: impl Fn(Vec<u8>) -> Result<(), String>,
) -> Result<(), String> {
    let (mut reader, mut writer) = tokio::io::split(stream);
    let read = async {
        let mut buffer = vec![0; 64 * 1024];
        loop {
            let count = reader
                .read(&mut buffer)
                .await
                .map_err(|error| error.to_string())?;
            if count == 0 {
                return Ok(());
            }
            on_data(buffer[..count].to_vec())?;
        }
    };
    let write = async {
        while let Some(write) = writes.recv().await {
            let result = async {
                writer.write_all(&write.bytes).await?;
                writer.flush().await
            }
            .await
            .map_err(|error: io::Error| error.to_string());
            let _ = write.result.send(result.clone());
            result?;
        }
        writer
            .shutdown()
            .await
            .or_else(|error| {
                if error.kind() == ErrorKind::NotConnected {
                    Ok(())
                } else {
                    Err(error)
                }
            })
            .map_err(|error| error.to_string())
    };
    tokio::select! {
        result = read => result,
        result = write => result,
    }
}
