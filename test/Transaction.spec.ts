import { assert } from 'chai';
import * as h from './helpers';
import * as utils from '../src/utils';

import Decorum from '../src/Decorum';
import Transaction from '../src/Transaction';

import crypto from 'crypto';

describe('Transaction', () => {
  let app: Decorum;

  before(async () => {
    app = new Decorum(await h.get_app());
  });

  it('create genesis transaction', async () => {
    const coin = crypto.randomBytes(20).toString('hex');

    const outputs: Array<[Buffer, number]> = [
      [Buffer.from('publickey'), 1000],
    ];

    const t = new Transaction(app.app);
    await t.setupGenesis(outputs, coin);
    await t.commit();

    const u = new Transaction(app.app, Buffer.from(t.xor));
    await u.fetch();

    assert.equal(u.coin, coin);
    assert.equal(u.depth, 0);
    assert.deepEqual(u.outputs, outputs);
  });

  it('create consecutive transaction', async () => {
    const [sk, pk] = await utils.generateKeyPair();

    const coin = crypto.randomBytes(20).toString('hex');

    const outputs: Array<[Buffer, number]> = [
      [pk, 1000],
    ];

    const t = new Transaction(app.app);
    await t.setupGenesis(outputs, coin);
    await t.commit();

    const u = new Transaction(app.app);
    await u.setup(
      [ [ pk, 1000 ] ],
      t,
      sk,
    );
    await u.commit();
  });
});
