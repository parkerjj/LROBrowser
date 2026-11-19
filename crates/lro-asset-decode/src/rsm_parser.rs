use std::collections::HashMap;

use serde::Serialize;

use super::{MODEL_MEMORY_BUDGET, RsmError};

type Result<T> = std::result::Result<T, RsmError>;
type Vector = [f64; 3];

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct ParsedRsm {
    version: f64,
    anim_len: i32,
    shade_type: i32,
    alpha: f64,
    #[serde(skip_serializing_if = "Option::is_none")]
    frame_rate_per_second: Option<f64>,
    main_node_index: usize,
    textures: Vec<String>,
    nodes: Vec<ParsedNode>,
    pos_keyframes: Vec<LegacyPositionFrame>,
    volumebox: Vec<VolumeBox>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct ParsedNode {
    name: String,
    parentname: String,
    textures: Vec<i32>,
    mat3: [f64; 9],
    offset: Vector,
    pos: Vector,
    rotangle: f64,
    rotaxis: Vector,
    scale: Vector,
    flip: Vector,
    vertices: Vec<Vector>,
    tvertices: Vec<f64>,
    faces: Vec<Face>,
    rot_keyframes: Vec<RotationFrame>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pos_keyframes: Option<Vec<PositionFrame>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    scale_key_frames: Option<Vec<ScaleFrame>>,
    #[serde(skip_serializing_if = "Option::is_none")]
    texture_animations: Option<Vec<TextureAnimationGroup>>,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct Face {
    vertidx: [u16; 3],
    tvertidx: [u16; 3],
    texid: u16,
    padding: u16,
    two_side: i32,
    #[serde(skip_serializing_if = "Option::is_none")]
    smooth_group: Option<i32>,
    #[serde(rename = "smoothGroup_1", skip_serializing_if = "Option::is_none")]
    smooth_group_1: Option<i32>,
    #[serde(rename = "smoothGroup_2", skip_serializing_if = "Option::is_none")]
    smooth_group_2: Option<i32>,
}

#[derive(Debug, Serialize)]
struct RotationFrame {
    frame: i32,
    q: [f64; 4],
}

#[derive(Debug, Serialize)]
struct LegacyPositionFrame {
    frame: i32,
    px: f64,
    py: f64,
    pz: f64,
    data: f64,
}

#[derive(Debug, Serialize)]
struct PositionFrame {
    frame: i32,
    px: f64,
    py: f64,
    pz: f64,
    #[serde(rename = "Data")]
    data: i32,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "PascalCase")]
struct ScaleFrame {
    frame: i32,
    scale: Vector,
    data: f64,
}

#[derive(Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct TextureAnimationGroup {
    texture_id: i32,
    animations: Vec<TextureAnimation>,
}

#[derive(Debug, Serialize)]
struct TextureAnimation {
    kind: i32,
    keyframes: Vec<TextureFrame>,
}

#[derive(Debug, Serialize)]
struct TextureFrame {
    frame: i32,
    offset: f64,
}

#[derive(Debug, Serialize)]
struct VolumeBox {
    size: Vector,
    pos: Vector,
    rot: Vector,
    flag: i32,
}

struct Reader<'a> {
    rest: &'a [u8],
    budget: usize,
}

impl<'a> Reader<'a> {
    fn new(bytes: &'a [u8]) -> Self {
        Self {
            rest: bytes,
            budget: MODEL_MEMORY_BUDGET,
        }
    }

