// @vitest-environment jsdom
import { expect, test, vi } from 'vitest';
import {
  consoleColor, consoleLines, createConsoleFilter, createKoreConsoleModel, outputBlockLines, outputLines, renderConsole, tableText,
} from '../src/kore/kore-panel-console.mjs';

test('domain colors follow consolecolors defaults and level overrides', () => {
  expect(consoleColor('attackMon', 'message')).toBe('#00bcd4');
  expect(consoleColor('drop', 'message')).toBe('#5c8dff');
  expect(consoleColor('unknown-domain', 'message')).toBe('#d6dbe1');
  expect(consoleColor('skill', 'error')).toBe('#e06060');
  expect(consoleColor('skill', 'warning')).toBe('#d8b84a');
  // Host 自己的日志用 'warn'，必须与 Rust 的 'warning' 同色。
  expect(consoleColor('system', 'warn')).toBe('#d8b84a');
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

function memoryStorage(initial: Record<string, string> = {}) {
  const data = new Map(Object.entries(initial));
  return { getItem: (key: string) => data.get(key) ?? null, setItem: (key: string, value: string) => { data.set(key, value); } };
}

test('console filter hides third-party combat by default and keeps unlisted domains always visible', () => {
  const filter = createConsoleFilter({ storage: memoryStorage() });
  expect(filter.isVisible('others')).toBe(false);
  expect(filter.isVisible('attackMon')).toBe(true);
  expect(filter.isVisible('attackMonMiss')).toBe(true);
  expect(filter.isVisible('system')).toBe(true);
  expect(filter.isVisible('info')).toBe(true);
  expect(filter.hiddenCount()).toBe(1);
});

test('console filter choices persist, notify and reset; both Miss domains follow their category', () => {
  const storage = memoryStorage();
  const filter = createConsoleFilter({ storage });
  const listener = vi.fn();
  filter.subscribe(listener);
  filter.setCategoryVisible('attacked', false);
  filter.setCategoryVisible('others', true);
  expect(listener).toHaveBeenCalledTimes(2);
  expect(filter.isVisible('attacked')).toBe(false);
  expect(filter.isVisible('attackedMiss')).toBe(false);
  expect(filter.isVisible('others')).toBe(true);

  const reloaded = createConsoleFilter({ storage });
  expect(reloaded.isVisible('attacked')).toBe(false);
  expect(reloaded.isVisible('others')).toBe(true);
  reloaded.reset();
  expect(reloaded.isVisible('attacked')).toBe(true);
  expect(reloaded.isVisible('others')).toBe(false);
  expect(createConsoleFilter({ storage: memoryStorage({ 'kore.console.hidden': '{bad json' }) }).isVisible('others')).toBe(false);
});

test('renderConsole drops hidden categories before applying the line limit', () => {
  const filter = createConsoleFilter({ storage: memoryStorage() });
  const container = document.createElement('div');
  const entries = [
    { level: 'message', domain: 'attackMon', text: '你对 海獭 造成了 5 点伤害', timestamp: 1 },
    ...Array.from({ length: 5 }, (_, index) => ({ level: 'message', domain: 'others', text: `别人 ${index}`, timestamp: 2 + index })),
  ];
  renderConsole(container, entries as never, { page: globalThis, maxLines: 3, filter });
  expect(container.textContent).toContain('你对 海獭 造成了 5 点伤害');
  expect(container.textContent).not.toContain('别人');
});
