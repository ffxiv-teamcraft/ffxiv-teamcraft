import { OauthProvider } from './oauth-provider';
import querystring from 'querystring';
import nodeUrl from 'url';
import { BrowserWindow, session } from 'electron';

export class Oauth {
  constructor(private provider: OauthProvider) {
  }

  getCode(opts: any = {}): Promise<string | string[]> {
    opts = opts || {};

    let urlParams: any = {
      response_type: 'code',
      redirect_uri: this.provider.redirect_uri,
      client_id: this.provider.client_id
    };

    if (opts.scope) {
      urlParams.scope = opts.scope;
    }

    if (opts.accessType) {
      urlParams.access_type = opts.access_type;
    }

    urlParams = Object.assign(urlParams, opts.additionalAuthCodeRequestData);

    const url = this.provider.authorize_url + '?' + querystring.stringify(urlParams);

    return new Promise((resolve, reject) => {
      let authWindow = new BrowserWindow({
        alwaysOnTop: true,
        autoHideMenuBar: true,
        webPreferences: {
          contextIsolation: false,
          nodeIntegration: this.provider.authorize_url.indexOf('discordapp.com') === -1,
          webviewTag: true
        },
        useContentSize: true
      });

      authWindow.loadURL(url, { userAgent: 'Chrome' });
      authWindow.show();

      authWindow.on('closed', () => {
        reject(new Error('window was closed by user'));
      });

      function onCallback(cbUrl: string) {
        const url_parts = nodeUrl.parse(cbUrl, true);
        const query = url_parts.query;
        const code = query.code;
        const error = query.error;

        if (error !== undefined) {
          reject(error);
          if (authWindow) {
            authWindow.removeAllListeners('closed');
          }
          setImmediate(() => {
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
          setImmediate(() => {
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
      session.defaultSession.webRequest.onBeforeRequest(filter, (details, callback) => {
        // process the callback url and get any param you need
        onCallback(details.url);

        // don't forget to let the request proceed
        callback({
          cancel: false
        });
      });

      const googleLoginURLs = ['accounts.google.com/signin/oauth', 'accounts.google.com/ServiceLogin'];
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
}
