import { assert } from 'chai';
import * as Safe from '../src/Safe';
import * as path from 'path';
import * as process from 'process';
import { SAFEApp } from '@maidsafe/safe-node-app/src/app';

setTimeout(() => null, 20000); // Prevent Node.js from exiting

describe('Safe', function() {
  this.timeout(0);

  const KEY = 'mykey';
  const VALUE = 'myvalue';

  const rand = Math.random().toString(36).substr(2, 4);

  const info = [
    {
      id: rand + '.1',
      name: rand + ' 1',
      vendor: rand,
    },
    {
      id: rand + '.2',
      name: rand + ' 2',
      vendor: rand,
    },
  ];

  let app1: SAFEApp;
  let app2: SAFEApp;

  it('first identity', async () => {
    const permissions = {};

    const opts = {
      own_container: true,
    };

    app1 = await Safe.bootstrap(info[0], permissions, opts, [
      process.argv[0],
      path.join(__dirname, 'bootstrap.js'),
    ]);

    const md = await app1.auth.getOwnContainer();
    const entries = await md.getEntries();
    const mutation = await entries.mutate();
    await mutation.insert(await md.encryptKey(KEY), await md.encryptValue(VALUE));
    await md.applyEntriesMutation(mutation);
  });

  it('access identity from app', async () => {
    const permissions = {
      ['apps/' + info[0].id]: ['Read'],
    };

    const opts = {
      own_container: false,
    };

    app2 = await Safe.bootstrap(info[1], permissions, opts, [
      process.argv[0],
      path.join(__dirname, 'bootstrap.js'),
    ]);

    const md = await app2.auth.getContainer('apps/' + info[0].id);
    const key = await md.encryptKey(KEY);
    const value = await md.decrypt((await md.get(key)).buf);

    assert(value, VALUE);
  });

  it('shares and accesses MD', async () => {
    const md = await app1.mutableData.newRandomPublic(15);
    await md.quickSetup({});

    const nat = await md.getNameAndTag();

    const uri = await app2.auth.genShareMDataUri([{
      typeTag: 15,
      name: nat.name,
      perms: ['Insert'],
    }]);

    const app3 = await Safe.fromUri(app2, uri);

    const md2 = await app2.mutableData.newPublic(nat.name, nat.typeTag);
    const entries = await md2.getEntries();
    const mutation = await entries.mutate();
    await mutation.insert(KEY, VALUE);
    await md2.applyEntriesMutation(mutation);
  });
});
