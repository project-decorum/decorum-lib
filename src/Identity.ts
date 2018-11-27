import rdflib from 'rdflib';

import { CONSTANTS } from '@maidsafe/safe-node-app';
import { SAFEApp } from '@maidsafe/safe-node-app/src/app';
import { MutableData } from '@maidsafe/safe-node-app/src/api/mutable';

export default class Identity {
  public name: string = '';

  public xor: Buffer | null = null;
  public tag: number = 0xDEC0;
  public url: string | null = null;

  public md: MutableData | undefined = undefined;

  private app: SAFEApp;

  private graph: any;


  constructor(app: SAFEApp) {
    this.app = app;
  }

  public async commit() {
    if (this.md !== undefined) {
      //
    } else {
      this.md = await this.app.mutableData.newRandomPublic(this.tag);

      this.url = (await this.md.getNameAndTag()).xorUrl;

      const perms = await this.app.mutableData.newPermissions();
      const key = await this.app.crypto.getAppPubSignKey();
      const set = ['Insert', 'Update', 'Delete', 'ManagePermissions'];
      await perms.insertPermissionSet(key, set);

      await this.md.put(perms, CONSTANTS.MD_ENTRIES_EMPTY);


      const graph = rdflib.graph();

      const FOAF = rdflib.Namespace('https://xmlns.com/foaf/0.1/');
      const RDF = rdflib.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');

      graph.add(rdflib.sym(this.url), RDF('type'), FOAF('PersonalProfileDocument'));
      graph.add(rdflib.sym(this.url), FOAF('primaryTopic'), rdflib.sym(this.url + '#me'));

      graph.add(rdflib.sym(this.url + '#me'), RDF('type'), FOAF('Person'));
      graph.add(rdflib.sym(this.url + '#me'), FOAF('name'), this.name);


      const rdf = this.md.emulateAs('RDF');
      rdf.graphStore = graph;
      rdf.id = this.url;
      rdf.commit();

      this.xor = (await this.md.getNameAndTag()).name;
    }
  }
}
