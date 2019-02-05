import { assert } from 'chai';
import * as h from '../helpers';
import * as utils from '../../src/utils';

import { SAFEApp } from '@maidsafe/safe-node-app/src/app';
import GenesisTransaction from '../../src/token/GenesisTransaction';

import crypto from 'crypto';

describe('Transaction', () => {
  let app: SAFEApp;

  before(async () => {
    app = await h.get_app();
  });

  it('create genesis and child transaction', async () => {
    const [sk, pk] = await utils.generateKeyPair();
    const coin = crypto.randomBytes(20).toString('hex');

    const gt = new GenesisTransaction(coin, [[pk, 1000]]);
    await gt.commit(app);

    const t = await gt.spend(sk, [[pk, 1000]]);
    await t.commit(app);

    const md = await app.mutableData.newPublic(t.xor, t.tag);
    const { buf: signature } = await md.get('signature');

    assert.deepEqual(t.signature, signature);
  });
});
