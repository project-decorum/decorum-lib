import { assert } from 'chai';
import * as h from './helpers';

import Decorum from '../src/Decorum';

describe('Decorum', () => {
  let app: Decorum;

  before(async () => {
    app = new Decorum(await h.get_app());
  });

  it('fetches a committed WebID', async () => {
    const identity = app.newIdentity();
    identity.name = 'John Doe';
    await identity.commit();

    const identity2 = app.newIdentity(identity.xor);
    await identity2.fetch();

    assert.equal(identity.name, identity2.name);
  });

  it('update an existing WebID', async () => {
    // Create new John.
    const identity = app.newIdentity();
    identity.name = 'John Doe';
    await identity.commit();

    // Fetch John and change to Isaac.
    const identity2 = app.newIdentity(identity.xor);
    await identity2.fetch();
    identity2.name = 'Isaac Newton';
    await identity2.commit();

    // Fetch John from network, should be Isaac now.
    await identity.fetch();

    assert.equal(identity.name, identity2.name);
  });
});
