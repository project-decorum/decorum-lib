import { assert } from 'chai';
import * as h from './helpers';

import Identity from '../src/Identity';
import { SAFEApp } from '@maidsafe/safe-node-app/src/app';

describe('Decorum', () => {
  let app: SAFEApp;

  before(async () => {
    app = await h.get_app();
  });

  it('fetches a committed WebID', async () => {
    const identity = new Identity('John Doe');
    await identity.put(app);

    const identity2 = await Identity.fromXor(app, identity.xor, identity.tag);

    assert.equal(identity.name, identity2.name);
  });

  it('update an existing WebID', async () => {
    // Create new John.
    const identity = new Identity('John Doe');
    await identity.put(app);

    // Fetch John and change to Isaac.
    const identity2 = await Identity.fromXor(app, identity.xor, identity.tag);
    identity2.name = 'Isaac Newton';
    await identity2.commit(app);

    // Fetch John from network, should be Isaac now.
    await identity.fetch(app);

    assert.equal(identity.name, identity2.name);
  });

  it('create "knows" relationship between WebIDs', async () => {
    const john = new Identity('John Doe');
    await john.put(app);

    const isaac = new Identity('Isaac Newton');
    isaac.addKnows(john);
    await isaac.put(app);

    const shouldBeJohn = await Identity.fromXorUrl(app, isaac.knows[0]);

    assert.equal(john.name, shouldBeJohn.name);
  });

  it('instantiates Identity from XOR URL', async () => {
    const john = new Identity('John Doe');
    await john.put(app);

    const identity = await Identity.fromXorUrl(app, john.url);

    assert.equal(john.name, identity.name);
  });
});
