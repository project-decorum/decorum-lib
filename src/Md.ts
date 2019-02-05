import crypto from 'crypto';
import { SAFEApp } from '@maidsafe/safe-node-app/src/app';

import { parse_xor_url, get_xor_url } from './utils';


export default class Md {
  /**
   * The XOR address (name) of the MD.
   */
  public xor: Buffer;

  /**
   * The tag type of the MD.
   */
  public tag: number;


  constructor(xor?: Buffer, tag?: number) {
    this.xor = xor || crypto.randomBytes(32);
    this.tag = tag || 0;
  }

  public async commit(app: SAFEApp) {
    throw new Error('unimplemented');
  }

  /**
   * The CID URL calculated from the XOR name and type tag.
   */
  get url(): string {
    return get_xor_url(this.xor, this.tag);
  }

  /**
   * Set the CID URL and derive XOR name and type tag from it.
   */
  set url(safeUrl: string) {
    const parsed = parse_xor_url(safeUrl);
    if (parsed.tag === undefined) {
      throw new Error('Expected XOR URL to contain `tag`.');
    }

    this.xor = parsed.xor;
    this.tag = parsed.tag;
  }
}
