const HEADER_BYTES: usize = 18;
const MAX_RGBA_BYTES: usize = 64 * 1024 * 1024;

#[derive(Clone, Copy, Debug, PartialEq, Eq)]
pub enum TgaError {
    Truncated,
    UnsupportedFormat,
    InvalidDimensions,
    InvalidPalette,
    InvalidPaletteIndex,
    OutputTooLarge,
    PacketOverrun,
}

#[derive(Clone, Copy)]
enum Format {
    Indexed,
    Gray,
    GrayAlpha,
    Bgr5551,
    Bgr,
    Bgra,
}

impl Format {
    fn bytes(self) -> usize {
        match self {
            Self::Indexed | Self::Gray => 1,
            Self::GrayAlpha | Self::Bgr5551 => 2,
            Self::Bgr => 3,
            Self::Bgra => 4,
        }
    }

    fn to_rgba(self, pixel: &[u8], palette: &[u8]) -> Result<[u8; 4], TgaError> {
        let alpha = 255;
        Ok(match self {
            Self::Indexed => {
                // The existing client treats indices as relative to the supplied palette.
                let index = usize::from(pixel[0]) * 3;
                let palette = palette
                    .get(index..index + 3)
                    .ok_or(TgaError::InvalidPaletteIndex)?;
                [palette[2], palette[1], palette[0], alpha]
            }
            Self::Gray => [pixel[0], pixel[0], pixel[0], alpha],
            Self::GrayAlpha => [pixel[0], pixel[0], pixel[0], pixel[1]],
            Self::Bgr5551 => {
                let packed = u16::from_le_bytes([pixel[0], pixel[1]]);
                // Preserve 5-bit channel scaling and the flag-independent alpha bit.
                let channel = |shift| (((packed >> shift) & 31_u16) << 3) as u8;
                let alpha = if packed & 0x8000 == 0 { 0 } else { 255 };
                [channel(10), channel(5), channel(0), alpha]
            }
            Self::Bgr => [pixel[2], pixel[1], pixel[0], alpha],
            Self::Bgra if pixel[..3] == [255, 0, 255] => [0; 4],
            Self::Bgra => [pixel[2], pixel[1], pixel[0], pixel[3]],
        })
    }
}

struct Image<'a> {
    width: usize,
    height: usize,
    right_origin: bool,
    top_origin: bool,
    compressed: bool,
    format: Format,
    palette: &'a [u8],
    data: &'a [u8],
}

impl<'a> Image<'a> {
    fn parse(input: &'a [u8]) -> Result<Self, TgaError> {
        let (header, payload) = input
            .split_at_checked(HEADER_BYTES)
            .ok_or(TgaError::Truncated)?;
        let (format, compressed) = match (header[2], header[16]) {
            (1 | 9, 8) => (Format::Indexed, header[2] == 9),
            (2 | 10, 16) => (Format::Bgr5551, header[2] == 10),
            (2 | 10, 24) => (Format::Bgr, header[2] == 10),
            (2 | 10, 32) => (Format::Bgra, header[2] == 10),
            (3 | 11, 8) => (Format::Gray, header[2] == 11),
            (3 | 11, 16) => (Format::GrayAlpha, header[2] == 11),
            _ => return Err(TgaError::UnsupportedFormat),
        };
        let width = u16::from_le_bytes([header[12], header[13]]) as usize;
        let height = u16::from_le_bytes([header[14], header[15]]) as usize;
        if width == 0 || height == 0 {
            return Err(TgaError::InvalidDimensions);
        }
        let palette_size = if matches!(format, Format::Indexed) {
            let entries = u16::from_le_bytes([header[5], header[6]]) as usize;
            if header[1] != 1 || header[7] != 24 || !(1..=256).contains(&entries) {
                return Err(TgaError::InvalidPalette);
            }
            entries * 3
        } else {
            if header[1] != 0 {
                return Err(TgaError::InvalidPalette);
            }
            0
        };
        let payload = payload
            .get(usize::from(header[0])..)
            .ok_or(TgaError::Truncated)?;
        let (palette, data) = payload
            .split_at_checked(palette_size)
            .ok_or(TgaError::Truncated)?;
        Ok(Self {
            width,
            height,
            right_origin: header[17] & 16 != 0,
            top_origin: header[17] & 32 != 0,
            format,
            compressed,
            palette,
            data,
        })
    }

