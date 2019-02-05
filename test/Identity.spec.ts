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
    await identity.commit(app);

    const identity2 = new Identity('', undefined, undefined, identity.xor);
    await identity2.fetch(app);

    assert.equal(identity.name, identity2.name);
  });

  it('update an existing WebID', async () => {
    // Create new John.
    const identity = new Identity('John Doe');
    await identity.commit(app);

    // Fetch John and change to Isaac.
    const identity2 = new Identity('', undefined, undefined, identity.xor);
    await identity2.fetch(app);
    identity2.name = 'Isaac Newton';
    await identity2.update(app);

    // Fetch John from network, should be Isaac now.
    await identity.fetch(app);

    assert.equal(identity.name, identity2.name);
  });

  it('create "knows" relationship between WebIDs', async () => {
    const john = new Identity('John Doe');
    await john.commit(app);

    const isaac = new Identity('Isaac Newton');
    isaac.addKnows(john);
    await isaac.commit(app);

    const shouldBeJohn = new Identity('');
    shouldBeJohn.url = isaac.knows[0];
    await shouldBeJohn.fetch(app);

    assert.equal(john.name, shouldBeJohn.name);
  });

  it('instantiates Identity from graph', async () => {
    const john = new Identity('John Doe');
    await john.commit(app);

    const md = await app.mutableData.newPublic(john.xor, john.tag);

    const rdf = md.emulateAs('RDF');
    await rdf.nowOrWhenFetched();

    const identity = Identity.fromGraph(rdf.graphStore);

    assert.equal(john.name, identity.name);
  });
});
