import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import * as Safe from '@maidsafe/safe-node-app';
const mock = require('./assets/MockVault.json');

/**
 * Copy pre-setup mock vault to be used during testing.
 */
export function copy_vault() {
  fs.copyFileSync(
    path.join(__dirname, 'assets/MockVault'),
    path.join(os.tmpdir(), 'MockVault'),
  );
}

/**
 * Initialize a logged in app from the pre-setup mock vault.
 *
 * @param id App ID.
 */
export async function get_app(id: string) {
  const app = await Safe.initialiseApp(mock[id].info);
  await app.auth.loginFromUri(mock[id].uri);

  return app;
}
