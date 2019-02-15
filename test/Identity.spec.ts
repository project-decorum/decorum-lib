import { assert } from 'chai';
import * as h from './helpers';

import { SAFEApp } from '@maidsafe/safe-node-app/src/app';
import AppContainer from '../src/AppContainer';


describe('Identity manager', () => {
  let app: SAFEApp;

  before(async () => {
    app = await h.get_app();
  });

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
