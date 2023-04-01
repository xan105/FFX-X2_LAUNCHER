/*
Copyright (c) Anthony Beaumont
This source code is licensed under the GNU GENERAL PUBLIC LICENSE Version 3
found in the LICENSE file in the root directory of this source tree.
*/

import mainMenu from "./menu/menu.js";
import settingsMenu from "./settings/settings.js";

customElements.define("main-menu", mainMenu);
customElements.define("settings-menu", settingsMenu);

Promise.all([
  customElements.whenDefined("main-menu"),      
  customElements.whenDefined("settings-menu")       
])
.then(ipcRenderer.componentsLoaded)
.catch(console.error);