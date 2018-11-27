import { assert } from 'chai';
import * as h from './helpers';

import Decorum from '../src/Decorum';
import { SAFEApp } from '@maidsafe/safe-node-app/src/app';

describe('Decorum', () => {
  let app: SAFEApp;

  before(async () => {
    app = await h.get_app();
  });

  it('', async () => {
    const dec = new Decorum(app);

    const identity = dec.newIdentity();
    identity.name = 'John Doe';
    await identity.commit();

    assert.isNotNull(identity.url);
    // console.log(await app.fetch(identity.url!));
  });
});
