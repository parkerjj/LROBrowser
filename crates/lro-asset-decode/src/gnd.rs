use std::collections::HashMap;

const LIGHT_SIDE: usize = 8;
const TILE_BYTES: usize = 40;
const SURFACE_BYTES: usize = 28;
const MAX_LIGHTMAP_BYTES: usize = 64 * 1024 * 1024;
const MAX_GROUND_OUTPUT_BYTES: usize = 256 * 1024 * 1024;
const GROUND_FLOATS_PER_QUAD: usize = 6 * 12;
const WATER_FLOATS_PER_QUAD: usize = 6 * 5;
const FLOOR_ORDER: [usize; 6] = [0, 1, 2, 2, 3, 0];

#[derive(Debug, Clone, Copy, Eq, PartialEq)]
pub enum GndError {
    InvalidHeader,
    InvalidVersion,
    InvalidDimensions,
    InvalidTextures,
    InvalidLightmaps,
    InvalidReference,
    InvalidWater,
    Truncated,
    MemoryLimit,
}

pub struct Ground {
    pub width: u32,
    pub height: u32,
    pub textures: Vec<Vec<u8>>,
    pub lightmap_count: u32,
    pub lightmap: Vec<u8>,
    pub tile_color: Vec<u8>,
    pub shadow_map: Vec<u8>,
    pub mesh: Vec<f32>,
    pub water_mesh: Vec<f32>,
    pub water: Option<GroundWater>,
}

pub struct GroundWater {
    pub level: f64,
    pub kind: i32,
    pub wave_height: f64,
    pub wave_speed: f64,
    pub wave_pitch: f64,
    pub anim_speed: i32,
    pub split_width: i32,
    pub split_height: i32,
    pub zones: Option<Vec<WaterZone>>,
}

pub struct WaterZone {
    pub level: f64,
    pub kind: i32,
    pub wave_height: f64,
    pub wave_speed: f64,
    pub wave_pitch: f64,
    pub anim_speed: i32,
}

struct Reader<'a>(&'a [u8]);

impl<'a> Reader<'a> {
    fn take(&mut self, length: usize) -> Result<&'a [u8], GndError> {
        let (value, rest) = self.0.split_at_checked(length).ok_or(GndError::Truncated)?;
        self.0 = rest;
        Ok(value)
    }

    fn u32(&mut self) -> Result<u32, GndError> {
        Ok(read_u32(self.take(4)?))
    }

    fn i32(&mut self) -> Result<i32, GndError> {
        Ok(self.u32()? as i32)
    }

    fn float(&mut self) -> Result<f64, GndError> {
        Ok(f64::from(f32::from_bits(self.u32()?)))
    }
}

fn read_u32(bytes: &[u8]) -> u32 {
    u32::from_le_bytes(bytes[..4].try_into().unwrap())
}

fn read_u16(bytes: &[u8]) -> usize {
    u16::from_le_bytes(bytes[..2].try_into().unwrap()) as usize
}

fn read_float(bytes: &[u8]) -> f64 {
    f64::from(f32::from_bits(read_u32(bytes)))
}

fn product(lhs: usize, rhs: usize) -> Result<usize, GndError> {
    lhs.checked_mul(rhs).ok_or(GndError::MemoryLimit)
}

fn reserve<T>(length: usize) -> Result<Vec<T>, GndError> {
    let mut output = Vec::new();
    output
        .try_reserve_exact(length)
        .map_err(|_| GndError::MemoryLimit)?;
    Ok(output)
}

fn fill_bytes(length: usize, value: u8) -> Result<Vec<u8>, GndError> {
    let mut output = reserve(length)?;
    output.resize(length, value);
    Ok(output)
}

#[derive(Default)]
struct Atlas {
    columns: usize,
    rows: usize,
    width: usize,
    height: usize,
}

