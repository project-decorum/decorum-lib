import { SAFEApp } from '@maidsafe/safe-node-app/src/app';

import consts from '@maidsafe/safe-node-app/src/consts';

import crypto from 'crypto';
import multihashes from 'multihashes';
import CID from 'cids';

import url from 'url';

export default class Md {
  /**
   * The XOR address (name) of the MD.
   */
  public xor: Buffer;

  /**
   * The tag type of the MD.
   */
  public tag: number = 0xDEC0;


  protected app: SAFEApp;

  constructor(app: SAFEApp, xor?: Buffer) {
    this.app = app;

    this.xor = xor || crypto.randomBytes(32);
  }

  /**
   * The CID URL calculated from the XOR name and type tag.
   *
   * @readonly
   * @type {string}
   */
  get url(): string {
    const encodedHash = multihashes.encode(this.xor, consts.CID_HASH_FN);
    const newCid = new CID(consts.CID_VERSION, consts.CID_DEFAULT_CODEC, encodedHash);
    const cidStr = newCid.toBaseEncodedString(consts.CID_BASE_ENCODING);
    return `safe://${cidStr}:${this.tag}`;
  }

  set url(safeUrl: string) {
    const urlObject = url.parse(safeUrl);

    const cid = new CID(urlObject.hostname);
    const encodedHash = multihashes.decode(cid.multihash);
    const address = encodedHash.digest;

    this.xor = encodedHash.digest;
    this.tag = Number(urlObject.port);
  }
}
