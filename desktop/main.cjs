const { app, BrowserWindow, Menu, protocol, net, session, ipcMain } = require('electron');
const path = require('node:path');
const { pathToFileURL } = require('node:url');
// Native checks get their own storage, so entering a test dive cannot replace a player's save.
if(process.env.ATOLL_QA){
  const fs=require('node:fs');
  const qaProfile=fs.mkdtempSync(path.join(app.getPath('temp'),'atoll-qa-'));
  app.setPath('userData',qaProfile);
}
protocol.registerSchemesAsPrivileged([{ scheme: 'atoll', privileges: { standard: true, secure: true, supportFetchAPI: true, stream: true } }]);
app.whenReady().then(() => {
  protocol.handle('atoll', request => {
    const root=app.getAppPath();
    const target=path.resolve(root, '.'+decodeURIComponent(new URL(request.url).pathname));
    if(target!==root && !target.startsWith(root+path.sep)) return new Response('Forbidden',{status:403});
    return net.fetch(pathToFileURL(target===root?path.join(root,'index.html'):target).toString());
  });
  session.defaultSession.setPermissionRequestHandler((_web,_permission,callback)=>callback(false));
  const window = new BrowserWindow({ width: 1440, height: 850, minWidth: 960, minHeight: 600, fullscreen: true, backgroundColor: '#082e39', icon: path.join(app.getAppPath(),'assets/icon.png'), title: 'Atoll Down Under', show: false, webPreferences: { preload: path.join(__dirname,'preload.cjs'), nodeIntegration: false, contextIsolation: true, sandbox: true } });
  const ownFrame=event=>event.sender===window.webContents&&event.senderFrame===window.webContents.mainFrame&&event.senderFrame.url.startsWith('atoll://game/');
  ipcMain.handle('atoll:fullscreen-state',event=>{if(!ownFrame(event))throw new Error('Unavailable');return window.isFullScreen();});
  const toggleFullscreen=()=>{const next=!window.isFullScreen();window.setFullScreen(next);return next;};
  ipcMain.handle('atoll:fullscreen-toggle',event=>{if(!ownFrame(event))throw new Error('Unavailable');return toggleFullscreen();});
  // Windows can emit these events before isFullScreen() reflects the change.
  // The event itself supplies the state; querying in its handler sends stale UI.
  const publishFullscreen=value=>window.webContents.send('atoll:fullscreen-changed',value);
  window.on('enter-full-screen',()=>publishFullscreen(true));window.on('leave-full-screen',()=>publishFullscreen(false));
  Menu.setApplicationMenu(null);
  window.webContents.setWindowOpenHandler(()=>({action:'deny'}));
  window.webContents.on('will-navigate', (event,url)=>{if(!url.startsWith('atoll://game/'))event.preventDefault();});
  window.loadURL('atoll://game/index.html');
  window.once('ready-to-show',()=>{if(!process.env.ATOLL_QA)window.show();});
  window.webContents.on('before-input-event',(event,input)=>{if(input.key==='F11'&&input.type==='keyDown'){event.preventDefault();if(!input.isAutoRepeat)toggleFullscreen();}});
});
app.on('window-all-closed',()=>app.quit());
