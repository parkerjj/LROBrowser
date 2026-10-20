// 把授权流程里的错误码翻译成用户能看懂的“发生了什么 + 怎么处理”。
// 错误码本身始终随卡片显示，方便复制给开发者；这里只负责说明和步骤。

const RELOAD = '刷新页面（F5）重新加载 KoreEngine';
const COPY = '仍然失败：点击“复制错误信息”，发给开发者';
const RETRY = '点击“重试”';

const GUIDES = {
  KE_CHARACTER_BOUND: {
    title: '这个角色已绑定到其他账号',
    cause: '该角色仍在另一 LTSD 账号的 30 天绑定期内。',
    steps: ['用最初绑定这个角色的 LTSD 账号登录', '或者等绑定期结束后再用当前账号绑定'],
  },
  KE_AUTH_UNAUTHENTICATED: {
    title: 'LTSD 登录已失效',
    cause: 'LTSD 登录已失效，请重新登录。',
    steps: ['点击“重新登录 LTSD”', '在打开的 LTSD 页面核对验证码并批准'],
  },
  KE_PROFILE_NOT_FOUND: {
    title: '这个角色还没有活动配置',
    cause: 'LTSD 中还没有这个角色的活动配置。',
    steps: ['点击“前往 LTSD 配置”，为当前角色创建并启用一套配置', '回到这里点击“重新检查”'],
  },
  KE_QUOTA_EXCEEDED: {
    title: '实例额度已用完',
    cause: '当前账号的 KoreEngine 实例额度已用完。',
    steps: ['在其他窗口或设备上停止自动模式', '或者选择一个正在运行的实例并替换'],
  },
  KE_INSTANCE_KICKED: {
    title: '这个窗口已被其他窗口顶替',
    cause: '此 KoreEngine 实例已在 LTSD 中停止。',
    steps: ['如果是你自己在别处启动了自动模式，这是正常现象', '需要继续时，在这个窗口重新输入 ai auto'],
  },
  KE_BUILD_REJECTED: {
    title: '当前版本未获授权',
    cause: '当前 KoreEngine 构建未获 LTSD 授权。',
    steps: [`${RELOAD}，确保是最新版本`, COPY],
  },
  'active-profile-unavailable': {
    title: '暂时取不到配置',
    cause: 'LTSD 暂时不可用，且没有可用的本地配置。',
    steps: ['检查网络后点击“重试同步”', COPY],
  },
  'character-identity-incomplete': {
    title: '没有取得当前角色的编号',
    cause: '未能取得当前角色的账号、角色或服务器编号，请重新登录游戏角色。',
    steps: ['退回选角界面，重新进入游戏', RETRY, COPY],
  },
  'reload-all-not-sent': {
    title: '配置已取得，但没能交给 KoreEngine',
    cause: '配置同步完成后，KoreEngine 没有收到“重新加载配置”的命令。',
    steps: [RETRY, RELOAD, COPY],
  },
  'active-profile-response-invalid': {
    title: 'LTSD 返回的配置格式不对',
    cause: 'LTSD 返回的配置文件缺失或格式不正确。',
    steps: ['稍后点击“重试同步”', COPY],
  },
  'boot-bind-unavailable': {
    title: '连不上 LTSD',
    cause: '无法连接 LTSD 完成角色绑定，请检查网络后重试。',
    steps: ['检查网络连接', RETRY, `仍然连不上：${RELOAD}`],
  },
  'boot-build-id-mismatch': {
    title: '启动层与核心版本不一致',
    cause: '启动层与 KoreEngine 构建不一致，请刷新页面重新加载。',
    steps: [`${RELOAD}（必要时先清除浏览器缓存）`, COPY],
  },
  'boot-core-hash-mismatch': {
    title: '核心文件校验失败',
    cause: 'KoreEngine 核心文件校验失败，请刷新页面重新加载。',
    steps: [`${RELOAD}（必要时先清除浏览器缓存）`, COPY],
  },
  'boot-key-bundle-invalid': {
    title: 'LTSD 返回的核心密钥无效',
    cause: 'LTSD 返回的核心密钥无效，请稍后重试或联系 LTSD。',
    steps: [RETRY, `仍然失败：${RELOAD}`, COPY],
  },
  'boot-bind-request-invalid': {
    title: '无法生成角色绑定请求',
    cause: '当前角色信息无法生成绑定请求，请重新登录游戏角色。',
    steps: ['退回选角界面，重新进入游戏', COPY],
  },
};

const WORKER_STOPPED = {
  title: 'KoreEngine 运行环境已停止',
  cause: '后台运行环境在完成授权前异常退出，当前页面无法继续使用它。',
  steps: [RELOAD, COPY],
};

const STALLED = {
  title: '这一步花的时间比预期长',
  cause: '启动层没有在预期时间内响应当前步骤。',
  steps: [RETRY, `仍然没有反应：${RELOAD}`, COPY],
};

function guideFor(code) {
  if (GUIDES[code]) return GUIDES[code];
  if (/^runtime-not-initialized|^boot-not-initialized|^Worker |^worker-|^shared-array-buffer|^package-|^manifest-|^boot-chunk|^core-chunk|^build-info-mismatch|^authorization-account-missing/.test(code)) {
    return WORKER_STOPPED;
  }
  const http = /^(?:ltsd-bind-http|ltsd-http)-(\d{3})$/.exec(code);
  if (http) {
    return {
      title: `LTSD 服务返回了异常（HTTP ${http[1]}）`,
      cause: Number(http[1]) >= 500 ? 'LTSD 服务暂时出现故障。' : 'LTSD 拒绝了这次请求。',
      steps: ['稍后点击“重试”', COPY],
    };
  }
  if (/^KE_/.test(code)) {
    return { title: 'LTSD 拒绝了请求', cause: `LTSD 返回了错误：${code}`, steps: [RETRY, COPY] };
  }
  return { title: '连接未完成', cause: `出现了未识别的错误：${code}`, steps: [RETRY, `仍然失败：${RELOAD}`, COPY] };
}

// `stalled` 表示某个等待阶段超过了看门狗时间但没有任何错误码。
export function authorizationGuide(code, { stalled = false } = {}) {
  const text = code == null ? '' : String(code);
  if (!text) return stalled ? { ...STALLED, code: '' } : null;
  return { ...guideFor(text), code: text };
}