impl Atlas {
    fn new(count: usize, side: usize) -> Result<Self, GndError> {
        if count == 0 {
            return Ok(Self::default());
        }
        let root = (count as f64).sqrt();
        let columns = root.round() as usize;
        let rows = root.ceil() as usize;
        let power_of_two = |tiles| {
            product(tiles, side)?
                .checked_next_power_of_two()
                .ok_or(GndError::MemoryLimit)
        };
        Ok(Self {
            columns,
            rows,
            width: power_of_two(columns)?,
            height: power_of_two(rows)?,
        })
    }

    fn rgba_bytes(&self) -> Result<usize, GndError> {
        product(product(self.width, self.height)?, 4)
    }

    fn map_tile_uv(&self, texture: usize, u: f64, v: f64) -> [f64; 2] {
        let column = (texture % self.columns) as f64;
        let row = (texture / self.columns) as f64;
        let columns = self.columns as f64;
        let rows = self.rows as f64;
        let scale_u = 258.0 * columns / self.width as f64;
        let scale_v = 258.0 * rows / self.height as f64;
        let border = 1.0 / 258.0;
        [
            (column + u * (1.0 - 2.0 * border) + border) * scale_u / columns,
            (row + v * (1.0 - 2.0 * border) + border) * scale_v / rows,
        ]
    }

    fn light_uv(&self, index: usize) -> [[f64; 2]; 4] {
        let x = (index % self.columns) as f64;
        let y = (index / self.columns) as f64;
        let columns = self.columns as f64;
        let rows = self.rows as f64;
        let scale_u = 8.0 * columns / self.width as f64;
        let scale_v = 8.0 * rows / self.height as f64;
        let u0 = (x + 0.125) / columns * scale_u;
        let u1 = (x + 0.875) / columns * scale_u;
        let v0 = (y + 0.125) / rows * scale_v;
        let v1 = (y + 0.875) / rows * scale_v;
        [[u0, v0], [u1, v0], [u1, v1], [u0, v1]]
    }

    fn unpack_light(
        &self,
        light_data: &[u8],
        count: usize,
        pixel_stride: usize,
    ) -> Result<Vec<u8>, GndError> {
        let mut atlas = fill_bytes(self.rgba_bytes()?, 0)?;
        for tile in 0..count {
            let source = tile * pixel_stride * 4;
            let x = tile % self.columns * LIGHT_SIDE;
            let y = tile / self.columns * LIGHT_SIDE;
            for row in 0..LIGHT_SIDE {
                for col in 0..LIGHT_SIDE {
                    let pixel = row * LIGHT_SIDE + col;
                    let dest = ((y + row) * self.width + x + col) * 4;
                    let rgb = source + pixel_stride + pixel * 3;
                    atlas[dest..dest + 4].copy_from_slice(&[
                        light_data[rgb],
                        light_data[rgb + 1],
                        light_data[rgb + 2],
                        light_data[source + pixel],
                    ]);
                }
            }
        }
        Ok(atlas)
    }
}

struct Source<'a> {
    width: usize,
    height: usize,
    texture_count: usize,
    texture_stride: usize,
    textures: &'a [u8],
    light_count: usize,
    light_stride: usize,
    lights: &'a [u8],
    tiles: &'a [u8],
    surfaces: &'a [u8],
    water: Option<WaterSource<'a>>,
}

