import { expect } from 'chai';

import Decorum from '../src/Decorum';

describe('Decorum', () => {
  let decorum: Decorum;

  it('initialise', async () => {
    decorum = await Decorum.initialise();
  });

  it('logging in', async () => {
    await decorum.login();
  });
});
