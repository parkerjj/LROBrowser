import { bootstrapV2Client } from './runtime/client-bootstrap';
import { getAvailableServerProfile } from './servers/server-profiles';
import { installDebugAccessGuard } from './runtime/debug-access';
import { readLoginPreferences } from './runtime/login-preferences.mjs';

installDebugAccessGuard(window);

const root = document.getElementById('app');
if (!root) throw new Error('Missing app mount point');
const requestedServer = readLoginPreferences().serverProfileId;
const profile = getAvailableServerProfile(requestedServer);
void bootstrapV2Client({ mount: root, profile, credentials: { username: '', password: '' } }).catch((error: unknown) => {
  root.replaceChildren();
  const message = document.createElement('p');
  message.setAttribute('role', 'alert');
  message.textContent = `客户端启动失败：${error instanceof Error ? error.message : String(error)}`;
  root.append(message);
});
