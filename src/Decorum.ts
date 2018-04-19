import { App } from 'safe-wrapper';

const info = {
  id: 'decorum.lib',
  name: 'Decorum Core Library',
  vendor: 'Project Decorum',
};

export default class Decorum {
  /**
   * Initialise the Decorum object.
   */
  public static async initialise() {
    const connection = await App.initialise(info);

    return new this(connection);
  }

  // The underlying app handle object.
  public connection: App;

  /**
   * Construct the Decorum object.
   *
   * @param connection  An app instance.
   */
  constructor(connection: App) {
    this.connection = connection;
  }

  /**
   * Request authorisation from the user.
   *
   * @return authorisation URI
   */
  public async authorise() {
    return await this.connection.authorise();
  }

  /**
   * Connect a registered session with the network.
   *
   * @param authUri
   */
  public async connect(authUri: string | false = false) {
    if (authUri !== false) {
      await this.connection.connectAuthorised(authUri);
    } else {
      await this.connection.connect();
    }

    return this;
  }
}
