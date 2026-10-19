import { expect, test } from 'vitest';
import { KORE_QUICK_COMMANDS, kvPairs, parseRatio, statusModel } from '../src/kore/kore-panel-window.mjs';

const kv = (pairs: [string, string][]) => ({ kind: 'output', ok: true, blocks: [{ type: 'kv', domain: 'info', level: 'message', pairs }] });

test('quick commands send the exact raw command text', () => {
  expect(KORE_QUICK_COMMANDS.map(entry => entry.command)).toEqual(['ai auto', 'ai off', 'ai clear', 'exp', 'exp report']);
});

test('status model reads Rust kv blocks without inventing values', () => {
  const model = statusModel({
    status: kv([['名称', '贤者'], ['职业', '智者'], ['等级', '99/70'], ['HP', '1200/1500 (80%)'], ['SP', '80/100 (80%)'], ['Zeny', '1234567']]),
    ai: kv([['模式', 'AUTO'], ['任务', 'attack'], ['目标', '1002 @(125, 88)'], ['下一步', 'Attack'], ['原因', '—']]),
    where: kv([['地图', 'prt_fild08.gat'], ['坐标', '(123, 87)']]),
    state: { status: 'runtime-ready', worldReady: true },
  });
  expect(model).toMatchObject({
    connected: true, worldReady: true, name: '贤者', job: '智者', level: '99/70',
    hp: { value: 1200, max: 1500, percent: 80 }, sp: { value: 80, max: 100, percent: 80 },
    mode: 'AUTO', task: 'attack', target: '1002 @(125, 88)', next: 'Attack',
    map: 'prt_fild08.gat', position: '(123, 87)', zeny: '1234567',
  });
});

test('missing or failed output stays visibly unknown', () => {
  const model = statusModel({ status: null, ai: null, where: null, state: { status: 'loading', worldReady: false } });
  expect(model).toMatchObject({ connected: false, worldReady: false, name: '—', job: '—', hp: { value: null, percent: null }, mode: '—' });
});

test('ratio parsing supports explicit and derived percentages', () => {
  expect(parseRatio('1200/1500 (80%)')).toEqual({ value: 1200, max: 1500, percent: 80 });
  expect(parseRatio('80/100')).toEqual({ value: 80, max: 100, percent: 80 });
  expect(parseRatio('—')).toEqual({ value: null, max: null, percent: null });
});

test('kv pairs ignore non-kv blocks', () => {
  expect(kvPairs({ blocks: [{ type: 'text', text: 'x' }] }).size).toBe(0);
});
