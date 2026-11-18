use percent_encoding::{AsciiSet, NON_ALPHANUMERIC, percent_decode_str, percent_encode};
use std::{fmt, net::IpAddr};
use url::{Host, Url};

pub const CHROME_UA: &str = "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36";
pub const OFFICIAL_ONLINE_PATH: &str = "/official/ro/Online.js";

const OFFICIAL_ONLINE_URL: &str = "https://game.lastro.cn/ro/Online.js";
const SAFE_PATH_ENCODING: &AsciiSet = &NON_ALPHANUMERIC
    .remove(b'/')
    .remove(b'-')
    .remove(b'.')
    .remove(b'_')
    .remove(b'~')
    .remove(b'!')
    .remove(b'\'')
    .remove(b'(')
    .remove(b')')
    .remove(b'*');

#[derive(Debug, PartialEq)]
pub enum PolicyError {
    Forbidden(&'static str),
}

impl fmt::Display for PolicyError {
    fn fmt(&self, f: &mut fmt::Formatter<'_>) -> fmt::Result {
        match self {
            Self::Forbidden(reason) => f.write_str(reason),
        }
    }
}

impl std::error::Error for PolicyError {}

pub fn is_public_ip(ip: IpAddr) -> bool {
    match ip {
        IpAddr::V4(ip) => {
            let [a, b, c, _] = ip.octets();
            !ip.is_private()
                && !ip.is_loopback()
                && !ip.is_link_local()
                && !ip.is_documentation()
                && !matches!(
                    (a, b, c),
                    (0 | 224..=255, _, _)
                        | (100, 64..=127, _)
                        | (192, 0, 0)
                        | (192, 88, 99)
                        | (198, 18..=19, _)
                )
        }
        IpAddr::V6(ip) => {
            if let Some(mapped) = ip.to_ipv4_mapped() {
                return is_public_ip(IpAddr::V4(mapped));
            }

            // Global unicast, excluding special-purpose, documentation and 6to4 prefixes.
            let [a, b, ..] = ip.segments();
            matches!(a, 0x2000..=0x3fff)
                && !matches!(
                    (a, b),
                    (0x2001, 0..=0x01ff | 0x0db8) | (0x2002, _) | (0x3fff, 0..=0x0fff)
                )
        }
    }
}

fn is_dns_name(host: &str) -> bool {
    !host.is_empty()
        && host.len() <= 253
        && host.split('.').all(|label| {
            !label.is_empty()
                && label.len() <= 63
                && !label.starts_with('-')
                && !label.ends_with('-')
                && label
                    .bytes()
                    .all(|byte| byte.is_ascii_alphanumeric() || byte == b'-')
        })
}

pub fn validate_tcp_target(host: &str, port: u16) -> Result<(), PolicyError> {
    let forbidden = PolicyError::Forbidden("TCP requires a public host and nonzero port");
    if port == 0 {
        return Err(forbidden);
    }
    if let Ok(address) = host.parse::<IpAddr>() {
        return if is_public_ip(address) {
            Ok(())
        } else {
            Err(forbidden)
        };
    }

    let host = host.strip_suffix('.').unwrap_or(host);
    let last_label = host.rsplit('.').next().unwrap_or_default();
    if !is_dns_name(host)
        || ["localhost", "local", "internal"].iter().any(|suffix| last_label.eq_ignore_ascii_case(suffix))
        // Host::parse distinguishes ordinary DNS names from alternate IPv4 literal forms.
        || !matches!(Host::parse(host), Ok(Host::Domain(_)))
    {
        return Err(forbidden);
    }
    Ok(())
}

pub fn validate_tls_target(host: &str, port: u16) -> Result<(), PolicyError> {
    if port == 443 && host.eq_ignore_ascii_case("game.lastro.cn") {
        return Ok(());
    }
    Err(PolicyError::Forbidden(
        "TLS requires the official login host",
    ))
}

#[derive(Debug, PartialEq)]
pub struct RelayTarget {
    pub url: String,
    pub target_host: String,
    pub target_port: u16,
}

pub fn validate_relay_url(value: &str) -> Result<RelayTarget, PolicyError> {
    let invalid = || PolicyError::Forbidden("relay requires an official WSS URL and public target");
    if value
        .bytes()
        .any(|byte| byte.is_ascii_control() || matches!(byte, b' ' | b'\\' | b'?' | b'#' | b'%'))
    {
        return Err(invalid());
    }
    let (_, remainder) = value.split_once("://").ok_or_else(invalid)?;
    let (authority, route) = remainder.split_once('/').ok_or_else(invalid)?;
    if authority.contains('@') || route.contains('/') {
        return Err(invalid());
    }
    let url = Url::parse(value).map_err(|_| invalid())?;
    let hostname = url.host_str().ok_or_else(invalid)?;
    if url.scheme() != "wss"
        || !(hostname == "lastro.cn" || hostname.ends_with(".lastro.cn"))
        || !is_dns_name(hostname)
        || url.port() == Some(0)
    {
        return Err(invalid());
    }

    let (host, port) = route.rsplit_once(':').ok_or_else(invalid)?;
    if port.is_empty() || !port.bytes().all(|byte| byte.is_ascii_digit()) {
        return Err(invalid());
    }
    let target_port = port.parse::<u16>().map_err(|_| invalid())?;
    let target_host = if let Some(address) = host
        .strip_prefix('[')
        .and_then(|host| host.strip_suffix(']'))
    {
        address
            .parse::<std::net::Ipv6Addr>()
            .map_err(|_| invalid())?;
        address
    } else {
        if host.contains(':') {
            return Err(invalid());
        }
        host
    };
    validate_tcp_target(target_host, target_port)?;
    Ok(RelayTarget {
        url: url.into(),
        target_host: target_host.to_owned(),
        target_port,
    })
}

fn valid_resource_segment(segment: &[u8]) -> bool {
    if segment.iter().all(|byte| matches!(byte, b'.' | b' ')) {
        return false;
    }
    if !segment.contains(&b'\\') {
        return true;
    }

    // GBK and Big5 may use 0x5C as a multibyte trail. Preserve it as an escape,
    // while checking for dot segments even if an upstream treats it as a separator.
    if std::str::from_utf8(segment).is_ok()
        || segment
            .split(|&byte| byte == b'\\')
            .any(|part| matches!(part.trim_ascii_end(), b"." | b".."))
    {
        return false;
    }
    let mut bytes = segment.iter().copied().peekable();
    while let Some(byte) = bytes.next() {
        if byte == b'\\' {
            return false;
        }
        if (0x81..=0xfe).contains(&byte) && matches!(bytes.peek(), Some(0x40..=0x7e | 0x80..=0xfe))
        {
            bytes.next();
        }
    }
    true
}

fn passive_extension(path: &[u8]) -> bool {
    let filename = path.rsplit(|&byte| byte == b'/').next().unwrap_or_default();
    let Some(dot) = filename.iter().rposition(|&byte| byte == b'.') else {
        return false;
    };
    let extension = &filename[dot + 1..];
    // Keep in sync with src/resources/resource-policy.ts.
    [
        "gat", "gnd", "rsw", "rsm", "rsm2", "str", "spr", "act", "gr2", "bmp", "tga", "png", "jpg",
        "jpeg", "gif", "webp", "dds", "mp3", "wav", "ogg", "opus", "flac", "pal", "txt", "xml",
        "csv", "bson", "otf", "ttf",
    ]
    .iter()
    .any(|allowed| extension.eq_ignore_ascii_case(allowed.as_bytes()))
}

pub fn resolve_lro_path(raw_path: &str) -> Result<String, PolicyError> {
    if raw_path == OFFICIAL_ONLINE_PATH {
        return Ok(OFFICIAL_ONLINE_URL.to_owned());
    }
    let forbidden = || PolicyError::Forbidden("resource path is forbidden");
    let path = raw_path
        .strip_prefix('/')
        .ok_or_else(forbidden)?
        .replace('\\', "/");
    // Also accept convertFileSrc's wholly encoded path, without allowing mixed separators.
    if path.contains('/')
        && path
            .as_bytes()
            .windows(3)
            .any(|part| part.eq_ignore_ascii_case(b"%2f"))
    {
        return Err(forbidden());
    }
    // Some filenames use legacy byte encodings. Decode once for validation without a UTF-8 conversion.
    let bytes: Vec<u8> = percent_decode_str(&path).collect();
    if bytes
        .iter()
        .any(|&byte| byte.is_ascii_control() || matches!(byte, b':' | b'%' | b'?' | b'#' | b';'))
        || !bytes
            .split(|&byte| byte == b'/')
            .all(valid_resource_segment)
    {
        return Err(forbidden());
    }
    let mut parts = bytes.splitn(2, |&byte| byte == b'/');
    let root = match parts.next() {
        Some(b"lastro") => "https://game.lastro.cn/ro/client_re/",
        Some(b"rodata") => "https://rodata.ltsd.ro/ro/client_re/",
        _ => return Err(forbidden()),
    };
    let path = parts
        .next()
        .filter(|path| passive_extension(path))
        .ok_or_else(forbidden)?;
    Ok(format!(
        "{root}{}",
        percent_encode(path, SAFE_PATH_ENCODING)
    ))
}

#[cfg(test)]
mod tests {
    use super::*;
    use std::net::IpAddr;

