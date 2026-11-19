//! Bounded decoders for the client's passive game assets.

mod act;
mod gat;
mod gnd;
mod rsm;
mod rsm_mesh;
mod rsw;
mod spr;
mod str_animation;
mod tga;

pub use act::{ActError, decode_act};
pub use gat::{GatError, GatLayout, decode_gat, gat_layout};
pub use gnd::{GndError, Ground, GroundWater, WaterZone, decode_gnd, validate_gnd};
pub use rsm::{ParsedRsm, RsmError, decode_rsm, smooth_normals};
pub use rsm_mesh::{NodeMeshInput, emit_model_mesh};
pub use rsw::{RswError, decode_rsw, validate_rsw};
pub use spr::{
    SprDecodeError, decode_indexed_frames, decode_indexed_rle, decode_spr,
    indexed_frames_output_len,
};
pub use str_animation::{StrError, decode_str};
pub use tga::{TgaError, decode_tga};

const MAX_ASSET_BYTES: usize = 64 * 1024 * 1024;

#[cfg(target_arch = "wasm32")]
mod wasm;
