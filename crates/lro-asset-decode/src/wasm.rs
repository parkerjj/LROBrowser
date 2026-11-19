use std::alloc::{Layout, alloc, dealloc};
use std::slice;

use crate::{
    NodeMeshInput, decode_act, decode_gat, decode_gnd, decode_rsm, decode_rsw, decode_spr,
    decode_str, decode_tga, emit_model_mesh, gat_layout,
};

const MAX_INPUT_BYTES: usize = 128 * 1024 * 1024;

pub enum Section {
    Bytes(Vec<u8>),
    Floats(Vec<f32>),
}

pub struct Asset(Vec<Section>);

impl Asset {
    fn new(sections: Vec<Section>) -> *mut Self {
        Box::into_raw(Box::new(Self(sections)))
    }

    fn bytes(result: Vec<u8>) -> *mut Self {
        Self::new(vec![Section::Bytes(result)])
    }
}

#[unsafe(no_mangle)]
pub extern "C" fn asset_alloc(length: usize) -> *mut u8 {
    if !(1..=MAX_INPUT_BYTES).contains(&length) {
        return std::ptr::null_mut();
    }
    // The host writes every byte before passing the input to a decoder.
    unsafe { alloc(Layout::from_size_align(length, 8).unwrap()) }
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn asset_free(pointer: *mut u8, length: usize) {
    // The adapter returns the same allocation and size exactly once.
    unsafe { dealloc(pointer, Layout::from_size_align(length, 8).unwrap()) };
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn asset_view(asset: *const Asset, index: usize) -> *const u8 {
    match unsafe { &*asset }.0.get(index) {
        Some(Section::Bytes(bytes)) => bytes.as_ptr(),
        Some(Section::Floats(floats)) => floats.as_ptr().cast(),
        None => std::ptr::null(),
    }
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn asset_size(asset: *const Asset, index: usize) -> usize {
    match unsafe { &*asset }.0.get(index) {
        Some(Section::Bytes(bytes)) => bytes.len(),
        Some(Section::Floats(floats)) => floats.len() * size_of::<f32>(),
        None => 0,
    }
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn asset_drop(asset: *mut Asset) {
    drop(unsafe { Box::from_raw(asset) });
}

fn gat(input: &[u8]) -> Option<*mut Asset> {
    let layout = gat_layout(input).ok()?;
    let mut packed = vec![0; 12 + layout.output_bytes];
    packed[..4].copy_from_slice(&layout.width.to_le_bytes());
    packed[4..8].copy_from_slice(&layout.height.to_le_bytes());
    packed[8] = layout.version_major;
    packed[9] = layout.version_minor;
    decode_gat(input, &mut packed[12..]).ok()?;
    Some(Asset::bytes(packed))
}

fn gnd(input: &[u8], water_level: f64, wave_height: f64) -> Option<*mut Asset> {
    let ground = decode_gnd(input, water_level, wave_height).ok()?;
    let mut meta = Vec::new();
    for value in [
        ground.width,
        ground.height,
        ground.lightmap_count,
        ground.textures.len() as u32,
    ] {
        meta.extend_from_slice(&value.to_le_bytes());
    }
    for texture in ground.textures {
        meta.extend_from_slice(&(texture.len() as u32).to_le_bytes());
        meta.extend_from_slice(&texture);
    }
    fn write_zone(meta: &mut Vec<u8>, zone: crate::WaterZone) {
        meta.extend_from_slice(&zone.level.to_le_bytes());
        meta.extend_from_slice(&zone.kind.to_le_bytes());
        meta.extend_from_slice(&zone.wave_height.to_le_bytes());
        meta.extend_from_slice(&zone.wave_speed.to_le_bytes());
        meta.extend_from_slice(&zone.wave_pitch.to_le_bytes());
        meta.extend_from_slice(&zone.anim_speed.to_le_bytes());
    }
    if let Some(water) = ground.water {
        write_zone(
            &mut meta,
            crate::WaterZone {
                level: water.level,
                kind: water.kind,
                wave_height: water.wave_height,
                wave_speed: water.wave_speed,
                wave_pitch: water.wave_pitch,
                anim_speed: water.anim_speed,
            },
        );
        meta.extend_from_slice(&water.split_width.to_le_bytes());
        meta.extend_from_slice(&water.split_height.to_le_bytes());
        if let Some(zones) = water.zones {
            meta.extend_from_slice(&(zones.len() as u32).to_le_bytes());
            for zone in zones {
                write_zone(&mut meta, zone);
            }
        }
    }
    Some(Asset::new(vec![
        Section::Bytes(meta),
        Section::Bytes(ground.lightmap),
        Section::Bytes(ground.tile_color),
        Section::Bytes(ground.shadow_map),
        Section::Floats(ground.mesh),
        Section::Floats(ground.water_mesh),
    ]))
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn asset_decode(
    format: u32,
    pointer: *const u8,
    length: usize,
    water_level: f64,
    wave_height: f64,
) -> *mut Asset {
    let input = unsafe { slice::from_raw_parts(pointer, length) };
    match format {
        0 => decode_spr(input).ok().map(Asset::bytes),
        1 => gat(input),
        2 => gnd(input, water_level, wave_height),
        3 => decode_rsw(input).ok().map(Asset::bytes),
        4 => decode_rsm(input)
            .ok()
            .and_then(|model| serde_json::to_vec(&model).ok())
            .map(Asset::bytes),
        5 => decode_act(input).ok().map(Asset::bytes),
        6 => decode_str(input).ok().map(Asset::bytes),
        7 => decode_tga(input).ok().map(Asset::bytes),
        _ => None,
    }
    .unwrap_or(std::ptr::null_mut())
}

#[unsafe(no_mangle)]
pub unsafe extern "C" fn asset_model_mesh(
    geometry: *const u32,
    words: usize,
    matrices: *const [f32; 16],
    shade_type: i32,
    alpha: f32,
    finite_zero: u32,
) -> *mut Asset {
    let geometry = unsafe { slice::from_raw_parts(geometry, words) };
    let matrices = unsafe { &*matrices.cast::<[[f32; 16]; 2]>() };
    model_mesh(geometry, matrices, shade_type, alpha, finite_zero != 0)
        .unwrap_or(std::ptr::null_mut())
}

fn model_mesh(
    geometry: &[u32],
    matrices: &[[f32; 16]; 2],
    shade_type: i32,
    alpha: f32,
    finite_zero: bool,
) -> Option<*mut Asset> {
    let [vertex_count, uv_count, face_count, material_count] = *geometry.first_chunk::<4>()?;
    let (positions, geometry) =
        geometry[4..].split_at_checked((vertex_count as usize).checked_mul(3)?)?;
    let (uv, geometry) = geometry.split_at_checked((uv_count as usize).checked_mul(2)?)?;
    let (faces, materials) = geometry.split_at_checked((face_count as usize).checked_mul(8)?)?;
    if materials.len() != material_count as usize {
        return None;
    }
    // The ABI packs f32 positions and UVs as their raw bits in a 32-bit aligned buffer.
    let positions = unsafe {
        slice::from_raw_parts(positions.as_ptr().cast::<[f32; 3]>(), vertex_count as usize)
    };
    let uv = unsafe { slice::from_raw_parts(uv.as_ptr().cast::<[f32; 2]>(), uv_count as usize) };
    let materials =
        unsafe { slice::from_raw_parts(materials.as_ptr().cast::<i32>(), materials.len()) };
    let result = emit_model_mesh(NodeMeshInput {
        vertices: positions,
        texture_coordinates: uv,
        faces: faces.as_chunks::<8>().0,
        materials,
        transform: &matrices[0],
        normal_transform: &matrices[1],
        shade_type,
        alpha,
        finite_zero,
    })
    .ok()?;
    let mut sections = Vec::with_capacity(result.len() + 1);
    sections.push(Section::Bytes(
        result.iter().flat_map(|(id, _)| id.to_le_bytes()).collect(),
    ));
    sections.extend(result.into_iter().map(|(_, mesh)| Section::Floats(mesh)));
    Some(Asset::new(sections))
}
