const fs = require('fs-extra');
const path = require('path');

fs.copy(
  path.join(__dirname, '../dist/apps/client/assets/i18n'),
  path.join(__dirname, '../dist/client-server/assets/i18n')
);
