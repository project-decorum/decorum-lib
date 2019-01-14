import { assert } from 'chai';
import * as h from './helpers';
import * as utils from '../src/utils';

import Decorum from '../src/Decorum';
import GenesisTransaction from '../src/token/GenesisTransaction';

import crypto from 'crypto';
import Transaction from '../src/token/Transaction';

describe('Transaction', () => {
  let app: Decorum;

  before(async () => {
    app = new Decorum(await h.get_app());
  });

  it('create genesis and child transaction', async () => {
    const [sk, pk] = await utils.generateKeyPair();
    const coin = crypto.randomBytes(20).toString('hex');

    const gt = new GenesisTransaction(app.app, coin, [[pk, 1000]]);
    await gt.commit();

    const t = await gt.spend(sk, [[pk, 1000]]);
    await t.commit();

    const md = await app.app.mutableData.newPublic(t.xor, t.tag);
    const { buf: signature } = await md.get('signature');

    assert.deepEqual(t.signature, signature);
  });
});
