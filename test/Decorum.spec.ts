import { assert } from 'chai';
import * as h from './helpers';

import Decorum from '../src/Decorum';
import { SAFEApp } from '@maidsafe/safe-node-app/src/app';

describe('Decorum', () => {
  let app: SAFEApp;

  before(async () => {
    app = await h.get_app();
  });

  it('fetches a committed WebID', async () => {
    const dec = new Decorum(app);

    const identity = dec.newIdentity();
    identity.name = 'John Doe';
    await identity.commit();

    const identity2 = dec.newIdentity();
    identity2.xor = identity.xor;
    await identity2.fetch();

    assert.equal(identity.name, identity2.name);
  });
});