    fn take(&mut self, length: usize) -> Result<&'a [u8]> {
        let (data, rest) = self
            .rest
            .split_at_checked(length)
            .ok_or(RsmError::Truncated)?;
        self.rest = rest;
        Ok(data)
    }

    fn spend(&mut self, bytes: usize) -> Result<()> {
        self.budget = self
            .budget
            .checked_sub(bytes)
            .ok_or(RsmError::MemoryBudget)?;
        Ok(())
    }

    fn u8(&mut self) -> Result<u8> {
        Ok(self.take(1)?[0])
    }

    fn u16(&mut self) -> Result<u16> {
        Ok(u16::from_le_bytes(self.take(2)?.try_into().unwrap()))
    }

    fn i32(&mut self) -> Result<i32> {
        Ok(i32::from_le_bytes(self.take(4)?.try_into().unwrap()))
    }

    fn float(&mut self) -> Result<f64> {
        let value = f32::from_le_bytes(self.take(4)?.try_into().unwrap());
        if !value.is_finite() {
            return Err(RsmError::InvalidFloat);
        }
        Ok(f64::from(value))
    }

    fn floats<const N: usize>(&mut self) -> Result<[f64; N]> {
        let mut output = [0.0; N];
        for value in &mut output {
            *value = self.float()?;
        }
        Ok(output)
    }

    fn indices(&mut self) -> Result<[u16; 3]> {
        Ok([self.u16()?, self.u16()?, self.u16()?])
    }

    fn count(&mut self, item_bytes: usize) -> Result<usize> {
        let count = usize::try_from(self.i32()?).map_err(|_| RsmError::InvalidCount)?;
        if count > self.rest.len() / item_bytes {
            return Err(RsmError::Truncated);
        }
        Ok(count)
    }

    fn items<T>(
        &mut self,
        item_bytes: usize,
        mut read: impl FnMut(&mut Self) -> Result<T>,
    ) -> Result<Vec<T>> {
        let count = self.count(item_bytes)?;
        let allocation = count
            .checked_mul(size_of::<T>())
            .ok_or(RsmError::MemoryBudget)?;
        self.spend(allocation)?;
        let mut items = Vec::with_capacity(count);
        for _ in 0..count {
            items.push(read(self)?);
        }
        Ok(items)
    }

    fn string(&mut self, length: usize) -> Result<String> {
        let bytes = self.take(length)?;
        let bytes = bytes.split(|&byte| byte == 0).next().unwrap();
        self.spend(bytes.len().saturating_mul(2))?;
        // GRSM strings represent a byte-derived path, not normalized text.
        Ok(bytes.iter().copied().map(char::from).collect())
    }

    fn variable_string(&mut self) -> Result<String> {
        let length = self.count(1)?;
        self.string(length)
    }
}

struct TextureTable {
    names: Vec<String>,
    indices: HashMap<String, i32>,
}

impl TextureTable {
    fn new(names: Vec<String>) -> Self {
        Self {
            names,
            indices: HashMap::new(),
        }
    }

    fn intern(&mut self, name: String) -> i32 {
        *self.indices.entry(name.clone()).or_insert_with(|| {
            let index = self.names.len() as i32;
            self.names.push(name);
            index
        })
    }
}

/// Parse and bound the binary layouts used by RSM and RSM2. The returned
/// values map directly to the renderer's model properties; transient matrices
/// and bounding boxes are constructed by the existing renderer.
pub fn decode_rsm(bytes: &[u8]) -> Result<ParsedRsm> {
    if bytes.len() > MODEL_MEMORY_BUDGET {
        return Err(RsmError::MemoryBudget);
    }
    let mut reader = Reader::new(bytes);
    if !matches!(reader.take(4)?, b"GRSM" | b"GRSX") {
        return Err(RsmError::InvalidHeader);
    }
    let major = reader.u8()?;
    let minor = reader.u8()?;
    if !matches!(major, 1 | 2) || minor > 9 {
        return Err(RsmError::InvalidVersion);
    }
    let version = f64::from(major) + f64::from(minor) / 10.0;
    let anim_len = reader.i32()?;
    let shade_type = reader.i32()?;
    let alpha = if version >= 1.4 {
        f64::from(reader.u8()?) / 255.0
    } else {
        1.0
    };
    let frame_rate_per_second = (version >= 2.2).then(|| reader.float()).transpose()?;
    let (textures, main_node_name) = if version >= 2.3 {
        // These names are read by the legacy loader, but the first node
        // remains the chosen root. Texture indices come from node materials.
        reader.items(4, Reader::variable_string)?;
        (Vec::new(), None)
    } else if version >= 2.2 {
        let textures = reader.items(4, Reader::variable_string)?;
        reader.items(4, Reader::variable_string)?;
        (textures, None)
    } else {
        reader.take(16)?;
        let textures = reader.items(40, |reader| reader.string(40))?;
        (textures, Some(reader.string(40)?))
    };

    let mut textures = TextureTable::new(textures);
    let nodes = reader.items(4, |reader| read_node(reader, version, &mut textures))?;
    let main_node_index = match main_node_name.filter(|name| !name.is_empty()) {
        Some(name) => nodes
            .iter()
            .rposition(|node| node.name == name)
            .unwrap_or(0),
        None => 0,
    };
    validate_hierarchy(&nodes, main_node_index)?;
    let pos_keyframes = if version < 1.6 {
        reader.items(20, |reader| {
            Ok(LegacyPositionFrame {
                frame: reader.i32()?,
                px: reader.float()?,
                py: reader.float()?,
                pz: reader.float()?,
                data: reader.float()?,
            })
        })?
    } else {
        Vec::new()
    };
    let volumebox = if reader.rest.is_empty() {
        Vec::new()
    } else {
        reader.items(if version >= 1.3 { 40 } else { 36 }, |reader| {
            Ok(VolumeBox {
                size: reader.floats()?,
                pos: reader.floats()?,
                rot: reader.floats()?,
                flag: if version >= 1.3 { reader.i32()? } else { 0 },
            })
        })?
    };
    for node in &nodes {
        if node
            .textures
            .iter()
            .any(|&index| index < 0 || index as usize >= textures.names.len())
        {
            return Err(RsmError::InvalidIndex);
        }
    }
    Ok(ParsedRsm {
        version,
        anim_len,
        shade_type,
        alpha,
        frame_rate_per_second,
        main_node_index,
        textures: textures.names,
        nodes,
        pos_keyframes,
        volumebox,
    })
}

