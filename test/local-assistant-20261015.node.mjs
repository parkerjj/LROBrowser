import test from 'node:test';
import assert from 'node:assert/strict';
import {JSDOM} from 'jsdom';
import {installMarketApi} from '../src/assistant/lro-market-api.mjs';
const {setTimeout,URL}=globalThis;

const wait=ms=>new Promise(resolve=>setTimeout(resolve,ms));
function market(){
 const page=new JSDOM('<body></body>',{url:'http://127.0.0.1:4188'}).window;
 const root=page.document.body;
 root.innerHTML='<input class="search"><button class="market-search-submit">查询</button><input type="checkbox" class="map-only"><select class="sort"><option value="price">价格</option></select><div class="filters"></div><div class="results"></div><div class="summary"></div><button class="market-more"></button>';
 const table={501:{identifiedDisplayName:'红色药水'},502:{identifiedDisplayName:'蓝色药水'}};
 const calls=[],values=new Map();
 page.fetch=async(url,options)=>{calls.push({url:new URL(url),options});return {ok:true,json:async()=>({items:[{id:1,itemId:501,price:10,quantity:2,mapName:'prontera'}],nextCursor:null})};};
 const app={shadow:root,settings:{shopEnabled:true,shoppingList:[]},currentMap:'prontera.gat',render(){},findMarketDisplayRecord(){},openRecordItemDetails(){},showStoredItemDetails(){},showAssistantView(){},addManualMarketRecord(){},marketShoppingMatches:()=>[],renderRow:r=>`<div>${r.itemName}</div>`,getAmdModule:name=>name==='DB/Items/ItemTable'?table:name==='DB/DBManager'?{getItemInfo:id=>table[id]}:null};
 const api=installMarketApi(app,page,{getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v)});
 return {page,root,app,api,calls,values,input:root.querySelector('.search')};
}
test('manual search waits for a click, preserves Chinese composition and committed query',async()=>{
 const f=market();try{
  f.app.showAssistantView('shop');f.input.dispatchEvent(new f.page.CompositionEvent('compositionstart'));
  f.input.value='hong';f.input.dispatchEvent(new f.page.InputEvent('input',{isComposing:true}));
  f.root.querySelector('.market-search-submit').click();assert.equal(f.calls.length,0);
  f.input.value='红色药水';f.input.dispatchEvent(new f.page.CompositionEvent('compositionend'));
  f.input.dispatchEvent(new f.page.InputEvent('input'));f.app.render();await wait(2150);assert.equal(f.calls.length,0);
  f.root.querySelector('.market-search-submit').click();await wait(10);
  assert.equal(f.calls.length,2);assert.equal(f.calls[0].url.searchParams.get('item_id'),'501');
  assert.equal(f.calls[1].url.searchParams.get('q'),'红色药水');
  f.input.value='蓝色药水';f.input.dispatchEvent(new f.page.InputEvent('input'));f.app.render();
  assert.equal(f.api.query,'红色药水');assert.match(f.root.querySelector('.results').textContent,/红色药水/);
  await wait(2150);assert.equal(f.calls.length,2);
  f.root.querySelector('.market-search-submit').click();await wait(10);
  assert.equal(f.calls[2].url.searchParams.get('item_id'),'502');assert.equal(f.api.query,'蓝色药水');
  assert.equal(f.root.querySelector('.search'),f.input);
  for(const call of f.calls){assert.equal(call.options.credentials,'omit');assert.equal(call.options.redirect,'error');}
 }finally{f.page.close();}
});
test('bounty action immediately searches the item across maps and unrelated filters',async()=>{
 const f=market();try{
  const type=f.root.querySelector('[aria-label="道具大类"]');type.selectedIndex=1;type.dispatchEvent(new f.page.Event('change'));
  const source=f.root.querySelector('[aria-label="市场数据来源"]');source.value='local';source.dispatchEvent(new f.page.Event('change'));
  f.root.querySelector('.map-only').checked=true;
  await f.api.search('红色药水',true);
  assert.equal(f.calls.length,2);assert.equal(f.input.value,'红色药水');assert.equal(source.value,'remote');
  assert.equal(f.calls[0].url.searchParams.get('item_id'),'501');
  for(const call of f.calls){assert.equal(call.url.searchParams.has('map'),false);assert.equal(call.url.searchParams.has('item_type'),false);}
 }finally{f.page.close();}
});

test('taxonomy filters, cursor continuation and cache are preserved; profile reset rejects late results',async()=>{
 const f=market();try{
  const type=f.root.querySelector('[aria-label="道具大类"]');type.selectedIndex=1;type.dispatchEvent(new f.page.Event('change'));await wait(5);
  assert.equal(f.calls.length,0);await f.api.search();assert.equal(f.calls[0].url.searchParams.get('item_type'),type.value);assert.ok(f.values.size);
  const count=f.calls.length;await f.api.load();assert.equal(f.calls.length,count);
  let deliver;f.page.fetch=()=>new Promise(resolve=>{deliver=resolve;});const pending=f.api.load(false,true);await wait(0);f.api.reset();
  deliver({ok:true,json:async()=>({items:[{id:99,itemId:502,price:1,quantity:1,mapName:'prontera'}],nextCursor:null})});await pending;
  assert.equal(f.api.records.length,0);
  f.page.fetch=async()=>({ok:true,json:async()=>({items:[],nextCursor:'cursor-1'})});await f.api.load(false,true);
  let sent;f.page.fetch=async url=>{sent=new URL(url);return {ok:true,json:async()=>({items:[],nextCursor:null})};};await f.api.load(true);assert.equal(sent.searchParams.get('cursor'),'cursor-1');
 }finally{f.page.close();}
});
