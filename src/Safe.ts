import * as fs from 'fs';
import * as ipc from 'node-ipc';
import * as path from 'path';
import * as yargs from 'yargs';
import * as Safe from '@maidsafe/safe-node-app';
import { SAFEApp } from '@maidsafe/safe-node-app/src/app';

// No stdout from node-ipc
ipc.config.silent = true;


export * from '@maidsafe/safe-node-app';

/**
 * Use IPC to communicate URI to current process to authorise app.
 *
 * @param info
 * @param permissions
 * @param opts
 * @param execPath
 */
export async function bootstrap(
  info?: any,
  permissions: any = {},
  opts: any = {},
  execPath?: string[],
): Promise<SAFEApp> {
  const options = {
    libPath: get_lib_path(),
  };

  const argv = yargs
    .option('pid', {
      type: 'number',
    })
    .option('uri', {
      type: 'string',
    })
    .help()
    .argv;

  if (argv.pid !== undefined) {
    if (argv.uri === undefined) {
      throw Error('--uri undefined');
    }

    await ipcSend(String(argv.pid), argv.uri);

    process.exit();
  }

  let uri;
  if (argv.uri !== undefined) {
    uri = argv.uri;
  } else {
    await authorise(process.pid, info, options, permissions, opts, execPath);
    uri = await ipcReceive(String(process.pid));
  }

  return await Safe.fromAuthUri(info, uri, undefined, options);
}

export async function fromUri(app: SAFEApp, uri: string) {
  await app.auth.openUri(uri);

  const uri2 = await ipcReceive(String(process.pid));

  return app.auth.loginFromUri(uri2);
}

async function authorise(
  pid: number,
  info: any,
  options: any,
  permissions: any = {},
  opts: any = {},
  execPath?: string[]) {
  if (execPath === undefined) {
    execPath = [process.argv[0], process.argv[1]];
  }

  info.customExecPath = [
    ...execPath,
    '--pid', String(pid),
    '--uri',
  ];

  const app = await Safe.initialiseApp(info, undefined, options);
  const uri = await app.auth.genAuthUri(permissions, opts);

  await app.auth.openUri(uri.uri);
}

async function ipcReceive(id: string): Promise<any> {
  return await new Promise((resolve) => {
    ipc.config.id = id;

    ipc.serve(() => {
      ipc.server.on('auth-uri', (data) => {
        resolve(data.message);
        ipc.server.stop();
      });
    });

    ipc.server.start();
  });
}

async function ipcSend(id: string, data: string) {
  return await new Promise((resolve) => {
    ipc.config.id = id + '-cli';

    ipc.connectTo(id, () => {
      ipc.of[id].on('connect', () => {
        ipc.of[id].emit('auth-uri', { id: ipc.config.id, message: data });

        resolve();
        ipc.disconnect('world');
      });
    });
  });
}

/**
 * @returns
 */
function get_lib_path() {
  const roots = [
    path.dirname(process.argv[0]),
    path.dirname(process.argv[1]),
  ];

  const locations = [
    'node_modules/@maidsafe/safe-node-app/src/native',
    '../node_modules/@maidsafe/safe-node-app/src/native',
    '../../node_modules/@maidsafe/safe-node-app/src/native',
    '../../../node_modules/@maidsafe/safe-node-app/src/native',
    '../../../../node_modules/@maidsafe/safe-node-app/src/native',
  ];

  for (const root of roots) {
    for (const location of locations) {
      const dir = path.join(root, location);

      if (fs.existsSync(dir)) {
        return dir;
      }
    }
  }

  throw Error('No library directory found.');
}
