//! Sprite action decoding and the common animation binary reader.

use std::{io, mem::size_of};

use serde::Serialize;

use super::MAX_ASSET_BYTES;

#[derive(Clone, Copy, Debug, Eq, PartialEq)]
pub enum ActError {
    Header,
    Version,
    Truncated,
    Count,
    Size,
    Number,
    Serialize,
}

pub(super) struct AnimationReader<'a> {
    rest: &'a [u8],
    available_allocation: usize,
}

impl<'a> AnimationReader<'a> {
    pub(super) fn new(input: &'a [u8]) -> Result<Self, ActError> {
        if input.len() > MAX_ASSET_BYTES {
            return Err(ActError::Size);
        }
        Ok(Self {
            rest: input,
            available_allocation: MAX_ASSET_BYTES,
        })
    }

    pub(super) fn take(&mut self, length: usize) -> Result<&'a [u8], ActError> {
        let (field, rest) = self
            .rest
            .split_at_checked(length)
            .ok_or(ActError::Truncated)?;
        self.rest = rest;
        Ok(field)
    }

    pub(super) fn u8(&mut self) -> Result<u8, ActError> {
        Ok(self.take(1)?[0])
    }

    fn u16(&mut self) -> Result<u16, ActError> {
        Ok(u16::from_le_bytes(self.take(2)?.try_into().unwrap()))
    }

    pub(super) fn u32(&mut self) -> Result<u32, ActError> {
        Ok(u32::from_le_bytes(self.take(4)?.try_into().unwrap()))
    }

    pub(super) fn i32(&mut self) -> Result<i32, ActError> {
        Ok(self.u32()? as i32)
    }

    pub(super) fn signed_count(&mut self) -> Result<usize, ActError> {
        usize::try_from(self.i32()?).map_err(|_| ActError::Count)
    }

    pub(super) fn f32(&mut self) -> Result<f32, ActError> {
        let value = f32::from_bits(self.u32()?);
        if !value.is_finite() {
            return Err(ActError::Number);
        }
        Ok(value)
    }

    pub(super) fn f64(&mut self) -> Result<f64, ActError> {
        self.f32().map(f64::from)
    }

    pub(super) fn float_array<const N: usize>(&mut self) -> Result<[f32; N], ActError> {
        let mut result = [0.0; N];
        for item in &mut result {
            *item = self.f32()?;
        }
        Ok(result)
    }

    fn allocate(&mut self, bytes: usize) -> Result<(), ActError> {
        self.available_allocation = self
            .available_allocation
            .checked_sub(bytes)
            .ok_or(ActError::Size)?;
        Ok(())
    }

    pub(super) fn fixed_string(&mut self, width: usize) -> Result<String, ActError> {
        let field = self.take(width)?;
        let length = field.iter().position(|&byte| byte == 0).unwrap_or(width);
        self.allocate(length * 2)?;
        let mut result = String::with_capacity(length * 2);
        // The original BinaryReader maps each byte directly to a code unit.
        for &byte in &field[..length] {
            result.push(char::from(byte));
        }
        Ok(result)
    }

    pub(super) fn list<T>(
        &mut self,
        count: usize,
        minimum_item_bytes: usize,
        mut read_item: impl FnMut(&mut Self) -> Result<T, ActError>,
    ) -> Result<Vec<T>, ActError> {
        if count > self.rest.len() / minimum_item_bytes {
            return Err(ActError::Count);
        }
        self.allocate(count.checked_mul(size_of::<T>()).ok_or(ActError::Size)?)?;
        let mut result = Vec::new();
        result
            .try_reserve_exact(count)
            .map_err(|_| ActError::Size)?;
        for _ in 0..count {
            result.push(read_item(self)?);
        }
        Ok(result)
    }
}

