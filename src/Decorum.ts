import { SAFEApp } from '@maidsafe/safe-node-app/src/app';
import Identity from './Identity';

export default class Decorum {
  // The underlying app handle object.
  public app: SAFEApp;

  /**
   * Construct the Decorum object.
   *
   * @param app  An app instance.
   */
  constructor(app: SAFEApp) {
    this.app = app;
  }

  /**
   * Create an uncommitted local Identity object.
   *
   * @param xor The XOR address to initiate this Identity with.
   * @returns The Identity
   */
  public newIdentity(xor?: Buffer) {
    return new Identity(this.app, xor);
  }
}
