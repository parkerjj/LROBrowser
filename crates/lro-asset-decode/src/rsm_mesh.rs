//! Vertex transformation, normal generation and material mesh emission.

use std::collections::BTreeMap;

use crate::rsm::{RsmError, smooth_normals};

const MAX_MESH_BYTES: usize = 64 * 1024 * 1024;
const FLOATS_PER_VERTEX: usize = 9;
const FLOATS_PER_FACE: usize = 3 * FLOATS_PER_VERTEX;

pub struct NodeMeshInput<'a> {
    pub vertices: &'a [[f32; 3]],
    pub texture_coordinates: &'a [[f32; 2]],
    /// Vertex indices, UV indices, local material index and shading group.
    pub faces: &'a [[u32; 8]],
    pub materials: &'a [i32],
    pub transform: &'a [f32; 16],
    pub normal_transform: &'a [f32; 16],
    pub shade_type: i32,
    pub alpha: f32,
    pub finite_zero: bool,
}

struct MeshFace {
    vertices: [usize; 3],
    coordinates: [usize; 3],
    material: i32,
    group: usize,
}

fn transform(matrix: &[f64; 16], point: [f32; 3]) -> [f32; 3] {
    let [x, y, z] = point.map(f64::from);
    std::array::from_fn(|i| {
        (matrix[i] * x + matrix[4 + i] * y + matrix[8 + i] * z + matrix[12 + i]) as f32
    })
}

fn triangle_normal(first: [f32; 3], second: [f32; 3], third: [f32; 3]) -> [f32; 3] {
    let difference = |left: [f32; 3], right: [f32; 3]| {
        std::array::from_fn(|i| f64::from(left[i]) - f64::from(right[i]))
    };
    let [a, b, c] = difference(third, second);
    let [x, y, z] = difference(first, second);
    let result = [b * z - c * y, c * x - a * z, a * y - b * x];
    let [i, j, k] = result;
    let length_squared = i * i + j * j + k * k;
    if length_squared > 0.0 {
        let inverse = 1.0 / length_squared.sqrt();
        result.map(|value| (value * inverse) as f32)
    } else {
        [0.0; 3]
    }
}

