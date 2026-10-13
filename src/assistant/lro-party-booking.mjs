import { getLastROAgencyCatalog } from './lro-party-catalog.mjs';
// LastRO's adventurer recruitment is an HTTP board plus native instance packets.
// This client keeps the two operations separate: never advertise a dungeon before the server ACK.
const ENDPOINT = 'https://game.lastro.cn/';
const ROLES = Object.freeze({ Assist: 1, Dealer: 1, Healer: 1, Tanker: 1 });
const MAX_PAGE = 10;

export function partyWebPath(nid) {
  return Number(nid) === 5 ? 'webserver2' : 'webserver';
}

let gbkReverse;
export function encodePartyText(value) {
  if (!gbkReverse) {
    // Same GBK percent-byte convention as the official UrlTools encoder.
    const decoder = new globalThis.TextDecoder('gbk');
    const bytes = new Uint8Array(2);
    const table = new Map();
    for (let high = 0x81; high <= 0xfe; high++) {
      for (let low = 0x40; low <= 0xfe; low++) {
        if (low === 0x7f) continue;
        bytes[0] = high; bytes[1] = low;
        const char = decoder.decode(bytes);
        if (char.length === 1 && char !== '\ufffd' && !table.has(char)) {
          table.set(char, '%' + high.toString(16).padStart(2, '0').toUpperCase()
            + '%' + low.toString(16).padStart(2, '0').toUpperCase());
        }
      }
    }
    gbkReverse = table;
  }
  return String(value ?? '').replace(/./g, char => {
    const code = char.charCodeAt(0);
    return code <= 0x7f || code === 8364 ? encodeURIComponent(char) : (gbkReverse.get(char) || char);
  });
}
export function decodePartyText(value) {
  const text = String(value ?? '').replace(/%20/gi, ' ');
  try { return decodeURIComponent(text); } catch {
    // Official UrlTools uses percent-encoded GBK bytes for Chinese.
    try {
      const decoder = new globalThis.TextDecoder('gbk');
      return text.replace(/(?:%[0-9a-f]{2})+/gi, part => {
        const bytes = part.match(/[0-9a-f]{2}/gi).map(x => parseInt(x, 16));
        return decoder.decode(Uint8Array.from(bytes));
      });
    } catch { return text; }
  }
}

export function normalizePartyEntry(value, decoder = decodePartyText) {
  if (!value || typeof value !== 'object') return null;
  const aid = Number(value.AID), cid = Number(value.GID);
  if (!Number.isSafeInteger(aid) || aid <= 0 || !Number.isSafeInteger(cid) || cid < 0) return null;
  return {
    aid, cid, iid: Number(value.IID) || 0,
    type: Number(value.Type) === 1 ? 1 : 0,
    state: Number(value.ISTATE) === 1 ? 1 : 0,
    min: Number(value.MinLV) || 1, max: Number(value.MaxLV) || 200,
    name: decoder(value.CharName),
    memo: decoder(value.Memo), map: decoder(value.WorldName),
  };
}

export function makePartyFields(session, action, extra = {}, encoder = encodeURIComponent) {
  const entity = session?.Entity;
  // Official Online.js stores AC.ACCEPT_LOGIN3.AuthToken; V2 keeps the same
  // 17-byte login token as SessionStorage.WebToken (webAuthToken on packet).
  const token = session?.AuthToken || session?.WebToken;
  if (!entity || !token) throw new Error('请先登录角色后使用冒险者募集');
  const form = new globalThis.FormData();
  const editing = action === 'add' || action === 'search';
  const common = {
    AuthToken: token,
    AID: editing ? session.AID : entity.GID,
    GDID: entity.GUID,
    ...(editing ? { GID: session.GID } : {}),
    WorldName: editing && action === 'add' && Number(extra.Type) === 0
      ? encoder(String(extra.WorldName ?? '')) : 'lastro',
  };
  for (const [key, value] of Object.entries(common)) form.append(key, String(value ?? ''));
  if (action === 'info') form.append('QueryAID', String(extra.QueryAID));
  if (editing) {
    for (const [key, value] of Object.entries(ROLES)) form.append(key, String(value));
    form.append('MinLV', String(extra.MinLV ?? 1));
    form.append('MaxLV', String(extra.MaxLV ?? 200));
    form.append('Memo', encoder(String(extra.Memo ?? '')));
  }
  if (action === 'add') {
    form.append('CharName', encoder(String(extra.CharName ?? '')));
    form.append('IID', String(extra.IID ?? 0));
    form.append('Type', String(extra.Type ?? 0));
    form.append('ISTATE', String(extra.ISTATE ?? 0));
  }
  return form;
}

