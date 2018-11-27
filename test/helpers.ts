import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import * as Safe from '@maidsafe/safe-node-app';

// @ts-ignore
import mock = require('./assets/MockVault.json');

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
  const app = await Safe.initialiseApp((mock as any)[id].info, undefined, {
    enableExperimentalApis: true,
  });
  await app.auth.loginFromUri((mock as any)[id].uri);

  return app;
}
