import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import 'dotenv/config'
import express from "express";
import openid from "openid";


let currentUser = "";
ipcMain.handle("auth:get-user", () => {
  return currentUser;
});
let mainWindow
function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
  // Remove CSP header entirely
    callback({
      responseHeaders: {
        ...details.responseHeaders
        // No Content-Security-Policy header
      }
    });
  });

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.

app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  const server = express();
  let relyingParty = new openid.RelyingParty(
    "http://localhost:3000/callback", // return URL
    "http://localhost:3000/",        // realm
    true,                            // stateless
    false,                           // strict mode
    []                               // no extensions
  );

  server.get("/callback", (req, res) => {
    relyingParty.verifyAssertion(req, async(err, result) => {
      if (err) return res.send("Login failed: " + err);
      if (result.authenticated) {
        // Extract SteamID64 from claimed_id
        const claimedId = result.claimedIdentifier;
        const steamId = claimedId.match(/\d+$/)[0];
        let steam_req = await fetch(`https://api.steampowered.com/ISteamUser/GetPlayerSummaries/v0002/?key=${process.env.apiKey}&steamids=${steamId}`);
        if(steam_req.status != 200){
          res.send("Login failed.");
        }
        let steam_res = await steam_req.json();
        let player_data = steam_res.response.players[0]
        mainWindow.webContents.send("steam-auth-success", player_data);
        res.send(`
          <html>
            <body>
              <script>
                window.close();
              </script>
              <p>You can now return to the app. If this page doesn't close automatically, you can close it manually.</p>
            </body>
          </html>
        `);
        // 👉 Here you can call Steam Web API with steamId + API key
      } else {
        res.send("Login failed.");
      }
    });
  });
  server.listen(3000, () => {
    console.log("Auth server running at http://localhost:3000");
  });

  // IPC test
  ipcMain.on('login', () => {
    const steamLoginUrl = new URL("https://steamcommunity.com/openid/login");
    steamLoginUrl.searchParams.set("openid.ns", "http://specs.openid.net/auth/2.0");
    steamLoginUrl.searchParams.set("openid.mode", "checkid_setup");
    steamLoginUrl.searchParams.set("openid.return_to", "http://localhost:3000/callback");
    steamLoginUrl.searchParams.set("openid.realm", "http://localhost:3000/");
    steamLoginUrl.searchParams.set("openid.identity", "http://specs.openid.net/auth/2.0/identifier_select");
    steamLoginUrl.searchParams.set("openid.claimed_id", "http://specs.openid.net/auth/2.0/identifier_select");
    const loginWindow = new BrowserWindow({
      width: 500,
      height: 700,
      webPreferences: {
        nodeIntegration: false,
      },
    });
    loginWindow.loadURL(steamLoginUrl.toString());
    return loginWindow;
  })

  ipcMain.on("getGames",async (event, args)=>{
    const { steamid } = args;
    console.log("args",args)
    const url = `https://api.steampowered.com/IPlayerService/GetOwnedGames/v0001/?key=${process.env.apiKey}&steamid=${steamid}&include_appinfo=1&include_played_free_games=1&include_purchase_date=1&format=json`
    console.log(url)
    let req = await fetch(url)
    if(req.status != 200){
      console.log("Failed to fetch games")
      console.log(await req.text())
      return
    }
    let res = await req.json();
    console.log(res.response.games)
    mainWindow.webContents.send("get-games-success", res);
  })
  
  

  createWindow()
  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