    fn decode(self) -> Result<Vec<u8>, TgaError> {
        let pixel_count = self.width * self.height; // Both dimensions are u16.
        let byte_count = pixel_count
            .checked_mul(4)
            .filter(|&n| n <= MAX_RGBA_BYTES)
            .ok_or(TgaError::OutputTooLarge)?;
        let stride = self.format.bytes();
        let min_input = if self.compressed {
            pixel_count.div_ceil(128) * (stride + 1)
        } else {
            pixel_count * stride
        };
        if self.data.len() < min_input {
            return Err(TgaError::Truncated);
        }
        let mut output = Vec::new();
        output
            .try_reserve_exact(8 + byte_count)
            .map_err(|_| TgaError::OutputTooLarge)?;
        output.extend((self.width as u32).to_le_bytes());
        output.extend((self.height as u32).to_le_bytes());
        output.resize(8 + byte_count, 0);

        let mut writer = PixelWriter {
            image: &self,
            rgba: &mut output[8..],
            position: 0,
        };
        if self.compressed {
            writer.decode_rle(pixel_count)?;
        } else {
            writer.write_literal(&self.data[..min_input])?;
        }
        Ok(output)
    }
}

struct PixelWriter<'a> {
    image: &'a Image<'a>,
    rgba: &'a mut [u8],
    position: usize,
}

impl PixelWriter<'_> {
    fn write(&mut self, rgba: [u8; 4]) {
        let Image {
            width,
            height,
            right_origin,
            top_origin,
            ..
        } = *self.image;
        let x = self.position % width;
        let y = self.position / width;
        let x = if right_origin { width - 1 - x } else { x };
        let y = if top_origin { y } else { height - 1 - y };
        let destination = (y * width + x) * 4;
        self.rgba[destination..destination + 4].copy_from_slice(&rgba);
        self.position += 1;
    }

    fn write_literal(&mut self, data: &[u8]) -> Result<(), TgaError> {
        let format = self.image.format;
        for pixel in data.chunks_exact(format.bytes()) {
            self.write(format.to_rgba(pixel, self.image.palette)?);
        }
        Ok(())
    }

    fn decode_rle(&mut self, pixel_count: usize) -> Result<(), TgaError> {
        let mut input = self.image.data;
        let format = self.image.format;
        let stride = format.bytes();
        while self.position < pixel_count {
            let (&header, data) = input.split_first().ok_or(TgaError::Truncated)?;
            let count = usize::from(header & 127) + 1;
            if count > pixel_count - self.position {
                return Err(TgaError::PacketOverrun);
            }
            let repeated = header & 128 != 0;
            let length = if repeated { stride } else { count * stride };
            let (packet, rest) = data.split_at_checked(length).ok_or(TgaError::Truncated)?;
            if repeated {
                let pixel = format.to_rgba(packet, self.image.palette)?;
                for _ in 0..count {
                    self.write(pixel);
                }
            } else {
                self.write_literal(packet)?;
            }
            input = rest;
        }
        Ok(())
    }
}

/// Decode TGA to little-endian u32 dimensions followed by top-left straight RGBA.
pub fn decode_tga(input: &[u8]) -> Result<Vec<u8>, TgaError> {
    Image::parse(input)?.decode()
}

#[cfg(test)]
mod tests {
    use super::*;

    fn header(kind: u8, depth: u8, width: u16, height: u16, flags: u8) -> [u8; 18] {
        let mut header = [0; 18];
        header[2] = kind;
        header[12..14].copy_from_slice(&width.to_le_bytes());
        header[14..16].copy_from_slice(&height.to_le_bytes());
        header[16] = depth;
        header[17] = flags;
        header
    }

