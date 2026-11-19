//! RSW scene records and the worker's wire representation.

use super::MAX_ASSET_BYTES;

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum RswError {
    Header,
    Version,
    Truncated,
    Count,
    ObjectType,
    Size,
}

struct Reader<'a>(&'a [u8]);

impl<'a> Reader<'a> {
    fn take(&mut self, length: usize) -> Result<&'a [u8], RswError> {
        let (field, rest) = self.0.split_at_checked(length).ok_or(RswError::Truncated)?;
        self.0 = rest;
        Ok(field)
    }

    fn byte(&mut self) -> Result<u8, RswError> {
        Ok(self.take(1)?[0])
    }

    fn i32(&mut self) -> Result<i32, RswError> {
        Ok(i32::from_le_bytes(self.take(4)?.try_into().unwrap()))
    }

    fn f64(&mut self) -> Result<f64, RswError> {
        Ok(f64::from(f32::from_le_bytes(
            self.take(4)?.try_into().unwrap(),
        )))
    }

    fn count(&mut self, minimum_item_bytes: usize) -> Result<usize, RswError> {
        let count = usize::try_from(self.i32()?).map_err(|_| RswError::Count)?;
        if count > self.0.len() / minimum_item_bytes {
            return Err(RswError::Count);
        }
        Ok(count)
    }

    fn string(&mut self, width: usize) -> Result<&'a [u8], RswError> {
        let field = self.take(width)?;
        Ok(&field[..field.iter().position(|&byte| byte == 0).unwrap_or(width)])
    }
}

struct Wire<const EMIT: bool> {
    bytes: Vec<u8>,
    length: usize,
}

impl<const EMIT: bool> Wire<EMIT> {
    fn bytes(&mut self, bytes: &[u8]) {
        self.length += bytes.len();
        if EMIT && self.length <= MAX_ASSET_BYTES {
            self.bytes.extend_from_slice(bytes);
        }
    }

    fn i32(&mut self, value: i32) {
        self.bytes(&value.to_le_bytes());
    }

    fn f64(&mut self, value: f64) {
        self.bytes(&value.to_le_bytes());
    }

    fn string(&mut self, value: &[u8]) {
        // All RSW string fields are 40 or 80 bytes wide.
        self.bytes(&[value.len() as u8]);
        self.bytes(value);
    }

    fn integers(&mut self, reader: &mut Reader<'_>, count: usize) -> Result<(), RswError> {
        for _ in 0..count {
            self.i32(reader.i32()?);
        }
        Ok(())
    }

    fn numbers(
        &mut self,
        reader: &mut Reader<'_>,
        count: usize,
        scale_divisor: f64,
    ) -> Result<(), RswError> {
        for _ in 0..count {
            self.f64(reader.f64()? / scale_divisor);
        }
        Ok(())
    }
}

/// Parse a scene and encode the fields needed by the map worker.
///
/// The wire starts with the version bytes, build number, four filenames, four
/// ground bounds, water, and sunlight. The object count is followed by
/// records in original order, each prefixed with its type (1–4). Integers are
/// little-endian i32, numbers are little-endian f64, and strings are a u8
/// length followed by original byte values, including non-ASCII filenames.
pub fn decode_rsw(input: &[u8]) -> Result<Vec<u8>, RswError> {
    parse::<true>(input)
}

/// Validate a scene with the same parser used for decoding, without emitting a wire buffer.
pub fn validate_rsw(input: &[u8]) -> Result<(), RswError> {
    parse::<false>(input).map(|_| ())
}

