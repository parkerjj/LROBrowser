use super::MAX_ASSET_BYTES;

#[cfg(test)]
mod file_tests {
    use super::*;

    #[test]
    fn decodes_indexed_and_rgba_frames_with_the_legacy_palette() {
        let mut input = b"SP\x01\x02\x01\x00\x01\x00\x02\x00\x01\x00\x03\x00\x07\x00\x01\x01\x00\x01\x00\x11\x22\x33\x44".to_vec();
        input.extend([17; 1024]);
        let result = decode_spr(&input).unwrap();
        assert_eq!(&result[..8], b"\x01\x02\x01\x00\x01\x00\x00\x00");
        assert_eq!(&result[8..1032], &[17; 1024]);
        assert_eq!(
            &result[1032..],
            b"\x02\x00\x01\x00\x07\x00\x00\x00\x01\x00\x01\x00\x11\x22\x33\x44"
        );
        assert!(decode_spr(&input[..1033]).is_err());
    }
}

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum SprDecodeError {
    Header,
    TruncatedRun,
    TruncatedFrame,
    OutputOverflow,
}

/// Decodes a sprite file into one aligned buffer shared by the main thread and the worker.
pub fn decode_spr(input: &[u8]) -> Result<Vec<u8>, SprDecodeError> {
    let (header, mut data) = input.split_at_checked(6).ok_or(SprDecodeError::Header)?;
    if &header[..2] != b"SP" {
        return Err(SprDecodeError::Header);
    }
    let version = f64::from(header[3]) + f64::from(header[2]) / 10.0;
    let indexed = u16::from_le_bytes(header[4..6].try_into().unwrap());
    let mut rgba = 0;
    if version > 1.1 {
        let (count, remaining) = data
            .split_at_checked(2)
            .ok_or(SprDecodeError::TruncatedFrame)?;
        rgba = u16::from_le_bytes(count.try_into().unwrap());
        data = remaining;
    }
    let mut output = header[2..].to_vec();
    output.extend_from_slice(&rgba.to_le_bytes());
    output.extend_from_slice(&[0; 2]);
    if version > 1.0 {
        let (frames, palette) = data
            .split_at_checked(data.len().saturating_sub(1024))
            .filter(|(_, palette)| palette.len() == 1024)
            .ok_or(SprDecodeError::TruncatedFrame)?;
        output.extend_from_slice(palette);
        data = frames;
    }
    let indexed = usize::from(indexed);
    for index in 0..indexed + usize::from(rgba) {
        let color_frame = index >= indexed;
        if !color_frame && version >= 2.1 {
            let frame = read_frame(data)?;
            let target = append_frame(&mut output, frame.dimensions, frame.pixels)?;
            decode_indexed_rle(frame.encoded, target)?;
            data = frame.rest;
        } else {
            let (dimensions, remaining) = data
                .split_at_checked(4)
                .ok_or(SprDecodeError::TruncatedFrame)?;
            let width = u16::from_le_bytes(dimensions[..2].try_into().unwrap());
            let height = u16::from_le_bytes(dimensions[2..].try_into().unwrap());
            if color_frame && (width > i16::MAX as u16 || height > i16::MAX as u16) {
                return Err(SprDecodeError::OutputOverflow);
            }
            let length = usize::from(width)
                .checked_mul(usize::from(height))
                .and_then(|size| size.checked_mul(if color_frame { 4 } else { 1 }))
                .ok_or(SprDecodeError::OutputOverflow)?;
            let (pixels, rest) = remaining
                .split_at_checked(length)
                .ok_or(SprDecodeError::TruncatedFrame)?;
            append_frame(&mut output, dimensions, length)?.copy_from_slice(pixels);
            data = rest;
        }
    }
    Ok(output)
}