    #[test]
    fn tcp_requires_a_public_unicast_address_or_valid_dns_name() {
        for (host, port) in [
            ("103.8.222.164", 26569),
            ("2606:4700::1111", 443),
            ("login.lastro.cn", 443),
        ] {
            assert_eq!(validate_tcp_target(host, port), Ok(()), "{host}:{port}");
        }
        for (host, port) in [
            ("127.0.0.1", 80),
            ("10.0.0.5", 80),
            ("192.168.1.2", 80),
            ("172.16.0.1", 80),
            ("169.254.1.1", 80),
            ("224.0.0.1", 80),
            ("::1", 80),
            ("localhost", 80),
            ("x.localhost", 80),
            ("x.local", 80),
            ("x.InTeRnAl.", 80),
            ("1.2.3.4", 0),
            ("0177.0.0.1", 80),
            ("2130706433", 80),
            ("user@host.net", 80),
            (" x.com", 80),
        ] {
            assert!(validate_tcp_target(host, port).is_err(), "{host}:{port}");
        }
    }

    #[test]
    fn address_filter_also_applies_to_resolved_addresses() {
        for address in [
            "0.0.0.0",
            "100.64.0.1",
            "192.0.2.1",
            "198.18.0.1",
            "255.255.255.255",
            "::",
            "::ffff:127.0.0.1",
            "fc00::1",
            "fe80::1",
            "ff00::1",
            "2001:db8::1",
            "3fff::1",
            "2002::1",
        ] {
            assert!(
                !is_public_ip(address.parse::<IpAddr>().unwrap()),
                "{address}"
            );
        }
        assert!(is_public_ip("::ffff:103.8.222.164".parse().unwrap()));
    }

