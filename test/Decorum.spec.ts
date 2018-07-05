import { assert } from 'chai';
import * as h from './helpers';

import Decorum from '../src/Decorum';
import { SAFEApp } from '@maidsafe/safe-node-app/src/app';

const NICKNAME = 'Test Identity';

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
});
