let active=false;
const desktop=window.atollDesktop;
const label=()=>active?'Leave fullscreen':'Fullscreen';
function update(value){
 active=Boolean(value);
 for(const button of document.querySelectorAll('[data-action="fullscreen"]')){
  button.textContent=label();button.setAttribute('aria-label',label());
 }
}
export function fullscreenButton(cls='text-button'){
 return `<button class="${cls}" data-action="fullscreen" title="F11 toggles fullscreen">${label()}</button>`;
}
export async function initializeFullscreen(){
 if(desktop){desktop.onFullscreenChange(update);update(await desktop.getFullscreen());}
 else{document.addEventListener('fullscreenchange',()=>update(document.fullscreenElement));update(document.fullscreenElement);}
}
export async function toggleFullscreen(){
 if(desktop)update(await desktop.toggleFullscreen());
 else if(document.fullscreenElement)await document.exitFullscreen();
 else await document.documentElement.requestFullscreen();
}
