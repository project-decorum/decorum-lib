import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';

// Copy pre-setup MockVault to be used during testing
fs.copyFileSync(
  path.join(__dirname, 'assets/MockVault'),
  path.join(os.tmpdir(), 'MockVault'),
);

import './Decorum.spec';
