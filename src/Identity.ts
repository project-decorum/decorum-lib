import Md from './Md';

import rdflib from 'rdflib';

import { CONSTANTS } from '@maidsafe/safe-node-app';
import { MutableData } from '@maidsafe/safe-node-app/src/api/mutable';


export default class Identity extends Md {
  public name: string = '';

  public md: MutableData | undefined;

  public graph: any;

  public async commit() {
    if (this.md === undefined) {
      this.md = await this.app.mutableData.newPublic(this.xor, this.tag);

      const perms = await this.app.mutableData.newPermissions();
      const key = await this.app.crypto.getAppPubSignKey();
      const set = ['Insert', 'Update', 'Delete', 'ManagePermissions'];
      await perms.insertPermissionSet(key, set);

      await this.md.put(perms, CONSTANTS.MD_ENTRIES_EMPTY);
    }

    this.graph = rdflib.graph();

    const FOAF = rdflib.Namespace('https://xmlns.com/foaf/0.1/');
    const RDF = rdflib.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');

    this.graph.add(rdflib.sym(this.url), RDF('type'), FOAF('PersonalProfileDocument'));
    this.graph.add(rdflib.sym(this.url), FOAF('primaryTopic'), rdflib.sym(this.url + '#me'));

    this.graph.add(rdflib.sym(this.url + '#me'), RDF('type'), FOAF('Person'));
    this.graph.add(rdflib.sym(this.url + '#me'), FOAF('name'), this.name);


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

    const FOAF = rdflib.Namespace('https://xmlns.com/foaf/0.1/');
    const name = this.graph.any(rdflib.sym(this.url + '#me'), FOAF('name'), null);

    this.name = name.value;
  }
}
