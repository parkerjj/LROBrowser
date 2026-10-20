import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { describe, expect, it, vi } from 'vitest';
import { patchRuntimeLastROBatteryPower } from '../scripts/lastro-battery-power.mjs';

const native = readFileSync('vendor/v2/Online.js', 'utf8');
function region(source: string, path: string) {
  const start = source.indexOf('//#region ' + path + '\n');
  const end = source.indexOf('//#endregion', start);
  if (start < 0 || end < start) throw new Error('Missing native region: ' + path);
  return source.slice(start, end);
}

function batteryFixture() {
  const sample = `//#region src/UI/Components/StatusIcons/StatusIcons.js
var StatusInfo_default = {}, StatusIcons = {}, _status = {};
function renderStatus(status, now) {
  if (!status.img) return;
  status.ctx.drawImage(status.img, 0, 0);
}
StatusIcons.update = function update(index, active, duration) {
  if (!_status[index]) _status[index] = { img: {}, ctx: mockCanvas, time: { textContent: "" } };
};
//#endregion
//#region src/Engine/MapEngine/Main.js
function onParameterChange$1(pkt) { otherPackets.push(pkt); }
//#endregion
`;
  const ctx = {
    mockCanvas: { clearRect: vi.fn(), drawImage: vi.fn(), fillRect: vi.fn(), fillStyle: '' },
    otherPackets: [] as Array<{ varID: number; count: number }>
  };
  const patched = patchRuntimeLastROBatteryPower(sample);
  const api = vm.runInNewContext(patched + '\nvar StatusIcons_default = StatusIcons;\n({handle:onParameterChange$1,render:renderStatus,items:_status,info:StatusInfo_default});', ctx) as {
    handle: (pkt: {varID:number; count:number}) => void;
    render: (status: unknown, now: number) => void;
    items: Record<number, {lastroBatteryPower:number; time:{textContent:string}; img:unknown; ctx:unknown}>;
    info: Record<number, {icon:string; descript:string[][]}>;
  };
  return { ...api, ctx };
}

describe('LastRO phone battery status compatibility', () => {
  it('patches actual vendor modules without changing network packet parsing', () => {
    const output = patchRuntimeLastROBatteryPower(native);
    expect(output).toContain('StatusIcons.updateBatteryPower');
    expect(output).toContain('pkt.varID === 300');
    expect(output).toContain('StatusInfo_default[2000]');
    expect(region(output,'src/Network/NetworkManager.js')).toBe(region(native,'src/Network/NetworkManager.js'));
    expect(() => patchRuntimeLastROBatteryPower(output)).toThrow('already-installed');
    for (const path of ['src/UI/Components/StatusIcons/StatusIcons.js', 'src/Engine/MapEngine/Main.js']) {
      const parsed = ts.createSourceFile(path,region(output,path),ts.ScriptTarget.Latest,true,ts.ScriptKind.JS);
      expect(parsed.parseDiagnostics, path).toHaveLength(0);
    }
  });

  it('shows the official percentage buff and preserves normal parameter handling', () => {
    const f = batteryFixture();
    f.handle({varID:300,count:100});
    expect(f.ctx.otherPackets).toEqual([]);
    expect(f.info[2000].icon).toBe('rk_lux.tga');
    expect(f.info[2000].descript[0][0]).toBe('电量');
    f.render(f.items[2000],1234);
    expect(f.items[2000].time.textContent).toBe('100%');
    expect(f.ctx.mockCanvas.fillRect).toHaveBeenLastCalledWith(0,0,32,32);
    f.handle({varID:300,count:25});
    f.render(f.items[2000],1235);
    expect(f.items[2000].time.textContent).toBe('25%');
    expect(f.ctx.mockCanvas.fillRect).toHaveBeenLastCalledWith(0,24,32,32);
    f.handle({varID:6,count:9000});
    expect(f.ctx.otherPackets).toEqual([{varID:6,count:9000}]);
  });

  it('clamps values to 0..100 and ignores invalid updates', () => {
    const f = batteryFixture();
    f.handle({varID:300,count:-10});
    expect(f.items[2000].lastroBatteryPower).toBe(0);
    f.handle({varID:300,count:999});
    expect(f.items[2000].lastroBatteryPower).toBe(100);
    f.handle({varID:300,count:NaN});
    expect(f.items[2000].lastroBatteryPower).toBe(100);
  });
});
