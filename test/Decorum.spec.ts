import * as h from './helpers';

import { SAFEApp } from '@maidsafe/safe-node-app/src/app';

describe('Decorum', () => {
  let app: SAFEApp;

  before(async () => {
    app = await h.get_app();
  });
});
