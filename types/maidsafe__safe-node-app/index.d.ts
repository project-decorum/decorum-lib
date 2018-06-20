declare module '@maidsafe/safe-node-app/src/api/emulations/nfs' {
  import { MutableData } from '@maidsafe/safe-node-app/src/api/mutable';
  import { CONSTANTS } from '@maidsafe/safe-node-app';

  /**
   * A NFS-style NfsFile
   *
   * _Note_: As this application layer, the network does not check any of the
   * metadata provided.
   */
  class NfsFile {
    constructor(ref: any);

    /**
     * The dataMapName to read the immutable data at
     *
     * @returns XoR-name
     */
    dataMapName: Buffer;

    /**
     * @returns user_metadata
     */
    userMetadata: Buffer;

    /**
     * When was this created? in UTC.
     */
    created: Date;

    /**
     * When was this last modified? in UTC.
     */
    modified: Date;

    /**
     * Get file size
     */
    size(): Promise<number>;

    /**
     * Read the file. NFS_FILE_START and NFS_FILE_END may be used to read the
     * entire content of the file. These constants are exposed by the
     * safe-app-nodejs package.
     *
     * @param position
     * @param len
     */
    read(position: (number | CONSTANTS.MD_ENTRIES_EMPTY), len: (number | CONSTANTS.NFS_FILE_END)): Promise<[Buffer, number]>;

    /**
     * Write file
     */
    write(content: (Buffer | string)): Promise<void>;

    /**
     * Close file
     */
    close(): Promise<void>;

    /**
     * Which version was this? Equals the underlying MutableData's entry version.
     */
    version: number;
  }

  /**
   * NFS Emulation on top of an MData
   */
  class NFS {
    /**
     * NFS Emulation on top of an MData
     */
    constructor(mData: MutableData);

    /**
     * Helper function to create and save file to the network
     *
     * @param content file contents
     * @returns  a newly created file
     */
    create(content: (string | Buffer)): NfsFile;

    /**
     * Find the file of the given filename (aka keyName in the MutableData)
     *
     * @param fileName the path/file name
     * @returns the file found for that path
     */
    fetch(fileName: string): Promise<NfsFile>;

    /**
     * Insert the given file into the underlying MutableData, directly commit to
     * the network.
     *
     * @param fileName - the path to store the file under
     * @param file - the file to serialise and store
     * @param userMetadata
     * @returns the same file
     */
    insert(fileName: (string | Buffer), file: NfsFile, userMetadata: (string | Buffer)): Promise<NfsFile>;

    /**
     * Replace a path with a new file. Directly commit to the network.
     *
     * @param fileName the path to store the file under
     * @param file the file to serialise and store
     * @param versionthe version successor number, to ensure you are overwriting the right one
     * @param userMetadata - optional parameter for updating user metadata
     * @returns the same file
     */
    update(fileName: (string | Buffer), file: NfsFile, version: number, userMetadata: (string | Buffer)): Promise<NfsFile>;

    /**
     * Delete a file from path. Directly commit to the network.
     */
    delete(fileName: (string | Buffer), version: number): Promise<void>;

    /**
     * Open a file for reading or writing.
     *
     * Open modes (these constants are exported by the safe-app-nodejs package):
     *
     * CONSTANTS.NFS_FILE_MODE_OVERWRITE: Replaces the entire content of the file when writing data.
     * CONSTANTS.NFS_FILE_MODE_APPEND: Appends to existing data in the file.
     * CONSTANTS.NFS_FILE_MODE_READ: Open file to read.
     *
     * @param file
     * @param NfsFile Defaults to NFS_FILE_MODE_OVERWRITE.
     * @returns {Promise<NfsFile>}
     */
    open(file: NfsFile, openMode?: (number | CONSTANTS.NFS_FILE_MODE_OVERWRITE | CONSTANTS.NFS_FILE_MODE_APPEND | CONSTANTS.NFS_FILE_MODE_READ)): Promise<NfsFile>;
  }
}

declare module '@maidsafe/safe-node-app/src/api/cipher_opt' {
  import { PubEncKey } from '@maidsafe/safe-node-app/src/api/crypto';

  /**
   * Holds the reference to a Cipher Options, either PlainText, Symmetric or Asymmetric
   */
  export class CipherOpt {}

  /**
   * Provide the Cipher Opt API
   */
  export class CipherOptInterface {
    /**
     * Create a PlainText Cipher Opt
     */
    newPlainText(): CipherOpt;

    /**
     * Create a new Symmetric Cipher
     */
    newSymmetric(): CipherOpt;

    /**
     * Create a new Asymmetric Cipher for the given public encryption key
     */
    newAsymmetric(pubEncKey: PubEncKey): CipherOpt;
  }
}

