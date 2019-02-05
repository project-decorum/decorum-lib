import Md from './Md';

import rdflib from 'rdflib';

import { CONSTANTS } from '@maidsafe/safe-node-app';
import { MutableData } from '@maidsafe/safe-node-app/src/api/mutable';
import { SAFEApp } from '@maidsafe/safe-node-app/src/app';


export default class RdfMd extends Md {
  public graph: any = rdflib.graph();

  public async put(app: SAFEApp) {
    const md = await app.mutableData.newPublic(this.xor, this.tag);

    const perms = await app.mutableData.newPermissions();
    const key = await app.crypto.getAppPubSignKey();
    const set = ['Insert', 'Update', 'Delete', 'ManagePermissions'];
    await perms.insertPermissionSet(key, set);

    await md.put(perms, CONSTANTS.MD_ENTRIES_EMPTY);

    const rdf = md.emulateAs('RDF');
    rdf.graphStore = this.graph;
    rdf.id = this.url;
    await rdf.commit();
  }

  public async commit(app: SAFEApp) {
    const md = await app.mutableData.newPublic(this.xor, this.tag);

    const rdf = md.emulateAs('RDF');
    rdf.graphStore = this.graph;
    rdf.id = this.url;
    await rdf.commit();
  }

  public async fetch(app: SAFEApp) {
    const md = await app.mutableData.newPublic(this.xor, this.tag);

    const rdf = md.emulateAs('RDF');
    await rdf.nowOrWhenFetched();
    this.graph = rdf.graphStore;
  }
}
