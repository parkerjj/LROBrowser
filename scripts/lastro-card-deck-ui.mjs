/** Compact four-preset controls, sharing the deck controller with native hotkeys. */
export function installLastroCardDeckUI(component, deps) {
  if (component._lastroDeckUI) return component._lastroDeckUI;
  const { document: doc, getPresets, getNames, getDraft, isDirty, canEdit, canSave, getAvailableCards, getCardState, getCardDefinition, getEquipmentTab,
    getSelected, getActivePreset, isBusy, isActive, select, save, activate, rename } = deps;
  const styleText = `.cc-presets{display:flex;align-items:center;gap:12px;padding:10px 16px;border-bottom:1px solid rgba(148,168,196,.12);background:#18202c}.cc-presets .preset-label{color:#9db0c5;font-size:12px;white-space:nowrap}.cc-presets .preset-options{display:flex;gap:6px;flex:1;min-width:0}.cc-presets .preset-slot{position:relative;display:flex;min-width:86px;min-height:32px}.cc-presets .preset-option{display:flex;align-items:center;justify-content:center;gap:8px;width:100%;height:32px;padding:0 12px;border:1px solid #3a4a60;border-radius:6px;background:#202a38;color:#cdd9e6;font:inherit;font-size:12px;cursor:pointer}.cc-presets .preset-name{max-width:120px;min-width:0;overflow:hidden;white-space:nowrap;text-overflow:ellipsis}.cc-presets .preset-option small{flex:0 0 auto;font-size:10px;color:#7d8ea3}.cc-presets .preset-option.selected{border-color:#e8b84b;background:rgba(232,184,75,.10);color:#f1ce80}.cc-presets .preset-option.active small{color:#63d68e}.cc-presets .preset-slot.renaming .preset-option{visibility:hidden}.cc-presets .preset-edit{position:absolute;inset:0;box-sizing:border-box;width:100%;height:32px;padding:0 10px;border:1px solid #e8b84b;border-radius:6px;background:#10161f;color:#e6ecf4;font:inherit;font-size:12px;outline:none}.cc-presets .preset-actions{display:flex;gap:6px}.cc-presets .preset-save,.cc-presets .preset-activate{height:32px;padding:0 12px;border:1px solid #3a4a60;border-radius:6px;background:#26313f;color:#d7e3ef;font:inherit;font-size:12px;white-space:nowrap;cursor:pointer}.cc-presets .preset-activate{border-color:#c99a26;background:#e8b84b;color:#241a06;font-weight:600}.cc-presets button:hover{border-color:#e8b84b}.cc-presets button:disabled{opacity:.5;cursor:default}.cc-presets button:focus-visible{outline:2px solid #e8b84b;outline-offset:2px}@media(max-width:760px){.cc-presets{flex-wrap:wrap;gap:8px}.cc-presets .preset-label{display:none}.cc-presets .preset-options{flex-basis:100%}.cc-presets .preset-slot{flex:1;min-width:0}.cc-presets .preset-option{padding:0 6px}.cc-presets .preset-actions{margin-left:auto}}`;
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
    if (state === 1 || state === 2) {
      const included = getDraft().some(value => value.id === entry.id);
      return create.call(this, entry, {
        ...nativeOptions, badgeText: included ? '本卡册已加入' : state === 2 ? '当前使用中' : '已充能',
        badgeKind: included ? '' : 'charged',
        action: included ? { label: '已在本卡册', disabled: true }
          : { action: 'add-deck', label: getSelected() === getActivePreset() ? '加入卡册' : '先激活卡册', kind: 'btn-gold', tab: card.tab, level: card.level,
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
    const effectsActive = active && !!this._data?.data?.[0]?.data?.[1]?.activate;
    const saved = getPresets()[selected - 1] !== null && !isDirty(selected);
    const meta = fragment.querySelector('.deck-meta');
    if (meta) {
      const chip = (label, value, on) => {
        const node = doc.createElement('div'); node.className = 'meta-chip' + (on ? ' on' : '');
        const caption = doc.createElement('span'), dot = doc.createElement('span'); dot.className = 'dot';
        caption.append(dot, doc.createTextNode(label));
        const text = doc.createElement('b'); text.textContent = value; node.append(caption, text); return node;
      };
      const capacity = chip('卡册容量', draft.length + ' / 8', false); capacity.classList.add('cap-row');
      const bar = doc.createElement('div'); bar.className = 'cap-bar';
      const fill = doc.createElement('i'); fill.style.width = Math.min(100, draft.length / 8 * 100) + '%';
      bar.append(fill); capacity.append(bar);
      meta.replaceChildren(chip('效果状态', active ? (effectsActive ? '已激活' : '未激活') + '（服务器）' : '未激活', effectsActive),
        chip('卡册状态', active ? saved ? '使用中' : '使用中 · 未保存' : saved ? '已保存' : '未保存', active), capacity);
    }
    const grid = fragment.querySelector('.slot-grid');
    if (grid) {
      grid.replaceChildren();
      for (let slot = 0; slot < 8; slot++) {
        const card = draft[slot];
        if (card) grid.append(this.createCardNode({ ...card, name: this.cardName(card.id), state: getCardState(card) }, {
          lastroDraftSlot: true, badgeText: active ? effectsActive ? '卡册生效' : '使用中' : '未激活', badgeKind: active ? 'indeck' : '',
          meta: '第' + card.level + '页',
          action: { action: 'cancel', label: '移除', kind: 'btn-ghost-danger', tab: 0, level: 1,
            disabled: blocked() || !canEdit(selected) },
        }));
        else {
          const empty = doc.createElement('div'); empty.className = 'slot-empty';
          const plus = doc.createElement('i'); plus.textContent = '＋';
          empty.append(plus, doc.createTextNode('空卡槽 ' + (slot + 1))); grid.append(empty);
        }
      }
      const heading = grid.previousElementSibling;
      if (heading?.classList.contains('sec-h')) {
        const label = heading.querySelector('h2'); if (label) label.textContent = nameAt(getNames(), selected) + ' · 卡组槽位';
        const count = heading.querySelector('.n'); if (count) count.textContent = draft.length + ' / 8';
        const hint = heading.querySelector('.hint'); if (hint) hint.textContent = active
          ? '增删经服务器确认后，点击「保存卡册」记录当前内容' : '先点击「激活」，再调整当前卡册';
      }
      const waitHead = grid.nextElementSibling;
      if (waitHead?.classList.contains('sec-h')) {
        const included = new Set(ids(draft));
        const available = getAvailableCards().filter(card => !included.has(card.id));
        const title = waitHead.querySelector('h2'); if (title) title.textContent = '已充能 · 可加入本卡册';
        const count = waitHead.querySelector('.n'); if (count) count.textContent = available.length + ' 张';
        const hint = waitHead.querySelector('.hint'); if (hint) hint.textContent = active
          ? '加入或移除均等待服务器确认' : '激活后可加入卡片，部位及数量限制由服务器判断';
        const list = doc.createElement('div'); list.className = available.length ? 'card-grid' : 'empty-box';
        if (!available.length) list.textContent = '没有可加入的已充能卡片。';
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
    const rules = root.querySelector('.deck-rules');
    if (rules && !rules.hasAttribute('data-deck-rules')) {
      const slots = rules.querySelector('.slots');
      const instructions = doc.createElement('span');
      instructions.textContent = '先激活卡册，再加入或移除卡片。操作经服务器确认后保存，已保存的确认卡册可用快捷键切换。部位及数量限制由服务器判断，双击名称可重命名。';
      rules.replaceChildren(instructions);
      if (slots) {
        rules.append(slots);
      }
      rules.dataset.deckRules = '';
    }
    if (!root.querySelector('[data-deck-style]')) {
      const style = doc.createElement('style'); style.dataset.deckStyle = ''; style.textContent = styleText; root.append(style);
    }
    let bar = root.querySelector('[data-deck-presets]');
    if (!bar) {
      bar = doc.createElement('div'); bar.className = 'cc-presets'; bar.dataset.deckPresets = '';
      const label = doc.createElement('span'); label.className = 'preset-label'; label.textContent = '套卡';
      const options = doc.createElement('div'); options.className = 'preset-options'; options.setAttribute('role', 'group'); options.setAttribute('aria-label', '切换套卡');
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
      const record = doc.createElement('button'); record.type = 'button'; record.className = 'preset-save'; record.textContent = '保存卡册';
      record.addEventListener('click', () => { if (!blocked() && canSave(getSelected())) save(getSelected()); });
      const use = doc.createElement('button'); use.type = 'button'; use.className = 'preset-activate'; use.textContent = '激活';
      use.addEventListener('click', () => { if (!editing && !renaming && !isBusy()) activate(getSelected()); });
      actions.append(record, use); bar.append(label, options, actions); body.before(bar);
    }
    const presets = getPresets(), names = getNames();
    const deckCount = root.querySelector('[data-tab="0"] .cnt');
    if (deckCount) deckCount.textContent = getDraft(getSelected()).length + '/8';
    const disabled = blocked();
    // Equal card contents do not imply that multiple saved presets are in use.
    // Selecting an empty recording slot must also leave the current preset alone.
    const activePreset = getActivePreset();
    for (const button of bar.querySelectorAll('[data-preset]')) {
      const index = Number(button.dataset.preset), cards = getDraft(index);
      const active = index === activePreset, matches = isActive(ids(cards));
      button.classList.toggle('selected', index === getSelected());
      button.classList.toggle('active', active);
      button.setAttribute('aria-pressed', String(index === getSelected()));
      button.disabled = disabled;
      button.querySelector('.preset-name').textContent = nameAt(names, index);
      button.querySelector('small').textContent = active ? matches ? presets[index - 1] === null || isDirty(index) ? '使用中 · 未保存' : '使用中' : '等待同步'
        : presets[index - 1] === null || isDirty(index) ? '未保存' : `${cards.length} 张`;
      button.title = '选择' + nameAt(names, index) + '；双击名称可重命名';
    }
    const selected = getSelected();
    bar.querySelector('.preset-save').disabled = disabled || !canSave(selected);
    bar.querySelector('.preset-save').title = canSave(selected)
      ? '保存服务器确认的「' + nameAt(names, selected) + '」' : '先激活卡册并等待服务器确认';
    const inUse = selected === activePreset && isActive(ids(getDraft(selected)));
    const use = bar.querySelector('.preset-activate');
    use.disabled = disabled || inUse;
    use.textContent = inUse ? '已激活' : '激活';
    use.title = '激活' + nameAt(names, selected);
  }
  const render = component.renderCards;
  component.renderCards = function (...args) { const result = render.apply(this, args); sync(); return result; };
  const remove = component.onRemove;
  component.onRemove = function (...args) { finishRename(false); return remove?.apply(this, args); };
  const api = { sync }; component._lastroDeckUI = api; return api;
}