declare module '@maidsafe/safe-node-app/src/web_fetch' {
  /**
   * holds additional options for the `webFetch` function.
   */
  interface WebFetchOptions {
    /**
     * range of bytes to be retrieved.
     * The `start` attribute is expected to be the start offset, while the `end`
     * attribute of the `range` object the end position (both inclusive) to be
     * retrieved, e.g. with `range: { start: 2, end: 3 }` the 3rd and 4th bytes
     * of data will be retrieved. If `end` is not specified, the bytes retrived
     * will be from the `start` offset untill the end of the file. The ranges
     * values are also used to populate the `Content-Range` and `Content-Length`
     * headers in the response.
     */
    range: { start: number, end: number };
  }
}

declare module '@maidsafe/safe-node-app/src/app' {
  import { AuthInterface } from '@maidsafe/safe-node-app/src/api/auth';
  import { CryptoInterface } from '@maidsafe/safe-node-app/src/api/crypto';
  import { CipherOptInterface } from '@maidsafe/safe-node-app/src/api/cipher_opt';
  import { ImmutableDataInterface } from '@maidsafe/safe-node-app/src/api/immutable';
  import { MutableDataInterface } from '@maidsafe/safe-node-app/src/api/mutable';
  import { WebFetchOptions } from '@maidsafe/safe-node-app/src/web_fetch';
  import { AppInfo, InitOptions } from '@maidsafe/safe-node-app';

  /**
   * Holds the information about the account.
   */
  interface AccountInfo {
    /**
     * number of mutations performed with this account
     */
    mutations_done: number;

    /**
     * number of remaining mutations allowed for this account
     */
    mutations_available: number;
  }

  /**
   * Holds one sessions with the network and is the primary interface to interact
   * with the network. As such it also provides all API-Providers connected through
   * this session.
   */
  class SAFEApp {
    /**
     * get the AuthInterface instance connected to this session
     */
    auth: AuthInterface;

    /**
     * get the Crypto instance connected to this session
     */
    crypto: CryptoInterface;

    /**
     * get the CipherOptInterface instance connected to this session
     */
    cipherOpt: CipherOptInterface;

    /**
     * get the ImmutableDataInterface instance connected to this session
     */
    immutableData: ImmutableDataInterface;

    /**
     * get the MutableDataInterface instance connected to this session
     */
    mutableData: MutableDataInterface;

    /**
     * Helper to lookup a given `safe://`-url in accordance with the convention
     * and find the requested object.
     *
     * @param url the url you want to fetch
     * @param options additional options
     * @returns the object with body of content and headers
     */
    webFetch(url: string, options?: WebFetchOptions): Promise<any>;

    /**
     * Returns true if current network connection state is INIT.
     * This is state means the library has been initialised but there is no
     * connection made with the network yet.
     */
    isNetStateInit(): boolean;

    /**
     * Returns true if current network connection state is CONNECTED.
     */
    isNetStateConnected(): boolean;

    /**
     * Returns true if current network connection state is DISCONNECTED.
     */
    isNetStateDisconnected(): boolean;

    /**
     * The current appInfo
     */
    appInfo: AppInfo;

    /**
     * Generate the log path for the provided filename. If the filename provided
     * is null, it then returns the path of where the safe_core log file is
     * located.
     *
     * @param logFilename optional log filename to generate the path
     */
    logPath(logFilename?: string): Promise<String>;

    /**
     * Returns account information, e.g. number of mutations done and available.
     */
    getAccountInfo(): Promise<AccountInfo>;

    /**
     * Create a SAFEApp and try to login it through the `authUri`
     *
     * @param appInfo the AppInfo
     * @param authUri URI containing the authentication info
     * @param networkStateCallBack optional callback function to receive network state updates
     * @param initialisation options
     * @returns authenticated and connected SAFEApp
     */
    static fromAuthUri(appInfo: AppInfo, authUri: string, networkStateCallBack?: (() => any), initialisation?: InitOptions): Promise<SAFEApp>;

    /**
     * Returns the name of the app's own container.
     */
    getOwnContainerName(): Promise<string>;

    /**
     * Reconnect to the metwork
     * Must be invoked when the client decides to connect back after the connection was lost.
     */
    reconnect(): void;

    /**
     * Resets the object cache kept by the underlyging library.
     */
    clearanyCache(): void;

    /**
     * @returns true if the underlyging library was compiled against mock-routing.
     */
    isMockBuild(): boolean;
  }
}

declare module '@maidsafe/safe-node-app/src/api/immutable' {
  import { CipherOpt } from '@maidsafe/safe-node-app/src/api/cipher_opt';
  import { SAFEApp } from '@maidsafe/safe-node-app/src/app';

  /**
   * Holds the connection to read an existing ImmutableData
   */
  class Reader {
    /**
     * Holds the connection to read an existing ImmutableData
     */
    constructor();

    /**
     * Read the given amount of bytes from the network
     *
     * @param options [offset=0] start position; [end=size] end position or end of data.
     */
    read(options?: { offset: number, end: number }): void;