/// Return vertices grouped by global material in the order used by JS numeric
/// object keys. Each vertex contains position, normal, UV and model opacity.
pub fn emit_model_mesh(input: NodeMeshInput<'_>) -> Result<Vec<(i32, Vec<f32>)>, RsmError> {
    let bytes_per_face = FLOATS_PER_FACE * size_of::<f32>()
        + size_of::<MeshFace>()
        + size_of::<[f32; 3]>()
        + size_of::<[u32; 4]>();
    let allocation = input
        .faces
        .len()
        .checked_mul(bytes_per_face)
        .and_then(|size| {
            input
                .vertices
                .len()
                .checked_mul(size_of::<[f32; 3]>())
                .and_then(|vertices| size.checked_add(vertices))
        })
        .and_then(|size| {
            input
                .materials
                .len()
                .checked_mul(size_of::<(i32, Vec<f32>)>())
                .and_then(|materials| size.checked_add(materials))
        });
    if allocation.is_none_or(|size| size > MAX_MESH_BYTES) {
        return Err(RsmError::MemoryBudget);
    }
    if input.materials.iter().any(|&material| material < 0) {
        return Err(RsmError::InvalidIndex);
    }

    let mut material_counts: BTreeMap<_, _> = input
        .materials
        .iter()
        .map(|&material| (material, 0))
        .collect();
    let mut faces = Vec::with_capacity(input.faces.len());
    let mut present_groups = 0_u32;
    for row in input.faces {
        let [a, b, c, u, v, w, local_material, group] = row.map(|value| value as usize);
        let material = *input
            .materials
            .get(local_material)
            .ok_or(RsmError::InvalidIndex)?;
        if a.max(b).max(c) >= input.vertices.len()
            || u.max(v).max(w) >= input.texture_coordinates.len()
        {
            return Err(RsmError::InvalidIndex);
        }
        if input.shade_type == 2 {
            present_groups |= 1_u32
                .checked_shl(group as u32)
                .ok_or(RsmError::InvalidIndex)?;
        }
        *material_counts.get_mut(&material).unwrap() += FLOATS_PER_FACE;
        faces.push(MeshFace {
            vertices: [a, b, c],
            coordinates: [u, v, w],
            material,
            group,
        });
    }

    let matrix = input.transform.map(f64::from);
    let transformed: Vec<_> = input
        .vertices
        .iter()
        .map(|&vertex| transform(&matrix, vertex))
        .collect();
    let mut flat_normals = Vec::new();
    if input.shade_type == 1 || input.shade_type == 2 {
        let normal_matrix = input.normal_transform.map(f64::from);
        flat_normals.reserve_exact(faces.len());
        flat_normals.extend(faces.iter().map(|face| {
            let [a, b, c] = face.vertices.map(|index| input.vertices[index]);
            transform(&normal_matrix, triangle_normal(a, b, c))
        }));
    }

    let mut group_offsets = [0; 32];
    let smooth = if input.shade_type == 2 {
        let normal_faces: Vec<_> = input
            .faces
            .iter()
            .map(|row| [row[0], row[1], row[2], row[7]])
            .collect();
        for (active_index, group) in (0..32)
            .filter(|&group| present_groups & (1 << group) != 0)
            .enumerate()
        {
            group_offsets[group] = active_index * input.vertices.len() * 3;
        }
        smooth_normals(
            &flat_normals,
            &normal_faces,
            input.vertices.len(),
            present_groups,
            input.finite_zero,
        )?
    } else {
        Vec::new()
    };

    let mut mesh: BTreeMap<_, _> = material_counts
        .into_iter()
        .map(|(material, count)| (material, Vec::with_capacity(count)))
        .collect();
    for (face_index, face) in faces.iter().enumerate() {
        let output = mesh.get_mut(&face.material).unwrap();
        for (vertex, coordinate) in face.vertices.into_iter().zip(face.coordinates) {
            output.extend(transformed[vertex]);
            let normal: &[f32] = match input.shade_type {
                1 => &flat_normals[face_index],
                2 => {
                    let index = group_offsets[face.group] + vertex * 3;
                    &smooth[index..index + 3]
                }
                _ => &[0.0, -1.0, 0.0],
            };
            output.extend(normal);
            output.extend(input.texture_coordinates[coordinate]);
            output.push(input.alpha);
        }
    }
    Ok(mesh.into_iter().collect())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn node_mesh_keeps_material_groups_vertex_order_and_uvs() {
        let vertices = [[1.0, 2.0, 3.0], [2.0, 2.0, 3.0], [1.0, 2.0, 4.0]];
        let texture_coordinates = [[0.1, 0.2], [0.3, 0.4], [0.5, 0.6]];
        let faces = [[0, 1, 2, 2, 0, 1, 0, 0], [2, 1, 0, 0, 1, 2, 1, 1]];
        let mut matrix = [0.0; 16];
        for index in [0, 5, 10, 15] {
            matrix[index] = 1.0;
        }
        matrix[12] = 10.0;
        let mesh = emit_model_mesh(NodeMeshInput {
            vertices: &vertices,
            texture_coordinates: &texture_coordinates,
            faces: &faces,
            materials: &[5, 5, 2],
            transform: &matrix,
            normal_transform: &matrix,
            shade_type: 0,
            alpha: 0.75,
            finite_zero: false,
        })
        .unwrap();
        assert_eq!(mesh.len(), 2);
        assert_eq!(mesh[0], (2, vec![]));
        assert_eq!(mesh[1].0, 5);
        assert_eq!(mesh[1].1.len(), 54);
        assert_eq!(
            &mesh[1].1[..9],
            &[11.0, 2.0, 3.0, 0.0, -1.0, 0.0, 0.5, 0.6, 0.75]
        );
        assert_eq!(
            &mesh[1].1[27..36],
            &[11.0, 2.0, 4.0, 0.0, -1.0, 0.0, 0.1, 0.2, 0.75]
        );
    }

    #[test]
    fn out_of_range_references_are_rejected() {
        let mesh = emit_model_mesh(NodeMeshInput {
            vertices: &[[0.0; 3]],
            texture_coordinates: &[[0.0; 2]],
            faces: &[[0, 0, 1, 0, 0, 0, 0, 0]],
            materials: &[0],
            transform: &[0.0; 16],
            normal_transform: &[0.0; 16],
            shade_type: 2,
            alpha: 1.0,
            finite_zero: true,
        });
        assert_eq!(mesh.unwrap_err(), RsmError::InvalidIndex);
    }
}
