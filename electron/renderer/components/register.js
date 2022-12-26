import mainMenu from "./menu.js";
customElements.define("main-menu", mainMenu);

window.ipcRenderer.componentsLoaded().catch(()=>{});