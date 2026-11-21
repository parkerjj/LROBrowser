/** Compact four-preset controls, sharing the deck controller with native hotkeys. */
export function installLastroCardDeckUI(component, deps) {
  if (component._lastroDeckUI) return component._lastroDeckUI;
  const { document: doc, getPresets, getNames, getDraft, isDirty, canEdit, canSave, getAvailableCards, getCardState, getCardDefinition, getEquipmentTab,
    getSelected, getActivePreset, isBusy, isActive, select, save, activate, rename } = deps;
  const styleText = `.cc-presets{display:flex;align-items:center;gap:12px;padding:10px 16px;border-bottom:1px solid rgba(148,168,196,.12);background:#18202c}.cc-presets .preset-label{color:#9db0c5;font-size:12px;white-space:nowrap}.cc-presets .preset-options{display:flex;gap:6px;flex:1;min-width:0}.cc-presets .preset-slot{position:relative;display:flex;min-width:86px;min-height:32px}.cc-presets .preset-option{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;height:32px;padding:0 12px;border:1px solid #3a4a60;border-radius:6px;background:#202a38;color:#cdd9e6;font:inherit;font-size:12px;cursor:pointer}.cc-presets .preset-name{max-width:120px;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.cc-presets .preset-option small{flex:0 0 auto;font-size:10px;color:#7d8ea3}.cc-presets .preset-option.selected{border-color:#e8b84b;background:rgba(232,184,75,.10);color:#f1ce80}.cc-presets .preset-option.active small{color:#63d68e}.cc-presets .preset-slot.renaming .preset-option{visibility:hidden}.cc-presets .preset-edit{position:absolute;inset:0;box-sizing:border-box;width:100%;height:32px;padding:0 10px;border:1px solid #e8b84b;border-radius:6px;background:#10161f;color:#e6ecf4;font:inherit;font-size:12px;outline:none}.cc-presets .preset-actions{display:flex;gap:6px}.cc-presets .preset-save,.cc-presets .preset-activate{height:32px;padding:0 12px;border:1px solid #3a4a60;border-radius:6px;background:#26313f;color:#d7e3ef;font:inherit;font-size:12px;white-space:nowrap;cursor:pointer}.cc-presets .preset-activate{border-color:#c99a26;background:#e8b84b;color:#241a06;font-weight:600}.cc-presets button:hover{border-color:#e8b84b}.cc-presets button:disabled{opacity:.5;cursor:default}.cc-presets button:focus-visible{outline:2px solid #e8b84b;outline-offset:2px}@media(max-width:840px){.cc-presets{flex-wrap:wrap;gap:8px}.cc-presets .preset-label{display:none}.cc-presets .preset-options{flex-basis:100%}.cc-presets .preset-slot{flex:1;min-width:0}.cc-presets .preset-option{padding:0 6px}.cc-presets .preset-actions{margin-left:auto}}`;
  let editing = null, renaming = false;
  const nameAt = (names, index) => names[index - 1] || '卡册 ' + index;
  const ids = cards => cards.map(card => card.id);
  const blocked = () => isBusy() || renaming || !!editing;
  function definition(entry) {
    if (entry.tab > 0) return { id: entry.id, tab: entry.tab, level: entry.level };
    return getCardDefinition(entry.id);
  }
  function equipmentOptions(card, options) {
    if (!card || typeof getEquipmentTab !== 'function') return options;
    const tab = getEquipmentTab(card);
    const label = ['', '头饰', '铠甲', '武器', '盾牌', '披肩', '鞋类', '饰品'][tab];
    // Protocol page coordinates stay intact; only verified equipment labels differ.
    return label && tab !== card.tab ? { ...options, meta: label + ' · 第' + card.level + '页' } : options;
  }
  const create = component.createCardNode;
  if (typeof create === 'function') component.createCardNode = function (entry, options = {}) {
    const { lastroDraftSlot, ...originalOptions } = options;
    const card = definition(entry), nativeOptions = equipmentOptions(card, originalOptions);
    if (lastroDraftSlot) return create.call(this, entry, nativeOptions);
    const state = card && getCardState(card);
    if (state === 2) {
      return create.call(this, entry, {
        ...nativeOptions, badgeText: '已加入卡组', badgeKind: 'indeck',
        action: { label: '已在卡组', disabled: true },
      });
    }
    if (state === 1) {
      const included = getDraft().some(value => value.id === entry.id);
      return create.call(this, entry, {
        ...nativeOptions, badgeText: '已充能', badgeKind: 'charged',
        action: included ? { label: '已在方案', disabled: true }
          : { action: 'add-deck', label: '加入卡组', kind: 'btn-gold', tab: card.tab, level: card.level,
            disabled: blocked() || !canEdit(getSelected()) },
      });
    }
    // A native tab-0 search result must resolve its original protocol position.
    // Never expose removal while a different, inactive saved preset is selected.
    if (entry.tab === 0) return create.call(this, entry, {
      ...nativeOptions, badgeText: '无法加入', badgeKind: '', action: { label: '分类不明确', disabled: true },
    });
    return create.call(this, entry, nativeOptions);
  };
  const renderDeck = component.renderDeck;
  if (typeof renderDeck === 'function') component.renderDeck = function (...args) {
    const fragment = renderDeck.apply(this, args);
    const selected = getSelected(), draft = getDraft(selected);
    const active = selected === getActivePreset() && isActive(ids(draft));
    const grid = fragment.querySelector('.slot-grid');
    if (grid) {
      grid.replaceChildren();
      for (let slot = 0; slot < 8; slot++) {
        const card = draft[slot];
        if (card) grid.append(this.createCardNode({ ...card, name: this.cardName(card.id), state: getCardState(card) }, {
          lastroDraftSlot: true,
          meta: '第' + card.level + '页',
          action: active ? { action: 'cancel', label: '移除', kind: 'btn-ghost-danger', tab: 0, level: 1,
            disabled: blocked() || !canEdit(selected) } : null,
        }));
        else {
          const empty = doc.createElement('div'); empty.className = 'slot-empty';
          const plus = doc.createElement('i'); plus.textContent = '＋';
          empty.append(plus, doc.createTextNode('空卡槽 ' + (slot + 1))); grid.append(empty);
        }
      }
      const heading = grid.previousElementSibling;
      if (heading?.classList.contains('sec-h')) {
        const label = heading.querySelector('h2'); if (label) label.textContent = active ? '当前卡组' : '预览 · ' + nameAt(getNames(), selected);
        const count = heading.querySelector('.n'); if (count) count.textContent = draft.length + ' / 8';
        if (!active) {
          const hint = doc.createElement('span'); hint.className = 'hint';
          hint.textContent = '使用此方案后可调整卡组'; heading.append(hint);
        }
      }
      const waitHead = grid.nextElementSibling;
      if (waitHead?.classList.contains('sec-h')) {
        const included = new Set(ids(draft));
        const available = getAvailableCards().filter(card => !included.has(card.id));
        const title = waitHead.querySelector('h2'); if (title && !active) title.textContent = '已充能卡片';
        const count = waitHead.querySelector('.n'); if (count) count.textContent = available.length + ' 张';
        const list = doc.createElement('div'); list.className = available.length ? 'card-grid' : 'empty-box';
        if (!available.length) list.textContent = '没有其他已充能卡片。';
        for (const card of available) list.append(this.createCardNode({ ...card, name: this.cardName(card.id) }, {
          meta: '第' + card.level + '页',
        }));
        const oldList = waitHead.nextElementSibling;
        if (oldList) oldList.replaceWith(list); else fragment.append(list);
      }
    }
    return fragment;
  };
  function finishRename(commit) {
    const current = editing;
    if (!current) return;
    editing = null;
    const name = current.input.value;
    current.input.remove(); current.slot.classList.remove('renaming');
    if (commit && name !== nameAt(getNames(), current.index)) {
      renaming = true; sync();
      const statusBefore = component.getRoot?.()?.querySelector('[data-status]')?.textContent;
      try {
        Promise.resolve(rename(current.index, name)).then(result => {
          const statusAfter = component.getRoot?.()?.querySelector('[data-status]')?.textContent;
          if (result === false && statusAfter === statusBefore) {
            component.setStatus?.('套卡名称未保存，请检查名称或稍后重试');
          }
        }).catch(() => {
          component.setStatus?.('套卡名称保存失败，请重试');
        }).finally(() => { renaming = false; sync(); });
      } catch {
        renaming = false; component.setStatus?.('套卡名称保存失败，请重试'); sync();
      }
    } else sync();
  }
  function beginRename(index, slot) {
    if (isBusy() || renaming || editing) return;
    const input = doc.createElement('input'); input.type = 'text'; input.className = 'preset-edit';
    input.maxLength = 24; input.setAttribute('aria-label', '重命名卡册 ' + index); input.dataset.presetNameInput = '';
    input.value = nameAt(getNames(), index);
    editing = { index, slot, input }; slot.classList.add('renaming'); slot.append(input);
    for (const event of ['mousedown', 'click', 'dblclick']) input.addEventListener(event, value => value.stopPropagation());
    input.addEventListener('keydown', event => {
      event.stopPropagation();
      if (event.isComposing) return;
      if (event.key === 'Enter' || event.key === 'Escape') {
        event.preventDefault(); finishRename(event.key === 'Enter');
      }
    });
    input.addEventListener('blur', () => { if (editing?.input === input) finishRename(true); });
    sync(); input.focus(); input.select();
  }
  function sync() {
    const root = component.getRoot?.();
    const body = root?.querySelector('[data-body]');
    if (!body) return;
    if (!root.querySelector('[data-deck-style]')) {
      const style = doc.createElement('style'); style.dataset.deckStyle = ''; style.textContent = styleText; root.append(style);
    }
    let bar = root.querySelector('[data-deck-presets]');
    if (!bar) {
      bar = doc.createElement('div'); bar.className = 'cc-presets'; bar.dataset.deckPresets = '';
      const label = doc.createElement('span'); label.className = 'preset-label'; label.textContent = '卡组方案';
      const options = doc.createElement('div'); options.className = 'preset-options'; options.setAttribute('role', 'group'); options.setAttribute('aria-label', '卡组方案');
      for (let index = 1; index <= 4; index++) {
        const slot = doc.createElement('div'); slot.className = 'preset-slot';
        const button = doc.createElement('button'); button.type = 'button'; button.className = 'preset-option'; button.dataset.preset = String(index);
        const name = doc.createElement('span'); name.className = 'preset-name';
        const count = doc.createElement('small'); button.append(name, count);
        button.addEventListener('click', () => { if (!editing && !renaming && !isBusy()) select(index); });
        name.addEventListener('dblclick', event => { event.preventDefault(); event.stopPropagation(); beginRename(index, slot); });
        slot.append(button); options.append(slot);
      }
      const actions = doc.createElement('div'); actions.className = 'preset-actions';
      const record = doc.createElement('button'); record.type = 'button'; record.className = 'preset-save'; record.textContent = '保存当前卡组';
      record.addEventListener('click', () => { if (!blocked() && canSave(getSelected())) save(getSelected()); });
      const use = doc.createElement('button'); use.type = 'button'; use.className = 'preset-activate';
      use.addEventListener('click', () => { if (!editing && !renaming && !isBusy()) activate(getSelected()); });
      actions.append(record, use); bar.append(label, options, actions); body.before(bar);
    }
    const presets = getPresets(), names = getNames();
    const disabled = blocked();
    // Equal card contents do not imply that multiple saved presets are in use.
    // Selecting an empty recording slot must also leave the current preset alone.
    const activePreset = getActivePreset();
    for (const button of bar.querySelectorAll('[data-preset]')) {
      const index = Number(button.dataset.preset), cards = getDraft(index);
      const active = index === activePreset, saved = presets[index - 1] !== null && !isDirty(index);
      button.classList.toggle('selected', index === getSelected());
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(index === getSelected()));
      button.disabled = disabled;
      button.querySelector('.preset-name').textContent = nameAt(names, index);
      button.querySelector('small').textContent = active ? saved ? '当前方案' : '当前方案 · 未保存'
        : saved ? `${cards.length} 张` : '未保存';
      button.title = '预览' + nameAt(names, index) + '，双击名称可重命名';
    }
    const selected = getSelected();
    const record = bar.querySelector('.preset-save'), canRecord = canSave(selected);
    record.disabled = disabled || !canRecord;
    record.title = canRecord ? '将当前卡组保存到「' + nameAt(names, selected) + '」' : '使用方案后可保存';
    const inUse = selected === activePreset;
    const clearsDeck = getDraft(selected).length === 0 && component._data?.data?.[0]?.data?.[1]?.cards?.some(Boolean);
    const use = bar.querySelector('.preset-activate');
    use.disabled = disabled || inUse;
    use.textContent = clearsDeck ? '清空并使用' : '使用方案';
    use.title = (clearsDeck ? '清空当前卡组并使用' : '使用') + '「' + nameAt(names, selected) + '」';
  }
  const render = component.renderCards;
  component.renderCards = function (...args) { const result = render.apply(this, args); sync(); return result; };
  const remove = component.onRemove;
  component.onRemove = function (...args) { finishRename(false); return remove?.apply(this, args); };
  const api = { sync }; component._lastroDeckUI = api; return api;
}
