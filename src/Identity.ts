import rdflib from 'rdflib';

import { CONSTANTS } from '@maidsafe/safe-node-app';
import { SAFEApp } from '@maidsafe/safe-node-app/src/app';
import { MutableData } from '@maidsafe/safe-node-app/src/api/mutable';

export default class Identity {
  public name: string = '';

  public xor: Buffer | undefined = undefined;
  public tag: number = 0xDEC0;
  public url: string | undefined = undefined;

  public md: MutableData | undefined = undefined;

  public graph: any;

  private app: SAFEApp;


  constructor(app: SAFEApp) {
    this.app = app;
  }

  public async populate() {
    if (this.md === undefined) {
      if (this.xor === undefined) {
        this.md = await this.app.mutableData.newRandomPublic(this.tag);
      } else {
        this.md = await this.app.mutableData.newPublic(this.xor, this.tag);
      }
    }

    if (this.xor === undefined) {
      this.xor = (await this.md.getNameAndTag()).name;
    }

    if (this.tag === undefined) {
      this.tag = (await this.md.getNameAndTag()).typeTag;
    }

    if (this.url === undefined) {
      this.url = (await this.md.getNameAndTag()).xorUrl;
    }
  }

  public async commit() {
    await this.populate();

    this.url = (await this.md!.getNameAndTag()).xorUrl;

    const perms = await this.app.mutableData.newPermissions();
    const key = await this.app.crypto.getAppPubSignKey();
    const set = ['Insert', 'Update', 'Delete', 'ManagePermissions'];
    await perms.insertPermissionSet(key, set);

    await this.md!.put(perms, CONSTANTS.MD_ENTRIES_EMPTY);


    this.graph = rdflib.graph();

    const FOAF = rdflib.Namespace('https://xmlns.com/foaf/0.1/');
    const RDF = rdflib.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');

    this.graph.add(rdflib.sym(this.url), RDF('type'), FOAF('PersonalProfileDocument'));
    this.graph.add(rdflib.sym(this.url), FOAF('primaryTopic'), rdflib.sym(this.url + '#me'));

    this.graph.add(rdflib.sym(this.url + '#me'), RDF('type'), FOAF('Person'));
    this.graph.add(rdflib.sym(this.url + '#me'), FOAF('name'), this.name);


    const rdf = this.md!.emulateAs('RDF');
    rdf.graphStore = this.graph;
    rdf.id = this.url;
    await rdf.commit();

    this.xor = (await this.md!.getNameAndTag()).name;
  }

  public async fetch() {
    await this.populate();

    const rdf = this.md!.emulateAs('RDF');

    await rdf.nowOrWhenFetched();
    this.graph = rdf.graphStore;

    const FOAF = rdflib.Namespace('https://xmlns.com/foaf/0.1/');
    const name = this.graph.any(rdflib.sym(this.url + '#me'), FOAF('name'), null);

    this.name = name.value;
  }
}
