const layout = `
  <section class="auction" role="dialog" aria-label="C点交易所">
    <header class="heading"><strong>C点交易所</strong><button type="button" data-close aria-label="关闭交易所">×</button></header>
    <nav aria-label="交易所操作">
      <button type="button" data-view="market">浏览商品</button>
      <button type="button" data-view="mine">我的挂单</button>
      <button type="button" data-view="sell">发布商品</button>
    </nav>
    <form data-search>
      <input aria-label="搜索商品" placeholder="道具名称或词条" maxlength="24">
      <select aria-label="商品类别">
        <option value="4">全部类别</option><option value="0">装备</option><option value="1">武器</option>
        <option value="2">卡片</option><option value="3">其他</option>
      </select>
      <button>搜索</button>
    </form>
    <ul data-list aria-label="交易所商品"></ul>
    <div data-pages><button type="button" data-page="-1">上一页</button><span></span><button type="button" data-page="1">下一页</button></div>
    <form data-sell hidden>
      <button type="button" data-inventory>打开背包</button>
      <div data-drop aria-label="上架道具"><span>将背包中的道具拖到这里</span><button type="button" data-reset hidden>取回道具</button></div>
      <div class="fields">
        <label>售价（C点）<input aria-label="售价" type="number" min="1" max="2147483647" step="1" value="1" required></label>
        <label>上架时长（小时）<input aria-label="上架小时数" type="number" min="1" max="168" step="1" value="168" required></label>
      </div>
      <button data-publish>确认上架</button>
    </form>
    <footer role="status" aria-live="polite"></footer>
  </section>`;

const styles = `
  .auction { width: min(500px, calc(100vw - 16px)); max-height: calc(100vh - 16px); overflow: auto; box-sizing: border-box;
    color: #202930; background: #f7f8fa; border: 1px solid #788994; border-radius: 7px; font: 13px/1.45 system-ui, sans-serif; }
  .auction [hidden] { display: none !important; }
  .heading, nav, form, ul, [data-pages], footer { margin: 0; padding: 8px 12px; }
  .heading { display: flex; align-items: center; justify-content: space-between; background: #213b49; color: #fff; cursor: move; }
  nav, [data-search], [data-pages], .fields { display: flex; gap: 6px; align-items: center; }
  nav { border-bottom: 1px solid #d4dce2; }
  button, input, select { font: inherit; border: 1px solid #a3b2bd; border-radius: 4px; min-height: 26px; box-sizing: border-box; }
  button { padding: 2px 9px; color: inherit; background: #fff; cursor: pointer; white-space: nowrap; }
  button:hover:not(:disabled) { border-color: #317686; }
  button[aria-pressed="true"], [data-publish] { background: #245765; border-color: #245765; color: #fff; }
  button:disabled, input:disabled, select:disabled { opacity: .55; cursor: default; }
  .heading button { background: transparent; border-color: #a3b2bd; color: #fff; font-size: 16px; }
  input, select { min-width: 0; padding: 2px 5px; background: #fff; color: inherit; }
  [data-search] input { flex: 1; }
  ul { max-height: min(300px, 48vh); overflow: auto; list-style: none; padding-block: 0; }
  li { display: grid; grid-template-columns: minmax(0, 1fr) auto auto; gap: 8px; align-items: center;
    padding: 6px 0; border-bottom: 1px solid #e0e5eb; }
  .item-name { min-width: 0; text-align: left; border-color: transparent; background: transparent; padding-inline: 3px;
    white-space: normal; overflow-wrap: anywhere; display: flex; align-items: center; gap: 6px; }
  .item-name img { width: 24px; height: 24px; object-fit: contain; flex: none; }
  .price { font-variant-numeric: tabular-nums; }
  .expires { display: block; font-size: 11px; color: #4f616e; }
  [data-pages] { justify-content: flex-end; }
  [data-sell] { display: grid; gap: 10px; justify-items: start; }
  [data-drop] { display: flex; width: 100%; box-sizing: border-box; align-items: center; justify-content: space-between;
    gap: 8px; min-height: 46px; padding: 8px; border: 1px dashed #728995; border-radius: 4px; overflow-wrap: anywhere; }
  .fields label { display: grid; gap: 2px; }
  footer { min-height: 19px; color: #4f616e; border-top: 1px solid #d4dce2; }
`;