fn parse<const EMIT: bool>(input: &[u8]) -> Result<Vec<u8>, RswError> {
    if input.len() > MAX_ASSET_BYTES {
        return Err(RswError::Size);
    }
    let mut reader = Reader(input);
    if reader.take(4)? != b"GRSW" {
        return Err(RswError::Header);
    }
    let major = reader.byte()?;
    let minor = reader.byte()?;
    if major == 0 || major > i8::MAX as u8 || minor > 9 {
        return Err(RswError::Version);
    }
    let version = u16::from(major) * 10 + u16::from(minor);
    let build = if version >= 25 { reader.i32()? } else { 0 };
    if version >= 22 {
        reader.take(1)?;
    }
    let ini = reader.string(40)?;
    let gnd = reader.string(40)?;
    let gat = reader.string(40)?;
    let src = if version >= 14 {
        reader.string(40)?
    } else {
        b""
    };

    let mut water = Water::default();
    if version < 26 {
        if version >= 13 {
            water.level = reader.f64()? / 5.0;
        }
        if version >= 18 {
            water.kind = reader.i32()?;
            water.wave_height = reader.f64()? / 5.0;
            water.wave_speed = reader.f64()?;
            water.wave_pitch = reader.f64()?;
        } else {
            water.wave_height = 1.0;
            water.wave_speed = 2.0;
            water.wave_pitch = 50.0;
        }
        water.anim_speed = if version >= 19 { reader.i32()? } else { 3 };
    }

    let mut output = Wire::<EMIT> {
        bytes: Vec::new(),
        length: 0,
    };
    if EMIT {
        output.bytes.reserve(input.len().min(1024 * 1024));
    }
    output.bytes(&[major, minor]);
    output.i32(build);
    for filename in [ini, gnd, gat, src] {
        output.string(filename);
    }
    // Ground comes after light in the source. Emit the ground first so the map
    // metadata and water occupy the same wire prefix across all versions.
    let light = if version >= 15 {
        let byte_length = if version >= 17 { 36 } else { 32 };
        Some(reader.take(byte_length)?)
    } else {
        None
    };
    if version >= 16 {
        output.integers(&mut reader, 4)?;
    } else {
        for bound in [-500, 500, -500, 500] {
            output.i32(bound);
        }
    }
    water.write(&mut output);
    if let Some(light) = light {
        let mut light = Reader(light);
        output.integers(&mut light, 2)?;
        output.numbers(&mut light, 6, 1.0)?;
        output.f64(if version >= 17 { light.f64()? } else { 1.0 });
    } else {
        output.i32(45);
        output.i32(45);
        for component in [1.0, 1.0, 1.0, 0.0, 0.0, 0.0, 1.0] {
            output.f64(component);
        }
    }

    if version >= 27 {
        let count = reader.count(4)?;
        reader.take(count * 4)?;
    }
    let count = reader.count(108 + 4)?;
    output.bytes(&(count as u32).to_le_bytes());
    for _ in 0..count {
        let kind = reader.i32()?;
        output.bytes(&[kind as u8]);
        match kind {
            1 => read_model(&mut reader, &mut output, version, build)?,
            2 => {
                output.string(reader.string(80)?);
                output.numbers(&mut reader, 3, 5.0)?;
                output.integers(&mut reader, 3)?;
                output.f64(reader.f64()?);
            }
            3 => {
                output.string(reader.string(80)?);
                output.string(reader.string(80)?);
                output.numbers(&mut reader, 3, 5.0)?;
                output.f64(reader.f64()?);
                output.integers(&mut reader, 2)?;
                output.f64(reader.f64()?);
                output.f64(if version >= 20 { reader.f64()? } else { 0.0 });
            }
            4 => {
                output.string(reader.string(80)?);
                output.numbers(&mut reader, 3, 5.0)?;
                output.i32(reader.i32()?);
                output.f64(10.0 * reader.f64()?);
                output.numbers(&mut reader, 4, 1.0)?;
            }
            _ => return Err(RswError::ObjectType),
        }
        if output.length > MAX_ASSET_BYTES {
            return Err(RswError::Size);
        }
    }
    // Older maps can have a trailing quadtree unused by the worker.
    Ok(output.bytes)
}

