import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import { runInNewContext } from 'node:vm';
import ts from 'typescript';
import { legacyVendorSource, runAssetBenchmark } from './asset-bench.mjs';

const source = legacyVendorSource('ThreadEventHandler.js');
const worker = ts.createSourceFile('ThreadEventHandler.js', source, ts.ScriptTarget.Latest, true, ts.ScriptKind.JS);
const readers = new Map([
  ['K.prototype.readBinaryString', null],
  ['K.prototype.readUByte', null],
  ['K.prototype.readULong', null],
  ['K.prototype.readFloat', null],
]);
let reader;
let gat;
function visit(node) {
  if (ts.isFunctionDeclaration(node) && node.name?.text === 'K' && node.getText(worker).includes('Undefined buffer type')) {
    assert.equal(reader, undefined);
    reader = node.getText(worker);
  }
  if (ts.isBinaryExpression(node) && node.operatorToken.kind === ts.SyntaxKind.EqualsToken) {
    const key = node.left.getText(worker);
    if (readers.has(key)) {
      assert.equal(readers.get(key), null);
      readers.set(key, node.getText(worker));
    }
  }
  if (ts.isClassExpression(node) && node.members.some(member =>
    ts.isMethodDeclaration(member) && member.name.getText(worker) === 'load' &&
    member.getText(worker).includes('GAT::load() - Invalid header'))) {
    assert.equal(gat, undefined);
    gat = node.getText(worker);
  }
  ts.forEachChild(node, visit);
}
visit(worker);
assert(reader && gat && [...readers.values()].every(Boolean), 'Missing GAT worker parser');
const Gat = runInNewContext(`${reader}; ${[...readers.values()].join(';')}; (${gat});`, {
  ArrayBuffer, DataView, Uint8Array, Float32Array,
});
const decodeWorker = input => new Uint8Array(new Gat(input.buffer).compile().cells.buffer);

const files = process.argv.slice(2);
let fixture;
if (!files.length) {
  // Reproducible coverage for all legacy flag mappings, including unknown flags.
  const flags = [0, 1, 2, 3, 4, 5, 6, 9, 0x80000000, 0x80000001, 0x80000002, 0x80000003,
    0x80000004, 0x80000005, 0x80000006, 0x80000007, 0x80000008, 0x80000009, 0xffffffff];
  fixture = Buffer.alloc(14 + 20 * flags.length);
  fixture.write('GRAT');
  fixture[4] = 1;
  fixture[5] = 2;
  fixture.writeUInt32LE(flags.length, 6);
  fixture.writeUInt32LE(1, 10);
  for (const [i, flag] of flags.entries()) {
    const offset = 14 + i * 20;
    fixture.writeFloatLE(1.15, offset);
    fixture.writeFloatLE(-0, offset + 4);
    fixture.writeFloatLE(-125.5, offset + 8);
    fixture.writeFloatLE(5.125, offset + 12);
    fixture.writeUInt32LE(flag, offset + 16);
  }
}

const inputs = fixture ? [{ name: 'synthetic-gat-1.2', bytes: fixture }] : await Promise.all(files.map(async file => ({
  name: path.basename(file), bytes: await readFile(file),
})));
const facts = [];
const fixtures = inputs.map(({ name, bytes }) => {
  assert.equal(bytes.subarray(0, 4).toString('ascii'), 'GRAT');
  assert(bytes[4] > 0 && bytes[5] <= 9);
  const width = bytes.readUInt32LE(6);
  const height = bytes.readUInt32LE(10);
  assert(width > 0 && height > 0 && width * height <= Math.floor((bytes.length - 14) / 20));
  const input = Uint8Array.from(bytes);
  const output = decodeWorker(input);
  assert.equal(output.length, width * height * 20);
  facts.push({ name, width, height, bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') });
  return { input, output };
});
await runAssetBenchmark({
  format: 'gat',
  fixtures,
  jsBackends: [['currentWorkerJs', decodeWorker]],
  repetitions: fixture ? 200 : 8,
  metadata: {
    fixtureKind: fixture ? 'synthetic' : 'map files',
    files: facts, cells: facts.reduce((sum, map) => sum + map.width * map.height, 0),
  },
});
