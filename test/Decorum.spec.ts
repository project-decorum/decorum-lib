import { assert } from 'chai';
import * as h from './helpers';

import Decorum from '../src/Decorum';

describe('Decorum', () => {
  let decorum: Decorum;

  before(async () => {
    h.copy_vault();

    decorum = new Decorum(await h.get_app('decorum.lib'));
  });

  it('initialises', async () => {
    await decorum.initialise();
  });

  it('create WebIDs', async () => {
    await decorum.createWebID('safe://myid.test', 'John Doe', 'Johnny');
    await decorum.createWebID('safe://cook.test', 'Liz Cook', 'Lizzie');
    await decorum.createWebID('safe://anid.heyo', 'Jan Smit', 'Jantje');
  });

  it('adds contacts', async () => {
    await decorum.addContact('myid.test');
    await decorum.addContact('anid.heyo');
  });

  it('lists contacts', async () => {
    const contacts = await decorum.getContacts();

    assert.include(contacts, 'myid.test');
    assert.include(contacts, 'anid.heyo');
  });

  it('lists WebIDs', async () => {
    const ids = await decorum.getWebIDs();

    assert.include(ids, 'safe://myid.test');
    assert.include(ids, 'safe://cook.test');
    assert.include(ids, 'safe://anid.heyo');
    assert.lengthOf(ids, 3);
  });
});
