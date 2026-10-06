import type { AvailableServerId } from '../servers/server-profile';
export interface LoginPreferences {
  connectionMode: 'relay' | 'direct';
  serverProfileId: AvailableServerId;
}
export function readLoginPreferences(): LoginPreferences;
export function saveLoginPreferences(selection: LoginPreferences): void;
