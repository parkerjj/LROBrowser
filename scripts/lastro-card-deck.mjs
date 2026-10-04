/** Four saved decks share one server-confirmed deck and serialized edits. */
export function installLastroCardDeck(component, deps) {
  if (component._lastroCardDeck) return component._lastroCardDeck;
  const { getSession, getDefaults, loadPreferences, setTimeout: schedule, clearTimeout: unschedule } = deps;
  let identity, connection, playing = false, preferences, presets = [null, null, null, null];
  let names = Array.from({ length: 4 }, (_, index) => '卡册 ' + (index + 1));
  let drafts = [null, null, null, null], activeCards = null;
  let verifiedCards = [null, null, null, null];
  let selected = 1, active = null, ready = false, epoch = 0, busy = null, pending = null, unresolved = null;
  const nativeSend = component.sendAction, nativeFull = component.rechargeList;
  const nativeUpdate = component.updateList, nativeCancel = component.cancelUpdate;
  const integer = (value, min, max) => Number.isInteger(value) && value >= min && value <= max;
  const validIndex = index => integer(index, 1, 4);
  const cleanName = value => typeof value === 'string' && value.trim()
    && Array.from(value.trim()).length <= 24
    && !Array.from(value).some(character => character.codePointAt(0) < 32 || character.codePointAt(0) === 127) ? value.trim() : null;
  const status = message => component.setStatus(message);
  const render = () => component.renderCards();
  const deck = () => component._data?.data?.[0]?.data?.[1]?.cards?.filter(Boolean) || [];
  const sameCards = (left, right) => left.length === right.length && new Set(left).size === left.length
    && new Set(right).size === right.length && left.every(id => right.includes(id));
  function cleanPreset(value) {
    if (!Array.isArray(value) || value.length > 8) return null;
    const ids = new Set(), output = [];
    for (const card of value) {
      if (!card || !integer(card.id, 1, 0xffffffff) || !integer(card.tab, 1, 7)
        || !integer(card.level, 1, 255) || ids.has(card.id)) return null;
      ids.add(card.id); output.push({ id: card.id, tab: card.tab, level: card.level });
    }
    return output;
  }
  const copyCards = cards => cards?.map(card => ({ ...card })) ?? null;
  const draft = index => drafts[index - 1] ?? presets[index - 1] ?? [];
  const sameDefinitions = (left, right) => left.length === right.length && left.every(card =>
    right.some(other => other.id === card.id && other.tab === card.tab && other.level === card.level));
  const dirty = index => drafts[index - 1] !== null
    && (presets[index - 1] === null || !sameDefinitions(drafts[index - 1], presets[index - 1]));
  const verified = index => validIndex(index) && !dirty(index) && presets[index - 1] !== null
    && verifiedCards[index - 1] !== null && sameDefinitions(presets[index - 1], verifiedCards[index - 1]);
  function preferenceSnapshot() {
    return { ...preferences, presets: presets.map(copyCards), names: [...names],
      activePreset: active, activeCards: copyCards(activeCards), verifiedCards: verifiedCards.map(copyCards) };
  }
  function finishPending(result, reason) {
    const current = pending; pending = null;
    if (current) { unschedule(current.timer); if (reason) current.onFailure?.(reason); current.resolve(result); }
  }
  function invalidate(reset = true) {
    if (!reset && (pending || unresolved)) {
      unresolved = pending || unresolved;
      // Cancel the old UI transaction; only reconcile its eventual result.
      unresolved.editIndex = null;
    }
    epoch++; finishPending(false); busy = null;
    // A same-socket map change cannot establish the result of an unanswered
    // operation. Keep it quarantined until a reply or complete roster arrives.
    if (reset) { ready = false; unresolved = null; }
    else if (unresolved) unresolved.token = epoch;
  }
  function session() {
    const value = getSession();
    if (value.key !== identity || value.connection !== connection) {
      invalidate(); identity = value.key; connection = value.connection; selected = 1;
      component._data = getDefaults();
      preferences = null; presets = [null, null, null, null]; drafts = [null, null, null, null]; active = null; activeCards = null;
      verifiedCards = [null, null, null, null];
      names = Array.from({ length: 4 }, (_, index) => '卡册 ' + (index + 1));
      if (identity) {
        try {
          preferences = loadPreferences(identity);
          presets = Array.from({ length: 4 }, (_, index) => cleanPreset(preferences?.presets?.[index]));
          verifiedCards = Array.from({ length: 4 }, (_, index) => cleanPreset(preferences?.verifiedCards?.[index]));
          names = names.map((name, index) => cleanName(preferences?.names?.[index]) || name);
          active = validIndex(preferences?.activePreset) ? preferences.activePreset : null;
          activeCards = cleanPreset(preferences?.activeCards) ?? (active ? copyCards(presets[active - 1]) : null);
        } catch { status('套卡设置读取失败'); }
      }
    } else if (playing && !value.playing) invalidate();
    playing = value.playing;
    return value;
  }
  function usable() {
    const value = session();
    return Boolean(value.key && value.connection && value.playing && ready && !unresolved);
  }
  function current(token) { return usable() && token === epoch; }
  function cardState(card) {
    const row = component._data?.data?.[card.tab]?.data?.[card.level];
    const slot = row?.cards?.indexOf(card.id) ?? -1;
    return slot < 0 ? -1 : row.recharge?.[slot];
  }
  function equipmentTab(card) {
    if (!integer(card?.id, 1, 0xffffffff) || !integer(card?.tab, 1, 7)) return null;
    // 4646 occupies a garment slot (confirmed in use and in the original
    // 3x catalogue). The 2x catalogue keeps it at shoe page 5 for the protocol.
    // Keep that request coordinate; descriptions do not decide equipment slots.
    return card.id === 4646 && card.tab === 6 ? 5 : card.tab;
  }
  function definitionError(cards) {
    if (!cleanPreset(cards)) return '卡册最多8张，同一卡片不能重复加入';
    if (cards.some(card => cardState(card) < 0)) return '卡片分类不明确，无法保存或激活';
    return null;
  }
  function definitionsFor(id) {
    const matches = [];
    for (let tab = 1; tab <= 7; tab++) {
      for (const [level, row] of Object.entries(component._data?.data?.[tab]?.data || {})) {
        const slot = row.cards.indexOf(id);
        if (slot >= 0) matches.push({ id, tab, level: Number(level), state: row.recharge[slot] });
      }
    }
    return matches;
  }
  function recordDeck() {
    const ids = deck();
    if (ids.length > 8 || new Set(ids).size !== ids.length) return null;
    const result = [];
    for (const id of ids) {
      const matches = definitionsFor(id);
      const confirmed = matches.filter(card => card.state === 2);
      const charged = matches.filter(card => card.state === 1);
      const candidates = confirmed.length ? confirmed : charged;
      if (candidates.length !== 1) return null;
      const { tab, level } = candidates[0]; result.push({ id, tab, level });
    }
    return result;
  }
  function activeIndex() {
    session();
    const confirmed = ready ? confirmedDeck() : null;
    return validIndex(active) && activeCards && confirmed
      && sameDefinitions(activeCards, confirmed) ? active : null;
  }
  function confirmedDeck() {
    const cards = recordDeck();
    return cards && cards.every(card => cardState(card) === 2) ? cards : null;
  }
  function editable(index = selected) {
    if (!validIndex(index) || !usable() || busy || index !== selected || active !== index || !activeCards) return false;
    const confirmed = confirmedDeck();
    return Boolean(confirmed && sameDefinitions(confirmed, activeCards) && sameDefinitions(confirmed, draft(index)));
  }
  function definitionFor(id) {
    const edited = draft(selected).find(card => card.id === id);
    if (edited && cardState(edited) > 0) return { ...edited, state: cardState(edited) };
    const matches = definitionsFor(id), confirmed = matches.filter(card => card.state === 2);
    const candidates = confirmed.length ? confirmed : matches.filter(card => card.state === 1);
    return candidates.length === 1 ? candidates[0] : null;
  }
  function availableCards() {
    const selectedIds = new Set(draft(selected).map(card => card.id)), seen = new Set(), cards = [];
    for (let tab = 1; tab <= 7; tab++) {
      for (const row of Object.values(component._data?.data?.[tab]?.data || {})) {
        for (let slot = 0; slot < row.cards.length; slot++) {
          const id = row.cards[slot];
          if (!id || ![1, 2].includes(row.recharge[slot]) || seen.has(id) || selectedIds.has(id)) continue;
          seen.add(id); const card = definitionFor(id);
          if (card) cards.push(card);
        }
      }
    }
    return cards;
  }
  function fullSnapshot(packet) {
    const defaults = getDefaults();
    if (!packet || packet.classNum !== undefined && packet.classNum !== 8
      || !Array.isArray(packet.classInfos) || packet.classInfos.length !== 8) return false;
    const ids = new Set();
    return packet.classInfos.every((category, tab) => {
      const count = Object.keys(defaults.data[tab]?.data || {}).length;
      return category && category.level === count && integer(category.enable, 0, 255)
        && Array.isArray(category.data) && category.data.length === count
        && category.data.every(row => row && integer(row.activate, 0, 255)
          && Array.from({ length: 8 }, (_, slot) => row['recharge' + slot]).every(value => {
            if (!integer(value, 0, tab === 0 ? 0xffffffff : 2)) return false;
            if (tab === 0 && value) { if (ids.has(value)) return false; ids.add(value); }
            return true;
          }));
    });
  }
  function acknowledged(action, packet) {
    session();
    const request = pending || unresolved;
    if (!request || request.token !== epoch || !playing || action !== request.action
      || packet?.cardid !== request.values.cardid || !integer(packet.state, 0, 2)) return;
    const sameCoordinates = packet.tab === request.values.tab && packet.level === request.values.level;
    const originalCancel = action === 'cancel' && request.cancelOrigin
      && packet.tab === request.cancelOrigin.tab && packet.level === request.cancelOrigin.level;
    if (!sameCoordinates && !originalCancel) return;
    const ids = deck();
    const accepted = action === 'cancel' ? packet.state < 2 && !ids.includes(packet.cardid)
      : action === 'recharge' ? packet.state > 0
        : packet.state === 2 && ids.includes(packet.cardid)
          && cardState({ id: packet.cardid, tab: packet.tab, level: packet.level }) === 2;
    if (request === pending) finishPending(accepted);
    else {
      unresolved = null;
      // A late reply updates the actual server state, but never resumes an
      // aborted multi-packet switch or marks that switch successful.
      if (accepted && validIndex(request.editIndex) && active === request.editIndex) {
        const confirmed = confirmedDeck();
        if (confirmed) { drafts[active - 1] = copyCards(confirmed); activeCards = copyCards(confirmed); }
      }
      status(accepted ? '已收到服务器确认，请检查当前卡册' : '服务器未确认卡片操作，未保存修改');
    }
  }
  function serverNotice(message) {
    session();
    const item = pending || unresolved;
    if (!item || item.token !== epoch || !playing || item.action !== 'add-deck' || typeof message !== 'string') return false;
    const reason = message.replace(/\0+$/, '').trim();
    // Only the server's specific card quota refusal can settle a missing ACK.
    // Ordinary chat, generic errors and success text never confirm mutations.
    const match = /^卡组中已有[1-8]张(头饰|铠甲|盔甲|武器|盾牌|披肩|鞋子|鞋类|饰品)类卡片[。！!]?$/u.exec(reason);
    const category = { 头饰: 1, 铠甲: 2, 盔甲: 2, 武器: 3, 盾牌: 4, 披肩: 5, 鞋子: 6, 鞋类: 6, 饰品: 7 };
    // Attribute the refusal to this request; this does not impose client quotas.
    if (!match || category[match[1]] !== equipmentTab({ id: item.values.cardid, tab: item.values.tab })) return false;
    const confirmed = confirmedDeck();
    if (!confirmed || !item.before || !sameDefinitions(confirmed, item.before)) return false;
    if (item === pending) finishPending(false, reason);
    else unresolved = null;
    status(reason); render(); return true;
  }
  function request(action, values, token, editIndex = null, onFailure = null) {
    return new Promise(resolve => {
      const definitions = action === 'cancel' ? definitionsFor(values.cardid) : [];
      const confirmed = definitions.filter(card => card.state === 2);
      const candidates = confirmed.length ? confirmed : definitions.filter(card => card.state === 1);
      const item = { action, values: { ...values }, token, resolve, editIndex, onFailure, before: copyCards(confirmedDeck()),
        timer: null, cancelOrigin: candidates.length === 1 ? candidates[0] : null };
      pending = item;
      item.timer = schedule(() => {
        if (pending !== item) return;
        // Retain confirmed cards and the active label. Prevent another request
        // from mistaking this delayed packet for its own acknowledgement.
        unresolved = item; finishPending(false, '服务器响应超时，正在等待卡册操作结果');
        status('服务器响应超时，正在等待卡册操作结果'); render();
      }, 5000);
      try { if (nativeSend.call(component, action, values) === false) finishPending(false); }
      catch { finishPending(false); }
    });
  }
  component.rechargeList = function (packet) {
    session();
    if (!fullSnapshot(packet)) { invalidate(); status('卡册状态尚未完整同步'); render(); return false; }
    const lastActive = active, lastCards = copyCards(activeCards);
    invalidate(); component._data = getDefaults();
    const result = nativeFull.call(this, packet);
    ready = result === true;
    active = ready ? lastActive : null; activeCards = lastCards;
    // The complete server roster also confirms an already active saved deck.
    // Older preferences need no migration guess about other saved combinations.
    if (ready) {
      const confirmed = recordDeck();
      if (confirmed && confirmed.every(card => cardState(card) === 2)) {
        for (let index = 0; index < 4; index++) {
          if (presets[index] && sameDefinitions(presets[index], confirmed)) verifiedCards[index] = copyCards(confirmed);
        }
      }
    }
    if (ready && presets.every(cards => cards === null) && drafts.every(cards => cards === null)) {
      const cards = recordDeck(); if (cards) drafts[0] = cards;
    }
    render(); return result;
  };
  component.updateList = function (packet) {
    session(); const result = nativeUpdate.call(this, packet);
    acknowledged((pending || unresolved)?.action === 'recharge' ? 'recharge' : 'add-deck', packet); render(); return result;
  };
  component.cancelUpdate = function (packet) {
    session(); const result = nativeCancel.call(this, packet);
    acknowledged('cancel', packet); render(); return result;
  };
  component.sendAction = function (action, values) {
    if (!['recharge', 'add-deck', 'cancel'].includes(action)) return nativeSend.call(this, action, values);
    if (!usable() || busy) { status(busy || unresolved ? '正在等待服务器确认，请稍候' : '卡册状态尚未完整同步'); return false; }
    if (action !== 'recharge') {
      if (!editable()) { status('请先点击激活当前卡册，等待服务器确认后再编辑'); return false; }
      if (!values || !integer(values.cardid, 1, 0xffffffff)) return false;
      const cards = confirmedDeck();
      if (action === 'cancel') {
        if (values.tab !== 0 || values.level !== 1 || !cards.some(card => card.id === values.cardid)) return false;
      } else {
        const card = { id: values.cardid, tab: values.tab, level: values.level };
        if (!cleanPreset([card]) || ![1, 2].includes(cardState(card)) || cards.some(value => value.id === card.id)) return false;
        if (cards.length >= 8) { status('卡册最多8张，请先移除卡片'); return false; }
      }
    }
    const token = epoch, task = {}, index = selected; busy = task;
    let failure;
    const operation = request(action, values, token, action === 'recharge' ? null : index, reason => { failure = reason; });
    void operation.then(result => {
      if (busy !== task) return;
      busy = null;
      if (result && current(token) && action !== 'recharge') {
        const confirmed = confirmedDeck();
        if (confirmed) {
          drafts[index - 1] = copyCards(confirmed); activeCards = copyCards(confirmed);
          status('服务器已确认「' + names[index - 1] + '」的修改，请保存卡册');
        } else status('卡册内容尚未完整确认，请重新同步');
      } else if (!result && ready) status(failure || '服务器未确认卡片操作，未保存修改');
      render();
    });
    render(); return true;
  };
  component.selectDeckPreset = function (index) {
    session(); if (!validIndex(index) || busy || unresolved) return false;
    selected = index;
    status('已选择「' + names[index - 1] + '」，请先激活再编辑，服务器确认后保存');
    render(); return true;
  };
  component.renameDeckPreset = async function (index, value) {
    const name = cleanName(value);
    if (!validIndex(index)) return false;
    if (!name) { status('卡册名称不能为空，最多24个字符，请勿包含控制字符'); return false; }
    if (!usable() || busy || !preferences) return false;
    const token = epoch, task = {}; busy = task; render();
    const next = preferenceSnapshot();
    next.names[index - 1] = name;
    try {
      if (typeof next.save !== 'function' || await next.save() === false) throw new Error('save');
      if (!current(token) || busy !== task) return false;
      preferences = next; names = next.names; status('已重命名为「' + name + '」'); return true;
    } catch { if (current(token)) status('卡册名称保存失败，请重试'); return false; }
    finally { if (busy === task) { busy = null; render(); } }
  };
  component.saveDeckPreset = async function (index) {
    if (!validIndex(index) || !usable() || busy || !preferences) return false;
    if (!editable(index)) { status('请先激活当前卡册，等待服务器确认后再保存'); return false; }
    const cards = copyCards(confirmedDeck());
    const token = epoch, task = {}; busy = task; selected = index; render();
    const next = preferenceSnapshot();
    next.presets[index - 1] = cards;
    next.verifiedCards[index - 1] = copyCards(cards);
    try {
      if (typeof next.save !== 'function' || await next.save() === false) throw new Error('save');
      if (!current(token) || busy !== task) return false;
      preferences = next; presets = next.presets; verifiedCards = next.verifiedCards; drafts[index - 1] = null;
      status('已保存「' + names[index - 1] + '」'); return true;
    } catch { if (current(token)) status('套卡保存失败，请重试'); return false; }
    finally { if (busy === task) { busy = null; render(); } }
  };
  function activate(index, target, requireVerified) {
    if (!validIndex(index)) return false;
    const owner = session(), startEpoch = epoch, name = names[index - 1];
    function notify(success, reason) {
      const value = session();
      if (value.key && value.key === owner.key && value.connection === owner.connection && value.playing
        && epoch === startEpoch) {
        try { deps.notify?.(success, index, name, reason); } catch { /* Notifications cannot change an acknowledged result. */ }
      }
      return success;
    }
    if (!usable() || busy) {
      const reason = busy || unresolved ? '正在等待服务器确认' : '卡册状态尚未完整同步';
      status(reason); return notify(false, reason);
    }
    if (!target) { status('「' + name + '」未保存'); return notify(false, '尚未保存'); }
    if (requireVerified && dirty(index)) { status('「' + name + '」有未保存修改，请先保存'); return notify(false, '请先保存卡册修改'); }
    const reason = definitionError(target);
    if (reason) { status(reason); return notify(false, reason); }
    if (!target.every(card => cardState(card) === 1 || cardState(card) === 2)) {
      status('套卡包含尚未充能或已变更的卡片，无法切换'); return notify(false, '卡片未充能或已变更');
    }
    if (requireVerified && !verified(index)) {
      const reason = '请先手动激活，等待服务器确认并保存';
      status('「' + name + '」' + reason); return notify(false, reason);
    }
    const before = deck();
    if (before.length > 8 || new Set(before).size !== before.length || before.length && !recordDeck()) {
      status('当前卡组分类不明确，请重新登录同步卡册状态'); return notify(false, '当前卡组分类不明确');
    }
    selected = index;
    const token = epoch, task = {}; busy = task; render();
    let failure;
    const rejected = reason => { failure = reason; };
    return (async () => {
      let success = false;
      try {
        const ids = target.map(card => card.id);
        for (const id of before.filter(id => !ids.includes(id))) {
          if (!current(token) || !await request('cancel', { tab: 0, level: 1, cardid: id }, token, null, rejected)) return false;
        }
        for (const card of target.filter(card => !before.includes(card.id))) {
          if (!current(token) || !await request('add-deck', { tab: card.tab, level: card.level, cardid: card.id }, token, null, rejected)) return false;
        }
        const confirmed = confirmedDeck();
        if (!current(token) || !confirmed || !sameDefinitions(target, confirmed)) return false;
        active = index; activeCards = copyCards(confirmed); drafts[index - 1] = copyCards(confirmed);
        if (presets[index - 1] && sameDefinitions(presets[index - 1], confirmed)) verifiedCards[index - 1] = copyCards(confirmed);
        const next = preferenceSnapshot();
        let saved = false;
        try { saved = typeof next.save === 'function' && await next.save() !== false; } catch { /* The acknowledged deck remains authoritative. */ }
        if (!current(token) || busy !== task) return false;
        if (saved) preferences = next;
        success = true; status('已切换至「' + name + '」' + (saved ? '' : '，活动标记保存失败')); return true;
      } finally {
        if (busy === task) {
          busy = null;
          if (!success && ready) status(failure || '套卡切换未完成，请检查服务器卡组状态');
          render();
        }
      }
    })().then(result => notify(result, result ? undefined : failure || (ready ? '服务器未确认切换' : '服务器响应超时或状态未同步')),
      () => { status('套卡切换失败'); return notify(false, '操作异常'); });
  }
  component.switchDeckPreset = function (index, { requireVerified = false } = {}) {
    session();
    return activate(index, validIndex(index) ? presets[index - 1] : null, requireVerified);
  };
  component.activateDeckPreset = function (index) {
    session();
    return activate(index, validIndex(index) ? copyCards(draft(index)) : null, false);
  };
  const api = {
    getPresets() { session(); return presets.map(value => value ? value.map(card => card.id) : null); },
    getNames() { session(); return [...names]; },
    getDraft(index) { session(); index ??= selected; return validIndex(index) ? copyCards(draft(index)) : []; },
    isDirty(index) { session(); index ??= selected; return validIndex(index) && dirty(index); },
    isVerified(index) { session(); return ready && verified(index); },
    getAvailableCards() { session(); return ready ? availableCards() : []; },
    getCardState(card) { session(); return cardState(card); },
    getCardDefinition(id) { session(); return ready ? definitionFor(id) : null; },
    getEquipmentTab: equipmentTab,
    getSelected() { session(); return selected; }, getActivePreset: activeIndex,
    isBusy() { session(); return busy !== null || unresolved !== null; },
    canEdit(index) { return editable(index); }, canSave(index) { return editable(index); },
    isActive(cards) { session(); return ready && sameCards(cards, deck()); }, invalidate, onServerNotice: serverNotice,
  };
  component._lastroCardDeck = api; session(); return api;
}
