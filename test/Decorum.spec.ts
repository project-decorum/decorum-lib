import { assert } from 'chai';
import * as h from './helpers';

import Decorum from '../src/Decorum';

describe('Decorum', () => {
  let decorum: Decorum;

  before(async () => {
    decorum = new Decorum(await h.get_app('decorum.lib'));
  });

  it('initialises', async () => {
    await decorum.initialise();
  });

  it('adds contacts', async () => {
    await decorum.addContact('myid.test');
    await decorum.addContact('anid.test');
  });

  it('lists contacts', async () => {
    const contacts = await decorum.getContacts();

    assert.include(contacts, 'myid.test');
    assert.include(contacts, 'anid.test');
  });
});
