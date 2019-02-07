import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

import * as Safe from '@maidsafe/safe-node-app';
import { SAFEApp } from '@maidsafe/safe-node-app/src/app';


const INFO = {
  id: 'decorum.lib',
  name: 'Decorum Core Library',
  vendor: 'Project Decorum',
};

const PERMISSIONS =  {
  _public: ['Read', 'Insert', 'Update', 'Delete'],
  _publicNames: ['Read', 'Insert', 'Update', 'Delete'],
};


/**
 * Initialize a local logged in app.
 */
export async function get_app() {
  const app = await Safe.initialiseApp(INFO, undefined, { enableExperimentalApis: true});
  await app.auth.loginForTest(PERMISSIONS, { own_container: true });

  return app;
}
