import AbstractTransaction from './AbstractTransaction';

import { SAFEApp } from '@maidsafe/safe-node-app/src/app';
import { ValueVersion } from '@maidsafe/safe-node-app/src/api/mutable';
import error_const from '@maidsafe/safe-node-app/src/error_const';

import { sha3_256 } from 'js-sha3';


export default class GenesisTransaction extends AbstractTransaction {
  public coin: string;


  constructor(app: SAFEApp, coin: string, outputs: Array<[Buffer, number]> = []) {
    const xor = Buffer.from(sha3_256.arrayBuffer('genesis-' + coin));
    super(app, xor, 0, outputs);

    this.coin = coin;
  }

  public async createEntries() {
    const entries = await super.createEntries();

    await entries.insert('coin', this.coin);

    return entries;
  }

  public async fetch() {
    const md = await super.fetch();

    const coinVv = await md.get('coin');
    this.coin = coinVv.buf.toString();

    return md;
  }
}
