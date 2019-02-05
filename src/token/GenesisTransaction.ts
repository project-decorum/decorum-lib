import AbstractTransaction from './AbstractTransaction';

import { SAFEApp } from '@maidsafe/safe-node-app/src/app';
import { getPublicKey } from '../utils';

import { sha3_256 } from 'js-sha3';
import Transaction from './Transaction';


export default class GenesisTransaction extends AbstractTransaction {
  public coin: string;


  constructor(coin: string, outputs: Array<[Buffer, number]> = []) {
    const xor = Buffer.from(sha3_256.arrayBuffer('genesis-' + coin));
    super(xor, 0, outputs);

    this.coin = coin;
  }

  public async createEntries(app: SAFEApp) {
    const entries = await super.createEntries(app);

    await entries.insert('coin', this.coin);

    return entries;
  }

  public async fetch(app: SAFEApp) {
    const md = await super.fetch(app);

    const coinVv = await md.get('coin');
    this.coin = coinVv.buf.toString();

    return md;
  }

  public async spend(sk: Buffer, outputs: Array<[Buffer, number]> = []) {
    const signature = await this.sign(sk);
    const pk = await getPublicKey(sk);

    return new Transaction(this.depth + 1, outputs, signature, pk, this);
  }
}
