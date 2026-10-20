// 复制文本：优先用异步 Clipboard API；它被 Permissions Policy（IWA 清单）或焦点规则拒绝时，
// 退回 execCommand('copy')，后者只要求用户手势，不受 clipboard-write 策略约束。
export async function copyText(page, text) {
  const clipboard = (page.navigator ?? globalThis.navigator)?.clipboard;
  if (typeof clipboard?.writeText === 'function') {
    try { await clipboard.writeText(text); return true; } catch { /* 退回传统方式 */ }
  }
  const document = page.document ?? globalThis.document;
  if (typeof document?.execCommand !== 'function' || !document.body) return false;
  const area = document.createElement('textarea');
  area.value = text;
  area.setAttribute('readonly', '');
  area.style.cssText = 'position:fixed;top:0;left:0;width:1px;height:1px;opacity:0;pointer-events:none';
  document.body.append(area);
  try {
    area.select();
    return document.execCommand('copy') === true;
  } catch { return false; } finally { area.remove(); }
}