fn append_frame<'a>(
    output: &'a mut Vec<u8>,
    dimensions: &[u8],
    len: usize,
) -> Result<&'a mut [u8], SprDecodeError> {
    let start = output.len() + 4;
    let end = start
        .checked_add(len)
        .filter(|&end| end <= MAX_ASSET_BYTES)
        .ok_or(SprDecodeError::OutputOverflow)?;
    output.extend_from_slice(dimensions);
    output.resize(end.next_multiple_of(4), 0);
    Ok(&mut output[start..end])
}

struct Frame<'a> {
    dimensions: &'a [u8],
    pixels: usize,
    encoded: &'a [u8],
    rest: &'a [u8],
}

fn read_frame(input: &[u8]) -> Result<Frame<'_>, SprDecodeError> {
    let (header, remaining) = input
        .split_at_checked(6)
        .ok_or(SprDecodeError::TruncatedFrame)?;
    let width = u16::from_le_bytes(header[..2].try_into().unwrap());
    let height = u16::from_le_bytes(header[2..4].try_into().unwrap());
    let encoded_size = u16::from_le_bytes(header[4..6].try_into().unwrap());
    let (encoded, rest) = remaining
        .split_at_checked(usize::from(encoded_size))
        .ok_or(SprDecodeError::TruncatedFrame)?;
    Ok(Frame {
        dimensions: &header[..4],
        pixels: usize::from(width) * usize::from(height),
        encoded,
        rest,
    })
}

/// Size of the adapter output for an indexed section, including its offset and frame metadata.
pub fn indexed_frames_output_len(mut input: &[u8], count: usize) -> Result<usize, SprDecodeError> {
    let mut bytes = 4_usize;
    for _ in 0..count {
        let frame = read_frame(input)?;
        bytes = bytes
            .checked_add(4)
            .and_then(|bytes| bytes.checked_add(frame.pixels))
            .filter(|bytes| *bytes <= MAX_ASSET_BYTES)
            .ok_or(SprDecodeError::OutputOverflow)?;
        input = frame.rest;
    }
    Ok(bytes)
}

/// Writes an input offset followed by a packed sequence of frame dimensions and pixels.
pub fn decode_indexed_frames(
    input: &[u8],
    count: usize,
    output: &mut [u8],
) -> Result<(), SprDecodeError> {
    let (consumed, mut target) = output
        .split_at_mut_checked(4)
        .ok_or(SprDecodeError::OutputOverflow)?;
    let mut remaining = input;
    for _ in 0..count {
        let frame = read_frame(remaining)?;
        let (dimensions, rest) = target
            .split_at_mut_checked(4)
            .ok_or(SprDecodeError::OutputOverflow)?;
        let (pixels, rest) = rest
            .split_at_mut_checked(frame.pixels)
            .ok_or(SprDecodeError::OutputOverflow)?;
        dimensions.copy_from_slice(frame.dimensions);
        decode_indexed_rle(frame.encoded, pixels)?;
        target = rest;
        remaining = frame.rest;
    }
    if !target.is_empty() {
        return Err(SprDecodeError::OutputOverflow);
    }
    let byte_offset =
        u32::try_from(input.len() - remaining.len()).map_err(|_| SprDecodeError::OutputOverflow)?;
    consumed.copy_from_slice(&byte_offset.to_le_bytes());
    Ok(())
}

/// Decodes one SPR 2.1 indexed frame with zero-filled trailing pixels.
pub fn decode_indexed_rle(mut input: &[u8], output: &mut [u8]) -> Result<(), SprDecodeError> {
    output.fill(0);
    let mut position = 0;
    while let Some((&pixel, tail)) = input.split_first() {
        input = tail;
        if pixel != 0 {
            *output
                .get_mut(position)
                .ok_or(SprDecodeError::OutputOverflow)? = pixel;
            position += 1;
            continue;
        }
        let (&count, tail) = input.split_first().ok_or(SprDecodeError::TruncatedRun)?;
        input = tail;
        let run = if count == 0 { 2 } else { usize::from(count) };
        position = position
            .checked_add(run)
            .filter(|next| *next <= output.len())
            .ok_or(SprDecodeError::OutputOverflow)?;
    }
    Ok(())
}