fn read_node(
    reader: &mut Reader<'_>,
    version: f64,
    textures: &mut TextureTable,
) -> Result<ParsedNode> {
    let name = read_node_name(reader, version)?;
    let parentname = read_node_name(reader, version)?;
    let textures = if version >= 2.3 {
        reader.items(4, |reader| Ok(textures.intern(reader.variable_string()?)))?
    } else {
        reader.items(4, Reader::i32)?
    };
    let mat3 = reader.floats()?;
    let offset = reader.floats()?;
    let (pos, rotangle, rotaxis, scale, flip) = if version >= 2.2 {
        ([0.0; 3], 0.0, [0.0; 3], [1.0; 3], [1.0, -1.0, 1.0])
    } else {
        (
            reader.floats()?,
            reader.float()?,
            reader.floats()?,
            reader.floats()?,
            [1.0; 3],
        )
    };
    let vertices = reader.items(12, Reader::floats::<3>)?;
    let count = reader.count(if version >= 1.2 { 12 } else { 8 })?;
    reader.spend(
        count
            .checked_mul(6 * size_of::<f64>())
            .ok_or(RsmError::MemoryBudget)?,
    )?;
    let mut tvertices = Vec::with_capacity(count * 6);
    for _ in 0..count {
        for _ in 0..4 {
            let color = if version >= 1.2 {
                f64::from(reader.u8()?) / 255.0
            } else {
                0.0
            };
            tvertices.push(f64::from(color as f32));
        }
        tvertices.push(f64::from((reader.float()? * 0.98 + 0.01) as f32));
        tvertices.push(f64::from((reader.float()? * 0.98 + 0.01) as f32));
    }
    let min_face_bytes = if version >= 2.2 {
        28
    } else if version >= 1.2 {
        24
    } else {
        20
    };
    let faces = reader.items(min_face_bytes, |reader| {
        read_face(reader, version, vertices.len(), count, textures.len())
    })?;
    let scale_key_frames = (version >= 1.6)
        .then(|| {
            reader.items(20, |reader| {
                Ok(ScaleFrame {
                    frame: reader.i32()?,
                    scale: reader.floats()?,
                    data: reader.float()?,
                })
            })
        })
        .transpose()?;
    let rot_keyframes = reader.items(20, |reader| {
        Ok(RotationFrame {
            frame: reader.i32()?,
            q: reader.floats()?,
        })
    })?;
    let pos_keyframes = (version >= 2.2)
        .then(|| {
            reader.items(20, |reader| {
                Ok(PositionFrame {
                    frame: reader.i32()?,
                    px: reader.float()?,
                    py: reader.float()?,
                    pz: reader.float()?,
                    data: reader.i32()?,
                })
            })
        })
        .transpose()?;
    let texture_animations = (version >= 2.3)
        .then(|| {
            reader.items(8, |reader| {
                Ok(TextureAnimationGroup {
                    texture_id: reader.i32()?,
                    animations: reader.items(8, |reader| {
                        Ok(TextureAnimation {
                            kind: reader.i32()?,
                            keyframes: reader.items(8, |reader| {
                                Ok(TextureFrame {
                                    frame: reader.i32()?,
                                    offset: reader.float()?,
                                })
                            })?,
                        })
                    })?,
                })
            })
        })
        .transpose()?;
    Ok(ParsedNode {
        name,
        parentname,
        textures,
        mat3,
        offset,
        pos,
        rotangle,
        rotaxis,
        scale,
        flip,
        vertices,
        tvertices,
        faces,
        scale_key_frames,
        rot_keyframes,
        pos_keyframes,
        texture_animations,
    })
}

