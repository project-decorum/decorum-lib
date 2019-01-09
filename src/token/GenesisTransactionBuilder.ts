import GenesisTransaction from './GenesisTransaction';

import { SAFEApp } from '@maidsafe/safe-node-app/src/app';

export default class GenesisTransactionBuilder {
  public coin: string;
  public outputs: Array<[Buffer, number]> = [];

  constructor(coin: string) {
    this.coin = coin;
  }

  public output(pk: Buffer, amount: number) {
    this.outputs.push([pk, amount]);

    return this;
  }

  public build(app: SAFEApp) {
    return new GenesisTransaction(app, this.coin, this.outputs);
  }
}