export function createLastroAuction({
  GUIComponent, UIManager, PACKET, Network, getInventory, getPlayerName, getItemName,
  loadItemIcon, showItemDetails, enabled,
}) {
  const panel = new GUIComponent('LastroAuction', styles);
  panel.render = () => layout;

  let ui;
  let active = false;
  let closing = false;
  let view = 'market';
  let query = { Type: 4, AuctionID: 0, Name: '', Page: 1 };
  let maxPage = 1;
  let rows = [];
  let waitingForList = false;
  let draft = null;
  let operation = null;
  let notice = '';

  function send(name, fields = {}) {
    try {
      if (Network.sendPacket(Object.assign(new PACKET.CZ[name](), fields)) !== false) return true;
    } catch (error) {
      console.warn('[LastRO] Auction request failed', name, error);
    }
    notice = '请求发送失败，请重试。';
    return false;
  }

  function makeListing(entry) {
    const doc = ui.list.ownerDocument;
    const row = doc.createElement('li');
    const details = doc.createElement('button');
    details.type = 'button';
    details.className = 'item-name';
    const icon = doc.createElement('img');
    icon.alt = '';
    details.append(icon, getItemName(entry));
    loadItemIcon(entry, url => { if (url) icon.src = url; });
    details.addEventListener('click', () => showItemDetails(entry));
    details.addEventListener('contextmenu', event => {
      event.preventDefault();
      showItemDetails(entry);
    });

    const info = doc.createElement('div');
    info.className = 'price';
    info.textContent = `${entry.MaxPrice.toLocaleString('zh-CN')} C点`;
    if (entry.DeleteTime > 0) {
      const expires = doc.createElement('time');
      expires.className = 'expires';
      const date = new Date(entry.DeleteTime * 1000);
      expires.dateTime = date.toISOString();
      expires.textContent = date.toLocaleString('zh-CN', { month: 'numeric', day: 'numeric', hour: '2-digit', minute: '2-digit' });
      info.append(expires);
    }
    const action = doc.createElement('button');
    action.type = 'button';
    action.textContent = view === 'mine' ? '下架' : '购买';
    action.disabled = closing || waitingForList || !!operation || (view === 'market' && (
      entry.SellerName === getPlayerName() || entry.MaxPrice < 1
    ));
    action.addEventListener('click', () => actOnListing(entry));
    row.append(details, info, action);
    return row;
  }

  function render() {
    if (!active) return;
    const busy = closing || !!operation || waitingForList;
    ui.close.disabled = closing;
    for (const tab of ui.tabs) {
      tab.setAttribute('aria-pressed', String(tab.dataset.view === view));
      tab.disabled = busy;
    }
    ui.search.hidden = view !== 'market';
    for (const control of ui.search.elements) control.disabled = busy;
    ui.list.hidden = view === 'sell';
    ui.list.replaceChildren(...rows.map(makeListing));
    ui.pages.hidden = view !== 'market';
    ui.page.textContent = `${query.Page} / ${maxPage}`;
    ui.previous.disabled = busy || query.Page <= 1;
    ui.next.disabled = busy || query.Page >= maxPage;
    ui.sell.hidden = view !== 'sell';
    ui.inventory.disabled = closing || !!operation;
    ui.dropLabel.textContent = draft ? getItemName(draft) : '将背包中的道具拖到这里';
    ui.reset.hidden = !draft;
    ui.reset.disabled = closing || !!operation;
    ui.publish.disabled = closing || !draft || !!operation;
    ui.status.textContent = closing ? '正在关闭交易所…' : notice || (waitingForList ? '正在加载商品…' : '');
  }

  function requestList() {
    if (closing || waitingForList || !active || view === 'sell') return;
    waitingForList = true;
    const sent = view === 'mine' ? send('AUCTION_REQ_MY_INFO', { Type: 0 }) : send('AUCTION_ITEM_SEARCH', query);
    if (!sent) waitingForList = false;
    render();
  }

  function selectView(next) {
    if (closing || operation || waitingForList || !active) return;
    view = next;
    rows = [];
    notice = '';
    if (view !== 'sell') requestList();
    else render();
  }

  function confirm(kind, message, packet, fields) {
    if (closing || !active || operation || waitingForList) return;
    const current = { kind, submitted: false };
    operation = current;
    render();
    current.prompt = UIManager.showPromptBox(message, 'ok', 'cancel', () => {
      if (closing || !active || !enabled() || operation !== current || current.submitted) return;
      current.submitted = true;
      notice = '等待服务器确认…';
      if (!send(packet, fields)) operation = null;
      render();
    }, () => {
      if (operation === current && !current.submitted) operation = null;
      render();
    });
  }

  function actOnListing(entry) {
    if (!rows.includes(entry) || !Number.isInteger(entry.AuctionID) || entry.AuctionID <= 0) return;
    const name = getItemName(entry);
    if (view === 'mine') {
      confirm('remove', `下架 ${name}？道具将通过邮件退回。`, 'AUCTION_ADD_CANCEL', { AuctionID: entry.AuctionID });
    } else if (view === 'market' && entry.SellerName !== getPlayerName() && entry.MaxPrice >= 1) {
      confirm('buy', `支付 ${entry.MaxPrice} C点购买 ${name}？道具将通过邮件发放。`, 'AUCTION_BUY', {
        AuctionID: entry.AuctionID, Money: entry.MaxPrice,
      });
    }
  }

  function stageItem(index) {
    if (closing || !active || view !== 'sell' || operation || draft || !Number.isInteger(index) || index < 0 || index > 0x7fff) return;
    const item = getInventory().getItemByIndex(index);
    if (!item) return;
    operation = { kind: 'stage', item, index };
    notice = '正在确认道具…';
    // The archived client encodes AUCTION_CREATE with the packet's default Type of 0.
    if (!send('AUCTION_CREATE', { Type: 0 }) || !send('AUCTION_ADD_ITEM', { index, count: 1 })) operation = null;
    render();
  }

  function onItemStaged(packet) {
    if (!active || operation?.kind !== 'stage' || (packet.result === 0 && packet.Index !== operation.index)) return;
    const { item, index } = operation;
    operation = null;
    if (packet.result !== 0) {
      notice = '该道具无法上架。';
    } else {
      const inventory = getInventory();
      draft = { ...item, count: 1 };
      if (inventory.getItemByIndex(index) === item) inventory.removeItem(index, 1);
      notice = '';
    }
    render();
  }

  function onList(packet) {
    if (closing || !active || !waitingForList) return;
    waitingForList = false;
    maxPage = Math.max(1, Math.min(0xffff, packet.MaxPage));
    rows = packet.auctionItemList.slice(0, Math.max(0, packet.Number));
    if (view === 'market' && query.Page > maxPage) {
      query = { ...query, Page: maxPage };
      requestList();
      return;
    }
    if (!rows.length && !notice) notice = '没有符合条件的商品。';
    render();
  }

  function onRemoveResult(result) {
    if (closing || !active || operation?.kind !== 'remove' || !operation.submitted) return;
    operation = null;
    notice = result === 1 ? '商品已下架，请查收邮件。' : '下架失败，商品可能已售出。';
    requestList();
  }

  function onResult({ Result }) {
    if (closing || !active || !operation?.submitted) return;
    const { kind } = operation;
    if (kind === 'remove') {
      onRemoveResult(Result === 2 ? 1 : 0);
      return;
    }
    operation = null;
    if (kind === 'publish' && Result === 1) {
      draft = null;
      view = 'mine';
      rows = [];
      notice = '上架成功。';
      requestList();
    } else if (kind === 'buy' && Result === 6) {
      notice = '购买成功，请查收邮件。';
      requestList();
    } else {
      notice = kind === 'buy' ? '购买失败。' : ({ 4: '挂单数量已达上限。', 5: '手续费扣款失败。' }[Result] ?? '上架失败。');
      render();
    }
  }

  panel.init = function () {
    const root = this._container;
    const pick = selector => root.querySelector(selector);
    ui = {
      tabs: root.querySelectorAll('[data-view]'), search: pick('[data-search]'), list: pick('[data-list]'),
      pages: pick('[data-pages]'), page: pick('[data-pages] span'), previous: pick('[data-page="-1"]'), next: pick('[data-page="1"]'),
      close: pick('[data-close]'), sell: pick('[data-sell]'), status: pick('footer'), drop: pick('[data-drop]'), dropLabel: pick('[data-drop] span'),
      publish: pick('[data-publish]'), reset: pick('[data-reset]'), inventory: pick('[data-inventory]'),
    };
    this._host.style.left = '112px';
    this._host.style.top = '104px';
    this.draggable(pick('.heading strong'));
    ui.close.addEventListener('click', () => {
      if (closing || !active) return;
      closing = true;
      if (!send('AUCTION_CLOSE')) closing = false;
      else operation?.prompt?.remove();
      render();
    });
    for (const tab of ui.tabs) tab.addEventListener('click', () => selectView(tab.dataset.view));
    ui.search.addEventListener('submit', event => {
      event.preventDefault();
      if (closing || operation || waitingForList) return;
      query = { Type: Number(pick('[data-search] select').value), AuctionID: 0, Name: pick('[data-search] input').value.trim(), Page: 1 };
      notice = '';
      requestList();
    });
    for (const button of [ui.previous, ui.next]) button.addEventListener('click', () => {
      if (closing || operation || waitingForList) return;
      const page = query.Page + Number(button.dataset.page);
      if (page < 1 || page > maxPage) return;
      query = { ...query, Page: page };
      notice = '';
      requestList();
    });
    ui.inventory.addEventListener('click', () => getInventory().append());
    ui.drop.addEventListener('dragover', event => { event.preventDefault(); event.stopPropagation(); });
    ui.drop.addEventListener('drop', event => {
      event.preventDefault();
      event.stopPropagation();
      let drag;
      try { drag = JSON.parse(event.dataTransfer.getData('Text')); } catch { return; }
      if (drag?.from === 'Inventory' && drag.type === 'item') stageItem(drag.data?.index);
    });
    ui.reset.addEventListener('click', () => {
      if (closing || operation || !draft) return;
      if (send('AUCTION_CREATE', { Type: 0 })) {
        draft = null;
        notice = '';
      }
      render();
    });
    ui.sell.addEventListener('submit', event => {
      event.preventDefault();
      if (!draft || view !== 'sell') return;
      const price = pick('[aria-label="售价"]').valueAsNumber;
      const hours = pick('[aria-label="上架小时数"]').valueAsNumber;
      if (!Number.isInteger(price) || price < 1 || price > 0x7fffffff || !Number.isInteger(hours) || hours < 1 || hours > 168) return;
      const fee = price >= 10 ? '，成交后另扣成交价的 10%' : '';
      confirm('publish', `以 ${price} C点上架 ${getItemName(draft)}，有效期 ${hours} 小时？上架手续费 ${price} Zeny${fee}。`, 'AUCTION_ADD', {
        NowMoney: price, MaxMoney: price, DeleteHour: hours,
      });
    });
  };

  panel.onAppend = () => {
    if (active) return;
    active = true;
    ui.search.reset();
    ui.sell.reset();
    requestList();
  };
  panel.onRemove = () => {
    active = false;
    closing = false;
    operation?.prompt?.remove();
    operation = draft = null;
    waitingForList = false;
    view = 'market';
    query = { Type: 4, AuctionID: 0, Name: '', Page: 1 };
    maxPage = 1;
    rows = [];
    notice = '';
  };

  panel.hookPackets = () => {
    const hook = (name, callback) => Network.hookPacket(PACKET.ZC[name], callback);
    hook('AUCTION_WINDOWS', packet => {
      if (packet.Type === 0 && enabled()) {
        if (!active) panel.append();
      } else if (active) panel.remove();
    });
    hook('AUCTION_ITEM_REQ_SEARCH', onList);
    hook('ACK_AUCTION_ADD_ITEM', onItemStaged);
    hook('AUCTION_RESULT', onResult);
    hook('AUCTION_ACK_MY_SELL_STOP', packet => onRemoveResult(packet.Result));
  };
  return panel;
}
