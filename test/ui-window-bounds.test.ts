import vm from 'node:vm';
import { describe, expect, it } from 'vitest';
import { patchRuntimeWindowBounds } from '../scripts/patch-v2-runtime.mjs';

const original = `    _fixPositionOverflow() {
      if (!this._host || !this._isDraggable) return;
      const WIDTH = _Renderer?.width ?? window.innerWidth;
      const HEIGHT = _Renderer?.height ?? window.innerHeight;
      UIClamp(this._host, WIDTH, HEIGHT, this.magnet);
    }`;
const patched = patchRuntimeWindowBounds(original + '\n//#region src/UI/GUIComponent.js');
const helper = patched.slice(patched.indexOf('function lastroRecoverWindowBounds'), patched.indexOf('//#region'));
const recover = vm.runInNewContext(helper + '\nlastroRecoverWindowBounds');

function make(left: number, top: number, width = 200, height = 120, vw = 800, vh = 600) {
  const host = {
    isConnected: true,
    style: { left: left + 'px', top: top + 'px', display: '', scale: '1', transformOrigin: '' },
    offsetWidth: width, offsetHeight: height,
    ownerDocument: { defaultView: { innerWidth: vw, innerHeight: vh } },
    get offsetLeft() { return parseFloat(this.style.left); },
    get offsetTop() { return parseFloat(this.style.top); },
    getBoundingClientRect() {
      const s = Number(this.style.scale), x = this.offsetLeft, y = this.offsetTop;
      return { left: x, top: y, right: x + width * s, bottom: y + height * s, width: width * s, height: height * s };
    },
  };
  return { host, component: { _host: host, _isDraggable: true, magnet: {} } };
}

describe('game window boundaries', () => {
  it('centers a window restored beyond the viewport', () => {
    const { host, component } = make(5000, -200);
    recover(component);
    expect(host.style.left).toBe('300px');
    expect(host.style.top).toBe('240px');
  });
  it('preserves correctly positioned windows', () => {
    const { host, component } = make(60, 80);
    recover(component);
    expect(host.style.left).toBe('60px');
    expect(host.style.top).toBe('80px');
  });
  it('scales oversized windows before repositioning', () => {
    const { host, component } = make(1000, 1000, 1000, 750);
    recover(component);
    expect(Number(host.style.scale)).toBeCloseTo(0.8);
    expect(host.getBoundingClientRect().left).toBeCloseTo(0);
  });
  it('leaves managed windows to their own position fitter', () => {
    const { host, component } = make(5000, 5000);
    recover({ ...component, _lastroWindowState: { fit() {} } });
    expect(host.style.left).toBe('5000px');
  });
});
