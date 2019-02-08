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
    public webIds: Map<Buffer, Buffer>;

    constructor(xor: Buffer, tag: number, serial: string, webIds?: Map<Buffer, Buffer>) {
      super(xor, tag);

      this.serial = serial;
      this.webIds = webIds || new Map();
    }

    public async commit(app: SAFEApp) {
      const md = await app.mutableData.fromSerial(this.serial);

      const entries = await md.getEntries();
      const entries_arr: Array<{ key: Buffer, value: ValueVersion }> = await entries.listEntries();

      const map = [...this.webIds.entries()];

      const mutation = await entries.mutate();

      for (const { key: mdKey, value: mdValue } of entries_arr) {
        const index = map.findIndex(([key, ]) => key.equals(mdKey));

        // If map does not have this key.
        if (index === -1) {
          // If entry is not already deleted.
          if (mdValue.buf.length > 0) {
            // DELETE.
            await mutation.delete(mdKey as any as Buffer, mdValue.version as any as number + 1);
          }

          continue;
        }

        // If map value is different from entry.
        if (!mdValue.buf.equals(map[index][1])) {
          // UPDATE
          await mutation.update(mdKey as any as Buffer, mdValue.buf, mdValue.version as any as number + 1);
        }

        // Map has entry and value is equal. Do nothing.
      }

      for (const [key, value] of map) {
        const index = entries_arr.findIndex(({ key: mdKey }) => key.equals(mdKey));

        // If MD does not have this key.
        if (index === -1) {
          // INSERT
          console.log('insert');
          await mutation.insert(key, value);
        }
      }

      await md.applyEntriesMutation(mutation);
    }

    public async add(wid: WebId) {
      const [key, value] = [Buffer.from(wid.url), Buffer.from(wid.url)];

      // If the same Buffer content is already in the Map: do not add.
      if ([...this.webIds].findIndex(([k, ]) => k.equals(key))) {
        return;
      }

      this.webIds.set(key, value);
    }

    public static async fromMd(md: MutableData) {
      const nat = await md.getNameAndTag();
      nat.name = Buffer.from(nat.name); // Fix FFI Buffer type

      const serial = await md.serialise();

      const entries = await md.getEntries();
      const entries_arr: Array<{ key: Buffer, value: ValueVersion }> = await entries.listEntries();

      let map = entries_arr.map(e => <[Buffer, Buffer]>[e.key, e.value.buf]);
          map = map.filter(([k, v]) => v.length > 0);

      const ids: Map<Buffer, Buffer> = new Map();

      return new this(nat.name, nat.typeTag, serial, ids);
    }
  }

  it('does things', async () => {
    {
      const md = await app.auth.getOwnContainer();
      const c = await Container.fromMd(md);

      c.webIds.set(Buffer.from('a'), Buffer.from([0]));
      c.webIds.set(Buffer.from('b'), Buffer.from([1]));
      c.webIds.set(Buffer.from('c'), Buffer.from([2]));

      await c.commit(app);
    }

    {
      const md = await app.auth.getOwnContainer();
      const c = await Container.fromMd(md);

      let key = [...c.webIds.keys()].find(k => k.equals(Buffer.from('a')));
      c.webIds.delete(key!);

      key = [...c.webIds.keys()].find(k => k.equals(Buffer.from('b')));
      c.webIds.set(key!, Buffer.from([2]));

      c.webIds.set(Buffer.from('d'), Buffer.from([3]));

      await c.commit(app);
    }

    {
      const md = await app.auth.getOwnContainer();
      const c = await Container.fromMd(md);

      console.log(c.webIds);
    }
  });
});
