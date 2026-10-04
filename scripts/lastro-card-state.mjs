/** Repair card filtering and confirmed updates on the native card component. */
export function installLastroCardState(component, deps) {
  if (!component || component._lastroCardStateInstalled) return false;
  const { document: doc, listCardEntries, CARD_CONNECTION_TABS, resolveCategoryCardAction, getInventory } = deps || {};
  if (!doc || typeof listCardEntries !== 'function' || !Array.isArray(CARD_CONNECTION_TABS)
    || typeof resolveCategoryCardAction !== 'function'
    || ['renderCategory', 'renderCards', 'handleBodyClick', 'createCardNode', 'getRoot']
      .some(name => typeof component[name] !== 'function')) return false;
  component._lastroCardStateInstalled = true;
  const nativeCategory = component.renderCategory;
  const nativeRender = component.renderCards;
  const nativeBodyClick = component.handleBodyClick;
  const filters = [
    { id: 'all', label: '全部' },
    { id: 'charged', label: '已充能' },
    { id: 'can-charge', label: '可充能' },
  ];
  const filtered = target => target._tab !== 0 && !target._search
    && (target._filter === 'charged' || target._filter === 'can-charge');
  const observedInventories = new WeakSet();
  let refreshQueued = false;
  function queueInventoryRefresh() {
    if (refreshQueued) return;
    refreshQueued = true;
    void Promise.resolve().then(() => {
      refreshQueued = false;
      const root = component.getRoot(), host = component._host;
      if (!root?.isConnected || component.__active === false || host?.style.display === 'none'
        || component._filter !== 'can-charge' || !filtered(component)) return;
      const body = root.querySelector('[data-body]'), scrollTop = body?.scrollTop || 0;
      component.renderCards();
      if (body) body.scrollTop = scrollTop;
    }).catch(() => { /* A card view refresh must not disrupt native inventory handling. */ });
  }
  function inventoryItems() {
    const inventory = getInventory?.();
    if (!inventory || typeof inventory !== 'object') return [];
    if (!observedInventories.has(inventory)) {
      observedInventories.add(inventory);
      // Leave onUpdateItem intact: the native shortcut bar replaces that callback.
      for (const name of ['setItems', 'addItem', 'removeItem', 'updateItem', 'onRemove']) {
        const original = inventory[name];
        if (typeof original !== 'function') continue;
        inventory[name] = function (...args) {
          try { return original.apply(this, args); }
          finally { queueInventoryRefresh(); }
        };
      }
    }
    return Array.isArray(inventory.list) ? inventory.list : [];
  }
  function button(label, action, disabled) {
    const element = doc.createElement('button');
    element.type = 'button'; element.textContent = label; element.disabled = disabled;
    element.dataset.pageAction = action;
    return element;
  }
  component.renderCategory = function renderCategory() {
    if (!filtered(this)) return nativeCategory.call(this);
    let result = listCardEntries(this._data, {
      tab: this._tab, filter: this._filter, page: this._filter === 'can-charge' ? 1 : this._page,
      pageSize: this._filter === 'can-charge' ? Number.MAX_SAFE_INTEGER : 8,
      itemNames: id => this.cardName(id),
    });
    if (this._filter === 'can-charge') {
      const owned = new Set(inventoryItems().filter(item => item?.type === 6
        && Number.isSafeInteger(item.ITID) && item.ITID > 0
        && Number.isFinite(item.count) && item.count > 0).map(item => item.ITID));
      const entries = result.entries.filter(entry => owned.has(entry.id));
      const totalPages = Math.max(1, Math.ceil(entries.length / 8));
      const page = Math.min(totalPages, Math.max(1, this._page));
      result = { entries: entries.slice((page - 1) * 8, page * 8), total: entries.length, totalPages, page };
    }
    this._page = result.page; this._totalPages = result.totalPages;
    const fragment = doc.createDocumentFragment();
    const toolbar = doc.createElement('div'); toolbar.className = 'cat-toolbar';
    const title = doc.createElement('div'); title.className = 'level-step';
    const label = doc.createElement('div'); label.className = 'lvl';
    label.textContent = filters.find(filter => filter.id === this._filter).label + ' · ' + result.total + ' 张';
    title.appendChild(label);
    const segment = doc.createElement('div'); segment.className = 'seg';
    for (const filter of filters) {
      const control = doc.createElement('button'); control.type = 'button';
      control.dataset.filter = filter.id; control.textContent = filter.label;
      control.className = filter.id === this._filter ? 'active' : '';
      segment.appendChild(control);
    }
    toolbar.append(title, segment); fragment.appendChild(toolbar);
    if (result.entries.length) {
      const grid = doc.createElement('div'); grid.className = 'card-grid'; grid.style.marginTop = '10px';
      for (const entry of result.entries) {
        grid.appendChild(this.createCardNode(entry, {
          ...resolveCategoryCardAction(entry), meta: '第' + entry.level + '页',
        }));
      }
      fragment.appendChild(grid);
    } else {
      const empty = doc.createElement('div'); empty.className = 'empty-box'; empty.style.marginTop = '10px';
      empty.textContent = '本分类没有符合筛选条件的卡片。';
      fragment.appendChild(empty);
    }
    return fragment;
  };
  component.renderCards = function renderCards() {
    inventoryItems();
    const body = this.getRoot()?.querySelector('[data-body]');
    const scrollbar = body?.querySelector(':scope > .ro-custom-scrollbar');
    let result;
    try { result = nativeRender.call(this); }
    finally {
      // Native rendering clears body children. Retain the same scrollbar so its
      // observer does not install another anonymous wheel listener each time.
      if (scrollbar) {
        if (scrollbar.parentNode !== body) body.appendChild(scrollbar);
        body._roScrollHandler?.();
      }
    }
    if (!filtered(this)) return result;
    const root = this.getRoot();
    const pages = root?.querySelector('[data-pages]');
    if (pages) {
      const page = doc.createElement('span'); page.textContent = this._page + ' / ' + this._totalPages;
      pages.replaceChildren(button('‹', 'prev', this._page <= 1), page,
        button('›', 'next', this._page >= this._totalPages));
    }
    const sub = root?.querySelector('[data-view-sub]');
    if (sub) {
      const category = CARD_CONNECTION_TABS.find(tab => tab.id === this._tab)?.label || '';
      sub.textContent = category + '分类 · ' + filters.find(filter => filter.id === this._filter).label;
    }
    return result;
  };
  component.handleBodyClick = function handleBodyClick(event) {
    const control = event.target?.closest?.('[data-filter]');
    if (control && filters.some(filter => filter.id === control.dataset.filter)) {
      this._filter = control.dataset.filter; this._page = 1; this.renderCards(); return;
    }
    return nativeBodyClick.call(this, event);
  };
  function packet(values) {
    if (![values?.tab, values?.level, values?.cardid, values?.state]
      .every(value => typeof value === 'number' && Number.isInteger(value))) return null;
    const tab = Number(values?.tab), level = Number(values?.level);
    const id = Number(values?.cardid), state = Number(values?.state);
    if (!Number.isInteger(tab) || !CARD_CONNECTION_TABS.some(item => item.id === tab)
      || !Number.isInteger(level) || level < 1 || level > 255
      || !Number.isInteger(id) || id < 1 || id > 0xffffffff
      || !Number.isInteger(state) || state < 0 || state > 2) return null;
    return { tab, level, id, state };
  }
  function deck(target) {
    const value = target._data?.data?.[0]?.data?.[1]?.cards;
    return Array.isArray(value) ? value : [];
  }
  function definition(target, values) {
    const row = target._data?.data?.[values.tab]?.data?.[values.level];
    const index = Array.isArray(row?.cards) ? row.cards.indexOf(values.id) : -1;
    return index >= 0 && Array.isArray(row.recharge) ? { row, index } : null;
  }
  function originalDefinition(target, id) {
    const matches = [];
    for (const [tab, category] of Object.entries(target._data?.data || {})) {
      if (Number(tab) === 0) continue;
      for (const row of Object.values(category?.data || {})) {
        if (!Array.isArray(row?.cards) || !Array.isArray(row.recharge)) continue;
        for (let index = 0; index < row.cards.length; index++) {
          if (row.cards[index] === id) matches.push({ row, index });
        }
      }
    }
    // A duplicated ID has no category in a tab-0 reply. Use only a unique
    // server-confirmed in-deck/charged definition; never choose the first row.
    for (const state of [2, 1]) {
      const candidates = matches.filter(entry => entry.row.recharge[entry.index] === state);
      if (candidates.length) return candidates.length === 1 ? candidates[0] : null;
    }
    return matches.length === 1 ? matches[0] : null;
  }
  component.updateList = function updateList(values) {
    const update = packet(values);
    if (!update) return false;
    const entry = definition(this, update);
    if (!entry) return false;
    entry.row.recharge[entry.index] = update.state;
    if (update.state === 2) {
      const slots = deck(this);
      let first = slots.indexOf(update.id);
      for (let index = first + 1; first >= 0 && index < slots.length; index++) {
        if (slots[index] === update.id) slots[index] = 0;
      }
      if (first < 0) {
        first = slots.indexOf(0);
        if (first >= 0) slots[first] = update.id;
      }
    }
    this.renderCards(); return true;
  };
  component.cancelUpdate = function cancelUpdate(values) {
    const update = packet(values);
    if (!update || update.tab === 0 && update.level !== 1) return false;
    const entry = update.tab === 0 ? originalDefinition(this, update.id) : definition(this, update);
    if (entry) entry.row.recharge[entry.index] = update.state;
    let changed = !!entry;
    // A state-2 response still confirms membership, not a successful removal.
    if (update.state < 2) {
      const slots = deck(this);
      for (let index = 0; index < slots.length; index++) {
        if (slots[index] === update.id) { slots[index] = 0; changed = true; }
      }
    }
    if (changed) this.renderCards();
    return changed;
  };
  return true;
}