    /**
     * The size of the immutable data on the network
     *
     * @returns length in bytes
     */
    size(): Promise<number>;
  }

  /**
   * Holds an Immutable Data Writer
   */
  class Writer {
    /**
     * Append the given data to immutable Data.
     *
     * @param data The string or buffer to write
     */
    write(data: (string | Buffer)): Promise<void>;

    /**
     * Close and write the immutable Data to the network.
     *
     * @param cipherOpt the Cipher Opt to encrypt data with
     * @returns the address to the data once written to the network
     */
    close(cipherOpt: CipherOpt): Promise<string>;
  }

  /**
   * Interact with Immutable Data of the Network through this Interface.
   *
   * Access it through your {SAFEApp} instance under `app.immutableData`
   */
  class ImmutableDataInterface {
    /**
     * Interact with Immutable Data of the Network through this Interface.
     *
     * Access it through your {SAFEApp} instance under `app.immutableData`
     */
    constructor(app: SAFEApp);

    /**
     * Create a new ImmutableDataInterface
     */
    create(): Promise<Writer>;

    /**
     * Look up an existing Immutable Data for the given address
     *
     * @param address the XorName on the network
     */
    fetch(address: Buffer): Promise<Reader>;

  }

}

declare module '@maidsafe/safe-node-app/src/api/mutable' {
  import { CONSTANTS } from '@maidsafe/safe-node-app';
  import { SAFEApp } from '@maidsafe/safe-node-app/src/app';
  import { PubSignKey } from '@maidsafe/safe-node-app/src/api/crypto';
  import { NFS } from '@maidsafe/safe-node-app/src/api/emulations/nfs';

  /**
   * Holds the permissions of a MutableData object
   */
  class Permissions {

    /**
     * Total number of permission entries
     *
     * @returns number of entries
     */
    len(): Promise<number>;

    /**
     * Lookup the permissions of a specifc key
     *
     * @param signKey The key to lookup for. Defaults to USER_ANYONE.
     * @returns the permission set for that key
     */
    getPermissionSet(signKey?: (PubSignKey | CONSTANTS.USER_ANYONE)): Promise<any>;

    /**
     * Insert a new permission set mapped to a specifc key. Directly commits to
     * the network. Requires 'ManagePermissions'-Permission for the app.
     *
     * @param signKey The key to map to. (Defaults to USER_ANYONE.)
     * @param permissionSet The permission set to insert.
     * @returns once finished
     */
    insertPermissionSet(signKey: (PubSignKey | CONSTANTS.USER_ANYONE), permissionSet: any): Promise<void>;

    /**
     * Return the list of all associated permission sets.
     *
     * @returns the list of permission sets
     */
    listPermissionSets(): Promise<Array<any>>;

  }

  /**
   * Holds a mutations to be done to the entries within one
   * transaction on the network.
   *
   * You need this whenever you want to change the content of
   * the entries.
   */
  class EntryMutationTransaction {
    /**
     * Store a new `Insert`-Action in the transaction to store a new entry.
     *
     * @param keyName the key you want to insert
     * @param value the value you want to insert
     * @returns resolves once the storing is done
     */
    insert(keyName: (string | Buffer), value: (string | Buffer)): Promise<void>;

    /**
     * Store a new `Delete`-Action in the transaction to delete an existing entry.
     *
     * @param keyName the key you want to delete
     * @param version the version successor, to confirm you are actually asking for the right version
     * @returns resolves once the storing is done
     */
    delete(keyName: (string | Buffer), version: number): Promise<void>;

    /**
     * Store a `Update`-Action in the transaction to update an existing entry.
     *
     * @param keyName the key for the entry you want to update
     * @param value the value to upate to
     * @param version the version successor, to confirm you are actually asking for the right version
     * @returns resolves once the storing is done
     */
    update(keyName: (string | Buffer), value: (string | Buffer), version: number): Promise<void>;

  }

  /**
   * Represent the Entries of a MutableData network object
   */
  class Entries {
    /**
     * Get the total number of entries in the MutableData
     *
     * @returns number of entries
     */
    len(): Promise<number>;

    /**
     * Look up the value of a specific key
     *
     * @param keyName the key to lookup
     * @returns the entry's value and the current version
     */
    get(keyName: string): Promise<ValueVersion>;

    /**
     * Get a list with the entries contained in this MutableData
     *
     * @returns the entries list
     */
    listEntries(): Promise<Array<any>>;

    /**
     * Insert a new entry. Once you call `MutableData.put` with this entry, it
     * will fail if the entry already exists or the current app doesn't have the
     * permissions to edit that mutable data.
     *
     * @param keyName the key you want store the data under
     * @param value the data you want to store
     * @returns resolves once storing is done
     */
    insert(keyName: (string | Buffer), value: (string | Buffer)): Promise<void>;

    /**
     * Create a new mutation transaction for the entries
     *
     * @return  the mutation transaction object
     */
    mutate(): Promise<EntryMutationTransaction>;

  }