pub(super) fn animation_json(value: &impl Serialize) -> Result<Vec<u8>, ActError> {
    #[derive(Default)]
    struct Output {
        bytes: Vec<u8>,
        too_large: bool,
    }

    impl io::Write for Output {
        fn write(&mut self, bytes: &[u8]) -> io::Result<usize> {
            if bytes.len() > MAX_ASSET_BYTES - self.bytes.len() {
                self.too_large = true;
                return Err(io::Error::other("animation wire size"));
            }
            self.bytes.extend_from_slice(bytes);
            Ok(bytes.len())
        }

        fn flush(&mut self) -> io::Result<()> {
            Ok(())
        }
    }

    let mut output = Output::default();
    serde_json::to_writer(&mut output, value).map_err(|_| {
        if output.too_large {
            ActError::Size
        } else {
            ActError::Serialize
        }
    })?;
    Ok(output.bytes)
}

#[derive(Serialize)]
struct Act {
    header: &'static str,
    version: f64,
    actions: Vec<Action>,
    sounds: Vec<String>,
}

#[derive(Serialize)]
struct Action {
    animations: Vec<Animation>,
    delay: f64,
}

#[derive(Serialize)]
struct Animation {
    layers: Vec<Layer>,
    sound: i32,
    pos: Vec<Anchor>,
}

#[derive(Serialize)]
struct Layer {
    pos: [i32; 2],
    index: i32,
    is_mirror: i32,
    scale: [f64; 2],
    color: [f64; 4],
    angle: i32,
    spr_type: i32,
    width: i32,
    height: i32,
}

#[derive(Serialize)]
struct Anchor {
    x: i32,
    y: i32,
}

/// Returns UTF-8 JSON for the ACT action list, delays, and sound names.
pub fn decode_act(input: &[u8]) -> Result<Vec<u8>, ActError> {
    let mut reader = AnimationReader::new(input)?;
    if reader.take(2)? != b"AC" {
        return Err(ActError::Header);
    }
    let minor = reader.u8()?;
    let major = reader.u8()?;
    if major == 0 || minor > 9 {
        return Err(ActError::Version);
    }
    let version = u16::from(major) * 10 + u16::from(minor);
    let count = usize::from(reader.u16()?);
    reader.take(10)?;
    let mut actions = reader.list(count, 4, |reader| {
        let length = reader.u32()? as usize;
        let minimum = 36 + 4 * usize::from(version >= 20) + 4 * usize::from(version >= 23);
        let animations = reader.list(length, minimum, |reader| read_animation(reader, version))?;
        Ok(Action {
            animations,
            delay: 150.0,
        })
    })?;
    let sounds = if version >= 21 {
        let count = reader.signed_count()?;
        reader.list(count, 40, |reader| reader.fixed_string(40))?
    } else {
        Vec::new()
    };
    if version >= 22 {
        for action in &mut actions {
            action.delay = reader.f64()? * 25.0;
        }
    }
    animation_json(&Act {
        header: "AC",
        version: f64::from(major) + f64::from(minor) / 10.0,
        actions,
        sounds,
    })
}

fn read_animation(reader: &mut AnimationReader<'_>, version: u16) -> Result<Animation, ActError> {
    reader.take(32)?;
    let count = reader.u32()? as usize;
    let minimum = 16
        + 16 * usize::from(version >= 20)
        + 4 * usize::from(version > 23)
        + 8 * usize::from(version >= 25);
    let layers = reader.list(count, minimum, |reader| read_layer(reader, version))?;
    let sound = if version >= 20 { reader.i32()? } else { -1 };
    let pos = if version >= 23 {
        let count = reader.signed_count()?;
        reader.list(count, 16, |reader| {
            reader.take(4)?;
            let x = reader.i32()?;
            let y = reader.i32()?;
            reader.take(4)?;
            Ok(Anchor { x, y })
        })?
    } else {
        Vec::new()
    };
    Ok(Animation { layers, sound, pos })
}

