import Transaction from './Transaction';

import { SAFEApp } from '@maidsafe/safe-node-app/src/app';
import AbstractTransaction from './AbstractTransaction';
import { getPublicKey } from '../utils';

export default class TransactionBuilder {
  public static async fromParent(parent: AbstractTransaction, sk: Buffer) {
    const signature = await parent.sign(sk);
    const pk = await getPublicKey(sk);

    const tb = new this(parent.depth + 1, signature, pk, parent.xor);
    tb.setParent(parent);

    return tb;
  }

  public outputs: Array<[Buffer, number]> = [];
  public depth: number;

  public parent: AbstractTransaction | undefined;
  public parentSerial: Buffer;
  public signature: Buffer;
  public publicKey: Buffer;

  constructor(depth: number, signature: Buffer, publicKey: Buffer, parentSerial: Buffer) {
    this.depth = depth;
    this.parentSerial = parentSerial;
    this.signature = signature;
    this.publicKey = publicKey;
  }

  public setParent(parent: AbstractTransaction) {
    this.parent = parent;
    this.parentSerial = parent.xor;
  }

  public output(publicKey: Buffer, amount: number) {
    this.outputs.push([publicKey, amount]);

    return this;
  }

  public build() {
    return new Transaction(
      this.depth,
      this.outputs,
      this.signature,
      this.publicKey,
      this.parent ? this.parent : this.parentSerial,
    );
  }
}