  /**
   * Holds the informatation of a value of a MutableData
   */
  interface ValueVersion {
    /**
     * the buffer with the value
     */
    buf: Buffer;

    /**
     * the version
     */
    version: Buffer;
  }

  interface NameAndTag {
    /**
     * the XoR-name/address on the network
     */
    name: Buffer;

    /**
     * the type tag
     */
    typeTag: number;
  }

  /**
   * Holds the reference to a MutableData
   */
  class MutableData {
    /**
     * Easily set up a newly (not yet created) MutableData with the app having
     * full-access permissions (and no other). The name and description parameters
     * are metadata for the MutableData which can be used to identify what this
     * MutablaData contains. The metadata is particularly used by the
     * Authenticator when another application has requested mutation permissions
     * on this MutableData, so the user can make a better decision to either
     * allow or deny such a request based on this information.
     *
     * @param data a key-value payload it should create the data with
     * @param name a descriptive name for the MutableData
     * @param  description a detailed description for the MutableData content
     * @returns self
     */
    quickSetup(data: any, name: (string | Buffer), description: (string | Buffer)): Promise<MutableData>;

    /**
     * Set the metadata information in the MutableData. Note this can be used only
     * if the MutableData was already committed to the network, .i.e either with
     * `put`, with `quickSetup`, or if it is an already existing MutableData just
     * fetched from the network. The metadata is particularly used by the
     * Authenticator when another application has requested mutation permissions
     * on this MutableData, displaying this information to the user, so the user
     * can make a better decision to either allow or deny such a request based on
     * it.
     *
     * @param name a descriptive name for the MutableData
     * @param description a detailed description for the MutableData content
     * @returns resolves once finished
     */
    setMetadata(name: (string | Buffer), description: (string | Buffer)): Promise<void>;

    /**
     * Encrypt the entry key provided as parameter with the encryption key contained
     * in a Private MutableData. If the MutableData is Public, the same (and
     * unencrypted) value is returned.
     *
     * @param key the key you want to encrypt
     * @returns the encrypted entry key
     */
    encryptKey(key: (string | Buffer)): Promise<Buffer>;

    /**
     * Encrypt the entry value provided as parameter with the encryption key
     * contained in a Private MutableData. If the MutableData is Public, the same
     * (and unencrypted) value is returned.
     *
     * @param value the data you want to encrypt
     * @returns the encrypted entry value
     */
    encryptValue(value: (string | Buffer)): Promise<Buffer>;

    /**
     * Decrypt the entry key/value provided as parameter with the encryption key
     * contained in a Private MutableData.
     *
     * @param value the data you want to decrypt
     * @returns the decrypted value
     */
    decrypt(value: (string | Buffer)): Promise<Buffer>;

    /**
     * Look up the name and tag of the MutableData as required to look it up on
     * the network.
     *
     * @returns the XoR-name and type tag
     */
    getNameAndTag(): Promise<NameAndTag>;

    /**
     * Look up the mutable data object version on the network
     *
     * @returns current version
     */
    getVersion(): Promise<number>;

    /**
     * Look up the value of a specific key
     *
     * @returns the entry value and its current version
     */
    get(key: any): Promise<ValueVersion>;

    /**
     * Commit this MutableData to the network.
     *
     * @param permissions the permissions to create the mutable data with
     * @param  entries data entries to create the mutable data with
     */
    put(permissions: (Permissions | CONSTANTS.MD_PERMISSION_EMPTY), entries: (Entries | CONSTANTS.MD_ENTRIES_EMPTY)): Promise<void>;

    /**
     * Get a Handle to the entries associated with this MutableData
     * @returns the entries representation object
     */
    getEntries(): Promise<(Entries)>;

    /**
     * Get a list with the keys contained in this MutableData
     * @returns the keys list
     */
    getKeys(): Promise<Array<any>>;

    /**
     * Get the list of values contained in this MutableData
     * @returns the list of values
     */
    getValues(): Promise<Array<any>>;

    /**
     * Get a Handle to the permissions associated with this mutableData
     * @returns the permissions representation object
     */
    getPermissions(): Promise<(Permissions)>;

    /**
     * Get a Handle to the permissions associated with this MutableData for a
     * specifc key
     *
     * @param signKey the key to look up. Defaults to USER_ANYONE.
     * @returns the permissions set associated to the key
     */
    getUserPermissions(signKey: (PubSignKey | CONSTANTS.USER_ANYONE)): Promise<(Permissions)>;

    /**
     * Delete the permissions of a specifc key. Directly commits to the network.
     * Requires 'ManagePermissions'-Permission for the app.
     *
     * @param signKey The key to lookup for. Defaults to USER_ANYONE.
     * @param version the version successor, to confirm you are actually asking for the right one
     * @returns once finished
     */
    delUserPermissions(signKey: (PubSignKey | CONSTANTS.USER_ANYONE), version: number): Promise<void>;

