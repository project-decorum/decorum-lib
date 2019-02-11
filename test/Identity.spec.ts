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

      c.webIds.set(Buffer.from('a'), Buffer.from([0]));
      c.webIds.set(Buffer.from('b'), Buffer.from([1]));
      c.webIds.set(Buffer.from('c'), Buffer.from([2]));

      await c.commit(app);
    }

    {
      const md = await app.auth.getOwnContainer();
      const c = await AppContainer.fromMd(md);

      let key = [...c.webIds.keys()].find(k => k.equals(Buffer.from('a')));
      c.webIds.delete(key!);

      key = [...c.webIds.keys()].find(k => k.equals(Buffer.from('b')));
      c.webIds.set(key!, Buffer.from([2]));

      c.webIds.set(Buffer.from('d'), Buffer.from([3]));

      await c.commit(app);
    }

    {
      const md = await app.auth.getOwnContainer();
      const c = await AppContainer.fromMd(md);

      console.log(c.webIds);
    }
  });
});