export async function requestParty(page, session, nid, action, extra = {}, encoder) {
  if (!['list', 'get', 'info', 'search', 'add', 'del'].includes(action)) throw new Error('未知募集操作');
  if (typeof page.LastROPartyHttpRequest === 'function') {
    return page.LastROPartyHttpRequest(nid, action, makePartyFields(session, action, extra, encoder));
  }
  const path = '/' + partyWebPath(nid) + '/party/' + action;
  const body = makePartyFields(session, action, extra, encoder);
  // IWA Direct TCP/TLS is the primary path: it has no CORS dependency.
  // The web build may fall back to browser fetch when the server permits CORS.
  if (typeof page.LastROPartyRequest === 'function') {
    return await page.LastROPartyRequest(path, body);
  }
  const response = await page.fetch(ENDPOINT + path.slice(1), {
    method: 'POST',
    body,
    credentials: 'include',
    cache: 'no-store',
  });
  if (!response.ok) throw new Error('官方募集服务返回 HTTP ' + response.status);
  const json = await response.json();
  if (!json || typeof json !== 'object') throw new Error('官方募集服务返回无效数据');
  return json;
}

const CSS = `
:host{all:initial;color:#e4edf9;font:14px/1.55 system-ui,"Microsoft YaHei",sans-serif}
*{box-sizing:border-box}
.screen{position:fixed;inset:0;z-index:99999;background:rgba(4,9,24,.72);backdrop-filter:blur(8px);display:grid;place-items:center;padding:16px}
.screen[hidden]{display:none}
.window{width:min(930px,100%);max-height:92vh;display:flex;flex-direction:column;overflow:hidden;background:linear-gradient(150deg,#18273c,#0c1526 70%);border:1px solid #4a6688;border-radius:18px;box-shadow:0 26px 75px #000a}
header{padding:18px 22px;border-bottom:1px solid #314a69;display:flex;align-items:center;gap:12px}
h2{font-size:20px;font-weight:700;margin:0;letter-spacing:.6px} .subtitle{color:#91aec8;font-size:12px}
.grow{flex:1} button,input,select,textarea{font:inherit;border-radius:8px}
button{border:1px solid #50749b;background:#213c59;color:#e7f5ff;cursor:pointer;padding:8px 12px}
button:hover{border-color:#71daf0;background:#2a5872} button:disabled{opacity:.5;cursor:not-allowed}
button.primary{background:linear-gradient(135deg,#087f99,#1254a0);border-color:#2b9fbe}
button.flat{background:transparent;border-color:transparent}
nav{display:flex;gap:8px;padding:14px 20px 0;flex-wrap:wrap}
nav button[aria-selected=true]{color:#70f1ed;border-color:#3ac8d9}
.tools{padding:12px 20px;display:flex;gap:8px}
input,select,textarea{min-width:0;background:#0c1b2c;border:1px solid #3d5878;color:#edfaff;padding:9px 10px;outline:none}
input:focus,select:focus,textarea:focus{border-color:#40c7e0}
.tools input{flex:1}.content{padding:4px 20px 16px;overflow:auto;min-height:220px;max-height:53vh}
.cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(255px,1fr));gap:10px}
.card{min-width:0;text-align:left;padding:14px;border-radius:12px;background:#152c43;border:1px solid #324d6c}
.card strong{display:block;color:#f0f9ff;font-size:15px;overflow-wrap:anywhere}
.card small,.muted{color:#94abc2}.card p{margin:8px 0;overflow-wrap:anywhere}
.chip{display:inline-block;border-radius:20px;padding:2px 8px;background:#17566c;color:#87e8e4;font-size:12px}
footer{display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:13px 20px;border-top:1px solid #314a69}
footer[hidden],.tools[hidden],.content[hidden]{display:none}
.status{color:#aac1d9;font-size:12px;flex:1;min-width:180px}
.view{padding:12px 20px;overflow:auto}
.view[hidden]{display:none}
.fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
label{display:grid;gap:4px;color:#b1cadd;font-size:12px}
label.wide{grid-column:1/-1}
textarea{width:100%;resize:vertical}
.actions{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px}
.notice{padding:10px;border-left:3px solid #60b4d7;background:#12283b;color:#adc8d8;margin:12px 0}
@media(max-width:540px){.fields{grid-template-columns:1fr}header{padding:12px}nav,.tools,footer{padding-left:12px;padding-right:12px}.content{padding-left:12px;padding-right:12px}}
`;