    #[test]
    fn tls_targets_only_the_official_login_host() {
        for host in ["game.lastro.cn", "GAME.LASTRO.CN"] {
            assert_eq!(validate_tls_target(host, 443), Ok(()));
        }
        for (host, port) in [
            ("game.lastro.cn", 8443),
            ("evil.com", 443),
            ("game.lastro.cn.evil.com", 443),
        ] {
            assert!(validate_tls_target(host, port).is_err(), "{host}:{port}");
        }
    }

    #[test]
    fn relay_requires_the_official_domain_and_a_valid_target() {
        let url = "wss://port.lastro.cn/103.8.222.164:26569";
        let target = validate_relay_url(url).unwrap();
        assert_eq!(target.url, url);
        assert_eq!(target.target_host, "103.8.222.164");
        assert_eq!(target.target_port, 26569);
        let target = validate_relay_url("wss://lastro.cn/[2606:4700::1111]:65535").unwrap();
        assert_eq!(target.target_host, "2606:4700::1111");
        assert_eq!(target.target_port, 65535);
        for url in [
            "ws://port.lastro.cn/1.2.3.4:1",
            "wss://evil.com/1.2.3.4:1",
            "wss://evillastro.cn/1.2.3.4:1",
            "wss://port.lastro.cn.evil.com/1.2.3.4:1",
            "wss://user:pw@port.lastro.cn/1.2.3.4:1",
            "wss://@port.lastro.cn/1.2.3.4:1",
            "wss://port.lastro.cn/1.2.3.4:1?x=1",
            "wss://port.lastro.cn/1.2.3.4:1#",
            "wss://port.lastro.cn/1.2.3.4:0",
            "wss://port.lastro.cn/1.2.3.4:99999",
            "wss://port.lastro.cn/1.2.3.4:+1",
            "wss://port.lastro.cn/127.0.0.1:1",
            "wss://port.lastro.cn/./1.2.3.4:1",
            "wss://port.lastro.cn/../1.2.3.4:1",
            "wss://port.lastro.cn/a%2Fb:1",
        ] {
            assert!(validate_relay_url(url).is_err(), "{url}");
        }
    }

