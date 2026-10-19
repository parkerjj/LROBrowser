import { expect, test, vi } from 'vitest';
import {
  consoleColor, consoleLines, createKoreConsoleModel, outputBlockLines, outputLines, tableText,
} from '../src/kore/kore-panel-console.mjs';

test('domain colors follow consolecolors defaults and level overrides', () => {
  expect(consoleColor('attackMon', 'message')).toBe('#00bcd4');
  expect(consoleColor('drop', 'message')).toBe('#5c8dff');
  expect(consoleColor('unknown-domain', 'message')).toBe('#d6dbe1');
  expect(consoleColor('skill', 'error')).toBe('#e06060');
  expect(consoleColor('skill', 'warning')).toBe('#d8b84a');
  expect(consoleColor('skill', 'debug')).toBe('#9a9a9a');
});

test('table blocks align columns by the widest cell', () => {
  expect(tableText(['#', '名称', '数量'], [['1', '红色药水', '12'], ['10', '短剑', '1']])).toEqual([
    '#   名称      数量',
    '1   红色药水  12',
    '10  短剑      1',
  ]);
});

test('kv and text blocks expand to domain-colored lines', () => {
  expect(outputBlockLines({ type: 'kv', domain: 'info', level: 'message', pairs: [['名称', '测试'], ['HP', '1200/1500']] })).toEqual([
    { text: '名称        测试', domain: 'info', level: 'message' },
    { text: 'HP          1200/1500', domain: 'info', level: 'message' },
  ]);
  expect(outputBlockLines({ type: 'text', domain: 'system', level: 'warning', text: '尚未收到: name' })).toEqual([
    { text: '尚未收到: name', domain: 'system', level: 'warning' },
  ]);
});

test('structured output keeps table rows as separate console lines', () => {
  const lines = outputLines({
    ok: true, command: 'i', blocks: [
      { type: 'table', domain: 'list', level: 'message', columns: ['#', '名称'], rows: [['1', '红色药水'], ['2', '短剑']] },
    ],
  });
  expect(lines.map(line => line.text)).toEqual(['#  名称', '1  红色药水', '2  短剑']);
});

test('console model follows host logs, caps entries and clears through the host', () => {
  const listeners = new Set<(state: unknown) => void>();
  const logs = Array.from({ length: 5 }, (_, index) => ({ level: 'message', domain: 'info', text: `line ${index}`, timestamp: index }));
  const clearConsole = vi.fn();
  const host = {
    state: { logs },
    onStateChange(listener: (state: unknown) => void) { listeners.add(listener); return () => listeners.delete(listener); },
    clearConsole,
  };
  const model = createKoreConsoleModel({ host, maxEntries: 3 });
  expect(model.entries().map(entry => entry.text)).toEqual(['line 2', 'line 3', 'line 4']);
  const seen: number[] = [];
  model.subscribe(entries => seen.push(entries.length));
  logs.push({ level: 'message', domain: 'info', text: 'line 5', timestamp: 5 });
  for (const listener of listeners) listener(host.state);
  expect(seen).toEqual([3]);
  model.clear();
  expect(clearConsole).toHaveBeenCalledOnce();
  model.dispose();
  expect(listeners.size).toBe(0);
});

test('log lines preserve timestamps and fall back to info', () => {
  const [line] = consoleLines([{ level: 'message', text: 'hello', timestamp: 0 }]);
  expect(line).toMatchObject({ text: 'hello', domain: 'info', level: 'message', timestamp: 0 });
});
