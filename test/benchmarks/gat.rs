const HEADER: usize = 14;
const CELL: usize = 20;

// The existing worker writes four heights and one bitmask as five LE f32s.
pub(crate) fn decode(input: &[u8], output: &mut [u8]) -> Option<()> {
    let (header, cells) = input.split_at_checked(HEADER)?;
    if &header[..4] != b"GRAT" || header[4] == 0 || header[5] > 9 {
        return None;
    }
    let width = u32::from_le_bytes(header[6..10].try_into().ok()?) as usize;
    let height = u32::from_le_bytes(header[10..14].try_into().ok()?) as usize;
    let required = width.checked_mul(height)?.checked_mul(CELL)?;
    if required == 0 || output.len() != required {
        return None;
    }
    for (source, target) in cells
        .get(..required)?
        .chunks_exact(CELL)
        .zip(output.chunks_exact_mut(CELL))
    {
        for (raw, value) in source[..16]
            .chunks_exact(4)
            .zip(target[..16].chunks_exact_mut(4))
        {
            let height = f32::from_le_bytes(raw.try_into().ok()?);
            // The JS loader multiplies as a Number before storing to Float32Array.
            value.copy_from_slice(&((f64::from(height) * 0.2) as f32).to_le_bytes());
        }
        let cell_type = u32::from_le_bytes(source[16..20].try_into().ok()?);
        let flags = match cell_type {
            0 | 2 | 4 | 6 | 0x8000_0000 | 0x8000_0002 | 0x8000_0005 | 0x8000_0006 => 10.0_f32,
            3 | 0x8000_0003 => 14.0,
            5 => 8.0,
            1 | 0x8000_0001 | 0x8000_0004 | 0x8000_0007..=0x8000_0009 => 1.0,
            _ => f32::NAN,
        };
        target[16..20].copy_from_slice(&flags.to_le_bytes());
    }
    Some(())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn fixture(width: u32, height: u32) -> Vec<u8> {
        let mut bytes = b"GRAT\x01\x02".to_vec();
        bytes.extend(width.to_le_bytes());
        bytes.extend(height.to_le_bytes());
        for value in [5.0_f32, -10.0, -0.0, 12.5] {
            bytes.extend(value.to_le_bytes());
        }
        bytes.extend(0x8000_0003_u32.to_le_bytes());
        bytes
    }

    #[test]
    fn keeps_four_heights_and_high_bit_water_flags() {
        let mut output = [0; CELL];
        assert_eq!(decode(&fixture(1, 1), &mut output), Some(()));
        for (raw, expected) in output.chunks_exact(4).zip([1.0_f32, -2.0, -0.0, 2.5, 14.0]) {
            assert_eq!(raw, expected.to_le_bytes());
        }
    }

    #[test]
    fn rejects_truncated_header_grid_and_impossible_dimensions() {
        let data = fixture(1, 1);
        let mut output = [0; CELL];
        assert_eq!(decode(&data[..13], &mut output), None);
        assert_eq!(decode(&data[..data.len() - 1], &mut output), None);
        assert_eq!(decode(&fixture(u32::MAX, u32::MAX), &mut output), None);
        assert_eq!(decode(&fixture(0, 1), &mut output), None);
        assert_eq!(decode(&data, &mut output[..19]), None);
    }
}
