import { expect } from 'chai';

import Decorum from '../src/Decorum';

describe('Decorum', () => {
  let decorum: Decorum;

  it('initialises the object', async () => {
    decorum = await Decorum.initialise();
  });

  it('logs in', async () => {
    await decorum.login();
  });
});
