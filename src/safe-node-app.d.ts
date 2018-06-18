declare module '@maidsafe/safe-node-app' {
  interface AppInfo {
    id: string
    name: string
    vendor: string
    scope?: string
    customExecPath?: string
  }

  interface InitOptions {
    registerScheme?: boolean
    joinSchemes?: string[]
    log?: boolean
    libPath?: string
    configPath?: string
  }

  const CONSTANTS: Constants;

  interface Constants {
    NFS_FILE_MODE_OVERWRITE: number
    NFS_FILE_MODE_APPEND: number
    NFS_FILE_MODE_READ: number
    NFS_FILE_START: number
    NFS_FILE_END: number
    USER_ANYONE: number
    MD_METADATA_KEY: string
    MD_ENTRIES_EMPTY: number
    MD_PERMISSION_EMPTY: number
  }

  export function initializeApp(appInfo: AppInfo, networkStateCallBack?: any, options?: InitOptions): Promise<SAFEApp>;
  export function fromAuthURI(appInfo: AppInfo, authUri: string, networkStateCallBack?: any, options?: any, initialisation?: InitOptions): Promise<SAFEApp>

  class SAFEApp {
    auth: AuthInterface;
    mutableData: MutableDataInterface;
  }

  interface AuthInterface {
    genAuthUri(permissions?: any, opts?: any): { uri: string }
    loginFromURI(uri: string): Promise<SAFEApp>
    loginForTest(access: any, opts: any): Promise<SAFEApp>
    openUri(uri: any): Promise<void>
  }

  interface MutableDataInterface {
    newRandomPublic(typeTag: number): Promise<MutableData>
    newEntries(): Promise<Entries>
  }

  class MutableData {
    put(permissions: (Permission | Constants['MD_PERMISSION_EMPTY']), entries: (Entries | Constants['MD_ENTRIES_EMPTY'])): Promise<void>
  }

  class Entries {
    len(): Promise<number>
    insert(keyName: (string | Buffer), value: (string | Buffer)): Promise<void>
  }

  class Permission {
    len(): Promise<number>
  }
}
