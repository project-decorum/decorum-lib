import RdfMd from './RdfMd';

import rdflib from 'rdflib';
import { SAFEApp } from '@maidsafe/safe-node-app/src/app';


export default class Identity extends RdfMd {

  public tag = 0xDEC0;

  public name: string;
  public nick: string | undefined;

  /**
   * The URLs of the identities that are known.
   */
  public knows: string[] = [];

  constructor(name: string, nick?: string, knows: string[] = [], xor?: Buffer) {
    super(xor);

    this.name = name;
    this.nick = nick;
    this.knows = knows;
  }

  public async commit(app: SAFEApp) {
    this.graph = this.toGraph();
    return await super.commit(app);
  }

  public async update(app: SAFEApp) {
    this.graph = this.toGraph();
    return await super.update(app);
  }

  public async fetch(app: SAFEApp) {
    await super.fetch(app);

    const FOAF = rdflib.Namespace('https://xmlns.com/foaf/0.1/');
    const name = this.graph.any(rdflib.sym(this.url + '#me'), FOAF('name'), null);

    this.name = name.value;
    this.knows = [];

    const matches = this.graph.match(rdflib.sym(this.url + '#me'), FOAF('knows'), null);
    for (const { object } of matches) {
      this.knows.push(object.value);
    }
  }

  public async addKnows(identity: this) {
    this.knows.push(identity.url);
  }

  public toGraph() {
    const graph = rdflib.graph();

    const FOAF = rdflib.Namespace('https://xmlns.com/foaf/0.1/');
    const RDF = rdflib.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');

    graph.add(rdflib.sym(this.url), RDF('type'), FOAF('PersonalProfileDocument'));
    graph.add(rdflib.sym(this.url), FOAF('primaryTopic'), rdflib.sym(this.url + '#me'));

    graph.add(rdflib.sym(this.url + '#me'), RDF('type'), FOAF('Person'));
    graph.add(rdflib.sym(this.url + '#me'), FOAF('name'), this.name);

    if (this.nick !== undefined) {
      graph.add(rdflib.sym(this.url + '#me'), FOAF('nick'), this.nick);
    }

    for (const url of this.knows) {
      graph.add(rdflib.sym(this.url + '#me'), FOAF('knows'), url);
    }

    // TODO: cert:key, pim:storage and foaf:Image

    return graph;
  }

  public static fromGraph(graph: any) {
    const FOAF = rdflib.Namespace('https://xmlns.com/foaf/0.1/');
    const RDF = rdflib.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');

    let url = graph.any(null, RDF('type'), FOAF('PersonalProfileDocument'));
    if (url === undefined) {
      throw new Error('WebID must have `type` of `PersonalProfileDocument`');
    }
    url = url.value;

    let name = graph.any(rdflib.sym(url + '#me'), FOAF('name'), null);
    if (name === undefined) {
      throw new Error('WebID must have a `name`');
    }
    name = name.value;

    let nick = graph.any(rdflib.sym(url + '#me'), FOAF('nick'), null);
    nick = nick ? nick.value : undefined;

    const knows: string[] = [];

    const matches = graph.match(rdflib.sym(url + '#me'), FOAF('knows'), null);
    for (const { object } of matches) {
      knows.push(object.value);
    }

    const identity = new this(name, nick, knows);
    identity.url = url;

    return identity;
  }
}
