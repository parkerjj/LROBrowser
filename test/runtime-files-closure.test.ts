import { readFileSync } from 'node:fs';
import path from 'node:path';
import { expect, test } from 'vitest';

// 运行时只会打包 core-asset-roots.json 列出的文件；漏列的相对 import 在 IWA 里会 404。
test('every relative import of a packaged runtime module is itself packaged', () => {
  const { runtimeFiles } = JSON.parse(readFileSync('config/core-asset-roots.json', 'utf8')) as { runtimeFiles: string[] };
  // 打包后所有运行时文件平铺在 runtime/ 下，import 按文件名解析。
  const packaged = new Set(runtimeFiles.map(name => path.posix.basename(name)));
  const missing: string[] = [];
  for (const file of runtimeFiles.filter(name => name.endsWith('.mjs'))) {
    const source = readFileSync(file, 'utf8');
    for (const match of source.matchAll(/(?:^|\n)\s*(?:import|export)\b[^'"\n;]*?from\s*['"](\.{1,2}\/[^'"]+)['"]|import\(\s*['"](\.{1,2}\/[^'"]+)['"]\s*\)/g)) {
      const target = path.posix.basename(match[1] ?? match[2]!);
      if (!packaged.has(target)) missing.push(`${file} -> ${target}`);
    }
  }
  expect(missing).toEqual([]);
});