    /**
     * Set the permissions of a specifc key. Directly commits to the network.
     * Requires 'ManagePermissions'-Permission for the app.
     *
     * @param signKey the key to lookup for. Defaults to USER_ANYONE.
     * @param permissionSet the permission set to set to
     * @param version the version successor, to confirm you are actually asking for the right one
     * @returns resolves once finished
     */
    setUserPermissions(signKey: (PubSignKey | CONSTANTS.USER_ANYONE), permissionSet: any, version: number): Promise<void>;

    /**
     * Commit the transaction to the network
     *
     * @param mutations the Mutations you want to apply
     * @return resolves once finished
     */
    applyEntriesMutation(mutations: EntryMutationTransaction): Promise<void>;

    /**
     * Serialise the current MutableData
     *
     * @returns the serialilsed version of the MutableData
     */
    serialise(): Promise<(string)>;

    /**
     * Get serialised size of current MutableData
     *
     * @returns the serialilsed size of the MutableData
     */
    getSerialisedSize(): Promise<number>;

    /**
     * Wrap this MutableData into a known abstraction. Currently only known: `NFS`
     *
     * @param eml name of the emulation
     * @returns the Emulation you are asking for
     */
    emulateAs(eml: string): NFS;
  }

  /**
   * Provide the MutableData API for the session.
   *
   * Access via `mutableData` on your app Instance.
   */
  class MutableDataInterface {
    constructor(app: SAFEApp);

    /**
     * Create a new mutuable data at a random address with private access.
     *
     * @param typeTag the typeTag to use
     */
    newRandomPrivate(typeTag: number): Promise<MutableData>;

    /**
     * Create a new mutuable data at a random address with public access.
     *
     * @param typeTag the typeTag to use
     */
    newRandomPublic(typeTag: number): Promise<MutableData>;

    /**
     * Initiate a mutuable data at the given address with private access.
     *
     * @param typeTag the typeTag to use
     */
    newPrivate(name: (Buffer | string), typeTag: number, secKey: (Buffer | string), nonce: (Buffer | string)): Promise<MutableData>;

    /**
     * Initiate a mutuable data at the given address with public access.
     *
     * @param typeTag the typeTag to use
     */
    newPublic(name: (Buffer | string), typeTag: number): Promise<MutableData>;

    /**
     * Create a new Permissions object.
     */
    newPermissions(): Promise<Permissions>;

    /**
     * Create a new EntryMutationTransaction object.
     */
    newMutation(): Promise<EntryMutationTransaction>;

    /**
     * Create a new Entries object.
     */
    newEntries(): Promise<Entries>;

    /**
     * Create a new Mutuable Data object from its serial
     */
    fromSerial(): Promise<MutableData>;
  }
}

declare module '@maidsafe/safe-node-app/src/api/auth' {
  import { InitOptions } from '@maidsafe/safe-node-app';
  import { SAFEApp } from '@maidsafe/safe-node-app/src/app';
  import { MutableData } from '@maidsafe/safe-node-app/src/api/mutable';

  /**
   * The AuthInterface contains all authentication related functionality with the
   * network. Like creating an authenticated or unauthenticated connection or
   * create messages for the IPC authentitcation protocol.
   *
   * Access your instance through your {SAFEApp} instance under `.auth`.
   */
  class AuthInterface {
    constructor(app: SAFEApp, initialisation: InitOptions);

    /**
     * Whether or not this is a registered/authenticated session.
     *
     * @returns true if this is an authenticated session
     */
    registered: boolean;

    /**
     * Generate an authentication URI for the app with the given permissions and optional parameters.
     *
     * @param permissions mapping the container-names to a list of permissions you want to request
     * @param opts optional parameters: own_container: whether or not to request our own container to be created for us, too
     * @returns `{id: <id>, uri: 'safe-auth://' }`
     */
    genAuthUri(permissions: any, opts?: { own_container: boolean }): { id: string, uri: string };

    /**
     * Generate a `'safe-auth'`-URI to request permissions on arbitrary owned MutableData's.
     *
     * @param permissions mapping the MutableData's XoR names to a list of permissions you want to request
     * @returns `safe-auth://`-URI
     */
    genShareMDataUri(permissions: any): string;

    /**
     * Generate an unregistered connection URI for the app.
     * @returns `{id: <id>, uri: 'safe-auth://' }`
     */
    genConnUri(): { id: any, uri: string };

    /**
     * Open the given Authentication URI to the authenticator
     */
    openUri(uri: string): string;

    /**
     * Generate a `'safe-auth'`-URI to request further container permissions
     *
     * @param containers mapping container name to list of permissions
     */
    genContainerAuthUri(containers: any): string;

    /**
     * Refresh the access persmissions from the network. Useful when you just connected or received a response from the authenticator in the IPC protocol.
     */
    refreshContainersPermissions(): Promise<void>;