impl<'a> Source<'a> {
    fn parse(bytes: &'a [u8]) -> Result<Self, GndError> {
        let mut reader = Reader(bytes);
        if reader.take(4)? != b"GRGN" {
            return Err(GndError::InvalidHeader);
        }
        let version = reader.take(2)?;
        if version[0] == 0 || version[1] > 9 {
            return Err(GndError::InvalidVersion);
        }
        let width = reader.u32()? as usize;
        let height = reader.u32()? as usize;
        let cells = product(width, height).map_err(|_| GndError::InvalidDimensions)?;
        if cells == 0 || cells > bytes.len() / SURFACE_BYTES {
            return Err(GndError::InvalidDimensions);
        }
        reader.take(4)?; // zoom
        let texture_count = reader.u32()? as usize;
        let texture_stride = reader.u32()? as usize;
        if texture_count > 0 && texture_stride == 0 {
            return Err(GndError::InvalidTextures);
        }
        let textures = reader.take(product(texture_count, texture_stride)?)?;
        let light_count = nonnegative(reader.i32()?, GndError::InvalidLightmaps)?;
        let light_width = nonnegative(reader.i32()?, GndError::InvalidLightmaps)?;
        let light_height = nonnegative(reader.i32()?, GndError::InvalidLightmaps)?;
        let light_grid = nonnegative(reader.i32()?, GndError::InvalidLightmaps)?;
        // A zero dimension makes the record empty even when other dimensions are large.
        let light_stride = if light_width == 0 || light_height == 0 || light_grid == 0 {
            0
        } else {
            product(product(light_width, light_height)?, light_grid)?
        };
        if light_count > 0 && light_stride < LIGHT_SIDE * LIGHT_SIDE {
            return Err(GndError::InvalidLightmaps);
        }
        let lights = reader.take(product(light_count, product(light_stride, 4)?)?)?;
        let tile_count = reader.u32()? as usize;
        let tiles = reader.take(product(tile_count, TILE_BYTES)?)?;
        let surfaces = reader.take(product(cells, SURFACE_BYTES)?)?;
        let water = if version >= &[1, 8] {
            Some(read_water(&mut reader, version >= &[1, 9])?)
        } else {
            None
        };
        Ok(Self {
            width,
            height,
            texture_count,
            texture_stride,
            textures,
            light_count,
            light_stride,
            lights,
            tiles,
            surfaces,
            water,
        })
    }

    fn texture_names(&self) -> Result<(Vec<Vec<u8>>, Vec<usize>), GndError> {
        let mut names = Vec::new();
        let mut by_name = HashMap::new();
        // Original indices in tile records are u16. Remaining names still go to the renderer.
        let index_count = self.texture_count.min(u16::MAX as usize + 1);
        let mut indices = reserve(index_count)?;
        if self.texture_count != 0 {
            for name in self.textures.chunks_exact(self.texture_stride) {
                let end = name
                    .iter()
                    .position(|&byte| byte == 0)
                    .unwrap_or(name.len());
                let name = &name[..end];
                let index = if let Some(&index) = by_name.get(name) {
                    index
                } else {
                    let index = names.len();
                    let mut copied_name = reserve(name.len())?;
                    copied_name.extend_from_slice(name);
                    names.try_reserve(1).map_err(|_| GndError::MemoryLimit)?;
                    by_name.try_reserve(1).map_err(|_| GndError::MemoryLimit)?;
                    names.push(copied_name);
                    by_name.insert(name, index);
                    index
                };
                if indices.len() < index_count {
                    indices.push(index);
                }
            }
        }
        Ok((names, indices))
    }

    fn tile(&self, index: usize) -> Option<&'a [u8]> {
        self.tiles
            .as_chunks::<TILE_BYTES>()
            .0
            .get(index)
            .map(<[_; TILE_BYTES]>::as_slice)
    }

    fn output_sizes(&self, water: f64, wave: f64) -> Result<OutputSizes, GndError> {
        let light = Atlas::new(self.light_count, LIGHT_SIDE)?.rgba_bytes()?;
        if light > MAX_LIGHTMAP_BYTES {
            return Err(GndError::MemoryLimit);
        }
        let mut ground_quads = 0;
        let mut water_quads = 0;
        for (index, bytes) in self
            .surfaces
            .as_chunks::<SURFACE_BYTES>()
            .0
            .iter()
            .enumerate()
        {
            let surface = Surface::from_bytes(bytes);
            for tile in surface.tiles.iter().flatten() {
                let record = self.tile(*tile).ok_or(GndError::InvalidReference)?;
                if read_u16(&record[32..]) >= self.texture_count
                    || read_u16(&record[34..]) >= self.light_count
                {
                    return Err(GndError::InvalidReference);
                }
            }
            let [top, front, right] = surface.tiles;
            ground_quads += usize::from(top.is_some())
                + usize::from(front.is_some() && index / self.width + 1 < self.height)
                + usize::from(right.is_some() && index % self.width + 1 < self.width);
            water_quads += usize::from(surface.has_water(water, wave));
        }
        let cells = self.surfaces.len() / SURFACE_BYTES;
        let color = product(cells, 4)?;
        let shadow = product(cells, LIGHT_SIDE * LIGHT_SIDE)?;
        let mesh = product(ground_quads, GROUND_FLOATS_PER_QUAD)?;
        let water_mesh = product(water_quads, WATER_FLOATS_PER_QUAD)?;
        let total = [
            light,
            color,
            shadow,
            product(mesh, 4)?,
            product(water_mesh, 4)?,
        ];
        if total
            .into_iter()
            .try_fold(0_usize, |sum, length| sum.checked_add(length))
            .is_none_or(|sum| sum > MAX_GROUND_OUTPUT_BYTES)
        {
            return Err(GndError::MemoryLimit);
        }
        Ok(OutputSizes {
            color,
            shadow,
            mesh,
            water_mesh,
        })
    }
}

