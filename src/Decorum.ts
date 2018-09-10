import * as Safe from '@maidsafe/safe-node-app';
import { SAFEApp } from '@maidsafe/safe-node-app/src/app';
import { MutableData } from '@maidsafe/safe-node-app/src/api/mutable';

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

  public async initialise() {
    // Create contact list MD
    const md = await this.app.mutableData.newRandomPublic(1);
    await md.quickSetup({});
    const serial = await md.serialise();

    // Put reference to contact list in own container
    const cont = await this.app.auth.getOwnContainer();
    const entries = await cont.getEntries();
    const mutation = await entries.mutate();
    await mutation.insert('contacts', serial);

    await cont.applyEntriesMutation(mutation);
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