const TEMPLATE = `
<div class="screen" hidden>
  <div class="window" role="dialog" aria-modal="true" aria-label="冒险者募集">
    <header><div><h2>冒险者募集</h2><div class="subtitle">LASTRO · ADVENTURER AGENCY</div></div><span class="grow"></span><button class="flat" data-action="close" aria-label="关闭">✕</button></header>
    <nav aria-label="募集分类"><button data-tab="0" aria-selected="true">招募中</button><button data-tab="1" aria-selected="false">挑战中</button><button data-tab="2" aria-selected="false">我的募集</button></nav>
    <div class="tools"><input class="search" aria-label="备注搜索" placeholder="搜索备注关键词"><button data-action="search">搜索</button><button data-action="reload">刷新</button></div>
    <div class="content"><div class="cards"></div></div>
    <section class="view" hidden><div class="view-body"></div><div class="actions view-actions"></div></section>
    <section class="view form-view" hidden>
      <div class="notice">已预置官方 AgencyTable 启用的 33 个副本；你可以扩充本地目录，但实际创建仍由 LastRO 游戏服务器决定。</div>
      <div class="fields">
        <label>副本类型 / 分类<input name="category" placeholder="例如：经典副本" maxlength="40"></label>
        <label>副本玩法名称（须与服务器名称一致）<input name="instanceName" list="party-instances" required maxlength="100"><datalist id="party-instances"></datalist></label>
        <label>副本 IID（募集公告使用）<input name="iid" type="number" min="1" step="1" required></label>
        <label>状态<select name="state"><option value="0">招募中</option><option value="1">挑战中</option></select></label>
        <label>最低等级<input name="min" type="number" min="1" max="999" value="1"></label>
        <label>最高等级<input name="max" type="number" min="1" max="999" value="200"></label>
        <label class="wide">备注<textarea name="memo" rows="3" maxlength="250" required></textarea></label>
      </div>
      <div class="actions"><button class="primary" data-action="submit">提交</button><button data-action="saveCatalog">保存到本地副本列表</button><button data-action="cancel">返回</button></div>
    </section>
    <footer><span class="status" role="status" aria-live="polite"></span><button data-action="previous">上一页</button><span class="page-number">1 / 1</span><button data-action="next">下一页</button><button class="primary" data-action="create">创建游戏副本</button></footer>
  </div>
</div>`;

