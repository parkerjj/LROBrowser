import assert from 'node:assert/strict';
import { readdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import { createContext, runInContext } from 'node:vm';
import { legacyVendorSource, repo, runAssetBenchmark } from './asset-bench.mjs';
const spriteRoot = path.join(repo, 'vendor/core/data/sprite');
const vendor = legacyVendorSource('Online.js').replaceAll('\r\n', '\n');
function region(name) {
  const start = vendor.indexOf('//#region ' + name + '\n');
  const end = vendor.indexOf('//#endregion', start + 1);
  assert(start >= 0 && end > start, 'Missing vendor region ' + name);
  return vendor.slice(start, end);
}

const context = createContext({
  ArrayBuffer, Uint8Array, DataView,
  __esmMin: initialize => initialize,
  init_Struct() {},
  init_CodepageManager() {},
});
context.self = context;
const spriteSource = region('src/Loaders/Sprite.js');
const Sprite = runInContext(region('src/Utils/BinaryReader.js') + spriteSource + '\ninit_Sprite(); SPR;', context);
const loopStart = spriteSource.indexOf('while (fp.tell() < end)');
const loopEnd = spriteSource.indexOf('frames[i] = {', loopStart);
assert(loopStart >= 0 && loopEnd > loopStart, 'Missing vendor indexed RLE loop');
// Only the kernel is timed. The unmodified loader supplies expected bytes for every frame.
const decodeLegacy = runInContext(`(function (input, size) {
  const fp = new BinaryReader(input.buffer, input.byteOffset, input.byteLength);
  const end = input.byteLength;
  const data = new Uint8Array(size);
  let index = 0, c, count, j;
  ${spriteSource.slice(loopStart, loopEnd)}
  return data;
})`, context);

function decodeJs(input, size) {
  const output = new Uint8Array(size);
  let position = 0;
  for (let offset = 0; offset < input.length; offset++) {
    const pixel = input[offset];
    if (pixel !== 0) {
      if (position >= size) throw new RangeError('Invalid RLE output size');
      output[position++] = pixel;
    } else {
      if (++offset >= input.length) throw new RangeError('Incomplete RLE run');
      position += input[offset] || 2;
      if (position > size) throw new RangeError('Invalid RLE output size');
    }
  }
  return output;
}

const frames = [];
const names = [];
for (const entry of await readdir(spriteRoot, { recursive: true, withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith('.spr')) continue;
  const file = path.join(entry.parentPath, entry.name);
  const data = await readFile(file);
  if (data[2] !== 1 || data[3] !== 2) continue;
  const original = new Sprite(Uint8Array.from(data).buffer);
  let offset = 8;
  for (const frame of original.frames.slice(0, original.indexed_count)) {
    const size = data.readUInt16LE(offset + 4);
    const input = data.subarray(offset + 6, offset + 6 + size);
    const output = frame.data;
    assert.equal(input.length, size);
    assert.deepEqual(decodeLegacy(input, output.length), output);
    assert.deepEqual(decodeJs(input, output.length), output);
    frames.push({ input, output });
    offset += 6 + size;
  }
  names.push(path.relative(spriteRoot, file));
}
assert(frames.length > 0, 'No bundled SPR 2.1 indexed frames found');

await runAssetBenchmark({
  format: 'spr',
  fixtures: frames,
  jsBackends: [['currentJs', decodeLegacy], ['tunedJs', decodeJs]],
  repetitions: 80,
  metadata: {
    files: names.sort(), frames: frames.length,
    pixels: frames.reduce((sum, frame) => sum + frame.output.length, 0),
  },
});
