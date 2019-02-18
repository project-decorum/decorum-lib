import { assert } from 'chai';
import * as h from './helpers';

import { SAFEApp } from '@maidsafe/safe-node-app/src/app';
import AppContainer from '../src/AppContainer';
import { WebId } from '../src';


describe('Identity manager', () => {
  let app: SAFEApp;

  beforeEach(async () => {
    app = await h.get_app();
  });

  it('adds a WebID', async () => {
    const md = await app.auth.getOwnContainer();
    const c = await AppContainer.fromMd(md);

    const wid = new WebId('John Doe');
    await wid.put(app);

    c.add(wid);
    await c.commit(app);
  });

  // TODO: split up this test and separate from Identity tests
  it('adds and removes entries', async () => {
    {
      const md = await app.auth.getOwnContainer();
      const c = await AppContainer.fromMd(md);

      c.webIds.set('a', 'a0'); // to be deleted
      c.webIds.set('b', 'b0'); // to be deleted and re-added
      c.webIds.set('c', 'c0'); // to be updated
      c.webIds.set('d', 'd0'); // to remain
      await c.commit(app);
    }

    {
      const md = await app.auth.getOwnContainer();
      const c = await AppContainer.fromMd(md);

      c.webIds.delete('a');    // delete
      c.webIds.delete('b');    // delete
      c.webIds.set('c', 'c1'); // update
      c.webIds.set('e', 'e0'); // insert new
      await c.commit(app);
    }

    {
      const md = await app.auth.getOwnContainer();
      const c = await AppContainer.fromMd(md);

      c.webIds.set('b', 'b1'); // re-add
      await c.commit(app);
    }

    {
      const md = await app.auth.getOwnContainer();
      const c = await AppContainer.fromMd(md);

      assert(c.webIds.size === 4);
      assert(c.webIds.get('b')!.equals(Buffer.from('b1')));
      assert(c.webIds.get('c')!.equals(Buffer.from('c1')));
      assert(c.webIds.get('d')!.equals(Buffer.from('d0')));
      assert(c.webIds.get('e')!.equals(Buffer.from('e0')));
    }
  });
});
