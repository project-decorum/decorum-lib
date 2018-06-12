import { assert } from 'chai';
import Safe from '../src/Safe';
import * as path from 'path';
import * as process from 'process';

setTimeout(() => null, 20000); // Prevent Node.js from exiting

describe('Safe', function() {
  this.timeout(0);

  const rand = Math.random().toString(36).substr(2, 4);

  it('first identity', async () => {
    const info = {
      id: rand,
      name: rand,
      vendor: rand,
    };

    const permissions = {};

    const opts = {
      own_container: true,
    };

    const app = await Safe.bootstrap(info, permissions, opts, [
      process.argv[0],
      path.join(process.cwd(), 'dist/test/bootstrap.js'),
    ]);

    const md = await app.auth.getOwnContainer();
    const entries = await md.getEntries();
    const mutation = await entries.mutate();
    await mutation.insert(await md.encryptKey('identity-1'), await md.encryptValue('myvalue'));
    await md.applyEntriesMutation(mutation);
  });

  it('access identity from app', async () => {
    const info = {
      id: 'random.' + rand,
      name: 'Random ' + rand,
      vendor: 'Random Inc. ' + rand,
    };

    const permissions = {
      ['apps/' + rand]: ['Read'],
    };

    const opts = {
      own_container: false,
    };

    const app = await Safe.bootstrap(info, permissions, opts, [
      process.argv[0],
      path.join(process.cwd(), 'dist/test/bootstrap.js'),
    ]);

    const md = await app.auth.getContainer('apps/' + rand);
    const key = await md.encryptKey('identity-1');
    const value = await md.decrypt((await md.get(key)).buf);

    assert(value, 'myvalue');
  });
});