    #[test]
    fn draws_all_four_origins_and_bgr24() {
        let pixels = [1, 2, 10, 1, 2, 20, 1, 2, 30, 1, 2, 40];
        for (flags, reds) in [
            (0, [30, 40, 10, 20]),
            (16, [40, 30, 20, 10]),
            (32, [10, 20, 30, 40]),
            (48, [20, 10, 40, 30]),
        ] {
            let mut input = header(2, 24, 2, 2, flags).to_vec();
            input.extend(pixels);
            let output = decode_tga(&input).unwrap();
            assert_eq!(&output[..8], &[2, 0, 0, 0, 2, 0, 0, 0]);
            for (pixel, red) in output[8..].chunks_exact(4).zip(reds) {
                assert_eq!(pixel, &[red, 2, 1, 255]);
            }
        }
    }

    #[test]
    fn handles_rle_true_color_with_magenta_key_and_partial_alpha() {
        let mut input = header(10, 32, 2, 2, 32).to_vec();
        input.extend([0x81, 255, 0, 255, 128, 1, 5, 6, 7, 128, 8, 9, 10, 255]);
        let output = decode_tga(&input).unwrap();
        assert_eq!(
            &output[8..],
            &[0, 0, 0, 0, 0, 0, 0, 0, 7, 6, 5, 128, 10, 9, 8, 255]
        );
        assert_eq!(
            decode_tga(&input[..input.len() - 1]),
            Err(TgaError::Truncated)
        );
    }

    #[test]
    fn preserves_packed_16_bit_values_and_gray_alpha() {
        let mut rgb = header(2, 16, 2, 1, 32).to_vec();
        rgb.extend([0xE0, 0xFF, 0x1F, 0]);
        assert_eq!(
            &decode_tga(&rgb).unwrap()[8..],
            &[248, 248, 0, 255, 0, 0, 248, 0]
        );
        let mut gray = header(11, 16, 2, 1, 32).to_vec();
        gray.extend([0x81, 90, 45]);
        assert_eq!(
            &decode_tga(&gray).unwrap()[8..],
            &[90, 90, 90, 45, 90, 90, 90, 45]
        );
        rgb[16] = 15;
        assert_eq!(decode_tga(&rgb), Err(TgaError::UnsupportedFormat));
    }

    #[test]
    fn reads_image_id_and_indexed_palette_in_legacy_index_order() {
        let mut indexed = header(9, 8, 2, 1, 32);
        indexed[0] = 2;
        indexed[1] = 1;
        indexed[3] = 1; // Existing client treats indices as relative to the supplied palette.
        indexed[5] = 2;
        indexed[7] = 24;
        let mut input = indexed.to_vec();
        input.extend([0xAA, 0xBB, 1, 2, 3, 4, 5, 6, 1, 1, 0]);
        assert_eq!(
            &decode_tga(&input).unwrap()[8..],
            &[6, 5, 4, 255, 3, 2, 1, 255]
        );
        *input.last_mut().unwrap() = 2;
        assert_eq!(decode_tga(&input), Err(TgaError::InvalidPaletteIndex));
    }

    #[test]
    fn bounds_decoded_size_lengths_and_run_counts() {
        assert_eq!(
            decode_tga(&header(2, 32, u16::MAX, u16::MAX, 0)),
            Err(TgaError::OutputTooLarge)
        );
        assert_eq!(
            decode_tga(&header(2, 24, 0, 4, 0)),
            Err(TgaError::InvalidDimensions)
        );
        assert_eq!(
            decode_tga(&header(2, 24, 1, 4, 0)),
            Err(TgaError::Truncated)
        );
        let mut runs = header(11, 8, 1, 1, 32).to_vec();
        runs.extend([0x81, 255]);
        assert_eq!(decode_tga(&runs), Err(TgaError::PacketOverrun));
    }
}
