import { bootstrapV2Client } from './runtime/client-bootstrap';
import { getAvailableServerProfile } from './servers/server-profiles';
import { installDebugAccessGuard } from './runtime/debug-access';
import { readLoginPreferences } from './runtime/login-preferences.mjs';
import { installHalloweenEffects } from './halloween/halloween-effects';
import './halloween/halloween.css';

const startup = globalThis.LastROStartupDiagnostics;
startup?.phase('初始化启动模块');
installDebugAccessGuard(window);
globalThis.LastROHalloweenEffects = installHalloweenEffects(window);

const root = document.getElementById('app');
if (!root) throw new Error('Missing app mount point');
startup?.phase('读取本地配置');
const requestedServer = readLoginPreferences().serverProfileId;
const profile = getAvailableServerProfile(requestedServer);
const assistantEnabled = true;
void bootstrapV2Client({ mount: root, profile, assistantEnabled, credentials: { username: '', password: '' } }).catch((error: unknown) => {
  if (startup) {
    startup.fail('客户端启动失败', error);
    return;
  }
  // The independent diagnostic script itself may have failed to load.
  document.getElementById('lastro-startup-screen')?.setAttribute('hidden', '');
  root.replaceChildren();
  const message = document.createElement('p');
  message.setAttribute('role', 'alert');
  message.textContent = `客户端启动失败：${error instanceof Error ? error.message : String(error)}`;
  root.append(message);
});
