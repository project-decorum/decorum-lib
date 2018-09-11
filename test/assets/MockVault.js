// This script is used to generate the right MockVault from within the Peruse browser
// Usage:
// NODE_ENV=dev Peruse --args --mock --preload
// Login with 'mocksafenetworkdeveloper'
// Open console, paste snippet, press enter and accept authorization requests.
// Take the URIs and put them in the MockVault.json file.

(async () => {
  const ID_CONF = {
    info: {
      id: 'decorum.lib.id-1',
      name: 'Decorum Core Library Identity 1',
      vendor: 'Project Decorum',
    },
    permissions: {},
    opts: {
      own_container: true
    },
  };

  const LIB_CONF = {
    info: {
      id: 'decorum.lib',
      name: 'Decorum Core Library',
      vendor: 'Project Decorum',
    },
    permissions: {
      'apps/decorum.lib.id-1': ['Read', 'Insert', 'Delete', 'Update', 'ManagePermissions'],
      _public: ['Read', 'Insert', 'Update', 'Delete'],
      _publicNames: ['Read', 'Insert', 'Update', 'Delete'],
    },
    opts: {
      own_container: true
    },
  };

  const id_app = await safe.initialiseApp(ID_CONF.info);
  const id_auth_uri = await id_app.auth.genAuthUri(ID_CONF.permissions, ID_CONF.opts);
  const id_uri = await safe.authorise(id_auth_uri);
  await id_app.auth.loginFromUri(id_uri);

  console.log(id_uri);

  const lib_app = await safe.initialiseApp(LIB_CONF.info);
  const lib_auth_uri = await lib_app.auth.genAuthUri(LIB_CONF.permissions, LIB_CONF.opts);
  const lib_uri = await safe.authorise(lib_auth_uri);
  await lib_app.auth.loginFromUri(lib_uri);

  console.log(lib_uri);
})();
