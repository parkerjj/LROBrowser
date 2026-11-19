const PACKAGED_DECODER = 'wasm/lro-asset-decode.wasm';
const MAX_INPUT_BYTES = 128 * 1024 * 1024;
const decoderFormats = new Set(['spr', 'gat', 'gnd', 'rsw', 'rsm', 'rsm2', 'act', 'str']);
const utf8 = new TextDecoder();

interface DecoderExports {
  memory: WebAssembly.Memory;
  asset_alloc: (length: number) => number;
  asset_free: (pointer: number, length: number) => void;
  asset_decode: (kind: number, input: number, size: number, water: number, wave: number) => number;
  asset_view: (handle: number, section: number) => number;
  asset_size: (handle: number, section: number) => number;
  asset_drop: (handle: number) => void;
  asset_model_mesh: (geometry: number, words: number, matrices: number, shade: number, alpha: number, finiteZero: number) => number;
}

// This reads the compact output of the packaged WASM, rather than the on-disk formats.
class AssetOutput {
  private readonly view: DataView;
  private offset = 0;

  constructor(private readonly bytes: Uint8Array) {
    this.view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  }

  u8() { return this.view.getUint8(this.offset++); }
  u16() { const value = this.view.getUint16(this.offset, true); this.offset += 2; return value; }
  u32() { const value = this.view.getUint32(this.offset, true); this.offset += 4; return value; }
  i32() { const value = this.view.getInt32(this.offset, true); this.offset += 4; return value; }
  f64() { const value = this.view.getFloat64(this.offset, true); this.offset += 8; return value; }
  triple() { return [this.f64(), this.f64(), this.f64()]; }
  take(length: number) {
    if (length > this.bytes.length - this.offset) throw new RangeError('invalid-asset-decoder-output');
    const result = this.bytes.subarray(this.offset, this.offset + length);
    this.offset += length;
    return result;
  }

  rest() { return this.take(this.bytes.length - this.offset); }
  string(length = this.u8()) {
    const bytes = this.take(length);
    let output = '';
    for (let offset = 0; offset < length; offset += 4096) {
      output += String.fromCharCode(...bytes.subarray(offset, offset + 4096));
    }
    return output;
  }
  align() { this.offset = Math.ceil(this.offset / 4) * 4; }
  floats() { return new Float32Array(this.bytes.buffer, this.bytes.byteOffset + this.offset); }
  json<T>() { return JSON.parse(utf8.decode(this.bytes)) as T; }
  get hasRemaining() { return this.offset < this.bytes.length; }
}

function waterZone(output: AssetOutput) {
  return {
    level: output.f64(), type: output.i32(), waveHeight: output.f64(),
    waveSpeed: output.f64(), wavePitch: output.f64(), animSpeed: output.i32(),
  };
}

function scene(output: AssetOutput) {
  const version = output.u8() + output.u8() / 10;
  const buildnumber = output.i32();
  const ini = output.string(), gnd = output.string(), gat = output.string(), src = output.string();
  const files = { ini, gnd, gat, src: version >= 1.4 ? src : null, buildnumber: version >= 2.5 ? buildnumber : null };
  const ground = { top: output.i32(), bottom: output.i32(), left: output.i32(), right: output.i32() };
  const water = { ...waterZone(output), splitWidth: 0, splitHeight: 0, images: new Array(32) };
  const light = {
    longitude: output.i32(), latitude: output.i32(), diffuse: output.triple(), ambient: output.triple(),
    opacity: output.f64(), direction: new Float32Array(3),
  };
  const models = [], lights = [], sounds = [], effects = [];
  const count = output.u32();
  for (let index = 0; index < count; index++) {
    const type = output.u8();
    const name = output.string();
    switch (type) {
      case 1:
        models.push({
          name: version >= 1.3 ? name : null, animType: output.i32(), animSpeed: output.f64(), blockType: output.i32(),
          UnknownByte: output.i32(), UnknownByte2: output.i32(), filename: output.string(), nodename: output.string(),
          position: output.triple(), rotation: output.triple(), scale: output.triple(),
        });
        break;
      case 2:
        lights.push({ name, pos: output.triple(), color: [output.i32(), output.i32(), output.i32()], range: output.f64() });
        break;
      case 3:
        sounds.push({
          name, file: output.string(), pos: output.triple(), vol: output.f64(), width: output.i32(),
          height: output.i32(), range: output.f64(), cycle: output.f64(),
        });
        break;
      case 4:
        effects.push({ name, pos: output.triple(), id: output.i32(), delay: output.f64(), param: [...output.triple(), output.f64()] });
        break;
      default: throw new Error('invalid-scene-output');
    }
  }
  return { files, ground, light, water, models, lights, sounds, effects };
}

interface ModelFace {
  vertidx: ArrayLike<number>;
  tvertidx: ArrayLike<number>;
  smoothGroup: number;
  texid: number;
}

interface ModelGeometry {
  vertices: readonly ArrayLike<number>[];
  tvertices: Float32Array;
  faces: readonly ModelFace[];
  textures: readonly number[];
}

