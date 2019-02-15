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
  public webIds: Map<Buffer, Buffer>;

  constructor(xor: Buffer, tag: number, serial: string, webIds?: Map<Buffer, Buffer>) {
    super(xor, tag);

    this.serial = serial;
    this.webIds = webIds || new Map();
  }

  public async commit(app: SAFEApp) {
    const md = await app.mutableData.fromSerial(this.serial);

    const entries = await md.getEntries();
    const mutation = await mutate_from_map(entries, this.webIds);

    await md.applyEntriesMutation(mutation);
  }

  public async add(wid: WebId) {
    const [key, value] = [Buffer.from(wid.url), Buffer.from(wid.url)];

    // If the same Buffer content is already in the Map: do not add.
    if ([...this.webIds].findIndex(([k,]) => k.equals(key)) !== -1) {
      return;
    }

    this.webIds.set(key, value);
  }

  public static async fromMd(md: MutableData) {
    const nat = await md.getNameAndTag();
    nat.name = Buffer.from(nat.name); // Fix FFI Buffer type

    const serial = await md.serialise();

    const entries = await md.getEntries();
    const entries_arr = await entries.listEntries();

    let map = entries_arr.map(e => <[Buffer, Buffer]>[e.key, e.value.buf]);
    map = map.filter(([k, v]) => v.length > 0);

    const ids: Map<Buffer, Buffer> = new Map(map);

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

  for (const { key: mdKey, value: mdValue } of entries_arr) {
    const index = map_arr.findIndex(([key,]) => key.equals(mdKey));

    // If map does not have this key.
    if (index === -1) {
      // If entry is not already deleted.
      if (mdValue.buf.length > 0) {
        // DELETE.
        await mutation.delete(mdKey, mdValue.version + 1);
      }

      continue;
    }

    // If map value is different from entry.
    if (!mdValue.buf.equals(map_arr[index][1])) {
      // UPDATE
      await mutation.update(mdKey, map_arr[index][1], mdValue.version + 1);
    }

    // Map has entry and value is equal. Do nothing.
  }

  for (const [key, value] of map_arr) {
    const index = entries_arr.findIndex(({ key: mdKey }) => key.equals(mdKey));


    // If MD does not have this key.
    if (index === -1) {
      // INSERT
      await mutation.insert(key, value);
    }
  }

  return mutation;
}