    /**
     * Get the names of all containers found and the app's granted permissions for each of them.
     */
    getContainersPermissions(): Promise<Array<any>>;

    /**
     * Read granted containers permissions from an auth URI without the need to connect to the network.
     *
     * @param uri the IPC response string given
     */
    readGrantedPermissions(uri: string): Promise<Array<any>>;

    /**
     * Get the MutableData for the app's own container generated by Authenticator. When run in tests, this falls back to the randomly generated version
     */
    getOwnContainer(): Promise<MutableData>;

    /**
     * Whether or not this session has specifc access permission for a given container.
     *
     * @param name name of the container, e.g. `'_public'`
     * @param permissions permissions to check for ('Read' by default)
     */
    canAccessContainer(name: string, permissions?: (string | string[])): Promise<boolean>;

    /**
     * Lookup and return the information necessary to access a container.
     *
     * @param name name of the container, e.g. `'_public'`
     * @returns the MutableData behind it
     */
    getContainer(name: string): Promise<MutableData>;

    /**
     * Create a new authenticated or unregistered session using the provided IPC response.
     *
     * @param uri the IPC response string given
     * @returns the given app instance with a newly setup and authenticated session.
     */
    loginFromURI(uri: string): Promise<SAFEApp>;

    /**
     * *ONLY AVAILALBE IF RUN in NODE_ENV='development' || 'testing'*
     *
     * Generate a _locally_ registered App with the given permissions, or a local unregistered App if permissions is `null`.
     *
     * @returns the locally registered/unregistered App instance
     */
    loginForTest(access: any, opts?: { own_container: boolean }): Promise<SAFEApp>;

    /**
     * *ONLY AVAILALBE IF RUN in NODE_ENV='development' || 'testing'*
     *
     * Simulates a network disconnection event. This can be used to test any logic
     * to be executed by an application when a network diconnection notification
     * is received.
     */
    simulateNetworkDisconnect(): void;
  }
}

declare module '@maidsafe/safe-node-app/src/api/crypto' {
  import { SAFEApp } from '@maidsafe/safe-node-app/src/app';

  /**
   * Holds the public part of an encryption key
   */
  class PubEncKey {

    /**
     * generate raw string copy of public encryption key
     */
    getRaw(): Promise<Buffer>;

    /**
     * Encrypt the input (buffer or string) using the private and public key with a seal
     *
     * @returns Ciphertext
     */
    encryptSealed(): Promise<Buffer>;

    /**
     * Decrypt the given cipher text (buffer or string) using this public
     * encryption key and the given secret key
     *
     * @param cipher to decrypt
     * @param secretEncKey secret encryption key
     * @returns plain text
     */
    decrypt(cipher: Buffer, secretEncKey: SecEncKey): Promise<Buffer>;

    /**
     * Encrypt the input (buffer or string) using this public encryption key and
     * the given secret key.
     *
     * @param data to be encrypted
     * @param secretEncKey secret encrpytion key
     * @returns cipher text
     */
    encrypt(data: Buffer, secretEncKey: SecEncKey): Promise<Buffer>;
  }

  /**
   * Holds the secret part of an encryption key
   */
  class SecEncKey {

    /**
     * generate raw string copy of secret encryption key
     */
    getRaw(): Promise<Buffer>;

    /**
     * Decrypt the given cipher text (buffer or string) using this secret
     * encryption key and the given public key.
     *
     * An example use case for this method is if you have received messages from
     * multiple senders, you may fetch your secret key once, then iterate over the
     * messages along with passing associated public encryption key to decrypt
     * each message.
     *
     * @param cipher to decrypt
     * @param publicEncKey public encryption key
     * @returns plain text
     */
    decrypt(cipher: Buffer, publicEncKey: PubEncKey): Promise<Buffer>;

    /**
     * Encrypt the input (buffer or string) using this secret encryption key
     * and the recipient's public key.
     *
     * An example use case for this method is if you have multiple intended
     * recipients. You can fetch your secret key once, then use this method to
     * iterate over recipient public encryption keys, encrypting data for each
     * key.
     *
     * @param data to be encrypted
     * @param recipientPubKey recipient's public encryption key
     * @returns cipher text
     */
    encrypt(data: Buffer, recipientPubKey: PubEncKey): Promise<Buffer>;
  }

  /**
   * Holds an asymmetric encryption keypair
   */
  class EncKeyPair {

    /**
     * get the Public Encryption key instance of this keypair
     */
    pubEncKey: PubEncKey;

    /**
     * get the Secrect Encryption key instance of this keypair
     */
    secEncKey: SecEncKey;

    /**
     * Decrypt the given cipher text with a seal (buffer or string) using this
     * encryption key pair
     *
     * @returns plain text
     */
    decryptSealed(): Promise<Buffer>;
  }

  /**
   * Holds the public part of a sign key
   */
  class PubSignKey {

