const {app, ipcMain, BrowserWindow} = require('electron');

const electronOauth2 = require('electron-oauth2');

let win, serve;
const args = process.argv.slice(1);
serve = args.some(val => val === '--serve');

if (serve) {
    require('electron-reload')(__dirname, {});
}

function createWindow() {
    // Create the browser window.
    win = new BrowserWindow({
        width: 1280,
        height: 720,
        backgroundColor: '#ffffff',
        icon: `file://${__dirname}/dist/assets/logo.png`
    });


    win.loadURL(`file://${__dirname}/dist/index.html`);

    //// uncomment below to open the DevTools.
    win.webContents.openDevTools();

    // Event when the window is closed.
    win.on('closed', function () {
        win = null
    });
}

// Create window on electron intialization
app.on('ready', createWindow);

// Quit when all windows are closed.
app.on('window-all-closed', function () {

    // On macOS specific close process
    if (process.platform !== 'darwin') {
        app.quit()
    }
});

app.on('activate', function () {
    // macOS specific close process
    if (win === null) {
        createWindow()
    }
});
const oauthConfig = {
    clientId: '1082504004791-u79p0kbo22kqn07b97qjsskllgro50o6.apps.googleusercontent.com',
    clientSecret: 'VNQtDrv0NQbMqxjQ2o8ZTtai',
    authorizationUrl: 'https://accounts.google.com/o/oauth2/auth',
    tokenUrl: 'https://accounts.google.com/o/oauth2/token',
    useBasicAuthorizationHeader: false,
    redirectUri: 'http://localhost'
};
const windowParams = {
    alwaysOnTop: true,
    webPreferences: {
        nodeIntegration: false
    }
};
const googleOauth = electronOauth2(oauthConfig, windowParams);

ipcMain.on('google-oauth', (event) => {
    googleOauth.getAccessToken({scope: 'https://www.googleapis.com/auth/userinfo.profile'})
        .then(token => {
            event.sender.send('google-oauth-reply', token);
        }, err => {
            console.log('Error while getting token', err);
        });
});