interface ModelTextureAnimation {
  textureId: number;
  animations: { kind: number; keyframes: { frame: number; offset: number }[] }[];
}

interface ModelNode {
  tvertices: number[];
  textureAnimations?: ModelTextureAnimation[];
}

interface ModelOutput {
  nodes: ModelNode[];
  mainNodeIndex: number;
}

interface AnimationOutput {
  layers: {
    texname: string[];
    animations: { pos: number[]; xy: number[]; uv: number[]; color: number[] }[];
  }[];
}

export function createAssetDecoder(wasm: DecoderExports) {
  const geometryLayouts = new WeakMap<ModelGeometry, Uint8Array<ArrayBuffer>>();

  function withInput<T>(input: Uint8Array, decode: (address: number) => T): T {
    if (!input.byteLength || input.byteLength > MAX_INPUT_BYTES) throw new Error('invalid-asset-input-size');
    const address = wasm.asset_alloc(input.byteLength);
    if (!address) throw new Error('asset-decoder-memory-limit');
    try {
      new Uint8Array(wasm.memory.buffer, address, input.byteLength).set(input);
      return decode(address);
    } finally {
      wasm.asset_free(address, input.byteLength);
    }
  }

  function readResult<T>(handle: number, kind: string, read: (section: (index: number) => Uint8Array) => T): T {
    if (!handle) throw new Error('invalid-asset-' + kind);
    try {
      return read(index => new Uint8Array(wasm.memory.buffer, wasm.asset_view(handle, index), wasm.asset_size(handle, index)).slice());
    } finally {
      wasm.asset_drop(handle);
    }
  }

  function decode<T>(kind: number, label: string, bytes: ArrayBuffer, read: (section: (index: number) => Uint8Array) => T,
    water = 0, wave = 0): T {
    return withInput(new Uint8Array(bytes), address =>
      readResult(wasm.asset_decode(kind, address, bytes.byteLength, water, wave), label, read));
  }

  return {
    decodeSpr(input: ArrayBuffer) {
      return decode(0, 'spr', input, section => {
        const output = new AssetOutput(section(0));
        const minor = output.u8(), major = output.u8();
        const version = major + minor / 10;
        const indexed_count = output.u16(), rgba_count = output.u16();
        output.u16();
        const palette = version > 1 ? output.take(1024) : null;
        const frames = [];
        for (let i = 0; i < indexed_count + rgba_count; i++) {
          const width = output.u16(), height = output.u16();
          const type = i < indexed_count ? 0 : 1;
          const data = output.take(width * height * (type === 1 ? 4 : 1));
          output.align();
          frames.push({ type, width, height, data });
        }
        return { version, indexed_count, _indexed_count: indexed_count, rgba_count, rgba_index: indexed_count, palette, frames };
      });
    },
    decodeGat(input: ArrayBuffer) {
      return decode(1, 'gat', input, section => {
        const output = new AssetOutput(section(0));
        const width = output.u32(), height = output.u32(), version = output.u8() + output.u8() / 10;
        output.align();
        return { width, height, version, cells: output.floats() };
      });
    },
    decodeGnd(input: ArrayBuffer, level: number, wave: number) {
      return decode(2, 'gnd', input, section => {
        const data = new AssetOutput(section(0));
        const width = data.u32(), height = data.u32(), lightmapSize = data.u32();
        const count = data.u32();
        const textures = Array.from({ length: count }, () => data.string(data.u32()));
        let water;
        if (data.hasRemaining) {
          const settings = { ...waterZone(data), splitWidth: data.i32(), splitHeight: data.i32() };
          water = data.hasRemaining ? { ...settings, Zones: Array.from({ length: data.u32() }, () => waterZone(data)) } : settings;
        }
        const mesh = new Float32Array(section(4).buffer);
        const waterMesh = new Float32Array(section(5).buffer);
        return { water, ground: { width, height, lightmapSize, textures, lightmap: section(1), tileColor: section(2),
          shadowMap: section(3), mesh, meshVertCount: mesh.length / 12, waterMesh, waterVertCount: waterMesh.length / 5 } };
      }, level, wave);
    },
    decodeRsw(input: ArrayBuffer) {
      return decode(3, 'rsw', input, section => scene(new AssetOutput(section(0))));
    },
    loadRsm(input: ArrayBuffer, model: { calcBoundingBox(): void }, nodePrototype: object,
      createBox: () => object, createMatrix: () => Float32Array): void {
      const { nodes, mainNodeIndex, ...fields } = decode(4, 'rsm', input, section =>
        new AssetOutput(section(0)).json<ModelOutput>());
      const liveNodes = nodes.map(({ textureAnimations, tvertices, ...node }) => {
        const textureKeyFrameGroup = textureAnimations?.map(({ textureId, animations }) => {
          const group = [];
          const types: ModelTextureAnimation['animations'][number]['keyframes'][] = [];
          group[textureId] = types;
          for (const { kind, keyframes } of animations) {
            const target = types[kind] ??= [];
            for (const keyframe of keyframes) target.push(keyframe);
          }
          return group;
        });
        return Object.assign(Object.create(nodePrototype), node, {
          main: model, is_only: nodes.length === 1,
          box: createBox(), matrix: createMatrix(),
          tvertices: Float32Array.from(tvertices), textureKeyFrameGroup,
        });
      });
      Object.assign(model, fields, { nodes: liveNodes, main_node: liveNodes[mainNodeIndex], instances: [], box: createBox() });
      model.calcBoundingBox();
    },
    modelMesh(node: ModelGeometry, matrix: Float32Array, rotation: Float32Array, shade: number, alpha: number, finiteZero = false) {
      let layout = geometryLayouts.get(node);
      if (!layout) {
        const { faces, textures, vertices, tvertices } = node;
        const uvCount = tvertices.length / 6;
        const words = new Uint32Array(4 + vertices.length * 3 + uvCount * 2 + faces.length * 8 + textures.length);
        const floats = new Float32Array(words.buffer);
        words.set([vertices.length, uvCount, faces.length, textures.length]);
        let offset = 4;
        for (const vertex of vertices) { floats.set(vertex, offset); offset += 3; }
        for (let i = 0; i < tvertices.length; i += 6) {
          floats[offset++] = tvertices[i + 4]!;
          floats[offset++] = tvertices[i + 5]!;
        }
        for (const face of faces) {
          words.set(face.vertidx, offset);
          words.set(face.tvertidx, offset + 3);
          words[offset + 6] = face.texid;
          words[offset + 7] = face.smoothGroup;
          offset += 8;
        }
        words.set(textures, offset);
        layout = new Uint8Array(words.buffer);
        geometryLayouts.set(node, layout);
      }
      const matrices = new Float32Array(32);
      matrices.set(matrix);
      matrices.set(rotation, 16);
      return withInput(layout, address => withInput(new Uint8Array(matrices.buffer), transform =>
        readResult(wasm.asset_model_mesh(address, layout.byteLength / 4, transform, shade, alpha, +finiteZero), 'model-mesh', section => {
          const ids = new Int32Array(section(0).buffer);
          return Object.fromEntries(Array.from(ids, (id, index) => [id, new Float32Array(section(index + 1).buffer)]));
        })));
    },
    decodeAct(input: ArrayBuffer) {
      return decode(5, 'act', input, section => new AssetOutput(section(0)).json<object>());
    },
    decodeStr(input: ArrayBuffer, texturePath: string) {
      return decode(6, 'str', input, section => {
        const asset = new AssetOutput(section(0)).json<AnimationOutput>();
        for (const layer of asset.layers) {
          layer.texname = layer.texname.map(name => 'data\\texture\\effect\\' + texturePath + name);
          for (const frame of layer.animations) {
            for (const property of ['pos', 'xy', 'uv', 'color'] as const) Object.assign(frame, { [property]: Float32Array.from(frame[property]) });
          }
        }
        return { ...asset, texturePath };
      });
    },
    decodeTga(input: Uint8Array) {
      return withInput(input, address => readResult(wasm.asset_decode(7, address, input.byteLength, 0, 0), 'tga', section => {
        const output = new AssetOutput(section(0));
        const width = output.u32(), height = output.u32();
        const rgba = output.rest();
        return { width, height, data: new Uint8ClampedArray(rgba.buffer, rgba.byteOffset, rgba.byteLength) };
      }));
    },
  };
}

