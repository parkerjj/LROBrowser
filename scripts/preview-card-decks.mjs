import { readFile, writeFile, mkdir } from 'node:fs/promises';
import console from 'node:console';
import { patchTrustedTypesDomWrites } from './patch-v2-runtime.mjs';
import { cacheNativeUiAssets, NATIVE_BMP_PREVIEW_SOURCE } from './preview-native-ui-assets.mjs';

await mkdir('generated', { recursive: true });
const ids = [4416,4112,4646,4670,4253,4433,4645,4409,4296,4098,4099,4119,4133];
const names = {4416:'小雪怪卡片',4112:'马尔杜克卡片',4646:'无限奇美拉卡片',4670:'水果胖姆蜘蛛卡片',4253:'爱丽丝女仆卡片',4433:'熔岩魔卡片',4133:'披肩卡片 4133',4645:'无限风魔之王卡片',4409:'阿加波卡片',4296:'蓝鼠卡片',4098:'土人卡片',4099:'帕莎纳卡片',4119:'巫婆卡片'};
const response = await globalThis.fetch('https://game.lastro.cn/ro/client_re/data/num2cardillustnametable.txt', { signal: globalThis.AbortSignal.timeout(10000), credentials: 'omit', redirect: 'error' });
if (!response.ok) throw new Error('Card illustration table unavailable');
const text = new globalThis.TextDecoder('euc-kr').decode(await response.arrayBuffer());
const resources = Object.fromEntries([...text.matchAll(/(?:^|\s)(\d+)#([^#]+)#/g)].map(match => [Number(match[1]),match[2].trim()]));
const assets = ids.filter(id=>resources[id]).map(id=>'cardbmp/'+resources[id]+'.bmp');
const {manifest,failures}=await cacheNativeUiAssets(assets,'generated/card-deck-assets');
await writeFile('generated/card-deck-native.mjs',patchTrustedTypesDomWrites(await readFile('vendor/v2/lastro-card-collection-ui.mjs','utf8')));
await writeFile('generated/card-deck-data.mjs',await readFile('vendor/v2/lastro-card-collection.mjs','utf8'));
await writeFile('generated/lastro-trusted-dom.mjs',await readFile('src/runtime/lastro-trusted-dom.mjs','utf8'));
const js = `import * as data from './card-deck-data.mjs';
import {createCardCollectionComponent,resolveCategoryCardAction} from './card-deck-native.mjs';
import {setLastROInnerHTML} from './lastro-trusted-dom.mjs';
import {installLastroCardDeckUI} from '../scripts/lastro-card-deck-ui.mjs';
import {installLastroCardState} from '../scripts/lastro-card-state.mjs';
import {installLastroCardDeck} from '../scripts/lastro-card-deck.mjs';
import {installLastroCardArt} from '../scripts/lastro-card-art.mjs';
const ids=${JSON.stringify(ids)}, names=${JSON.stringify(names)}, resources=${JSON.stringify(resources)};
const manifest=${JSON.stringify(manifest)},assetDirectory='card-deck-assets';
${NATIVE_BMP_PREVIEW_SOURCE}
class GUIComponent{
  static MouseMode={STOP:1};
  constructor(name,css){this._host=document.createElement('div');this._host.id=name;this.root=this._host.attachShadow({mode:'open'});this.css=css;}
  getRoot(){return this.root;}
  prepare(){if(this.ready)return;const style=document.createElement('style');style.textContent=this.css;this.root.append(style);const content=document.createElement('div');setLastROInnerHTML(content,this.render());this.root.append(content);this.ready=true;this.init();}
  append(){this.prepare();document.body.append(this._host);this.onAppend?.();}
  remove(){this._host.remove();this.onRemove?.();}
  focus(){}
}
const DB={INTERFACE_PATH:'data/texture/ui/',getItemInfo:id=>({identifiedDisplayName:names[id]||'卡片 '+id,illustResourcesName:resources[id]})};
const Client={loadFile(path,callback,failure){const asset=path.replace(DB.INTERFACE_PATH,'');decodeBmp(asset).then(callback).catch(()=>failure?.());}};
const Network={sendPacket(packet){setTimeout(()=>{
  const reply={tab:packet.tab,level:packet.level,cardid:packet.cardid,state:packet.id===2787?1:packet.id===2775?1:2};
  if(packet.id===2787)component.cancelUpdate(reply);else component.updateList(reply);
},120);}};
const PACKET={CZ:{REQUEST_CARDCONNECTION_RECHARGE:class {},REQUEST_CARDCONNECTION_ADDMYDECK:class {},REQUEST_CARDCONNECTION_CANCEL:class {}}};
const component=createCardCollectionComponent({GUIComponent,DB,Client,Configs:{get:()=>5},Network,PACKET,...data});
installLastroCardState(component,{document,...data,resolveCategoryCardAction});
const defaults=data.getCardConnectionData(5);
function definition(id){for(let tab=1;tab<=7;tab++)for(const [level,row] of Object.entries(defaults.data[tab].data))if(row.cards.includes(id))return {id,tab,level:Number(level)};throw new Error('Missing preview card definition');}
const presets=[ids.slice(0,8).map(definition),[4296,4098,4645,4416].map(definition),null,null];
const preference={presets,activePreset:1,activeCards:presets[0].map(card=>({...card})),names:['卡册 1','卡册 2','卡册 3','卡册 4'],save(){return true;}};
const api=installLastroCardDeck(component,{getSession:()=>({key:'offline-preview',connection:Network,playing:true}),getDefaults:()=>data.getCardConnectionData(5),loadPreferences:()=>preference,setTimeout,clearTimeout,
notify(success,index,name,reason){const toast=document.querySelector('[data-toast]');toast.textContent=success?'切换成功：已切换至「'+name+'」':'切换失败：「'+name+'」'+(reason?'，'+reason:'');toast.style.color=success?'#63d68e':'#ffb4a8';toast.hidden=false;setTimeout(()=>{toast.hidden=true;},3000);}});
installLastroCardArt(component,{document,DB,Client});
function setDeck(cards){const d=component._data;for(const [tabKey,tab]of Object.entries(d.data)){if(Number(tabKey)===0)continue;for(const level of Object.values(tab.data))level.recharge=level.cards.map(id=>cards.includes(id)?2:ids.includes(id)?1:0);}d.data[0].data[1].cards=[...cards,...Array(8-cards.length).fill(0)];d.data[0].data[1].activate=1;d.data[0].enable=1;}
installLastroCardDeckUI(component,{document,...api,select:index=>component.selectDeckPreset(index),save:index=>component.saveDeckPreset(index),activate:index=>component.activateDeckPreset(index),rename:(index,name)=>component.renameDeckPreset(index,name)});
component.prepare();setDeck(ids.slice(0,8));
const classInfos=Array.from({length:8},(_,tab)=>({enable:1,level:Object.keys(component._data.data[tab].data).length,data:Object.values(component._data.data[tab].data).map(row=>({activate:1,...Object.fromEntries(Array.from({length:8},(_,slot)=>['recharge'+slot,(tab===0?row.cards:row.recharge)[slot]||0]))}))}));
component.rechargeList({classNum:8,classInfos});component.append();
window.cardDeckPreview={component,api};
Promise.all(assets.map(decodeBmp)).then(()=>{document.body.dataset.ready='true';});
`;
await writeFile('generated/card-deck-preview.js',js.replace('Promise.all(assets.map(decodeBmp))','Promise.all(Object.keys(manifest).map(decodeBmp))'));
await writeFile('generated/card-deck-preview.html',`<!doctype html><html lang="zh-CN"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>卡册四套切换预览</title><link rel="stylesheet" href="/fonts/misans.css"><style>body{margin:0;background:#0e141c;font-family:Arial,'Microsoft YaHei','MiSans',sans-serif}#assets{position:fixed;bottom:0;left:0;color:#f9a;font-size:11px}[data-toast]{position:fixed;top:12px;left:50%;transform:translateX(-50%);z-index:200;background:#111d;padding:8px 16px;border-radius:6px;font-size:12px;pointer-events:none}</style><div id="assets"></div><div data-toast hidden role="status"></div><script type="module" src="./card-deck-preview.js"></script></html>`);
console.log(JSON.stringify({preview:'/generated/card-deck-preview.html',artworks:Object.keys(manifest).length,failures}));
