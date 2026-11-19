//! STR effect layers and keyframes.

use serde::Serialize;

pub use super::act::ActError as StrError;
use super::act::{AnimationReader, animation_json};

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct Effect {
    header: &'static str,
    version: u32,
    fps: u32,
    max_key: u32,
    layernum: u32,
    layers: Vec<Layer>,
}

#[derive(Serialize)]
struct Layer {
    texcnt: usize,
    texname: Vec<String>,
    anikeynum: usize,
    animations: Vec<Key>,
}

#[derive(Serialize)]
struct Key {
    frame: i32,
    #[serde(rename = "type")]
    kind: u32,
    pos: [f32; 2],
    uv: [f32; 8],
    xy: [f32; 8],
    aniframe: f64,
    anitype: u32,
    delay: f64,
    angle: f64,
    color: [f32; 4],
    srcalpha: u32,
    destalpha: u32,
    mtpreset: u32,
}

/// Returns STR v148 as UTF-8 JSON. The worker associates texture references
/// with its texture path and restores Float32Array fields before rendering.
pub fn decode_str(input: &[u8]) -> Result<Vec<u8>, StrError> {
    let mut reader = AnimationReader::new(input)?;
    if reader.take(4)? != b"STRM" {
        return Err(StrError::Header);
    }
    let version = reader.u32()?;
    if version != 148 {
        return Err(StrError::Version);
    }
    let fps = reader.u32()?;
    let max_key = reader.u32()?;
    let layernum = reader.u32()?;
    reader.take(16)?;
    let layers = reader.list(layernum as usize, 8, read_layer)?;
    animation_json(&Effect {
        header: "STRM",
        version,
        fps,
        max_key,
        layernum,
        layers,
    })
}

fn read_layer(reader: &mut AnimationReader<'_>) -> Result<Layer, StrError> {
    let texcnt = reader.signed_count()?;
    let texname = reader.list(texcnt, 128, |reader| reader.fixed_string(128))?;
    let anikeynum = reader.signed_count()?;
    let animations = reader.list(anikeynum, 124, read_key)?;
    Ok(Layer {
        texcnt,
        texname,
        anikeynum,
        animations,
    })
}

fn read_key(reader: &mut AnimationReader<'_>) -> Result<Key, StrError> {
    let frame = reader.i32()?;
    let kind = reader.u32()?;
    let pos = reader.float_array()?;
    let uv = reader.float_array()?;
    let xy = reader.float_array()?;
    let aniframe = reader.f64()?;
    let anitype = reader.u32()?;
    let delay = reader.f64()?;
    let angle = reader.f64()? / (1024.0 / 360.0);
    let mut color = [0.0; 4];
    for channel in &mut color {
        // The legacy decoder divides in Number precision, then creates the f32 array.
        *channel = (reader.f64()? / 255.0) as f32;
    }
    let srcalpha = reader.u32()?;
    let destalpha = reader.u32()?;
    let mtpreset = reader.u32()?;
    Ok(Key {
        frame,
        kind,
        pos,
        uv,
        xy,
        aniframe,
        anitype,
        delay,
        angle,
        color,
        srcalpha,
        destalpha,
        mtpreset,
    })
}

#[cfg(test)]
mod tests {
    use serde_json::{Value, json};

    use super::*;

    fn fixture() -> Vec<u8> {
        let mut bytes = b"STRM".to_vec();
        for value in [148_u32, 30, 240, 1] {
            bytes.extend(value.to_le_bytes());
        }
        bytes.extend([0; 16]);
        bytes.extend(1_i32.to_le_bytes());
        bytes.extend(b"\xe3/star.tga\0unused");
        bytes.resize(168, 0);
        for value in [1_i32, -8, 1] {
            bytes.extend(value.to_le_bytes());
        }
        for component in 0..18 {
            bytes.extend((component as f32 / 8.0).to_le_bytes());
        }
        bytes.extend(52.5_f32.to_le_bytes());
        bytes.extend(4_u32.to_le_bytes());
        for value in [0.0625_f32, 256.0, 127.5, 64.0, 256.0, 255.0] {
            bytes.extend(value.to_le_bytes());
        }
        for value in [4_u32, 5, 6] {
            bytes.extend(value.to_le_bytes());
        }
        bytes
    }

    #[test]
    fn preserves_texture_code_units_and_animation_transforms() {
        let data: Value = serde_json::from_slice(&decode_str(&fixture()).unwrap()).unwrap();
        assert_eq!(data["header"], "STRM");
        assert_eq!(data["version"], 148);
        assert_eq!(data["fps"], 30);
        assert_eq!(data["maxKey"], 240);
        let layer = &data["layers"][0];
        assert_eq!(layer["texname"], json!(["ã/star.tga"]));
        let key = &layer["animations"][0];
        assert_eq!(key["frame"], -8);
        assert_eq!(key["type"], 1);
        assert_eq!(key["pos"], json!([0.0, 0.125]));
        assert_eq!(
            key["uv"],
            json!([0.25, 0.375, 0.5, 0.625, 0.75, 0.875, 1.0, 1.125])
        );
        assert_eq!(key["aniframe"], 52.5);
        assert_eq!(key["anitype"], 4);
        assert_eq!(key["delay"], 0.0625);
        assert_eq!(key["angle"], 90.0);
        let color = key["color"].as_array().unwrap();
        for (value, input) in color.iter().zip([127.5, 64.0, 256.0, 255.0]) {
            assert_eq!(value.as_f64().unwrap() as f32, (input / 255.0) as f32);
        }
        assert_eq!(key["srcalpha"], 4);
        assert_eq!(key["destalpha"], 5);
        assert_eq!(key["mtpreset"], 6);
    }

    #[test]
    fn rejects_truncation_negative_texture_counts_and_nonfinite_keyframes() {
        let mut input = fixture();
        for length in 0..input.len() {
            assert!(decode_str(&input[..length]).is_err(), "length {length}");
        }
        input[180..184].copy_from_slice(&f32::NAN.to_le_bytes());
        assert_eq!(decode_str(&input), Err(StrError::Number));
        input[36..40].copy_from_slice(&(-1_i32).to_le_bytes());
        assert_eq!(decode_str(&input), Err(StrError::Count));
    }
}
