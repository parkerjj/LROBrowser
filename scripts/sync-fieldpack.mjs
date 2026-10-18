#!/usr/bin/env node

import { createHash } from 'node:crypto';
import { copyFile, mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';

const args = process.argv.slice(2);
function option(name, fallback) {
  const index = args.indexOf(name);
  return index >= 0 ? args[index + 1] : fallback;
}

const source = option('--source', process.env.OPENKORE_FIELDS ?? '');
const destination = option(
  '--dest',
  path.resolve(process.cwd(), 'public/ke/map/fieldpack-2.0.5'),
);
const revision = option('--revision', process.env.OPENKORE_REVISION ?? 'unknown');

if (!source) {
  process.stderr.write('usage: node scripts/sync-fieldpack.mjs --source <openkore>/fields [--dest <dir>] [--revision <sha>]\n');
  process.exit(1);
}

async function findFieldMaps(directory, prefix = '') {
  const files = [];
  for (const entry of await readdir(directory, { withFileTypes: true })) {
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) {
      files.push(...await findFieldMaps(path.join(directory, entry.name), relativePath));
    } else if (entry.isFile() && entry.name.endsWith('.fld2.gz')) {
      files.push({ sourcePath: path.join(directory, entry.name), relativePath });
    }
  }
  return files;
}

const files = (await findFieldMaps(source)).sort((a, b) =>
  a.relativePath.localeCompare(b.relativePath));
if (!files.length) throw new Error(`No .fld2.gz files found under ${source}`);

const manifest = {};
let totalBytes = 0;
for (const file of files) {
  const bytes = await readFile(file.sourcePath);
  const target = path.join(destination, file.relativePath);
  await mkdir(path.dirname(target), { recursive: true });
  await copyFile(file.sourcePath, target);
  manifest[file.relativePath] = {
    sha256: createHash('sha256').update(bytes).digest('hex'),
    bytes: bytes.byteLength,
  };
  totalBytes += bytes.byteLength;
}

await writeFile(
  path.join(destination, 'manifest.json'),
  `${JSON.stringify({
    schemaVersion: 1,
    fieldpackVersion: '2.0.5',
    source: { revision, fileCount: files.length, totalBytes },
    files: manifest,
  }, null, 2)}\n`,
);

process.stdout.write(`Copied ${files.length} field maps (${totalBytes} bytes) to ${destination}\n`);
