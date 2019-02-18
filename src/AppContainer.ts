import { SAFEApp } from '@maidsafe/safe-node-app/src/app';
import { MutableData, Entries } from '@maidsafe/safe-node-app/src/api/mutable';
import error_const from '@maidsafe/safe-node-app/src/error_const';

import Md from '../src/Md';
import WebId from '../src/WebID';

export default class AppContainer extends Md {
  /**
   * Contains the encryption keys.
   */
  private serial: string;

  /**
   * List of WebIDs.
   */
  public webIds: EntriesMap;

  constructor(xor: Buffer, tag: number, serial: string, webIds?: EntriesMap) {
    super(xor, tag);

    this.serial = serial;
    this.webIds = webIds || new EntriesMap();
  }

  public async commit(app: SAFEApp) {
    const md = await app.mutableData.fromSerial(this.serial);

    const entries = await md.getEntries();
    const mutation = await mutate_from_map(entries, this.webIds);

    if (mutation !== undefined) {
      await md.applyEntriesMutation(mutation);
    }
  }

  public async add(wid: WebId) {
    this.webIds.set(wid.url, wid.url);
  }

  public static async fromMd(md: MutableData) {
    const nat = await md.getNameAndTag();
    nat.name = Buffer.from(nat.name); // Fix FFI Buffer type

    const serial = await md.serialise();

    const entries = await md.getEntries();
    const ids = await EntriesMap.from(entries);

    return new this(nat.name, nat.typeTag, serial, ids);
  }
}

/**
 * Calculate differences between Entries and Map<Buffer, Buffer>.
 *
 * @param entries
 * @param entriesMap
 * @returns Mutation that will make Entries mirror the Map.
 */
async function mutate_from_map(entries: Entries, entriesMap: Map<Buffer, Buffer>) {
  const entries_arr = await entries.listEntries();
  const map_arr = [...entriesMap.entries()];

  const mutation = await entries.mutate();
  let mutated = false;

  for (const { key: mdKey, value: mdValue } of entries_arr) {
    const index = map_arr.findIndex(([key,]) => key.equals(mdKey));

    // If map does not have this key.
    if (index === -1) {
      // If entry is not already deleted.
      if (mdValue.buf.length > 0) {
        // DELETE.
        await mutation.delete(mdKey, mdValue.version + 1);
        mutated = true;
      }

      continue;
    }

    // If map value is different from entry.
    if (!mdValue.buf.equals(map_arr[index][1])) {
      // UPDATE
      await mutation.update(mdKey, map_arr[index][1], mdValue.version + 1);
      mutated = true;
    }

    // Map has entry and value is equal. Do nothing.
  }

  for (const [key, value] of map_arr) {
    const index = entries_arr.findIndex(({ key: mdKey }) => key.equals(mdKey));


    // If MD does not have this key.
    if (index === -1) {
      // INSERT
      await mutation.insert(key, value);
      mutated = true;
    }
  }

  return mutated ? mutation : undefined;
}

/**
 * A Map implementation that will not duplicate equal Buffers:
 *
 * ```
 * let map;
 *
 * map = new Map();
 * map.set(Buffer.from('a'), 'a0');
 * map.set(Buffer.from('a'), 'a1');
 * console.log(map.size); // will yield '2'
 *
 * map = new EntriesMap();
 * map.set(Buffer.from('a'), 'a0');
 * map.set(Buffer.from('a'), 'a1');
 * console.log(map.size); // will yield '1'
 * ```
 *
 * @class EntriesMap
 */
class EntriesMap extends Map<Buffer, Buffer> {
  public delete(key: Buffer | string) {
    key = key instanceof Buffer ? key : Buffer.from(key);

    const equal = this.find(key);
    if (equal !== undefined) {
      return super.delete(equal[0]);
    }

    return false;
  }

  public get(key: Buffer | string) {
    const equal = this.find(key);
    return equal === undefined ? undefined : equal[1];
  }

  public has(key: Buffer | string) {
    return this.find(key) ? true : false;
  }

  public set(key: Buffer | string, value: Buffer | string) {
    key = key instanceof Buffer ? key : Buffer.from(key);
    value = value instanceof Buffer ? value : Buffer.from(value);

    const equal = this.find(key);
    if (equal !== undefined) {
      key = equal[0];
    }

    super.set(key, value);

    return this;
  }

  public static async from(entries: Entries) {
    const entries_arr = await entries.listEntries();

    let map = entries_arr.map(e => <[Buffer, Buffer]>[e.key, e.value.buf]);
    map = map.filter(([k, v]) => v.length > 0);

    return new this(map);
  }

  public async toMutation(entries: Entries) {
    return await mutate_from_map(entries, this);
  }

  private find(key: Buffer | string) {
    const keyBuf = key instanceof Buffer ? key : Buffer.from(key);

    return Array.from(this).find(([k, v]) => k.equals(keyBuf));
  }
}
