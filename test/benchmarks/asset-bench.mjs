import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { execFileSync } from 'node:child_process';
import { log } from 'node:console';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { cpus } from 'node:os';
import path from 'node:path';
import { performance } from 'node:perf_hooks';
import process from 'node:process';
import { fileURLToPath, URL } from 'node:url';

export const repo = fileURLToPath(new URL('../../', import.meta.url));

export function legacyVendorSource(filename) {
  return execFileSync('git', ['show', '753c75e:vendor/v2/' + filename], { cwd: repo, encoding: 'utf8', maxBuffer: 32 * 1024 * 1024 });
}

export async function runAssetBenchmark({ format, fixtures, jsBackends, repetitions, metadata }) {
  const formatId = { spr: 0, gat: 1 }[format];
  assert.notEqual(formatId, undefined);
  const outputDir = path.join(repo, 'generated', 'rust-asset-benchmark', format);
  const binary = name => path.join(outputDir, name + (process.platform === 'win32' ? '.exe' : ''));
  const sampleCount = 21;
  await mkdir(outputDir, { recursive: true });
  const packedFixtures = path.join(outputDir, 'fixtures.bin');
  await writeFile(packedFixtures, Buffer.concat(fixtures.flatMap(({ input, output }) => {
    const header = Buffer.alloc(8);
    header.writeUInt32LE(input.length, 0);
    header.writeUInt32LE(output.length, 4);
    return [header, input, output];
  })));
  const rust = path.join(repo, 'test/benchmarks/asset-decode.rs');
  const wasm = path.join(outputDir, 'asset-decode.wasm');
  const compile = (...args) => execFileSync('rustc', ['+1.99.0', '--edition=2024', rust, ...args], { stdio: 'inherit' });
  compile('--test', '-o', binary('asset-decode-test'));
  execFileSync(binary('asset-decode-test'), { stdio: 'inherit' });
  compile('-O', '-o', binary('asset-decode'));
  compile('-O', '--target', 'wasm32-unknown-unknown', '--crate-type', 'cdylib', '-C', 'strip=symbols', '-o', wasm);

  const wasmBytes = await readFile(wasm);
  const wasmStart = performance.now();
  const { instance: { exports: { memory, allocate, decode_asset: decodeAsset } } } = await globalThis.WebAssembly.instantiate(wasmBytes);
  const wasmInitMs = performance.now() - wasmStart;
  const inputAddress = allocate(Math.max(...fixtures.map(fixture => fixture.input.length)));
  const outputAddress = allocate(Math.max(...fixtures.map(fixture => fixture.output.length)));
  const heap = new Uint8Array(memory.buffer);
  function decodeWasm(input, size) {
    heap.set(input, inputAddress);
    assert.equal(decodeAsset(formatId, inputAddress, input.length, outputAddress, size), 1);
    return heap.slice(outputAddress, outputAddress + size);
  }
  for (const { input, output } of fixtures) assert.deepEqual(decodeWasm(input, output.length), output);

  const native = execFileSync(binary('asset-decode'), [format, packedFixtures, String(repetitions), String(sampleCount)], { encoding: 'utf8' })
    .trim().split(/\s+/).map(Number);
  let checksum = 0;
  function batch(decode) {
    const start = performance.now();
    for (let index = 0; index < repetitions; index++) {
      for (const { input, output } of fixtures) {
        const decoded = decode(input, output.length);
        checksum += decoded[decoded.length >>> 1] ?? 0;
      }
    }
    return performance.now() - start;
  }
  const backends = [...jsBackends, ['rustWasmWithCopies', decodeWasm]];
  const timings = { nativeRustKernel: native };
  for (const [name, backend] of backends) {
    for (let index = 0; index < 3; index++) batch(backend);
    timings[name] = [];
  }
  for (let sample = 0; sample < sampleCount; sample++) {
    // Rotate measurement order to reduce bias from warmup and scheduling.
    for (let index = 0; index < backends.length; index++) {
      const [name, backend] = backends[(sample + index) % backends.length];
      timings[name].push(batch(backend));
    }
  }
  const stats = values => {
    const sorted = [...values].sort((a, b) => a - b);
    return { medianMs: sorted[Math.floor(sorted.length / 2)], p95Ms: sorted[Math.ceil(sorted.length * 0.95) - 1] };
  };
  log(JSON.stringify({
    format, platform: process.platform, cpu: cpus()[0]?.model, nodeVersion: process.version, rustVersion: '1.99.0',
    ...metadata, repetitions, sampleCount, wasmBytes: wasmBytes.length, wasmInitMs, checksum,
    millisecondsPerBatch: Object.fromEntries(Object.entries(timings).map(([name, values]) => [name, stats(values)])),
  }, null, 2));
}
