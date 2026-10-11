const {contextBridge,ipcRenderer}=require('electron');
// Only window display controls and a background notification cross the boundary. No general IPC,
// Node, file paths or Electron event objects are exposed to game code.
contextBridge.exposeInMainWorld('atollDesktop',{
 getFullscreen:()=>ipcRenderer.invoke('atoll:fullscreen-state'),
 toggleFullscreen:()=>ipcRenderer.invoke('atoll:fullscreen-toggle'),
 onBackground:callback=>{
  const listener=()=>callback();
  ipcRenderer.on('atoll:background',listener);
  return ()=>ipcRenderer.removeListener('atoll:background',listener);
 },
 onFullscreenChange:callback=>{
  const listener=(_event,value)=>callback(Boolean(value));
  ipcRenderer.on('atoll:fullscreen-changed',listener);
  return ()=>ipcRenderer.removeListener('atoll:fullscreen-changed',listener);
 }
});