    /**
     * generate raw string copy of public sign key
     */
    getRaw(): Promise<Buffer>;

    /**
     * Verify the given signed data (buffer or string) using the public sign key
     *
     * @param data to verify signature
     */
    verify(data: Buffer): Promise<Buffer>;
  }

  /**
   * Holds the secret part of a sign key
   */
  class SecSignKey {
    /**
     * Holds the secret part of a sign key
     */
    constructor();

    /**
     * generate raw string copy of secret sign key
     */
    getRaw(): Promise<Buffer>;

    /**
     * Sign the given data (buffer or string) using the secret sign key
     *
     * @param data to sign
     * @returns signed data
     */
    sign(data: Buffer): Promise<Buffer>;
  }

  /**
   * Holds a sign key pair
   */
  class SignKeyPair {

    /**
     * get the public sign key instance of this key pair
     */
    pubSignKey: PubSignKey;

    /**
     * get the secrect sign key instance of this key pair
     */
    secSignKey: SecSignKey;
  }

  /**
   * Encryption functionality for the app
   *
   * Access it through your {SAFEApp} instance under `app.crypto`
   */
  class CryptoInterface {
    /**
     * Encryption functionality for the app
     *
     * Access it through your {SAFEApp} instance under `app.crypto`
     */
    constructor(app: SAFEApp);

    /**
     * Hash the given input with SHA3 Hash
     */
    sha3Hash(data: any): Promise<Buffer>;

    /**
     * Get the public signing key of this session
     */
    getAppPubSignKey(): Promise<PubSignKey>;

    /**
     * Get the public encryption key of this session
     */
    getAppPubEncKey(): Promise<PubEncKey>;

    /**
     * Generate a new Asymmetric Encryption Key Pair
     */
    generateEncKeyPair(): Promise<EncKeyPair>;

    /**
     * Generate a new Sign Key Pair (public & private keys).
     */
    generateSignKeyPair(): Promise<SignKeyPair>;

    /**
     * Generate a new Asymmetric Encryption Key Pair from raw secret and public keys
     */
    generateEncKeyPairFromRaw(): Promise<EncKeyPair>;

    /**
     * Generate a new Sign Key Pair from raw secret and public keys
     */
    generateSignKeyPairFromRaw(): Promise<SignKeyPair>;

    /**
     * Interprete the Public Sign Key from a given raw string
     * @param raw public sign key raw bytes as string
     */
    pubSignKeyFromRaw(raw: string): Promise<PubSignKey>;

    /**
     * Interprete the Secret Sign Key from a given raw string
     *
     * @param raw secret sign key raw bytes as string
     */
    secSignKeyFromRaw(raw: string): Promise<SecSignKey>;

    /**
     * Interprete the public encryption Key from a given raw string
     *
     * @param raw public encryption key raw bytes as string
     */
    pubEncKeyFromRaw(raw: string): Promise<PubEncKey>;

    /**
     * Interprete the secret encryption Key from a given raw string
     *
     * @param raw secret encryption key raw bytes as string
     */
    secEncKeyFromRaw(raw: string): Promise<SecEncKey>;

    /**
     * Generate a nonce that can be used when creating private MutableData
     *
     * @returns the nonce generated
     */
    generateNonce(): Promise<Buffer>;
  }

}

declare module '@maidsafe/safe-node-app' {
  import { SAFEApp } from '@maidsafe/safe-node-app/src/app';

  /**
   * Holds the information about this app, needed for authentication.
   */
  interface AppInfo {
    /**
     * unique identifier for the app (e.g. 'net.maidsafe.examples.mail-app')
     */
    id: string;

    /**
     * human readable name of the app (e.g. "Mail App")
     */
    name: string;

    /**
     * human readable name of the vendor (e.g. "MaidSafe Ltd.")
     */
    vendor: string;

    /**
     * an optional scope of this instance
     */
    scope?: string;

    /**
     * an optional customised execution path to use when registering the URI with the system.
     */
    customExecPath?: string;
  }

  /**
   * holds the additional intialisation options for the App.
   */
  interface InitOptions {

    /**
     * to register auth scheme with the OS. Defaults to true
     */
    registerScheme?: boolean;

    /**
     * to additionally register custom protocol schemes
     */
    joinSchemes?: string[];

    /**
     * to enable or disable back end logging. Defaults to true
     */
    log?: boolean;

    /**
     * path to the folder where the native libs can be found. Defaults to current folder path.
     */
    libPath?: string;

    /**
     * set additional search path for the config files. E.g. `log.toml` and
     * `crust.config` files will be also searched not only in the same folder
     * where the native library is, but also in this additional search path.
     */
    configPath?: string;

    /**
     * to force the use of mock routing regardless the NODE_ENV environment
     * variable value. Defaults to false
     */
    forceUseMock?: boolean;
  }


