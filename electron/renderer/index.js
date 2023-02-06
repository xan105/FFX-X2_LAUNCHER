import { DOMReady, $select } from "@xan105/vanilla-query";
import mainMenu from "./components/menu/menu.js";
import settingsMenu from "./components/settings/settings.js";

/*
//seperate file script src="translate.js" ??
import l10n from "./l10n.json" assert { type: "json"};
const lang = l10n[currentlang] ?? l10n["english"];
*/

DOMReady(()=>{ 

	const menu = {
    main: $select("#main main-menu"),
    settings: $select("#settings settings-menu")
	};

  menu.main.$on("exit", ()=>{
    //menu.settings.$fadeIn();
    
    
    /*menu.main.input = false;
    menu.settings.$fadeIn();
    menu.settings.input = true;*/
    
    
    //menu.settings.enter();
  });
  
  menu.settings.$on("exit", ()=>{
    
    /*menu.settings.input = false;
    menu.settings.$fadeOut();
    menu.main.input = true;*/
  });

	window.ipcRenderer.onGamepadInput((event, input) => {
    /*if (menu.settings.$isHidden() === false){
      menu.settings.onGamepadInput(input);
    } else {
      menu.main.onGamepadInput(input);
    }*/
    menu.main.onGamepadInput(input);
  });
  
});

customElements.define("main-menu", mainMenu);
customElements.define("settings-menu", settingsMenu);
window.ipcRenderer.componentsLoaded().catch(()=>{});