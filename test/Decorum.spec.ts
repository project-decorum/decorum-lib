import { assert } from 'chai';
import * as h from './helpers';

import Decorum from '../src/Decorum';
import { SAFEApp } from '@maidsafe/safe-node-app/src/app';

const NICKNAME = 'Test Identity';
const TYPE_TAG = 16048;

describe('Decorum', () => {
  let decorum: Decorum;

  it('initialise', async () => {
    decorum = await Decorum.initialise();
  });

  it('logging in', async () => {
    await decorum.login();
  });

  it('creates identity', async () => {
    const md = await decorum.createIdentity(NICKNAME);

    // Check for public access and assert value
    const nn = await md.get('nickname');
    assert(nn, NICKNAME);
  });
});

describe('Decorum with pre-existing app', () => {
  let app: SAFEApp;

  before(async () => {
    app = await h.get_app('decorum.lib');
  });

  it('has access', async () => {
    assert.isTrue(await app.auth.canAccessContainer('apps/decorum.lib.id-1', ['Read']));
  });

  it.only('does stuff', async () => {
    const profile = {
      uri: 'safe://mywebid.gabriel',
      name: 'Gabriel Viganotti',
      nick: 'bochaco',
      website: 'safe://mywebsite.gabriel',
      image: 'safe://mywebsite.gabriel/images/myavatar',
    };

    const md = await app.mutableData.newRandomPublic(TYPE_TAG);
    await md.quickSetup({});
    const webId = await md.emulateAs('WebID');
    await webId.create(profile);
  });
});
