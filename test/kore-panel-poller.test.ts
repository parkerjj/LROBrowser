import { expect, test, vi } from 'vitest';
import { createKorePoller } from '../src/kore/kore-panel-poller.mjs';

function pollerHarness({ worldReady = true } = {}) {
  const outputListeners = new Set<(output: { command: string; result: unknown; silent: boolean }) => void>();
  const stateListeners = new Set<(state: unknown) => void>();
  const sent: Array<{ text: string; options: unknown }> = [];
  const host = {
    state: { worldReady, status: 'runtime-ready', logs: [] as unknown[] },
    sendCommandText: vi.fn((text: string, options: unknown) => { sent.push({ text, options }); return true; }),
    onCommandOutput(listener: (output: { command: string; result: unknown; silent: boolean }) => void) {
      outputListeners.add(listener); return () => outputListeners.delete(listener);
    },
    onStateChange(listener: (state: unknown) => void) {
      stateListeners.add(listener); return () => stateListeners.delete(listener);
    },
    emit(command: string, result: unknown, silent = true) {
      for (const listener of outputListeners) listener({ command, result, silent });
    },
    setReady(value: boolean) {
      host.state.worldReady = value;
      for (const listener of stateListeners) listener(host.state);
    },
  };
  let tick = () => {};
  const setInterval = vi.fn((fn: () => void) => { tick = fn; return 1; });
  const clearInterval = vi.fn();
  let clock = 0;
  const poller = createKorePoller({ host, setInterval, clearInterval, now: () => clock });
  return { host, poller, sent, setInterval, clearInterval, run: () => tick(), advance: (ms: number) => { clock += ms; } };
}

const ok = (command: string, blocks: unknown[] = []) => ({ kind: 'output', command, ok: true, blocks });

test('hidden view sends nothing and small view skips fullscreen-only regions', () => {
  const { poller, sent, run } = pollerHarness();
  poller.start();
  run();
  expect(sent).toEqual([]);
  poller.setView('small');
  expect(sent.map(entry => entry.text)).toEqual(['s', 'ai print', 'where']);
  expect(sent.every(entry => (entry.options as { silent: boolean }).silent)).toBe(true);
  run();
  expect(sent).toHaveLength(3);
});

test('in-flight commands are not resent before their output arrives', () => {
  const { poller, sent, run, advance } = pollerHarness();
  poller.start();
  poller.setView('small');
  advance(10_000);
  run();
  expect(sent.map(entry => entry.text)).toEqual(['s', 'ai print', 'where']);
  poller.request('status');
  expect(sent).toHaveLength(3);
});

test('results are stored and a failed output becomes a region error', () => {
  const { host, poller, sent, advance } = pollerHarness();
  poller.start();
  poller.setView('small');
  host.emit('s', ok('s', [{ type: 'kv', pairs: [['名称', '测试']] }]));
  expect(poller.results('status')).toMatchObject({ ok: true, command: 's' });
  expect(poller.results('ai')).toBeNull();
  host.emit('ai print', { kind: 'error', code: 'world-not-ready', message: 'not ready' });
  expect(poller.errors('ai')).toMatchObject({ code: 'world-not-ready' });
  advance(2000);
  host.emit('where', ok('where'));
  expect(poller.results('where')).toMatchObject({ command: 'where' });
  expect(sent).toHaveLength(3);
});

test('fullscreen view polls entities and only the visible tab query', () => {
  const { poller, sent } = pollerHarness();
  poller.start();
  poller.setView('fullscreen');
  expect(sent.map(entry => entry.text)).toEqual(['s', 'ai print', 'where', 'ml', 'pl', 'nl', 'il']);
  poller.setTab('inventory');
  expect(sent.map(entry => entry.text)).toContain('i');
  expect(sent.map(entry => entry.text)).not.toContain('cart');
  poller.setTab('cart');
  expect(sent.map(entry => entry.text)).toContain('cart');
});

test('world readiness and document visibility pause automatic sends', () => {
  const { host, poller, sent, run, advance } = pollerHarness();
  poller.start();
  poller.setView('small');
  expect(sent).toHaveLength(3);
  host.emit('s', ok('s'));
  host.emit('ai print', ok('ai print'));
  host.emit('where', ok('where'));
  host.setReady(false);
  advance(10_000);
  run();
  expect(sent).toHaveLength(3);
  host.setReady(true);
  advance(10_000);
  run();
  expect(sent.length).toBeGreaterThan(3);
});

test('stop clears the timer and dispose unsubscribes', () => {
  const { poller, setInterval, clearInterval, host } = pollerHarness();
  poller.start();
  expect(setInterval).toHaveBeenCalledOnce();
  poller.stop();
  expect(clearInterval).toHaveBeenCalledOnce();
  poller.dispose();
  expect(host.state.logs).toEqual([]);
});
