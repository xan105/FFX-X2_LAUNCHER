import { DOMReady, $select } from "@xan105/vanilla-query";

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
    
    console.log("exit main menu");
    menu.settings.show();
  });
  
  console.log(menu.settings.show);
  
  menu.settings.$on("exit", ()=>{
    
    /*menu.settings.input = false;
    menu.settings.$fadeOut();
    menu.main.input = true;*/
  });

	ipcRenderer.onGamepadInput((event, input) => {
    if (menu.settings.$isHidden() === true){
      console.log("input on settings");
      menu.settings.onGamepadInput(input);
    } else {
      console.log("input on menu");
      menu.main.onGamepadInput(input);
    }
  });
  
});