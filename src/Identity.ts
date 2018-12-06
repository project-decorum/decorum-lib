import rdflib from 'rdflib';

import { CONSTANTS } from '@maidsafe/safe-node-app';
import { SAFEApp } from '@maidsafe/safe-node-app/src/app';
import { MutableData } from '@maidsafe/safe-node-app/src/api/mutable';

import consts from '@maidsafe/safe-node-app/src/consts';

import crypto from 'crypto';
import multihashes from 'multihashes';
import CID from 'cids';


export default class Identity {
  public name: string = '';

  public xor: Buffer;
  public tag: number = 0xDEC0;

  public graph: any;

  private app: SAFEApp;


  constructor(app: SAFEApp, xor?: Buffer) {
    this.app = app;

    this.xor = xor || crypto.randomBytes(32);
  }

  /**
   * The CID URL calculated from the XOR name and type tag.
   *
   * @readonly
   * @type {string}
   */
  get url(): string {
    const encodedHash = multihashes.encode(this.xor, consts.CID_HASH_FN);
    const newCid = new CID(consts.CID_VERSION, consts.CID_DEFAULT_CODEC, encodedHash);
    const cidStr = newCid.toBaseEncodedString(consts.CID_BASE_ENCODING);
    return `safe://${cidStr}:${this.tag}`;
  }

  public async commit() {
    const md = await this.app.mutableData.newPublic(this.xor, this.tag);

    const perms = await this.app.mutableData.newPermissions();
    const key = await this.app.crypto.getAppPubSignKey();
    const set = ['Insert', 'Update', 'Delete', 'ManagePermissions'];
    await perms.insertPermissionSet(key, set);

    await md.put(perms, CONSTANTS.MD_ENTRIES_EMPTY);

    this.graph = rdflib.graph();

    const FOAF = rdflib.Namespace('https://xmlns.com/foaf/0.1/');
    const RDF = rdflib.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');

    this.graph.add(rdflib.sym(this.url), RDF('type'), FOAF('PersonalProfileDocument'));
    this.graph.add(rdflib.sym(this.url), FOAF('primaryTopic'), rdflib.sym(this.url + '#me'));

    this.graph.add(rdflib.sym(this.url + '#me'), RDF('type'), FOAF('Person'));
    this.graph.add(rdflib.sym(this.url + '#me'), FOAF('name'), this.name);


    const rdf = md.emulateAs('RDF');
    rdf.graphStore = this.graph;
    rdf.id = this.url;
    await rdf.commit();
  }

  public async fetch() {
    const md = await this.app.mutableData.newPublic(this.xor, this.tag);

    const rdf = md.emulateAs('RDF');

    await rdf.nowOrWhenFetched();
    this.graph = rdf.graphStore;

    const FOAF = rdflib.Namespace('https://xmlns.com/foaf/0.1/');
    const name = this.graph.any(rdflib.sym(this.url + '#me'), FOAF('name'), null);

    this.name = name.value;
  }
}
