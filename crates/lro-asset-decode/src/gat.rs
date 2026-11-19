use super::MAX_ASSET_BYTES;

const HEADER_BYTES: usize = 14;
const CELL_BYTES: usize = 20;

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum GatError {
    Header,
    Version,
    Truncated,
    Dimensions,
    OutputSize,
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub struct GatLayout {
    pub version_major: u8,
    pub version_minor: u8,
    pub width: u32,
    pub height: u32,
    pub output_bytes: usize,
}

pub fn gat_layout(input: &[u8]) -> Result<GatLayout, GatError> {
    let header = input.get(..HEADER_BYTES).ok_or(GatError::Truncated)?;
    if &header[..4] != b"GRAT" {
        return Err(GatError::Header);
    }
    if header[4] == 0 || header[5] > 9 {
        return Err(GatError::Version);
    }
    let width = u32::from_le_bytes(header[6..10].try_into().unwrap());
    let height = u32::from_le_bytes(header[10..14].try_into().unwrap());
    let output_bytes = (width as usize)
        .checked_mul(height as usize)
        .and_then(|cells| cells.checked_mul(CELL_BYTES))
        .filter(|bytes| (1..=MAX_ASSET_BYTES).contains(bytes))
        .ok_or(GatError::Dimensions)?;
    if output_bytes > input.len() - HEADER_BYTES {
        return Err(GatError::Truncated);
    }
    Ok(GatLayout {
        version_major: header[4],
        version_minor: header[5],
        width,
        height,
        output_bytes,
    })
}

/// Writes the worker's layout of four heights and one bitmask as little-endian f32s.
pub fn decode_gat(input: &[u8], output: &mut [u8]) -> Result<(), GatError> {
    let layout = gat_layout(input)?;
    if output.len() != layout.output_bytes {
        return Err(GatError::OutputSize);
    }
    let (source_cells, _) =
        input[HEADER_BYTES..HEADER_BYTES + layout.output_bytes].as_chunks::<CELL_BYTES>();
    let (target_cells, _) = output.as_chunks_mut::<CELL_BYTES>();
    for (source, target) in source_cells.iter().zip(target_cells) {
        let (heights, _) = source[..16].as_chunks::<4>();
        let (target_heights, _) = target[..16].as_chunks_mut::<4>();
        for (raw, value) in heights.iter().zip(target_heights) {
            let height = f32::from_le_bytes(*raw);
            // Match JavaScript Number multiplication followed by Float32Array rounding.
            value.copy_from_slice(&((f64::from(height) * 0.2) as f32).to_le_bytes());
        }
        let cell_type = u32::from_le_bytes(source[16..20].try_into().unwrap());
        let flags = match cell_type {
            0 | 2 | 4 | 6 | 0x8000_0000 | 0x8000_0002 | 0x8000_0005 | 0x8000_0006 => 10.0_f32,
            3 | 0x8000_0003 => 14.0,
            5 => 8.0,
            1 | 0x8000_0001 | 0x8000_0004 | 0x8000_0007..=0x8000_0009 => 1.0,
            _ => f32::NAN,
        };
        target[16..20].copy_from_slice(&flags.to_le_bytes());
    }
    Ok(())
}
