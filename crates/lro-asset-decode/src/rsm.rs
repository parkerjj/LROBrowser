//! RSM/RSM2 model decoding and shared model-normal generation.

#[path = "rsm_parser.rs"]
mod parser;

pub use parser::{ParsedRsm, decode_rsm};

const MODEL_MEMORY_BUDGET: usize = 64 * 1024 * 1024;

#[derive(Debug, Clone, Copy, PartialEq, Eq)]
pub enum RsmError {
    InvalidHeader,
    InvalidVersion,
    InvalidCount,
    InvalidFloat,
    InvalidIndex,
    InvalidHierarchy,
    Truncated,
    MemoryBudget,
}

/// Smooth model normals in the same face order as the client.
///
/// The result contains one `vertex_count * 3` slice per bit in
/// `present_groups`, in ascending shading-group order. Every face's last
/// integer is its original group ID. Repeated corner indices contribute only
/// once. The legacy static path keeps NaN for zero-length normals, while the
/// animated renderer requests zeros for those vertices.
pub fn smooth_normals(
    flat_normals: &[[f32; 3]],
    faces: &[[u32; 4]],
    vertex_count: usize,
    present_groups: u32,
    finite_zero: bool,
) -> Result<Vec<f32>, RsmError> {
    if flat_normals.len() != faces.len() {
        return Err(RsmError::InvalidCount);
    }
    let group_count = present_groups.count_ones() as usize;
    let slots = group_count
        .checked_mul(vertex_count)
        .filter(|&length| {
            length <= MODEL_MEMORY_BUDGET / (size_of::<[f64; 3]>() + size_of::<[f32; 3]>())
        })
        .ok_or(RsmError::MemoryBudget)?;
    let mut sums = vec![[0.0_f64; 3]; slots];
    let mut group_offsets = [None; 32];
    for (group, id) in (0..32)
        .filter(|&id| present_groups & (1 << id) != 0)
        .enumerate()
    {
        group_offsets[id] = Some(group * vertex_count);
    }
    for (indices, value) in faces.iter().zip(flat_normals) {
        let [a, b, c, id] = indices.map(|index| index as usize);
        let base = group_offsets
            .get(id)
            .copied()
            .flatten()
            .ok_or(RsmError::InvalidIndex)?;
        if a.max(b).max(c) >= vertex_count {
            return Err(RsmError::InvalidIndex);
        }
        let add = |sum: &mut [f64; 3]| {
            for (total, component) in sum.iter_mut().zip(value) {
                *total += f64::from(*component);
            }
        };
        add(&mut sums[base + a]);
        if a != b {
            add(&mut sums[base + b]);
        }
        if a != c && b != c {
            add(&mut sums[base + c]);
        }
    }
    let mut output = Vec::with_capacity(slots * 3);
    for [x, y, z] in sums {
        let mut inverse_length = 1.0 / (x * x + y * y + z * z).sqrt();
        if finite_zero && !inverse_length.is_finite() {
            inverse_length = 1.0;
        }
        output.extend([
            (x * inverse_length) as f32,
            (y * inverse_length) as f32,
            (z * inverse_length) as f32,
        ]);
    }
    Ok(output)
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn smooth_normals_keep_face_order_and_ignore_duplicate_corner_indices() {
        let flat = [[1.0, 0.0, 0.0], [0.0, 0.0, 1.0], [0.0, -2.0, 0.0]];
        let faces = [[0, 1, 1, 2], [0, 1, 1, 2], [1, 2, 2, 31]];
        let normals = smooth_normals(&flat, &faces, 3, (1 << 2) | (1 << 31), false).unwrap();
        let diagonal = (1.0_f64 / 2.0_f64.sqrt()) as f32;
        assert_eq!(
            &normals[0..6],
            &[diagonal, 0.0, diagonal, diagonal, 0.0, diagonal]
        );
        assert!(normals[6..12].iter().all(|value| value.is_nan()));
        assert_eq!(&normals[12..], &[0.0, -1.0, 0.0, 0.0, -1.0, 0.0]);
        let finite = smooth_normals(&flat, &faces, 3, (1 << 2) | (1 << 31), true).unwrap();
        assert_eq!(&finite[6..12], &[0.0; 6]);
    }

    #[test]
    fn smooth_normals_reject_unsound_indices_and_shapes() {
        let flat = [[0.0; 3]];
        for faces in [[[0, 0, 2, 0]], [[0, 0, 1, 32]], [[0, 0, 1, 1]]] {
            assert!(smooth_normals(&flat, &faces, 2, 1, false).is_err());
        }
        assert!(smooth_normals(&flat, &[], 1, 1, false).is_err());
    }
}