struct OutputSizes {
    color: usize,
    shadow: usize,
    mesh: usize,
    water_mesh: usize,
}

fn nonnegative(value: i32, error: GndError) -> Result<usize, GndError> {
    usize::try_from(value).map_err(|_| error)
}

fn read_zone(reader: &mut Reader<'_>) -> Result<WaterZone, GndError> {
    Ok(WaterZone {
        level: reader.float()?,
        kind: reader.i32()?,
        wave_height: reader.float()?,
        wave_speed: reader.float()?,
        wave_pitch: reader.float()?,
        anim_speed: reader.i32()?,
    })
}

struct WaterSource<'a> {
    global: GroundWater,
    records: Option<&'a [u8]>,
}

impl WaterSource<'_> {
    fn decode(mut self) -> Result<GroundWater, GndError> {
        if let Some(bytes) = self.records {
            let count = bytes.len() / 24;
            let mut zones = reserve(count)?;
            let mut reader = Reader(bytes);
            for _ in 0..count {
                zones.push(read_zone(&mut reader)?);
            }
            self.global.zones = Some(zones);
        }
        Ok(self.global)
    }
}

fn read_water<'a>(reader: &mut Reader<'a>, has_zones: bool) -> Result<WaterSource<'a>, GndError> {
    let water = read_zone(reader)?;
    let split_width = reader.i32()?;
    let split_height = reader.i32()?;
    if split_width < 0 || split_height < 0 {
        return Err(GndError::InvalidWater);
    }
    let records = if has_zones {
        let count = product(split_width as usize, split_height as usize)?;
        Some(reader.take(product(count, 24)?)?)
    } else {
        None
    };
    Ok(WaterSource {
        global: GroundWater {
            level: water.level / 5.0,
            kind: water.kind,
            wave_height: water.wave_height / 5.0,
            wave_speed: water.wave_speed,
            wave_pitch: water.wave_pitch,
            anim_speed: water.anim_speed,
            split_width,
            split_height,
            zones: None,
        },
        records,
    })
}

struct Surface {
    heights: [f64; 4],
    tiles: [Option<usize>; 3],
}

impl Surface {
    fn from_bytes(bytes: &[u8]) -> Self {
        let heights = std::array::from_fn(|i| read_float(&bytes[4 * i..]) / 5.0);
        let tiles =
            std::array::from_fn(|i| usize::try_from(read_u32(&bytes[16 + 4 * i..]) as i32).ok());
        Self { heights, tiles }
    }

    fn has_water(&self, water: f64, wave: f64) -> bool {
        self.tiles[0].is_some() && self.heights.iter().any(|&height| height > water - wave)
    }
}

type Vector = [f64; 3];

fn add(a: Vector, b: Vector) -> Vector {
    std::array::from_fn(|i| a[i] + b[i])
}

fn subtract(a: Vector, b: Vector) -> Vector {
    std::array::from_fn(|i| a[i] - b[i])
}

