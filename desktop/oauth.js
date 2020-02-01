const querystring = require('querystring');
const { BrowserWindow } = require('electron');
const nodeUrl = require('url');
const { session } = require('electron');

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
          nodeIntegration: true,
          webviewTag: true
        },
        useContentSize: true
      });

      authWindow.loadURL(url);
      authWindow.show();

      authWindow.on('closed', () => {
        reject(new Error('window was closed by user'));
      });

      function onCallback(url) {
        let url_parts = nodeUrl.parse(url, true);
        let query = url_parts.query;
        let code = query.code;
        let error = query.error;

        console.log(error, code);

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

      // Prepare to filter only the callbacks for my redirectUri
      const filter = {
        urls: ['http://localhost/*']
      };

      // intercept all the requests for that includes my redirect uri
      session.defaultSession.webRequest.onBeforeRequest(filter, function(details, callback) {
        const url = details.url;
        // process the callback url and get any param you need
        onCallback(url);

        // don't forget to let the request proceed
        callback({
          cancel: false
        });
      });

      let googleLoginURLs = ['accounts.google.com/signin/oauth', 'accounts.google.com/ServiceLogin'];
      session.defaultSession.webRequest.onBeforeSendHeaders((details, callback) => {
        googleLoginURLs.forEach((loginURL) => {
          if (details.url.indexOf(loginURL) > -1) {
            details.requestHeaders['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.12; rv:58.0) Gecko/20100101 Firefox/58.0';
          }
        });
        callback({ cancel: false, requestHeaders: details.requestHeaders });
      });
    });
  }

  return {
    getCode: getCode
  };
};
