import Safe from '../src/Safe';
import * as path from 'path';
import * as process from 'process';

setTimeout(() => null, 10000);

describe('Safe', function() {
  this.timeout(0);

  it('first identity', async () => {
    const info = {
      id: 'decorum.lib',
      name: 'Decorum Core Library',
      vendor: 'Project Decorum',
    };

    const permissions = {};

    const opts = {
      own_container: true,
    };

    const app = await Safe.bootstrap(info, permissions, opts, [
      process.argv[0],
      path.join(process.cwd(), 'dist/test/bootstrap.js'),
    ]);

    console.log(await app.getOwnContainerName());

    const md = await app.auth.getOwnContainer();
    const entries = await md.getEntries();
    const mutation = await entries.mutate();
    await mutation.insert(await md.encryptKey('identity-1'), await md.encryptValue('myvalue'));
    await md.applyEntriesMutation(mutation);
  });

  // it('access identity from app', async () => {
  //   const info = {
  //     id: 'random.app',
  //     name: 'Random',
  //     vendor: 'Random Inc.',
  //   };

  //   const app = await Safe.initializeApp(info);

  //   const permissions = {
  //     'apps/decorum.lib': ['Read'],
  //   };

  //   const opts = {
  //     own_container: false,
  //   };

  //   await app.auth.loginForTest(permissions, opts);

  //   const md = await app.auth.getContainer('apps/decorum.lib');
  //   const key = await md.encryptKey('identity-1');
  //   const value = await md.decryptValue(await md.get(key));

  //   assert(value, 'myvalue');
  // });
});