fn normalized(vector: Vector) -> Option<Vector> {
    let [x, y, z] = vector;
    let squared = x * x + y * y + z * z;
    (squared > 0.0).then(|| {
        let inverse = 1.0 / squared.sqrt();
        vector.map(|value| value * inverse)
    })
}

fn triangle_normal(a: Vector, b: Vector, c: Vector) -> Vector {
    let [x, y, z] = subtract(c, b);
    let [u, v, w] = subtract(a, b);
    normalized([y * w - z * v, z * u - x * w, x * v - y * u]).unwrap_or([0.0; 3])
}

fn surface_normal(surface: &Surface) -> [f32; 3] {
    if surface.tiles[0].is_none() {
        return [0.0; 3];
    }
    // The worker stores the triangle corners and the combined face normal in Float32Array.
    let [h0, h1, h2, h3] = surface.heights.map(|height| f64::from(height as f32));
    let [a, b, c, d] = [
        [0.0, h0, 0.0],
        [2.0, h1, 0.0],
        [2.0, h3, 2.0],
        [0.0, h2, 2.0],
    ];
    normalized(add(triangle_normal(a, b, c), triangle_normal(c, d, a)))
        .unwrap_or([0.0; 3])
        .map(|value| value as f32)
}

fn corner_normals(normals: &[[f32; 3]], center: usize, width: usize) -> [Vector; 4] {
    let stride = width as isize;
    let sample = |offset| {
        normals
            .get((center as isize + offset) as usize)
            .copied()
            .unwrap_or([0.0; 3])
            .map(f64::from)
    };
    let origin = sample(0);
    // The legacy worker uses linear indices at row boundaries as well as inside rows.
    let neighbors = [
        [-1, -1 - stride, -stride],
        [1, 1 - stride, -stride],
        [1, 1 + stride, stride],
        [-1, -1 + stride, stride],
    ];
    neighbors.map(|[a, b, c]| {
        let total = add(add(add(origin, sample(a)), sample(b)), sample(c));
        normalized(total).unwrap_or(total)
    })
}

struct Face {
    vertices: [Vector; 4],
    normals: [Vector; 4],
    texture_order: [usize; 4],
    light_order: [usize; 4],
    color_uv: [[f64; 2]; 4],
    triangle_order: [usize; 6],
}

impl Face {
    fn write(&self, output: &mut Vec<f32>, texture_uv: [[f64; 2]; 4], light_uv: [[f64; 2]; 4]) {
        for i in self.triangle_order {
            let [x, y, z] = self.vertices[i];
            let [nx, ny, nz] = self.normals[i];
            let [u, v] = texture_uv[self.texture_order[i]];
            let [lu, lv] = light_uv[self.light_order[i]];
            let [cu, cv] = self.color_uv[i];
            output.extend([x, y, z, nx, ny, nz, u, v, lu, lv, cu, cv].map(|value| value as f32));
        }
    }
}

struct Terrain<'a> {
    source: Source<'a>,
    surfaces: Vec<Surface>,
    textures: Vec<Vec<u8>>,
    texture_indices: Vec<usize>,
    texture_atlas: Atlas,
    light_atlas: Atlas,
    water_height: f64,
    wave_height: f64,
}

