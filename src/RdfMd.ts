import Md from './Md';

import rdflib from 'rdflib';

import { CONSTANTS } from '@maidsafe/safe-node-app';
import { MutableData } from '@maidsafe/safe-node-app/src/api/mutable';


export default class RdfMd extends Md {
  public md: MutableData | undefined;

  public graph: any = rdflib.graph();

  public async commit() {
    if (this.md === undefined) {
      this.md = await this.app.mutableData.newPublic(this.xor, this.tag);

      const perms = await this.app.mutableData.newPermissions();
      const key = await this.app.crypto.getAppPubSignKey();
      const set = ['Insert', 'Update', 'Delete', 'ManagePermissions'];
      await perms.insertPermissionSet(key, set);

      await this.md.put(perms, CONSTANTS.MD_ENTRIES_EMPTY);
    }

    const rdf = this.md.emulateAs('RDF');
    rdf.graphStore = this.graph;
    rdf.id = this.url;
    await rdf.commit();
  }

  public async fetch() {
    this.md = await this.app.mutableData.newPublic(this.xor, this.tag);

    const rdf = this.md.emulateAs('RDF');
    await rdf.nowOrWhenFetched();
    this.graph = rdf.graphStore;
  }
}
