import 'mocha';
import 'mocha/mocha.css';

import Decorum from '../src/Decorum';

mocha.setup('bdd');

describe('Decorum', () => {
  let decorum: Decorum;
  let uri: string;

  it('initialises the object', async () => {
    decorum = await Decorum.initialise();
  });

  it('asks authorisation', async () => {
    uri = await decorum.authorise();
  }).timeout(0); // Do not timeout; give tester time to authorise.
});

mocha.run();
