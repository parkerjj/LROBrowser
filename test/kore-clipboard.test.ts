import { expect, test, vi } from 'vitest';
import { copyText } from '../src/kore/kore-clipboard.mjs';

function fakePage({ writeText, execCommand }: { writeText?: () => Promise<void>; execCommand?: () => boolean }) {
  const appended: Array<{ value: string; removed: boolean }> = [];
  const document = {
    body: { append: (node: { value: string; removed: boolean }) => appended.push(node) },
    createElement: () => ({ value: '', removed: false, style: {}, setAttribute() {}, select() {}, remove() { this.removed = true; } }),
    execCommand,
  };
  return { page: { navigator: writeText ? { clipboard: { writeText } } : {}, document } as never, appended };
}

test('uses the async Clipboard API when it works', async () => {
  const writeText = vi.fn(async () => {});
  const { page, appended } = fakePage({ writeText });
  expect(await copyText(page, 'abc')).toBe(true);
  expect(writeText).toHaveBeenCalledWith('abc');
  expect(appended).toHaveLength(0);
});

test('falls back to execCommand when the Clipboard API is refused by Permissions Policy', async () => {
  const execCommand = vi.fn(() => true);
  const { page, appended } = fakePage({ writeText: async () => { throw new DOMException('denied', 'NotAllowedError'); }, execCommand });
  expect(await copyText(page, 'abc')).toBe(true);
  expect(execCommand).toHaveBeenCalledWith('copy');
  expect(appended[0]).toMatchObject({ value: 'abc', removed: true });
});

test('reports failure when neither path can copy', async () => {
  expect(await copyText(fakePage({ execCommand: () => false }).page, 'abc')).toBe(false);
  expect(await copyText(fakePage({}).page, 'abc')).toBe(false);
});