impl Terrain<'_> {
    fn draw_face(&self, mesh: &mut Vec<f32>, tile_index: usize, face: &Face) {
        let tile = self.source.tile(tile_index).unwrap();
        let texture = self.texture_indices[read_u16(&tile[32..])];
        let light = read_u16(&tile[34..]);
        let texture_uv = std::array::from_fn(|i| {
            self.texture_atlas.map_tile_uv(
                texture,
                read_float(&tile[i * 4..]),
                read_float(&tile[16 + i * 4..]),
            )
        });
        face.write(mesh, texture_uv, self.light_atlas.light_uv(light));
    }

    fn build(self, sizes: OutputSizes) -> Result<Ground, GndError> {
        let width = self.source.width;
        let height = self.source.height;
        let lightmap = self.light_atlas.unpack_light(
            self.source.lights,
            self.source.light_count,
            self.source.light_stride,
        )?;
        let shadow_width = width * LIGHT_SIDE;
        let mut shadow_map = fill_bytes(sizes.shadow, 255)?;
        let mut tile_color = fill_bytes(sizes.color, 0)?;
        let mut normals = reserve(self.surfaces.len())?;
        normals.extend(self.surfaces.iter().map(surface_normal));
        let mut mesh = reserve(sizes.mesh)?;
        let mut water_mesh = reserve(sizes.water_mesh)?;

        for (index, surface) in self.surfaces.iter().enumerate() {
            let x = index % width;
            let y = index / width;
            let xl = (x * 2) as f64;
            let xr = xl + 2.0;
            let zt = (y * 2) as f64;
            let zb = zt + 2.0;
            let [h0, h1, h2, h3] = surface.heights;
            let [top, front, right] = surface.tiles;
            if let Some(tile) = top {
                let record = self.source.tile(tile).unwrap();
                let [blue, green, red, alpha] = record[36..40].try_into().unwrap();
                tile_color[index * 4..index * 4 + 4].copy_from_slice(&[red, green, blue, alpha]);
                let start = read_u16(&record[34..]) * self.source.light_stride * 4;
                for row in 0..LIGHT_SIDE {
                    let from = start + row * LIGHT_SIDE;
                    let to = (y * LIGHT_SIDE + row) * shadow_width + x * LIGHT_SIDE;
                    shadow_map[to..to + LIGHT_SIDE]
                        .copy_from_slice(&self.source.lights[from..from + LIGHT_SIDE]);
                }
                let u = (x as f64 + 0.5) / width as f64;
                let v = (y as f64 + 0.5) / height as f64;
                let u_end = (x as f64 + 1.5) / width as f64;
                let v_end = (y as f64 + 1.5) / height as f64;
                self.draw_face(
                    &mut mesh,
                    tile,
                    &Face {
                        vertices: [[xl, h0, zt], [xr, h1, zt], [xr, h3, zb], [xl, h2, zb]],
                        normals: corner_normals(&normals, index, width),
                        texture_order: [0, 1, 3, 2],
                        light_order: [0, 1, 2, 3],
                        color_uv: [[u, v], [u_end, v], [u_end, v_end], [u, v_end]],
                        triangle_order: FLOOR_ORDER,
                    },
                );
                if surface.has_water(self.water_height, self.wave_height) {
                    let water = self.water_height;
                    let u = (x % 5) as f64 / 5.0;
                    let v = (y % 5) as f64 / 5.0;
                    let u_end = (x % 5 + 1) as f64 / 5.0;
                    let v_end = (y % 5 + 1) as f64 / 5.0;
                    let corners = [
                        [xl, water, zt, u, v],
                        [xr, water, zt, u_end, v],
                        [xr, water, zb, u_end, v_end],
                        [xl, water, zb, u, v_end],
                    ];
                    for corner in FLOOR_ORDER {
                        water_mesh.extend(corners[corner].map(|value| value as f32));
                    }
                }
            }
            if let Some(tile) = front.filter(|_| y + 1 < height) {
                let [n0, n1, ..] = self.surfaces[index + width].heights;
                self.draw_face(
                    &mut mesh,
                    tile,
                    &Face {
                        vertices: [[xl, n0, zb], [xr, h3, zb], [xr, n1, zb], [xl, h2, zb]],
                        normals: [[0.0, 0.0, 1.0]; 4],
                        texture_order: [2, 1, 3, 0],
                        light_order: [3, 1, 2, 0],
                        color_uv: [[0.0; 2]; 4],
                        triangle_order: [0, 1, 2, 0, 1, 3],
                    },
                );
            }
            if let Some(tile) = right.filter(|_| x + 1 < width) {
                let [n0, _, n2, _] = self.surfaces[index + 1].heights;
                self.draw_face(
                    &mut mesh,
                    tile,
                    &Face {
                        vertices: [[xr, h1, zt], [xr, h3, zb], [xr, n0, zt], [xr, n2, zb]],
                        normals: [[1.0, 0.0, 0.0]; 4],
                        texture_order: [1, 0, 3, 2],
                        light_order: [1, 0, 2, 3],
                        color_uv: [[0.0; 2]; 4],
                        triangle_order: [0, 1, 2, 2, 3, 1],
                    },
                );
            }
        }
        Ok(Ground {
            width: width as u32,
            height: height as u32,
            textures: self.textures,
            lightmap_count: self.source.light_count as u32,
            lightmap,
            tile_color,
            shadow_map,
            mesh,
            water_mesh,
            water: self.source.water.map(WaterSource::decode).transpose()?,
        })
    }
}