  /**
   * The entry point to create a new SAFEApp
   *
   * @param appInfo
   * @param callback function to receive network state updates
   * @param options initialisation options
   * @returns promise to a SAFEApp instance
   */
  export function initializeApp(appInfo: AppInfo, networkStateCallBack?: (() => any), options?: InitOptions): Promise<SAFEApp>;

  /**
   * If you have received a response URI (which you are allowed to store
   * securely), you can directly get an authenticated or non-authenticated
   * connection by using this helper function. Just provide said URI as the
   * second value.
   *
   * @param appInfo the app info
   * @param authUri the URI coming back from the Authenticator
   * @param optional callback function to receive network state updates
   * @param options initialisation options
   * @returns promise to a SAFEApp instance
   */
  export function fromAuthURI(appInfo: AppInfo, authUri: string, networkStateCallBack?: (() => any), options?: InitOptions): Promise<SAFEApp>;

  export enum CONSTANTS {
    NFS_FILE_MODE_OVERWRITE = 1,
    NFS_FILE_MODE_APPEND = 2,
    NFS_FILE_MODE_READ = 4,
    NFS_FILE_START = 0,
    NFS_FILE_END = 0,
    USER_ANYONE = 0,
    MD_METADATA_KEY = '_metadata',
    MD_ENTRIES_EMPTY = 0,
    MD_PERMISSION_EMPTY = 0,
  }

  export const VERSION: string;
}

declare module '@maidsafe/safe-node-app/src/error_const' {
  interface CodeError extends Error {
    code: number;
  }

  /**
   * Thrown natively when data not found on network.
   */
  export const ERR_NO_SUCH_DATA: CodeError;

  /**
   * Thrown natively when entry on found in MutableData.
   */
  export const ERR_NO_SUCH_ENTRY: CodeError;

  /**
   * Thrown natively when NFS-style file not found.
   */
  export const ERR_FILE_NOT_FOUND: CodeError;

  /**
   * Thrown natively when attempting to fetch partial byte range of NFS-style
   * file that is not within the total byte range. For example, this error is
   * thrown if a file is 10 bytes long, however a byte range of 20 is requested.
   */
  export const INVALID_BYTE_RANGE: CodeError;

  /**
   * Thrown when a native library fails to load and which library.
   */
  export const FAILED_TO_LOAD_LIB: CodeError;

  /**
   * Informs that app is not yet connected to network.
   */
  export const SETUP_INCOMPLETE: CodeError;

  /**
   * Informs when app info provided during initialisation is invalid.
   */
  export const MALFORMED_APP_INFO: CodeError;

  /**
   * Argument should be an array object.
   */
  export const MISSING_PERMS_ARRAY: CodeError;

  /**
   * Informs of a specific object in a share MData permissions array that is malformed.
   */
  export const INVALID_SHARE_MD_PERMISSION: CodeError;

  /**
   * Thrown when share MD permissions is not an array.
   */
  export const INVALID_PERMS_ARRAY: CodeError;

  /**
   * Please provide URL
   */
  export const MISSING_URL: CodeError;

  /**
   * Please provide URL in string format.
   */
  export const INVALID_URL: CodeError;

  /**
   * Thrown when attempting to connect without authorisation URI.
   */
  export const MISSING_AUTH_URI: CodeError;

  /**
   * Thrown when attempting extract granted access permissions from a URI which
   * doesn't contain such information.
   */
  export const NON_AUTH_GRANTED_URI: CodeError;

  /**
   * Thrown when invalid permission is requested on container.
   */
  export const INVALID_PERM: CodeError;

  /**
   * Thrown when attempting to get a container without specifying name with a
   * string.
   */
  export const MISSING_CONTAINER_STRING: CodeError;

  /**
   * Thrown when functions unique to testing environment are attempted  to be
   * used.
   */
  export const NON_DEV: CodeError;

  /**
   * Thrown when public encryption key is not provided as necessary function
   * argument.
   */
  export const MISSING_PUB_ENC_KEY: CodeError;

  /**
   * Thrown when secret encryption key is not provided as necessary function
   * argument.
   */
  export const MISSING_SEC_ENC_KEY: CodeError;

  /**
   * Logger initialisation failed.
   */
  export const LOGGER_INIT_ERROR: CodeError;

  /**
   * Informs you when config search path has failed to set, with specific
   * reason.
   */
  export const CONFIG_PATH_ERROR: CodeError;

  /**
   * Custom name used to create public or private MutableData must be 32 bytes
   * in length.
   */
  export const XOR_NAME: CodeError;

  /**
   * Any string or buffer provided to private MutableData that is not 24 bytes
   * in length will throw error.
   */
  export const NONCE: CodeError;

  /**
   * Tag argument when creating private or public MutableData must be a number.
   */
  export const TYPE_TAG_NAN: CodeError;

  /**
   * Secret encryption key of improper length is provided to custom private
   * MutableData
   */
  export const INVALID_SEC_KEY: CodeError;
}