#[derive(Default)]
struct Water {
    level: f64,
    kind: i32,
    wave_height: f64,
    wave_speed: f64,
    wave_pitch: f64,
    anim_speed: i32,
}

impl Water {
    fn write<const EMIT: bool>(self, out: &mut Wire<EMIT>) {
        out.f64(self.level);
        out.i32(self.kind);
        out.f64(self.wave_height);
        out.f64(self.wave_speed);
        out.f64(self.wave_pitch);
        out.i32(self.anim_speed);
    }
}

fn read_model<const EMIT: bool>(
    reader: &mut Reader<'_>,
    out: &mut Wire<EMIT>,
    version: u16,
    build: i32,
) -> Result<(), RswError> {
    if version >= 13 {
        out.string(reader.string(40)?);
        out.i32(reader.i32()?);
        out.f64(reader.f64()?);
        out.i32(reader.i32()?);
    } else {
        out.string(b"");
        out.i32(0);
        out.f64(1.0);
        out.i32(0);
    }
    let unknown_byte = if version >= 26 && build >= 186 {
        reader.byte()? as i8
    } else {
        0
    };
    out.i32(i32::from(unknown_byte));
    out.i32(if version >= 27 { reader.i32()? } else { 0 });
    out.string(reader.string(80)?);
    out.string(reader.string(80)?);
    out.numbers(reader, 3, 5.0)?;
    out.numbers(reader, 3, 1.0)?;
    out.numbers(reader, 3, 5.0)?;
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn integers(out: &mut Vec<u8>, values: &[i32]) {
        for value in values {
            out.extend(value.to_le_bytes());
        }
    }

    fn floats(out: &mut Vec<u8>, values: &[f32]) {
        for value in values {
            out.extend(value.to_le_bytes());
        }
    }

    fn fixed(out: &mut Vec<u8>, value: &[u8], width: usize) {
        out.extend_from_slice(value);
        out.resize(out.len() + width - value.len(), 0);
    }

    fn fixture(version: u8, build: i32) -> (Vec<u8>, usize) {
        let mut input = b"GRSW".to_vec();
        input.extend([version / 10, version % 10]);
        if version >= 25 {
            integers(&mut input, &[build]);
        }
        if version >= 22 {
            input.push(0xab);
        }
        fixed(&mut input, b"map.ini", 40);
        fixed(&mut input, b"\x80map.gnd\0ignored", 40);
        fixed(&mut input, b"map.gat", 40);
        if version >= 14 {
            fixed(&mut input, b"map.src", 40);
        }
        if (13..26).contains(&version) {
            floats(&mut input, &[-2.0]);
            if version >= 18 {
                integers(&mut input, &[8]);
                floats(&mut input, &[3.0, 7.0, 11.0]);
            }
            if version >= 19 {
                integers(&mut input, &[4]);
            }
        }
        if version >= 15 {
            integers(&mut input, &[14, -25]);
            floats(&mut input, &[0.25, 0.5, 0.75, 0.125, 0.25, 0.375]);
            if version >= 17 {
                floats(&mut input, &[0.5]);
            }
        }
        if version >= 16 {
            integers(&mut input, &[-4, 5, -6, 7]);
        }
        if version >= 27 {
            integers(&mut input, &[2, 0x1111, 0x2222]);
        }
        let objects = input.len();
        integers(&mut input, &[4, 1]);
        if version >= 13 {
            fixed(&mut input, b"model", 40);
            integers(&mut input, &[3]);
            floats(&mut input, &[1.25]);
            integers(&mut input, &[4]);
        }
        if version >= 26 && build >= 186 {
            input.push(0xfe);
        }
        if version >= 27 {
            integers(&mut input, &[0x3344]);
        }
        fixed(&mut input, b"\xb4/tree.rsm", 80);
        fixed(&mut input, b"branch", 80);
        floats(
            &mut input,
            &[-7.0, 0.0, 15.0, 11.0, 22.0, 33.0, 5.0, 3.0, -0.0],
        );
        integers(&mut input, &[2]);
        fixed(&mut input, b"lamp", 80);
        floats(&mut input, &[10.0, 15.0, 20.0]);
        integers(&mut input, &[190, 205, 240]);
        floats(&mut input, &[45.5]);
        integers(&mut input, &[3]);
        fixed(&mut input, b"bells", 80);
        fixed(&mut input, b"bells.wav", 80);
        floats(&mut input, &[5.0, -5.0, 0.0, 0.25]);
        integers(&mut input, &[30, 40]);
        floats(&mut input, &[10.5]);
        if version >= 20 {
            floats(&mut input, &[12.5]);
        }
        integers(&mut input, &[4]);
        fixed(&mut input, b"spark", 80);
        floats(&mut input, &[10.0, 5.0, 15.0]);
        integers(&mut input, &[15]);
        floats(&mut input, &[0.25, 1.0, 2.0, 3.0, 4.0]);
        (input, objects)
    }

    fn string(reader: &mut Reader<'_>, expected: &[u8]) {
        let length = reader.byte().unwrap() as usize;
        assert_eq!(reader.take(length).unwrap(), expected);
    }

    fn number(reader: &mut Reader<'_>, expected: f64) {
        assert_eq!(reader.take(8).unwrap(), expected.to_le_bytes());
    }

    #[test]
    fn modern_scene_preserves_record_order_and_converts_units() {
        let (mut input, _) = fixture(27, 186);
        input.extend([1, 2, 3]); // Unused suffix.
        let wire = decode_rsw(&input).unwrap();
        assert_eq!(validate_rsw(&input), Ok(()));
        let mut reader = Reader(&wire);
        assert_eq!(reader.take(2).unwrap(), [2, 7]);
        assert_eq!(reader.i32().unwrap(), 186);
        for filename in [
            b"map.ini".as_slice(),
            b"\x80map.gnd",
            b"map.gat",
            b"map.src",
        ] {
            string(&mut reader, filename);
        }
        for bound in [-4, 5, -6, 7] {
            assert_eq!(reader.i32().unwrap(), bound);
        }
        number(&mut reader, 0.0);
        assert_eq!(reader.i32().unwrap(), 0);
        for _ in 0..3 {
            number(&mut reader, 0.0);
        }
        assert_eq!(reader.i32().unwrap(), 0);
        assert_eq!(reader.i32().unwrap(), 14);
        assert_eq!(reader.i32().unwrap(), -25);
        for light in [0.25, 0.5, 0.75, 0.125, 0.25, 0.375, 0.5] {
            number(&mut reader, light);
        }
        assert_eq!(reader.i32().unwrap(), 4);

        assert_eq!(reader.byte().unwrap(), 1);
        string(&mut reader, b"model");
        assert_eq!(reader.i32().unwrap(), 3);
        number(&mut reader, 1.25);
        for field in [4, -2, 0x3344] {
            assert_eq!(reader.i32().unwrap(), field);
        }
        string(&mut reader, b"\xb4/tree.rsm");
        string(&mut reader, b"branch");
        for value in [-1.4, 0.0, 3.0, 11.0, 22.0, 33.0, 1.0, 0.6, -0.0] {
            number(&mut reader, value);
        }

        assert_eq!(reader.byte().unwrap(), 2);
        string(&mut reader, b"lamp");
        for position in [2.0, 3.0, 4.0] {
            number(&mut reader, position);
        }
        for color in [190, 205, 240] {
            assert_eq!(reader.i32().unwrap(), color);
        }
        number(&mut reader, 45.5);

        assert_eq!(reader.byte().unwrap(), 3);
        string(&mut reader, b"bells");
        string(&mut reader, b"bells.wav");
        for value in [1.0, -1.0, 0.0, 0.25] {
            number(&mut reader, value);
        }
        assert_eq!(reader.i32().unwrap(), 30);
        assert_eq!(reader.i32().unwrap(), 40);
        number(&mut reader, 10.5);
        number(&mut reader, 12.5);

        assert_eq!(reader.byte().unwrap(), 4);
        string(&mut reader, b"spark");
        for position in [2.0, 1.0, 3.0] {
            number(&mut reader, position);
        }
        assert_eq!(reader.i32().unwrap(), 15);
        for value in [2.5, 1.0, 2.0, 3.0, 4.0] {
            number(&mut reader, value);
        }
        assert!(reader.0.is_empty());
    }

    #[test]
    fn legacy_and_modern_versions_share_the_wire_layout() {
        for version in [10, 12, 13, 14, 15, 16, 17, 18, 19, 20, 22, 25, 26, 27] {
            for build in [185, 186] {
                let (input, _) = fixture(version, build);
                validate_rsw(&input).unwrap();
                let wire = decode_rsw(&input).unwrap();
                let mut reader = Reader(&wire);
                assert_eq!(reader.take(2).unwrap(), [version / 10, version % 10]);
                assert_eq!(reader.i32().unwrap(), if version >= 25 { build } else { 0 });
                string(&mut reader, b"map.ini");
                string(&mut reader, b"\x80map.gnd");
                string(&mut reader, b"map.gat");
                string(&mut reader, if version >= 14 { b"map.src" } else { b"" });
                assert_eq!(reader.i32().unwrap(), if version >= 16 { -4 } else { -500 });
                reader.take(12).unwrap();
                number(
                    &mut reader,
                    if (13..26).contains(&version) {
                        -0.4
                    } else {
                        0.0
                    },
                );
                assert_eq!(
                    reader.i32().unwrap(),
                    if (18..26).contains(&version) { 8 } else { 0 }
                );
                let expected_wave = match version {
                    18..=25 => [0.6, 7.0, 11.0],
                    26.. => [0.0; 3],
                    _ => [1.0, 2.0, 50.0],
                };
                for value in expected_wave {
                    number(&mut reader, value);
                }
                assert_eq!(
                    reader.i32().unwrap(),
                    match version {
                        19..=25 => 4,
                        26.. => 0,
                        _ => 3,
                    }
                );
                assert_eq!(reader.i32().unwrap(), if version >= 15 { 14 } else { 45 });
                reader.take(4 + 48).unwrap();
                number(&mut reader, if version >= 17 { 0.5 } else { 1.0 });
                assert_eq!(reader.i32().unwrap(), 4);
                assert_eq!(reader.byte().unwrap(), 1);
                string(&mut reader, if version >= 13 { b"model" } else { b"" });
                assert_eq!(reader.i32().unwrap(), if version >= 13 { 3 } else { 0 });
                number(&mut reader, if version >= 13 { 1.25 } else { 1.0 });
                assert_eq!(reader.i32().unwrap(), if version >= 13 { 4 } else { 0 });
                assert_eq!(
                    reader.i32().unwrap(),
                    if version >= 26 && build >= 186 { -2 } else { 0 }
                );
                assert_eq!(
                    reader.i32().unwrap(),
                    if version >= 27 { 0x3344 } else { 0 }
                );
            }
        }
    }

    #[test]
    fn rejects_truncation_negative_count_and_unknown_types() {
        let (mut input, offset) = fixture(27, 186);
        for truncated in 0..input.len() {
            assert!(decode_rsw(&input[..truncated]).is_err());
            assert!(validate_rsw(&input[..truncated]).is_err());
        }
        input[offset + 4] = 99;
        assert_eq!(decode_rsw(&input), Err(RswError::ObjectType));
        input[offset..offset + 4].copy_from_slice(&(-1_i32).to_le_bytes());
        assert_eq!(decode_rsw(&input), Err(RswError::Count));
    }
}
