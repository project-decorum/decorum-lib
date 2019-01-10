import Md from '../Md';
import { sign } from '../utils';

import { SAFEApp } from '@maidsafe/safe-node-app/src/app';


export default abstract class AbstractTransaction extends Md {
  public tag = 0xDEC1;

  /**
   * Amount of transactions removed from the genesis transaction. 0 = genesis
   */
  public depth: number;

  /**
   * The public keys that the funds are sent to.
   */
  public outputs: Array<[Buffer, number]>;


  constructor(app: SAFEApp, xor: Buffer, depth: number, outputs: Array<[Buffer, number]>) {
    super(app, xor);

    this.depth = depth;
    this.outputs = outputs;
  }

  /**
   * Create an Entries instance with the properties from this class.
   */
  public async createEntries() {
    const entries = await this.app.mutableData.newEntries();

    await entries.insert('depth', this.depth.toString());
    await entries.insert('outputs', JSON.stringify(this.outputs.map((o) => {
      return [[...o[0]], o[1]];
    })));

    return entries;
  }

  public async commit() {
    // Put the entries at an MD without permissions.
    const md = await this.app.mutableData.newPublic(this.xor, this.tag);
    const pm = await this.app.mutableData.newPermissions();
    const entries = await this.createEntries();
    await md.put(pm, entries);
  }

  public async fetch() {
    const md = await this.app.mutableData.newPublic(this.xor, this.tag);

    const depthVv = await md.get('depth');
    this.depth = Number(depthVv.buf.toString());

    const outputsVv = await md.get('outputs');
    this.outputs = JSON.parse(
      outputsVv.buf.toString()).map((o: Array<[number[], number]>) => [Buffer.from(o[0]), o[1]],
    );

    return md;
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
