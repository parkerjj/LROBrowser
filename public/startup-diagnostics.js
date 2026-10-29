(function () {
  'use strict';
  // Loaded before the module graph: even a failed main.ts import leaves a visible diagnosis.
  var startedAt = Date.now();
  var phaseName = '等待启动脚本';
  var message = '正在准备游戏客户端…';
  var detail = '';
  var failed = false;
  var finished = false;
  var delayed = false;
  var warningTimer = 0;
  var timeoutTimer = 0;
  var timeline = [];

  function element(id) { return document.getElementById(id); }
  function remember(kind, value) {
    timeline.push('+' + Math.round((Date.now() - startedAt) / 1000) + 's [' + kind + '] ' + value);
    if (timeline.length > 24) timeline.shift();
  }
  function errorText(error) {
    var raw = error && typeof error === 'object'
      ? (typeof error.stack === 'string' ? error.stack : error.message || String(error))
      : String(error == null ? '未知错误' : error);
    return String(raw).replace(/\b(password|token|authorization|cookie|secret)\s*[:=]\s*[^\s,;]+/gi, '$1=[已隐藏]').slice(0, 3000);
  }
  function show() {
    if (finished) return;
    var screen = element('lastro-startup-screen');
    if (!screen) return;
    screen.hidden = false;
    element('lastro-startup-heading').textContent = failed ? '客户端启动异常' : '正在启动客户端';
    element('lastro-startup-phase').textContent = '当前阶段：' + phaseName;
    element('lastro-startup-message').textContent = message;
    var technical = element('lastro-startup-detail');
    technical.hidden = !detail;
    technical.textContent = detail;
    element('lastro-startup-copy').hidden = !failed && !delayed;
    screen.dataset.state = failed ? 'error' : delayed ? 'slow' : 'loading';
  }
  function stopTimers() {
    window.clearTimeout(warningTimer);
    window.clearTimeout(timeoutTimer);
  }
  function watch() {
    stopTimers();
    delayed = false;
    warningTimer = window.setTimeout(function () {
      if (finished || failed) return;
      delayed = true;
      message = '此阶段已等待 25 秒，可能正在加载较大的资源。若持续不变，请复制诊断信息。';
      remember('slow', phaseName);
      show();
    }, 25000);
    timeoutTimer = window.setTimeout(function () {
      if (finished || failed) return;
      delayed = true;
      message = '此阶段超过 60 秒仍未完成，疑似启动卡住。程序仍会继续尝试加载。';
      remember('timeout', phaseName);
      show();
    }, 60000);
  }
  function phase(name) {
    if (finished || failed) return;
    phaseName = String(name).slice(0, 120);
    message = '正在加载，请稍候…';
    detail = '';
    remember('phase', phaseName);
    show();
    watch();
  }
  function fail(reason, error) {
    if (finished) return;
    failed = true;
    stopTimers();
    message = String(reason).slice(0, 180);
    detail = errorText(error);
    remember('error', message + (detail ? ': ' + detail.slice(0, 250) : ''));
    show();
    console.error('[LastRO startup]', message, error);
  }
  function ready() {
    if (finished) return;
    remember('ready', '登录窗口已呈现');
    finished = true;
    stopTimers();
    var screen = element('lastro-startup-screen');
    if (screen) screen.hidden = true;
  }
  function report() {
    return [
      'LRO 启动诊断', '阶段：' + phaseName, '状态：' + (failed ? '异常' : delayed ? '超时/缓慢' : '加载中'),
      '说明：' + message, '错误：' + (detail || '无明确异常'), '经过（相对时间）：',
      timeline.join('\n'), '浏览器：' + navigator.userAgent
    ].join('\n');
  }
  function installUi() {
    show();
    var copy = element('lastro-startup-copy');
    if (copy) copy.addEventListener('click', function () {
      var content = report();
      if (!navigator.clipboard || !navigator.clipboard.writeText) {
        copy.textContent = '请截图发送给开发者';
        return;
      }
      void navigator.clipboard.writeText(content).then(function () {
        copy.textContent = '已复制诊断信息';
      }, function () { copy.textContent = '复制失败，请截图发送'; });
    });
    if (!failed && !finished) watch();
  }

  // Capture errors before the app's own module code has had a chance to run.
  window.addEventListener('error', function (event) {
    if (finished) return;
    if (event.target && event.target !== window) {
      if (event.target.tagName === 'SCRIPT') {
        fail('启动脚本加载失败', event.target.getAttribute('src') || '未知脚本');
      }
      return;
    }
    fail('JavaScript 运行异常', event.error || event.message);
  }, true);
  window.addEventListener('unhandledrejection', function (event) {
    if (!finished) fail('未处理的异步异常', event.reason);
  });
  window.LastROStartupDiagnostics = { phase: phase, fail: fail, ready: ready };
  remember('phase', phaseName);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', installUi, { once: true });
  } else {
    installUi();
  }
})();
