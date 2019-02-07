import { assert } from 'chai';
import * as h from './helpers';

import WebId from '../src/WebID';
import { SAFEApp } from '@maidsafe/safe-node-app/src/app';
import Md from '../src/Md';
import { MutableData, ValueVersion } from '@maidsafe/safe-node-app/src/api/mutable';
import error_const from '@maidsafe/safe-node-app/src/error_const';

describe('Identity manager', () => {
  let app: SAFEApp;

  before(async () => {
    app = await h.get_app();
  });

  class Container extends Md {
    /**
     * Contains the encryption keys.
     */
    private serial: string;

    /**
     * List of WebIDs.
     */
    public webIds: Map<string, string>;

    constructor(xor: Buffer, tag: number, serial: string, webIds?: Map<string, string>) {
      super(xor, tag);

      this.serial = serial;
      this.webIds = webIds || new Map();
    }

    public async commit(app: SAFEApp) {
      const md = await app.mutableData.fromSerial(this.serial);

      const entries = await md.getEntries();
      const mutation = await entries.mutate();

      for (const [url, ] of this.webIds) {
        let mdVal: ValueVersion | undefined;

        try {
          mdVal = await entries.get(url);
        } catch (error) {
          if (error.code !== error_const.ERR_NO_SUCH_ENTRY.code) {
            throw error;
          }
        }

        if (mdVal === undefined) {
          await mutation.insert(url, url);
        }
      }

      await md.applyEntriesMutation(mutation);
    }

    public async add(wid: WebId) {
      this.webIds.set(wid.url, wid.url);
    }

    public static async fromMd(md: MutableData) {
      const nat = await md.getNameAndTag();
      nat.name = Buffer.from(nat.name); // Fix FFI Buffer type

      const serial = await md.serialise();

      const entries = await md.getEntries();
      const entries_arr: Array<{ key: Uint8Array, value: ValueVersion }> = await entries.listEntries();

      const ids: Map<string, string> = new Map(entries_arr.map(e => <[string, string]>[e.key.toString(), e.value.buf.toString()]));

      return new this(nat.name, nat.typeTag, serial, ids);
    }
  }

  it('does things', async () => {
    {
      const md = await app.auth.getOwnContainer();
      const c = await Container.fromMd(md);

      const wid = new WebId('John Doe');
      c.add(wid);

      await c.commit(app);
    }

    {
      const md = await app.auth.getOwnContainer();
      const c = await Container.fromMd(md);

      const wid = new WebId('John Doe');
      c.add(wid);

      await c.commit(app);
    }

    {
      const md = await app.auth.getOwnContainer();
      const c = await Container.fromMd(md);

      console.log(c.webIds);
    }
  });
});