fn read_node_name(reader: &mut Reader<'_>, version: f64) -> Result<String> {
    if version >= 2.2 {
        reader.variable_string()
    } else {
        reader.string(40)
    }
}

fn read_face(
    reader: &mut Reader<'_>,
    version: f64,
    vertices: usize,
    coordinates: usize,
    textures: usize,
) -> Result<Face> {
    let length = if version >= 2.2 { reader.i32()? } else { -1 };
    let vertidx = reader.indices()?;
    let tvertidx = reader.indices()?;
    let texid = reader.u16()?;
    if usize::from(texid) >= textures
        || vertidx.iter().any(|&index| usize::from(index) >= vertices)
        || tvertidx
            .iter()
            .any(|&index| usize::from(index) >= coordinates)
    {
        return Err(RsmError::InvalidIndex);
    }
    let padding = reader.u16()?;
    let two_side = reader.i32()?;
    let smooth_group = (version >= 1.2).then(|| reader.i32()).transpose()?;
    let smooth_group_1 = (length > 24).then(|| reader.i32()).transpose()?;
    let smooth_group_2 = (length > 28).then(|| reader.i32()).transpose()?;
    if length > 32 {
        reader.take((length - 32) as usize)?;
    }
    Ok(Face {
        vertidx,
        tvertidx,
        texid,
        padding,
        two_side,
        smooth_group,
        smooth_group_1,
        smooth_group_2,
    })
}

fn validate_hierarchy(nodes: &[ParsedNode], root: usize) -> Result<()> {
    if nodes.is_empty() {
        return Err(RsmError::InvalidHierarchy);
    }
    let mut children: HashMap<&str, Vec<usize>> = HashMap::new();
    for (index, node) in nodes.iter().enumerate() {
        if node.name != node.parentname {
            children.entry(&node.parentname).or_default().push(index);
        }
    }
    fn visit(
        nodes: &[ParsedNode],
        children: &HashMap<&str, Vec<usize>>,
        index: usize,
        visiting: &mut [bool],
        depth: usize,
        visits: &mut usize,
    ) -> Result<()> {
        *visits += 1;
        if depth > 256 || visiting[index] || *visits > nodes.len().saturating_mul(2) {
            return Err(RsmError::InvalidHierarchy);
        }
        visiting[index] = true;
        if let Some(indices) = children.get(nodes[index].name.as_str()) {
            for &child in indices {
                visit(nodes, children, child, visiting, depth + 1, visits)?;
            }
        }
        visiting[index] = false;
        Ok(())
    }
    visit(
        nodes,
        &children,
        root,
        &mut vec![false; nodes.len()],
        1,
        &mut 0,
    )
}

#[cfg(test)]
mod tests {
    use super::*;

    fn integers(bytes: &mut Vec<u8>, values: &[i32]) {
        bytes.extend(values.iter().flat_map(|value| value.to_le_bytes()));
    }

    fn reals(bytes: &mut Vec<u8>, values: &[f32]) {
        bytes.extend(values.iter().flat_map(|value| value.to_le_bytes()));
    }

    fn fixed(bytes: &mut Vec<u8>, name: &[u8]) {
        bytes.extend(name);
        bytes.resize(bytes.len() + 40 - name.len(), 0);
    }

    fn variable(bytes: &mut Vec<u8>, name: &[u8]) {
        integers(bytes, &[name.len() as i32]);
        bytes.extend(name);
    }

    fn legacy() -> Vec<u8> {
        let mut bytes = b"GRSM\x01\x04".to_vec();
        integers(&mut bytes, &[10, 2]);
        bytes.push(200);
        bytes.extend([0; 16]);
        integers(&mut bytes, &[1]);
        fixed(&mut bytes, b"\x81-test.bmp");
        fixed(&mut bytes, b"main");
        integers(&mut bytes, &[1]);
        fixed(&mut bytes, b"main");
        fixed(&mut bytes, b"");
        integers(&mut bytes, &[1, 0]);
        reals(&mut bytes, &[0.0; 22]);
        integers(&mut bytes, &[1]);
        reals(&mut bytes, &[0.1, 0.2, 0.3]);
        integers(&mut bytes, &[1]);
        bytes.extend([80, 90, 100, 255]);
        reals(&mut bytes, &[0.3, 0.6]);
        integers(&mut bytes, &[1]);
        bytes.extend([0; 16]);
        integers(&mut bytes, &[0, 2, 0, 0]);
        bytes
    }

