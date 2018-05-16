import * as Safe from '@maidsafe/safe-node-app';

const info = {
  id: 'decorum.lib',
  name: 'Decorum Core Library',
  vendor: 'Project Decorum',
};

export default class Decorum {
  /**
   * Initialise the Decorum object.
   *
   * @returns {Decorum}
   */
  public static async initialise() {
    const app = await Safe.initializeApp(info);

    return new this(app);
  }

  // The underlying app handle object.
  public app: any;

  /**
   * Construct the Decorum object.
   *
   * @param app  An app instance.
   */
  constructor(app: any) {
    this.app = app;
  }

  /* istanbul ignore next */
  /**
   * Request authorisation from the user
   *
   * @return {string} authorisation URI
   */
  public async authorise() {
    return await this.app.auth.genAuthUri();
  }

  /**
   * Login
   *
   * @return {Decorum}
   */
  public async login(authUri?: string) {
    /* istanbul ignore if */
    if (authUri !== undefined) {
      await this.app.auth.loginFromURI(authUri);
    } else {
      await this.app.auth.loginForTest();
    }

    return this;
  }
}
