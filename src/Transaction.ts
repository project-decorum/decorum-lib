import Md from './Md';
import { sign, getPublicKey } from './utils';

import { MutableData, ValueVersion } from '@maidsafe/safe-node-app/src/api/mutable';
import error_const from '@maidsafe/safe-node-app/src/error_const';


export default class Transaction extends Md {
  public md: MutableData | undefined;

  public tag = 0xDEC1;

  public depth: number = 0;
  public outputs: Array<[Buffer, number]> = [];

  public coin: string | undefined;

  public signature: Buffer | undefined;
  public parent: Transaction | undefined;
  public publicKey: Buffer | undefined;


  /**
   * Setup the properties for a genesis transaction.
   *
   * @param outputs
   * @param coin
   */
  public async setupGenesis(outputs: Array<[Buffer, number]>, coin: string) {
    this.outputs = outputs;
    this.coin = coin;

    this.xor = await this.app.crypto.sha3Hash('genesis-' + this.coin);
  }

  /**
   * Setup the properties for a regular transaction.
   *
   * @param outputs
   * @param parent
   * @param sk
   */
  public async setup(outputs: Array<[Buffer, number]>, parent: Transaction, sk: Buffer) {
    this.depth = parent.depth + 1;
    this.parent = parent;
    this.outputs = outputs;
    this.signature = await parent.sign(sk);
    this.publicKey = await getPublicKey(sk);

    this.xor = await this.app.crypto.sha3Hash(this.signature);
  }

  public async commit() {
    this.md = await this.app.mutableData.newPublic(this.xor, this.tag);

    const entries = await this.app.mutableData.newEntries();
    const pm = await this.app.mutableData.newPermissions();

    await entries.insert('depth', this.depth.toString());
    await entries.insert('outputs', JSON.stringify(this.outputs.map((o) => {
      return [ [...o[0]], o[1] ];
    })));

    if (this.coin !== undefined) {
      await entries.insert('coin', this.coin);
    } else {
      await entries.insert('parent', this.parent!.xor);
      await entries.insert('signature', this.signature!);
      await entries.insert('public_key', this.publicKey!);
    }

    await this.md.put(pm, entries);
  }

  public async fetch() {
    this.md = await this.app.mutableData.newPublic(this.xor, this.tag);

    const depthVv = await this.md.get('depth');
    this.depth = Number(depthVv.buf.toString());

    const outputsVv = await this.md.get('outputs');
    this.outputs = JSON.parse(
      outputsVv.buf.toString()).map((o: Array<[ number[], number ]>) => [ Buffer.from(o[0]), o[1] ],
    );

    let coinVv: ValueVersion | undefined;
    try {
      coinVv = await this.md.get('coin');
    } catch (e) {
      if (e.code !== error_const.ERR_NO_SUCH_ENTRY.code) {
        throw e;
      }
    }

    if (coinVv !== undefined) {
      this.coin = coinVv.buf.toString();
    } else {
      const parentVv = await this.md.get('parent');
      this.parent = new Transaction(this.app, parentVv.buf);

      const signatureVv = await this.md.get('signature');
      this.signature = signatureVv.buf;

      const publicKeyVv = await this.md.get('public_key');
      this.publicKey = publicKeyVv.buf;
    }
  }

  /**
   * Sign this MD.
   *
   * @param sk Secret key to sign the MD with.
   * @return Signature.
   */
  public async sign(sk: Buffer) {
    return await sign(sk, this.xor);
  }
}