/// Decode a GND file into the terrain streams consumed by the map renderer.
pub fn decode_gnd(
    bytes: &[u8],
    rsw_water_level: f64,
    rsw_wave_height: f64,
) -> Result<Ground, GndError> {
    let source = Source::parse(bytes)?;
    let (water_height, wave_height) = source
        .water
        .as_ref()
        .map_or((rsw_water_level, rsw_wave_height), |water| {
            (water.global.level, water.global.wave_height)
        });
    let sizes = source.output_sizes(water_height, wave_height)?;
    let mut surfaces = reserve(source.surfaces.len() / SURFACE_BYTES)?;
    surfaces.extend(
        source
            .surfaces
            .as_chunks::<SURFACE_BYTES>()
            .0
            .iter()
            .map(|surface| Surface::from_bytes(surface)),
    );
    let (textures, texture_indices) = source.texture_names()?;
    let texture_atlas = Atlas::new(textures.len(), 258)?;
    let light_atlas = Atlas::new(source.light_count, LIGHT_SIDE)?;
    Terrain {
        source,
        surfaces,
        textures,
        texture_indices,
        texture_atlas,
        light_atlas,
        water_height,
        wave_height,
    }
    .build(sizes)
}

/// Validate an input before caching it, without allocating renderer output.
pub fn validate_gnd(bytes: &[u8]) -> Result<(), GndError> {
    let source = Source::parse(bytes)?;
    let (water, wave) = source.water.as_ref().map_or((f64::INFINITY, 0.0), |water| {
        (water.global.level, water.global.wave_height)
    });
    source.output_sizes(water, wave).map(|_| ())
}

#[cfg(test)]
mod tests {
    use super::*;

    fn ground_fixture(version: u8, light_count: u32, pixel_stride: u32, face: i32) -> Vec<u8> {
        let mut bytes = b"GRGN\x01".to_vec();
        bytes.push(version);
        for value in [1_u32, 1, 1.0_f32.to_bits(), 1, 4] {
            bytes.extend(value.to_le_bytes());
        }
        bytes.extend([0xC0, b'x', 0, b'?']);
        for value in [light_count, pixel_stride, 1, 1] {
            bytes.extend(value.to_le_bytes());
        }
        let stride = pixel_stride as usize;
        let data = bytes.len();
        if stride > 0 {
            bytes.resize(data + light_count as usize * stride * 4, 0);
        }
        if light_count > 0 && stride >= 64 {
            bytes[data] = 45;
            bytes[data + stride..data + stride + 3].copy_from_slice(&[1, 2, 3]);
        }
        bytes.extend(1_u32.to_le_bytes());
        bytes.extend([0; 32]);
        bytes.extend(if face < 0 { [255; 4] } else { [0; 4] });
        bytes.extend([4, 5, 6, 7]);
        for value in [0_f32, 0.0, 0.0, 0.0] {
            bytes.extend(value.to_le_bytes());
        }
        for value in [face, -1, -1] {
            bytes.extend(value.to_le_bytes());
        }
        bytes
    }

