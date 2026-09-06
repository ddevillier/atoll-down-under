const { app, BrowserWindow, Menu, protocol, net, session } = require('electron');
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
  const window = new BrowserWindow({ width: 1440, height: 850, minWidth: 960, minHeight: 600, backgroundColor: '#082e39', icon: path.join(app.getAppPath(),'assets/icon.png'), title: 'Atoll Down Under', show: false, webPreferences: { nodeIntegration: false, contextIsolation: true, sandbox: true } });
  Menu.setApplicationMenu(null);
  window.webContents.setWindowOpenHandler(()=>({action:'deny'}));
  window.webContents.on('will-navigate', (event,url)=>{if(!url.startsWith('atoll://game/'))event.preventDefault();});
  window.loadURL('atoll://game/index.html');
  window.once('ready-to-show',()=>{if(!process.env.ATOLL_QA)window.show();});
  window.webContents.on('before-input-event',(_event,input)=>{ if(input.key==='F11' && input.type==='keyDown')window.setFullScreen(!window.isFullScreen()); });
});
app.on('window-all-closed',()=>app.quit());
