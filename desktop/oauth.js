const querystring = require('querystring');
const { BrowserWindow } = require('electron');
const nodeUrl = require('url');

module.exports = function(config) {
  function getCode(opts) {
    opts = opts || {};

    let urlParams = {
      response_type: 'code',
      redirect_uri: config.redirect_uri,
      client_id: config.client_id
    };

    if (opts.scope) {
      urlParams.scope = opts.scope;
    }

    if (opts.accessType) {
      urlParams.access_type = opts.access_type;
    }

    urlParams = Object.assign(urlParams, opts.additionalAuthCodeRequestData);

    let url = config.authorize_url + '?' + querystring.stringify(urlParams);

    return new Promise(function(resolve, reject) {
      let authWindow = new BrowserWindow({
        alwaysOnTop: true,
        autoHideMenuBar: true,
        webPreferences: {
          contextIsolation: false,
          webviewTag: true
        }
      });

      authWindow.loadURL(url);
      authWindow.show();
      authWindow.maximize();

      authWindow.on('closed', () => {
        reject(new Error('window was closed by user'));
      });

      function onCallback(url) {
        let url_parts = nodeUrl.parse(url, true);
        let query = url_parts.query;
        let code = query.code;
        let error = query.error;

        if (error !== undefined) {
          reject(error);
          if (authWindow) {
            authWindow.removeAllListeners('closed');
          }
          setImmediate(function() {
            if (authWindow) {
              authWindow.close();
              authWindow = null;
            }
          });
        } else if (code) {
          resolve(code);
          if (authWindow) {
            authWindow.removeAllListeners('closed');
          }
          setImmediate(function() {
            if (authWindow) {
              authWindow.close();
              authWindow = null;
            }
          });
        }
      }

      authWindow.webContents.on('will-navigate', (event, url) => {
        onCallback(url);
      });

      authWindow.webContents.on('did-get-redirect-request', (event, oldUrl, newUrl) => {
        onCallback(newUrl);
      });
    });
  }

  return {
    getCode: getCode
  };
};