    #[test]
    fn preserves_padded_rgba_and_the_worker_vertex_layout() {
        let ground = decode_gnd(&ground_fixture(7, 1, 128, 0), 0.0, 1.0).unwrap();
        assert_eq!(
            (ground.width, ground.height, ground.lightmap_count),
            (1, 1, 1)
        );
        assert_eq!(ground.textures, [vec![0xC0, b'x']]);
        assert_eq!(&ground.lightmap[..4], &[1, 2, 3, 45]);
        assert_eq!(&ground.tile_color, &[6, 5, 4, 7]);
        assert_eq!(ground.shadow_map.len(), 64);
        assert_eq!(ground.shadow_map[0], 45);
        assert_eq!(ground.mesh.len(), 72);
        assert_eq!(&ground.mesh[..6], &[0.0, 0.0, 0.0, 0.0, -1.0, 0.0]);
        assert_eq!(&ground.mesh[8..12], &[0.125, 0.125, 0.5, 0.5]);
        assert_eq!(ground.water_mesh.len(), 30);
        assert!(ground.water.is_none());
    }

    #[test]
    fn preserves_empty_faces_without_requiring_unused_texture_or_light_indices() {
        let ground = decode_gnd(&ground_fixture(7, 0, 0, -2), 0.0, 0.0).unwrap();
        assert!(ground.lightmap.is_empty());
        assert!(ground.mesh.is_empty());
        assert_eq!(ground.tile_color, [0; 4]);
        assert_eq!(ground.shadow_map, [255; 64]);
    }

    #[test]
    fn rejects_truncation_and_invalid_backing_before_allocating_output() {
        let mut fixture = ground_fixture(7, 1, 64, 0);
        assert!(validate_gnd(&fixture).is_ok());
        for length in 0..fixture.len() {
            assert!(validate_gnd(&fixture[..length]).is_err());
        }
        fixture[338] = 1; // Texture index in tile record.
        assert_eq!(validate_gnd(&fixture), Err(GndError::InvalidReference));
        fixture[338] = 0;
        fixture[362..366].copy_from_slice(&i32::MAX.to_le_bytes());
        assert_eq!(validate_gnd(&fixture), Err(GndError::InvalidReference));
        assert!(decode_gnd(&ground_fixture(7, i32::MAX as u32, 0, -1), 0.0, 0.0).is_err());
        assert!(decode_gnd(&ground_fixture(7, 1, 63, 0), 0.0, 0.0).is_err());
    }

    #[test]
    fn reads_gnd_water_override_and_preserves_zone_units() {
        let mut bytes = ground_fixture(9, 1, 64, 0);
        for value in [
            (5_f32).to_bits(),
            2,
            (10_f32).to_bits(),
            (2_f32).to_bits(),
            (50_f32).to_bits(),
            3,
            1,
            1,
        ] {
            bytes.extend(value.to_le_bytes());
        }
        for value in [
            (15_f32).to_bits(),
            4,
            (25_f32).to_bits(),
            (3_f32).to_bits(),
            (40_f32).to_bits(),
            5,
        ] {
            bytes.extend(value.to_le_bytes());
        }
        let ground = decode_gnd(&bytes, 100.0, 0.0).unwrap();
        assert_eq!(ground.water_mesh[1], 1.0);
        let water = ground.water.unwrap();
        assert_eq!((water.level, water.wave_height, water.kind), (1.0, 2.0, 2));
        let zone = &water.zones.unwrap()[0];
        assert_eq!(
            (zone.level, zone.wave_height, zone.kind, zone.anim_speed),
            (15.0, 25.0, 4, 5)
        );
        assert!(decode_gnd(&bytes[..bytes.len() - 1], 0.0, 0.0).is_err());
    }

    #[test]
    fn caps_derived_light_atlas_across_rounding_boundary() {
        assert_eq!(
            Atlas::new(512 * 512, LIGHT_SIDE)
                .unwrap()
                .rgba_bytes()
                .unwrap(),
            MAX_LIGHTMAP_BYTES
        );
        assert_eq!(
            Atlas::new(512 * 512 + 1, LIGHT_SIDE)
                .unwrap()
                .rgba_bytes()
                .unwrap(),
            MAX_LIGHTMAP_BYTES * 2
        );
        assert_eq!(Atlas::new(0, LIGHT_SIDE).unwrap().rgba_bytes().unwrap(), 0);
    }
}
