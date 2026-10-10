/**
 * Read-only diagnostic: run on a networked CI runner, not in the game client.
 * Mirrors must be tested with exactly the filenames published by the origin.
 * Never downloads executable content or stores credentials.
 */
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import process from 'node:process';
import { mkdir, writeFile } from 'node:fs/promises';

const exec = promisify(execFile);
const roots = Object.freeze({
  official: 'http://game.lastro.cn/ro/client_re/',
  mirror: 'https://rodata.ltsd.ro/ro/client_re/',
});
const paths = new Set();
const add = (value) => paths.add(value);
const spriteDir = 'data/sprite/阁胶磐/';
for (const name of ['ill_assulter', 'ill_permeter', 'ill_freezer', 'ill_solider', 'ill_heater', 'ill_turtle_general']) {
  for (const ext of ['spr', 'act']) add(spriteDir + name + '.' + ext);
}
for (const name of ['ill_permeter', 'ill_solider']) {
  for (const ext of ['spr', 'act']) {
    add('data/sprite/몬스터/' + name + '.' + ext);
    add(spriteDir + name.toUpperCase() + '.' + ext.toUpperCase());
  }
}
for (let i = 1; i <= 6; i++) {
  add('data/texture/扁鸥付阑/TUR_H_0' + i + '.BMP');
}
add('data/texture/扁鸥付阑/TUR_H_03.bmp');
add('data/texture/기타마을/TUR_H_03.BMP');
add('data/texture/蜡历牢磐其捞胶/item/i8white.bmp');
add('data/texture/유저인터페이스/item/i8white.bmp');

const encodePath = (path) => path.split('/').map(encodeURIComponent).join('/');
async function requestHeaders(url, method) {
  const args = [
    '-sS', '--max-time', '7', '--connect-timeout', '4',
    '--max-redirs', '0', '-D', '-', '-o', '/dev/null',
    '-w', '\n__CURL_CODE__:%{http_code}\n',
  ];
  if (method === 'HEAD') args.push('-I');
  else args.push('--range', '0-0', '--max-filesize', '16384');
  args.push(url);
  let stdout = '', error = '';
  try {
    ({ stdout } = await exec('curl', args, { timeout: 9_000, maxBuffer: 32_768 }));
  } catch (failed) {
    stdout = failed.stdout ?? '';
    error = (failed.stderr ?? failed.message ?? '').trim().slice(0, 240);
  }
  const code = Number(/__CURL_CODE__:(\d+)/.exec(stdout)?.[1] ?? 0);
  const headerBlock = stdout.split(/\r?\n\r?\n/).findLast(block => /^HTTP\//m.test(block)) ?? '';
  const size = /^(?:content-length):\s*(.+)$/im.exec(headerBlock)?.[1] ?? '';
  const type = /^content-type:\s*(.+)$/im.exec(headerBlock)?.[1] ?? '';
  const location = /^location:\s*(.+)$/im.exec(headerBlock)?.[1] ?? '';
  return { method, status: code, size, type, location, ...(error ? { error } : {}) };
}
async function probe(source, path) {
  const url = roots[source] + encodePath(path);
  const head = await requestHeaders(url, 'HEAD');
  // HEAD is sometimes disabled or has a different object lookup policy.
  // Confirm its negative results using a zero-to-zero range GET.
  const get = head.status === 200 || head.status === 206 ? null : await requestHeaders(url, 'GET');
  return { source, path, url, head, ...(get ? { get } : {}), found: [head, get].some(x => x && (x.status === 200 || x.status === 206)) };
}
const tasks = Object.keys(roots).flatMap(source => [...paths].map(path => ({ source, path })));
const results = [];
let cursor = 0;
await Promise.all(Array.from({ length: 10 }, async () => {
  while (cursor < tasks.length) {
    const task = tasks[cursor++];
    results.push(await probe(task.source, task.path));
  }
}));
results.sort((a, b) => a.path.localeCompare(b.path) || a.source.localeCompare(b.source));
const found = results.filter(r => r.found);
const report = { scannedAt: new Date().toISOString(), total: results.length, reachable: found.length, results };
await mkdir('resource-probe', { recursive: true });
await writeFile('resource-probe/report.json', JSON.stringify(report, null, 2) + '\n');
const lines = [
  '# Remote resource probe',
  '',
  'This is an independent HEAD + (when necessary) Range GET diagnostic from the GitHub Actions runner, not the client.',
  '',
  '| Origin | Path | HEAD | GET fallback | Result |',
  '| --- | --- | --- | --- | --- |',
  ...results.map(r => `| ${r.source} | \`${r.path}\` | ${r.head.status || r.head.error || 'network error'} | ${r.get ? (r.get.status || r.get.error || 'network error') : '-'} | ${r.found ? 'FOUND' : 'not confirmed'} |`),
  '',
  `Found: ${found.length}/${results.length}. A negative result can also mean this runner is blocked by DNS/firewall.`,
];
await writeFile('resource-probe/report.md', lines.join('\n') + '\n');
process.stdout.write(lines.join('\n') + '\n');
if (process.env.GITHUB_STEP_SUMMARY) await writeFile(process.env.GITHUB_STEP_SUMMARY, lines.join('\n') + '\n', { flag: 'a' });