    #[test]
    fn resource_paths_map_to_fixed_origins_and_preserve_legacy_bytes() {
        for (path, upstream) in [
            (
                "/lastro/data/clientinfo.xml",
                "https://game.lastro.cn/ro/client_re/data/clientinfo.xml",
            ),
            (
                "/lastro%2Fdata%2Fclientinfo.xml",
                "https://game.lastro.cn/ro/client_re/data/clientinfo.xml",
            ),
            (
                "/rodata/data/sprite/a.spr",
                "https://rodata.ltsd.ro/ro/client_re/data/sprite/a.spr",
            ),
            (
                "/official/ro/Online.js",
                "https://game.lastro.cn/ro/Online.js",
            ),
            (
                "/lastro/data/%A4%5C/%B0%A1.spr",
                "https://game.lastro.cn/ro/client_re/data/%A4%5C/%B0%A1.spr",
            ),
            (
                "/rodata/data/%E8%A3%9D%E5%82%99%20A.BMP",
                "https://rodata.ltsd.ro/ro/client_re/data/%E8%A3%9D%E5%82%99%20A.BMP",
            ),
        ] {
            assert_eq!(resolve_lro_path(path).unwrap(), upstream);
        }
    }

    #[test]
    fn resource_paths_reject_traversal_ambiguity_and_executable_formats() {
        for path in [
            "/nope/x.spr",
            "/lastro/../x.spr",
            "/lastro/%2e%2e/x.spr",
            "/lastro/a%252e%252e/x.spr",
            "/lastro/data//x.spr",
            r"/lastro/data\..\x.spr",
            "/lastro/data/x.spr%00",
            "/lastro/data/%7f.spr",
            "/lastro/data/a.js",
            "/lastro/data/a.wasm",
            "/lastro/data/a.lub",
            "/lastro/data/a.svg",
            "/lastro/data/noext",
            "/official/ro/other.js",
            "/official/ro/%4Fnline.js",
            "//lastro/x.spr",
            "/lastro/data/%2fx.spr",
            "/lastro/data/%5Cx.spr",
            "/lastro/data/%A4%5C%2e%2e/x.spr",
            "/lastro/data/%C2%80%5Cx.spr",
            "/lastro/data/x%ZZ.spr",
            "/lastro/data/x.spr?test",
            "/lastro/data/x.spr%23",
            "/lastro/data/x.spr%3A",
            "/lastro/data/..%20/x.spr",
        ] {
            assert!(resolve_lro_path(path).is_err(), "{path}");
        }
    }
}
