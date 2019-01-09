import { assert } from 'chai';
import * as h from './helpers';
import * as utils from '../src/utils';

import Decorum from '../src/Decorum';
import GenesisTransaction from '../src/token/GenesisTransaction';

import crypto from 'crypto';
import TransactionBuilder from '../src/token/TransactionBuilder';

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

    const tb = await TransactionBuilder.fromParent(gt, sk);
    const t = tb.build(app.app);
    await t.commit();
  });
});
