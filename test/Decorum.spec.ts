import { assert } from 'chai';

import Decorum from '../src/Decorum';

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
