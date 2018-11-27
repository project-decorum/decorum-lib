import { SAFEApp } from '@maidsafe/safe-node-app/src/app';
import Identity from './Identity';

export default class Decorum {
  // The underlying app handle object.
  public app: SAFEApp;

  /**
   * Construct the Decorum object.
   *
   * @param app  An app instance.
   */
  constructor(app: SAFEApp) {
    this.app = app;
  }

  public newIdentity() {
    return new Identity(this.app);
  }



  public async initialise() {
    // Create contact list MD
    const md = await this.app.mutableData.newRandomPublic(1); // TODO: type tag
    await md.quickSetup({});
    const serial = await md.serialise();

    // Put reference to contact list in own container
    const cont = await this.app.auth.getOwnContainer();
    const entries = await cont.getEntries();
    const mutation = await entries.mutate();
    await mutation.insert('contacts', serial);

    await cont.applyEntriesMutation(mutation);
  }

  public async createWebID(uri: string, name: string, nick: string) {
    const profile = { uri, name, nick };

    const md = await this.app.mutableData.newRandomPublic(2); // TODO: type tag
    await md.quickSetup({});

    const webId = await md.emulateAs('WebID');
    await webId.create(profile);
  }

  public async getWebIDs() {
    const cont = await this.app.auth.getContainer('_public');

    const rdf = cont.emulateAs('RDF');
    // rdf.setId('safe://_public/webId');
    await rdf.nowOrWhenFetched();


    const ids = rdf.statementsMatching(
      undefined,
      rdf.sym('http://safenetwork.org/safevocab/uri'),
      undefined,
    );

    return ids.map((i: any) => i.object.value);
  }

  public async addContact(name: string) {
    // Get contact list MD from own container
    const cont = await this.app.auth.getOwnContainer();
    const vv = await cont.get('contacts');
    const md = await this.app.mutableData.fromSerial(vv.buf);

    const rdf = md.emulateAs('RDF');
    await rdf.nowOrWhenFetched();

    rdf.setId('list');
    rdf.add(rdf.sym('safe://example.com/myid'), rdf.sym('http://xmlns.com/foaf/0.1/knows'), rdf.literal(name));

    await rdf.commit();
  }

  public async getContacts() {
    // Get contact list MD from own container
    const cont = await this.app.auth.getOwnContainer();
    const vv = await cont.get('contacts');
    const md = await this.app.mutableData.fromSerial(vv.buf);

    const rdf = md.emulateAs('RDF');
    await rdf.nowOrWhenFetched();

    const contacts = rdf.each(
      rdf.sym('safe://example.com/myid'),
      rdf.sym('http://xmlns.com/foaf/0.1/knows'),
      undefined,
    );

    return contacts.map((c: any) => c.value);
  }
}
