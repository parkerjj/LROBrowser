/* global window, document, navigator, console */
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
  function guidance() {
    var context = phaseName + ' ' + message + ' ' + detail;
    if (/WebGL|shader|GLSL|图形初始化|显卡/i.test(context)) {
      return '请在 Chrome「设置 → 系统」中开启图形加速（硬件加速），然后完全退出并重启 Chrome。\n若仍失败，请更新 Chrome 和显卡驱动，并关闭其他游戏窗口以释放显存；随后重新打开客户端。仍无法启动时，请复制诊断信息发送给开发者。';
    }
    if (/工作线程|Worker|脚本|运行时|Online\.js|包内|本地光标|核心资源清单/i.test(phaseName + ' ' + message)
      || /Package resource|packaged cursor/i.test(detail)) {
      return '请关闭客户端窗口后重新打开；若仍失败，请从原安装来源重新安装最新版客户端。不要清除浏览器或客户端的站点数据，以免丢失已保存账号。\n请复制诊断信息发送给开发者，以便确认失败的本地资源或启动阶段。';
    }
    if (/基础资料|背景|网络|fetch|network|timeout|连接/i.test(context)) {
      return '请检查网络是否可访问游戏资源服务器，关闭客户端窗口后重新打开。若仍停在此阶段，请复制诊断信息发送给开发者。无需清除已保存账号。';
    }
    return '请关闭客户端窗口后重新打开，并确认 Chrome 与客户端均为最新版本。若仍无法启动，请复制诊断信息发送给开发者。不要清除已保存账号或站点数据。';
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
    var help = element('lastro-startup-help');
    if (help) {
      help.hidden = !failed && !delayed;
      help.textContent = failed || delayed ? guidance() : '';
    }
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
    if (finished || failed) return;
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
      '说明：' + message, '建议：' + guidance(), '错误：' + (detail || '无明确异常'), '经过（相对时间）：',
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
