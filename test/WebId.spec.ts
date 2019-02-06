import { assert } from 'chai';
import * as h from './helpers';

import WebId from '../src/WebID';
import { SAFEApp } from '@maidsafe/safe-node-app/src/app';

describe('WebId', () => {
  let app: SAFEApp;

  before(async () => {
    app = await h.get_app();
  });

  it('fetches a committed WebID', async () => {
    const wid = new WebId('John Doe');
    await wid.put(app);

    const wid2 = await WebId.fromXor(app, wid.xor, wid.tag);

    assert.equal(wid.name, wid2.name);
  });

  it('update an existing WebID', async () => {
    // Create new John.
    const wid = new WebId('John Doe');
    await wid.put(app);

    // Fetch John and change to Isaac.
    const wid2 = await WebId.fromXor(app, wid.xor, wid.tag);
    wid2.name = 'Isaac Newton';
    await wid2.commit(app);

    // Fetch John from network, should be Isaac now.
    await wid.fetch(app);

    assert.equal(wid.name, wid2.name);
  });

  it('create "knows" relationship between WebIDs', async () => {
    const john = new WebId('John Doe');
    await john.put(app);

    const isaac = new WebId('Isaac Newton');
    isaac.addKnows(john);
    await isaac.put(app);

    const shouldBeJohn = await WebId.fromXorUrl(app, isaac.knows[0]);

    assert.equal(john.name, shouldBeJohn.name);
  });

  it('instantiates WebId from XOR URL', async () => {
    const john = new WebId('John Doe');
    await john.put(app);

    const wid = await WebId.fromXorUrl(app, john.url);

    assert.equal(john.name, wid.name);
  });
});