    fn modern() -> Vec<u8> {
        let mut bytes = b"GRSX\x02\x03".to_vec();
        integers(&mut bytes, &[30, 2]);
        bytes.push(255);
        reals(&mut bytes, &[60.0]);
        integers(&mut bytes, &[0, 1]);
        variable(&mut bytes, b"main");
        variable(&mut bytes, b"");
        integers(&mut bytes, &[2]);
        variable(&mut bytes, b"first.bmp");
        variable(&mut bytes, b"first.bmp");
        reals(&mut bytes, &[0.0; 12]);
        integers(&mut bytes, &[0, 0, 0, 0, 0, 0]);
        // A texture animation stores sparse texture and animation-type IDs.
        integers(&mut bytes, &[1, 5, 1, 7, 1, 12]);
        reals(&mut bytes, &[0.2]);
        bytes
    }

    fn transitional() -> Vec<u8> {
        let mut bytes = b"GRSM\x02\x02".to_vec();
        integers(&mut bytes, &[240, 1]);
        bytes.push(255);
        reals(&mut bytes, &[30.0]);
        integers(&mut bytes, &[1]);
        variable(&mut bytes, b"model.bmp");
        integers(&mut bytes, &[1]);
        variable(&mut bytes, b"root");
        integers(&mut bytes, &[1]);
        variable(&mut bytes, b"root");
        variable(&mut bytes, b"");
        integers(&mut bytes, &[1, 0]);
        reals(&mut bytes, &[0.0; 12]);
        integers(&mut bytes, &[0, 0, 0, 1, 40]);
        reals(&mut bytes, &[1.0, 2.0, 3.0, 4.0]);
        integers(&mut bytes, &[0, 1, 90]);
        reals(&mut bytes, &[-4.0, 5.0, 6.0]);
        integers(&mut bytes, &[123]);
        bytes
    }

    #[test]
    fn rsm_one_preserves_paths_float_precision_and_faces() {
        let value = serde_json::to_value(decode_rsm(&legacy()).unwrap()).unwrap();
        assert_eq!(value["version"], 1.4);
        assert_eq!(value["textures"][0], "\u{81}-test.bmp");
        assert_eq!(value["alpha"], 200.0 / 255.0);
        assert_eq!(value["nodes"][0]["vertices"][0][0], f64::from(0.1_f32));
        assert_eq!(value["nodes"][0]["faces"][0]["smoothGroup"], 2);
        assert_eq!(
            value["nodes"][0]["tvertices"][4],
            f64::from((f64::from(0.3_f32) * 0.98 + 0.01) as f32)
        );
    }

    #[test]
    fn rsm_two_preserves_shared_material_indices_and_texture_animation() {
        let value = serde_json::to_value(decode_rsm(&modern()).unwrap()).unwrap();
        assert_eq!(value["frameRatePerSecond"], 60.0);
        assert_eq!(value["mainNodeIndex"], 0);
        assert_eq!(value["nodes"][0]["flip"][1], -1.0);
        assert_eq!(value["nodes"][0]["textures"], serde_json::json!([0, 0]));
        assert_eq!(value["textures"], serde_json::json!(["first.bmp"]));
        assert_eq!(value["nodes"][0]["textureAnimations"][0]["textureId"], 5);
        assert_eq!(
            value["nodes"][0]["textureAnimations"][0]["animations"][0]["keyframes"][0]["frame"],
            12
        );
    }

    #[test]
    fn rsm_22_preserves_variable_names_numeric_textures_and_keyframe_case() {
        let value = serde_json::to_value(decode_rsm(&transitional()).unwrap()).unwrap();
        assert_eq!(value["textures"], serde_json::json!(["model.bmp"]));
        let node = &value["nodes"][0];
        assert_eq!(node["textures"], serde_json::json!([0]));
        assert_eq!(node["name"], "root");
        assert_eq!(node["scaleKeyFrames"][0]["Frame"], 40);
        assert_eq!(node["posKeyframes"][0]["frame"], 90);
        assert_eq!(node["posKeyframes"][0]["Data"], 123);
        assert!(node.get("textureAnimations").is_none());
    }

    #[test]
    fn malformed_models_are_bounded_before_allocation() {
        assert_eq!(decode_rsm(b"junk").unwrap_err(), RsmError::InvalidHeader);
        let mut bytes = legacy();
        bytes[31..35].copy_from_slice(&i32::MAX.to_le_bytes());
        assert_eq!(decode_rsm(&bytes).unwrap_err(), RsmError::Truncated);
        let mut bytes = modern();
        bytes.pop();
        assert_eq!(decode_rsm(&bytes).unwrap_err(), RsmError::Truncated);
    }
}
