import RdfMd from './RdfMd';

import rdflib from 'rdflib';


export default class Identity extends RdfMd {
  public name: string = '';

  public async commit() {
    this.graph = rdflib.graph();

    const FOAF = rdflib.Namespace('https://xmlns.com/foaf/0.1/');
    const RDF = rdflib.Namespace('http://www.w3.org/1999/02/22-rdf-syntax-ns#');

    this.graph.add(rdflib.sym(this.url), RDF('type'), FOAF('PersonalProfileDocument'));
    this.graph.add(rdflib.sym(this.url), FOAF('primaryTopic'), rdflib.sym(this.url + '#me'));

    this.graph.add(rdflib.sym(this.url + '#me'), RDF('type'), FOAF('Person'));
    this.graph.add(rdflib.sym(this.url + '#me'), FOAF('name'), this.name);

    return await super.commit();
  }

  public async fetch() {
    await super.fetch();

    const FOAF = rdflib.Namespace('https://xmlns.com/foaf/0.1/');
    const name = this.graph.any(rdflib.sym(this.url + '#me'), FOAF('name'), null);

    this.name = name.value;
  }
}
