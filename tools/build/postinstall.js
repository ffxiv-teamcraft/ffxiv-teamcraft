const { execSync } = require('child_process');
execSync('electron-builder install-app-deps', { stdio: 'inherit' });
