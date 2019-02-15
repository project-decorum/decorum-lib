import { assert } from 'chai';
import * as h from './helpers';

import { SAFEApp } from '@maidsafe/safe-node-app/src/app';
import AppContainer from '../src/AppContainer';


describe('Identity manager', () => {
  let app: SAFEApp;

  before(async () => {
    app = await h.get_app();
  });

  // it.only('tests stupid things', async () => {
  //   class EntriesMap extends Map<Buffer, Buffer> {
  //     set(key: Buffer | string, value: Buffer | string) {
  //       // Convert non-Buffer to Buffer.
  //       key = key instanceof Buffer ? key : Buffer.from(key);
  //       value = value instanceof Buffer ? value : Buffer.from(value);

  //       // Look for an equal Buffer Object that should be updated.
  //       const equal = [...this].find(([k, v]) => k.equals(key as Buffer));
  //       if (equal !== undefined) {
  //         key = equal[0];
  //       }

  //       super.set(key, value);

  //       return this;
  //     }
  //   }

  //   const map = new EntriesMap();
  //   map.set(Buffer.from('a'), Buffer.from('a0'));
  //   map.set(Buffer.from('a'), Buffer.from('a1'));
  //   map.set(Buffer.from('a'), Buffer.from('a2'));

  //   console.log([...map.entries()].map(e => [e[0].toString(), e[1].toString()]));

  // });

  it('does things', async () => {
    {
      const md = await app.auth.getOwnContainer();
      const c = await AppContainer.fromMd(md);

      c.webIds.set(Buffer.from('a'), Buffer.from('a0'));
      c.webIds.set(Buffer.from('b'), Buffer.from('b0'));
      c.webIds.set(Buffer.from('c'), Buffer.from('c0'));
      c.webIds.set(Buffer.from('d'), Buffer.from('d0'));
      c.webIds.set(Buffer.from('e'), Buffer.from('e0'));

      await c.commit(app);
    }

    {
      const md = await app.auth.getOwnContainer();
      const c = await AppContainer.fromMd(md);

      let key = [...c.webIds.keys()].find(k => k.equals(Buffer.from('a')));
      c.webIds.delete(key!);

      key = [...c.webIds.keys()].find(k => k.equals(Buffer.from('b')));
      c.webIds.set(key!, Buffer.from('b1'));

      key = [...c.webIds.keys()].find(k => k.equals(Buffer.from('d')));
      c.webIds.set(key!, Buffer.from('d1'));

      c.webIds.set(Buffer.from('f'), Buffer.from('f0'));

      await c.commit(app);
    }

    {
      const md = await app.auth.getOwnContainer();
      const c = await AppContainer.fromMd(md);
      console.log([...c.webIds.entries()].map(e => [e[0].toString(), e[1].toString()]));

      c.webIds.set(Buffer.from('a'), Buffer.from('a1'));

      await c.commit(app);
    }

    {
      const md = await app.auth.getOwnContainer();
      const c = await AppContainer.fromMd(md);

      console.log([...c.webIds.entries()].map(e => [e[0].toString(), e[1].toString()]));
      const test = 123;
    }
  });
});