fn read_layer(reader: &mut AnimationReader<'_>, version: u16) -> Result<Layer, ActError> {
    let mut layer = Layer {
        pos: [reader.i32()?, reader.i32()?],
        index: reader.i32()?,
        is_mirror: reader.i32()?,
        scale: [1.0, 1.0],
        color: [1.0; 4],
        angle: 0,
        spr_type: 0,
        width: 0,
        height: 0,
    };
    if version >= 20 {
        for channel in &mut layer.color {
            *channel = f64::from(reader.u8()?) / 255.0;
        }
        let x_scale = reader.f64()?;
        let y_scale = if version > 23 { reader.f64()? } else { x_scale };
        layer.scale = [x_scale, y_scale];
        layer.angle = reader.i32()?;
        layer.spr_type = reader.i32()?;
        if version >= 25 {
            layer.width = reader.i32()?;
            layer.height = reader.i32()?;
        }
    }
    Ok(layer)
}

#[cfg(test)]
mod tests {
    use serde_json::{Value, json};

    use super::*;

    fn i32s(bytes: &mut Vec<u8>, values: &[i32]) {
        for value in values {
            bytes.extend(value.to_le_bytes());
        }
    }

    fn fixture(version: u8) -> Vec<u8> {
        let mut bytes = b"AC".to_vec();
        bytes.extend([version % 10, version / 10]);
        bytes.extend(1_u16.to_le_bytes());
        bytes.extend([0; 10]);
        i32s(&mut bytes, &[1]); // One frame.
        bytes.extend([0; 32]);
        i32s(&mut bytes, &[1, -11, 22, -1, 1]); // One mirrored layer.
        if version >= 20 {
            bytes.extend([0, 64, 168, 255]);
            bytes.extend(0.5_f32.to_le_bytes());
            if version > 23 {
                bytes.extend(2.25_f32.to_le_bytes());
            }
            i32s(&mut bytes, &[90, 1]);
            if version >= 25 {
                i32s(&mut bytes, &[18, 19]);
            }
            i32s(&mut bytes, &[2]); // Frame sound.
        }
        if version >= 23 {
            i32s(&mut bytes, &[1, 0xaa, -31, 58, 0xbb]);
        }
        if version >= 21 {
            i32s(&mut bytes, &[1]);
            bytes.extend(b"snd\x80.wav\0ignored");
            bytes.resize(bytes.len() + 24, 0);
        }
        if version >= 22 {
            bytes.extend(4.5_f32.to_le_bytes());
        }
        bytes
    }

    #[test]
    fn versions_preserve_layer_defaults_and_optional_fields() {
        for version in [10, 20, 21, 22, 23, 24, 25] {
            let result: Value =
                serde_json::from_slice(&decode_act(&fixture(version)).unwrap()).unwrap();
            let layer = &result["actions"][0]["animations"][0];
            assert_eq!(
                layer["pos"],
                if version >= 23 {
                    json!([{"x": -31, "y": 58}])
                } else {
                    json!([])
                }
            );
            assert_eq!(layer["sound"], if version >= 20 { 2 } else { -1 });
            let sprite = &layer["layers"][0];
            assert_eq!(sprite["pos"], json!([-11, 22]));
            assert_eq!(sprite["index"], -1);
            assert_eq!(sprite["is_mirror"], 1);
            let scale = match version {
                24.. => json!([0.5, 2.25]),
                20.. => json!([0.5, 0.5]),
                _ => json!([1.0, 1.0]),
            };
            assert_eq!(sprite["scale"], scale);
            assert_eq!(sprite["width"], if version >= 25 { 18 } else { 0 });
            assert_eq!(sprite["height"], if version >= 25 { 19 } else { 0 });
            assert_eq!(
                result["sounds"],
                if version >= 21 {
                    json!(["snd\u{80}.wav"])
                } else {
                    json!([])
                }
            );
            assert_eq!(
                result["actions"][0]["delay"],
                if version >= 22 { 112.5 } else { 150.0 }
            );
        }
    }

    #[test]
    fn rejects_truncated_layers_and_excessive_counts() {
        let mut input = fixture(25);
        for length in 0..input.len() {
            assert!(decode_act(&input[..length]).is_err(), "length {length}");
        }
        input[16..20].copy_from_slice(&u32::MAX.to_le_bytes());
        assert_eq!(decode_act(&input), Err(ActError::Count));
    }
}