export function installLastroPartyBooking({ page, modules, subscribePackets, profile, codec }) {
  if (!page?.document || !modules?.get) throw new Error('缺少原生客户端模块');
  const document = page.document;
  let host, shadow, native;
  let pageIndex = 0, tab = 0, rows = [], own = null, selected = null, editing = false, pending = null, busy = false;
  let currentProfile = profile ?? 'lastro-public';
  const getSession = () => modules.get('Engine/SessionStorage');
  const getPacket = () => modules.get('Network/PacketStructure');
  const getNetwork = () => modules.get('Network/NetworkManager');
  const getNid = () => Number(page.ROConfig?.clientVer ?? page.ROConfig?.lastroNid ?? 3);
  const catalogKey = () => 'lastro-party-catalog-v1:' + currentProfile;
  const customCatalog = () => { try {
    const data = JSON.parse(page.localStorage.getItem(catalogKey()) || '[]');
    return Array.isArray(data) ? data.filter(x => x && Number.isSafeInteger(Number(x.iid)) && Number(x.iid) > 0 && typeof x.name === 'string').slice(0, 200) : [];
  } catch { return []; } };
  const catalog = () => {
    const merged = new Map(getLastROAgencyCatalog(getNid()).map(row => [row.iid, row]));
    for (const row of customCatalog()) merged.set(Number(row.iid), row);
    return [...merged.values()];
  };
  const findName = iid => catalog().find(x => Number(x.iid) === Number(iid))?.name || '';
  const encode = value => typeof codec?.encode === 'function' ? codec.encode(value) : encodePartyText(value);
  const decode = value => typeof codec?.decode === 'function' ? codec.decode(String(value ?? '').replace(/%20/gi, ' ')) : decodePartyText(value);
  const parseEntry = value => normalizePartyEntry(value, decode);
  const status = msg => { if (shadow) shadow.querySelector('.status').textContent = msg; };
  const showError = error => status((error?.message || '操作失败') + (error instanceof TypeError ? '；请检查官方站点跨域访问权限（CORS）。' : ''));
  const ui = selector => shadow.querySelector(selector);

  function filtered() {
    const session = getSession();
    if (tab === 0) return rows.filter(x => x.state === 0);
    if (tab === 1) return rows.filter(x => x.state === 1);
    return rows.filter(x => x.aid === Number(session?.AID) || x.aid === Number(session?.partyLeaderAID));
  }
  function renderRows() {
    const target = ui('.cards');
    target.replaceChildren();
    const visible = filtered();
    const count = Math.max(1, Math.ceil(visible.length / MAX_PAGE));
    pageIndex = Math.min(pageIndex, count - 1);
    for (const item of visible.slice(pageIndex * MAX_PAGE, (pageIndex + 1) * MAX_PAGE)) {
      const button = document.createElement('button');
      button.className = 'card';
      const name = item.type ? (findName(item.iid) || '副本 IID ' + item.iid) : (item.map || '普通招募');
      const title = document.createElement('strong'); title.textContent = name;
      const badge = document.createElement('span'); badge.className = 'chip'; badge.textContent = item.state ? '挑战中' : '招募中';
      const description = document.createElement('p'); description.textContent = item.memo || '无备注';
      const foot = document.createElement('small'); foot.textContent = item.name + ' · Lv.' + item.min + '–' + item.max;
      button.append(title, badge, description, foot);
      button.addEventListener('click', () => { void details(item); });
      target.append(button);
    }
    if (!visible.length) { const empty = document.createElement('p'); empty.className = 'muted'; empty.textContent = '当前没有符合条件的募集'; target.append(empty); }
    ui('.page-number').textContent = (pageIndex + 1) + ' / ' + count;
    ui('[data-action="previous"]').disabled = pageIndex <= 0;
    ui('[data-action="next"]').disabled = pageIndex >= count - 1;
  }
  function showView(kind) {
    ui('.content').hidden = Boolean(kind);
    ui('.tools').hidden = Boolean(kind);
    ui('.view:not(.form-view)').hidden = kind !== 'details';
    ui('.form-view').hidden = kind !== 'form';
    ui('footer').hidden = Boolean(kind);
  }
  function buildCatalogHints() {
    const list = ui('#party-instances'); list.replaceChildren();
    for (const row of catalog()) {
      const option = document.createElement('option'); option.value = row.name; list.append(option);
    }
  }
  async function load(action = 'list', memo = '') {
    if (busy) return;
    busy = true; status('正在同步官方募集信息…');
    try {
      const session = getSession();
      const reply = await requestParty(page, session, getNid(), action, { Memo: memo }, encode);
      rows = (Array.isArray(reply.data) ? reply.data : []).map(parseEntry).filter(Boolean);
      pageIndex = 0; renderRows();
      const mine = await requestParty(page, session, getNid(), 'get', {}, encode);
      own = mine.data ? parseEntry(mine.data) : null;
      ui('[data-action="create"]').hidden = Boolean(own);
      status('已同步 ' + rows.length + ' 条募集信息');
    } catch (error) { showError(error); }
    finally { busy = false; }
  }
  async function details(item) {
    status('正在读取募集详情…');
    try {
      const response = await requestParty(page, getSession(), getNid(), 'info', { QueryAID: item.aid }, encode);
      selected = parseEntry(response.data);
      if (!selected) throw new Error('该募集已失效');
      showView('details');
      const data = selected;
      const body = ui('.view-body'); body.replaceChildren();
      for (const line of [
        data.type ? (findName(data.iid) || '未知副本（IID ' + data.iid + '）') : '普通队伍招募',
        '队长：' + data.name,
        '等级：' + data.min + ' ~ ' + data.max,
        '状态：' + (data.state ? '挑战中' : '招募中'),
        data.type ? '副本 IID：' + data.iid : '目标地图：' + data.map,
        '备注：' + data.memo,
      ]) { const p = document.createElement('p'); p.textContent = line; body.append(p); }
      const actions = ui('.view-actions'); actions.replaceChildren();
      const join = document.createElement('button'); join.textContent = data.type ? '进入副本' : '加入队伍';
      join.className = 'primary';
      join.disabled = data.state === 1 && Number(getSession()?.partyLeaderAID) !== data.aid;
      join.addEventListener('click', () => enter(data));
      actions.append(join);
      if (own && data.aid === own.aid) {
        const edit = document.createElement('button'); edit.textContent = '编辑募集';
        edit.addEventListener('click', () => openForm(own)); actions.append(edit);
        const remove = document.createElement('button'); remove.textContent = '删除 / 关闭副本';
        remove.addEventListener('click', () => { void closeOwned(); }); actions.append(remove);
      }
      const back = document.createElement('button'); back.textContent = '返回'; back.addEventListener('click', () => showView('')); actions.append(back);
    } catch (error) { showError(error); }
  }
  function packet(name, fields = {}) {
    const Constructor = getPacket()?.CZ?.[name];
    if (typeof Constructor !== 'function') throw new Error('当前 RoBrowser 尚未提供 ' + name + ' 游戏封包');
    const output = new Constructor();
    Object.assign(output, fields);
    getNetwork().sendPacket(output);
  }
  function enter(item) {
    const s = getSession();
    try {
      if (item.type === 0) {
        if (s.hasParty && Number(s.partyLeaderAID) !== item.aid) throw new Error('请先退出当前队伍');
        if (s.hasParty) packet('PRIVATE_AIRSHIP_REQUEST', { mapname: item.map, itemid: 14527 });
        else packet('PARTY_REQ_MASTER_TO_JOIN', { CID: item.cid, AID: item.aid });
      } else {
        const name = findName(item.iid);
        if (!name) throw new Error('未知副本名称，请先在本地副本列表登记准确的 IID 和名称');
        packet('REQ_ENTER_INSTANCE', { CID: item.cid, AID: item.aid, instanceName: name });
      }
      showView(''); status('已向游戏服务器发送请求，结果以服务器响应为准');
    } catch (error) { showError(error); }
  }
  function openForm(value = null) {
    editing = Boolean(value);
    buildCatalogHints();
    const form = ui('.form-view');
    form.querySelector('[name="iid"]').disabled = editing && value?.type === 1;
    form.querySelector('[name="instanceName"]').disabled = editing && value?.type === 1;
    form.querySelector('[name="state"]').disabled = !editing;
    for (const [name, text] of Object.entries({
      category: '', instanceName: value ? findName(value.iid) : '',
      iid: value?.iid || '', state: value?.state || 0,
      min: value?.min || 1, max: value?.max || 200, memo: value?.memo || '无',
    })) form.querySelector('[name="' + name + '"]').value = text;
    if (value?.type === 0) { status('普通招募原有记录可编辑；原版客户端禁止新建普通募集。'); }
    showView('form');
  }
  function formValues() {
    const form = ui('.form-view');
    const val = name => form.querySelector('[name="' + name + '"]').value.trim();
    const min = Number(val('min')), max = Number(val('max')), iid = Number(val('iid'));
    if (!Number.isSafeInteger(min) || !Number.isSafeInteger(max) || min < 1 || max < min || max > 999) throw new Error('等级范围无效');
    if (!val('memo')) throw new Error('备注不能为空');
    if (!editing && (!Number.isSafeInteger(iid) || iid < 1 || !val('instanceName'))) throw new Error('必须填写准确的副本名称及 IID');
    return { category: val('category'), name: val('instanceName'), iid, min, max, memo: val('memo'), state: Number(val('state')) };
  }
  function saveCatalog(value) {
    if (!value.name || !Number.isSafeInteger(value.iid) || value.iid < 1) throw new Error('名称及 IID 均为必填');
    const current = customCatalog().filter(x => Number(x.iid) !== value.iid);
    current.push({ category: value.category, name: value.name, iid: value.iid });
    page.localStorage.setItem(catalogKey(), JSON.stringify(current.slice(-200)));
    buildCatalogHints();
  }
  function fields(value, type) {
    return { CharName: getSession()?.Entity?.display?.name || '', Type: type,
      IID: type ? value.iid : 0, MinLV: value.min, MaxLV: value.max,
      Memo: value.memo, ISTATE: value.state, WorldName: type ? 'lastro' : value.map };
  }
  async function createOrUpdate() {
    try {
      const value = formValues();
      if (value.name && value.iid) saveCatalog(value);
      if (!editing) {
        const session = getSession();
        if (!session?.hasParty || !session?.isPartyLeader) throw new Error('必须是已组队的队长才能创建游戏副本');
        if (pending) throw new Error('服务器仍在处理上一次副本创建请求');
        const P = getPacket();
        if (!P?.ZC?.RS_CREATE_INSTANCE) throw new Error('缺少副本创建结果封包，不能安全登记募集');
        pending = { action: 'create', value: { ...value, state: 0 } };
        try { packet('REQ_CREATE_INSTANCE', { instanceName: value.name }); }
        catch (error) { pending = null; throw error; }
        status('创建指令已发出，正在等待游戏服务器确认…');
      } else {
        const old = own;
        if (!old) throw new Error('没有可修改的募集记录');
        const result = await requestParty(page, getSession(), getNid(), 'add',
          fields({ ...value, map: old.map, iid: old.iid }, old.type), encode);
        if (Number(result.Type) !== 1) throw new Error('官方募集服务拒绝修改');
        showView(''); await load();
      }
    } catch (error) { showError(error); }
  }
  async function closeOwned() {
    if (!own || !page.confirm('确定要关闭你的募集信息吗？')) return;
    try {
      if (own.type === 0) {
        const result = await requestParty(page, getSession(), getNid(), 'del', {}, encode);
        if (Number(result.Type) !== 1) throw new Error('服务端没有确认关闭');
        showView(''); await load();
      } else {
        if (!getPacket()?.ZC?.RS_DEL_INSTANCE) throw new Error('缺少副本关闭结果封包');
        pending = { action: 'delete' };
        packet('REQ_DEL_INSTANCE');
        status('正在等待服务器关闭副本确认…');
      }
    } catch (error) { pending = null; showError(error); }
  }
  async function acknowledge(structure, result, phase) {
    if (phase !== 'after' || !pending || !result) return;
    const P = getPacket()?.ZC;
    if (pending.action === 'create' && structure === P?.RS_CREATE_INSTANCE) {
      const value = pending.value; pending = null;
      if (Number(result.rs) !== 1) { status('游戏服务器拒绝创建副本（结果码：' + result.rs + '）'); return; }
      try {
        const created = await requestParty(page, getSession(), getNid(), 'add',
          fields(value, 1), encode);
        if (Number(created.Type) !== 1) throw new Error('副本已创建，但募集登记失败；可尝试编辑或刷新');
        showView(''); await load();
      } catch (error) { showError(error); }
    } else if (pending.action === 'delete' && structure === P?.RS_DEL_INSTANCE) {
      pending = null;
      if (![1, 2].includes(Number(result.rs))) { status('服务器拒绝关闭副本（结果码：' + result.rs + '）'); return; }
      try {
        if (Number(result.rs) === 1) {
          const reply = await requestParty(page, getSession(), getNid(), 'del', {}, encode);
          if (Number(reply.Type) !== 1) throw new Error('副本已关闭，但募集公告删除失败');
        }
        showView(''); await load();
      } catch (error) { showError(error); }
    }
  }
  if (typeof subscribePackets === 'function') subscribePackets(acknowledge);

  async function onAction(event) {
    const action = event.target.closest('[data-action]')?.dataset.action;
    if (!action) return;
    event.preventDefault();
    if (action === 'close') { ui('.screen').hidden = true; return; }
    if (action === 'cancel') { showView(''); return; }
    if (action === 'reload') { await load(); return; }
    if (action === 'search') { await load('search', ui('.search').value); return; }
    if (action === 'previous') { pageIndex = Math.max(0, pageIndex - 1); renderRows(); return; }
    if (action === 'next') { pageIndex++; renderRows(); return; }
    if (action === 'create') { openForm(); return; }
    if (action === 'submit') { await createOrUpdate(); return; }
    if (action === 'saveCatalog') { try { saveCatalog(formValues()); status('本地副本名称与 IID 已保存，服务器配置不会改变'); } catch (e) { showError(e); } }
  }
  function ensureUI() {
    if (host) return;
    host = document.createElement('div');
    host.id = 'lastro-party-booking';
    host.dataset.lroAssistantRoot = 'true';
    shadow = host.attachShadow({ mode: 'open' });
    const style = document.createElement('style'); style.textContent = CSS;
    const template = document.createElement('template'); template.innerHTML = TEMPLATE;
    shadow.append(style, template.content);
    shadow.addEventListener('click', event => { event.stopPropagation(); void onAction(event); });
    shadow.addEventListener('pointerdown', event => event.stopPropagation(), true);
    ui('.search').addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); void load('search', event.target.value); } });
    ui('[name="instanceName"]').addEventListener('change', event => {
      const match = catalog().find(row => row.name === event.target.value);
      if (match) { ui('[name="iid"]').value = match.iid; ui('[name="category"]').value = match.category || ''; }
    });
    shadow.querySelectorAll('[data-tab]').forEach(button => button.addEventListener('click', () => {
      tab = Number(button.dataset.tab); pageIndex = 0; shadow.querySelectorAll('[data-tab]').forEach(b => b.setAttribute('aria-selected', String(b === button))); renderRows();
    }));
    document.body.append(host);
    const Manager = modules.get('UI/UIManager');
    const GUIComponent = modules.get('UI/GUIComponent');
    if (typeof GUIComponent === 'function' && typeof GUIComponent.prototype.lroAdopt === 'function' && Manager?.addComponent) {
      try {
        native = new GUIComponent('LastROPartyBooking').lroAdopt(host);
        Manager.addComponent(native);
      } catch { native = null; }
    }
  }
  function open() {
    if (!getSession()?.Entity) return;
    ensureUI();
    ui('.screen').hidden = false;
    native?.focus?.();
    showView('');
    void load();
  }
  return Object.freeze({ open, setProfile(id) { currentProfile = String(id); rows = []; own = null; selected = null; pending = null; } });
}