export function requiresAssetDecoder(filename: string): boolean {
  return decoderFormats.has(filename.slice(filename.lastIndexOf('.') + 1).toLowerCase());
}

let activeDecoder: ReturnType<typeof createAssetDecoder> | undefined;
let loadingDecoder: Promise<void> | undefined;

export function preloadAssetDecoder(
  files: readonly { path: string; kind?: string }[] | undefined,
  base: URL,
  fetcher: typeof fetch = globalThis.fetch,
): Promise<void> {
  if (!files?.some(entry => entry.path === PACKAGED_DECODER && entry.kind === 'wasm')) {
    return Promise.reject(new Error('asset-decoder-missing-from-package'));
  }
  loadingDecoder ??= (async () => {
    const response = await fetcher(new URL(PACKAGED_DECODER, base), { redirect: 'error', credentials: 'omit' });
    if (!response.ok) throw new Error('asset-decoder-http-' + response.status);
    const { instance } = await WebAssembly.instantiate(await response.arrayBuffer());
    if (!(instance.exports.memory instanceof WebAssembly.Memory)
      || ['asset_alloc', 'asset_free', 'asset_decode', 'asset_view', 'asset_size', 'asset_drop', 'asset_model_mesh']
        .some(name => typeof instance.exports[name] !== 'function')) throw new Error('asset-decoder-incompatible');
    activeDecoder = createAssetDecoder(instance.exports as unknown as DecoderExports);
  })().catch(error => {
    loadingDecoder = undefined;
    throw error;
  });
  return loadingDecoder;
}

export function getAssetDecoder() {
  if (!activeDecoder) throw new Error('asset-decoder-not-ready');
  return activeDecoder;
}
