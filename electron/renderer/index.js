import { DOMReady, $select } from "@xan105/vanilla-query";

/*
//seperate file script src="translate.js" ??
import l10n from "./l10n.json" assert { type: "json"};
const lang = l10n[currentlang] ?? l10n["english"];
*/

DOMReady(()=>{ 



	const menu = {
    main: $select("main-menu"),
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

	/*Input handling*/
	
	ipcRenderer.onGamepadInput((event, input) => {
    const component = menu.settings.$isHidden() ? "main" : "settings";
    menu[component].onGamepadInput(input);
  });
  
  document.addEventListener("keydown", (event) => {
    if ((event.key === "r" && event.ctrlKey) ||
        (event.key === "F5" && event.ctrlKey) ||
         event.key === "F5"
    ) event.preventDefault();
   
    if (event.isComposing || event.repeat) return;
    
    const component = menu.settings.$isHidden() ? "main" : "settings";
    menu[component].onKBMInput(event.key);
  });
  
  document.addEventListener("mousedown", (event) => { 
    if (event.button <= 2 ) return;

    const component = menu.settings.$isHidden() ? "main" : "settings";
    menu[component].onKBMInput("Mouse" + event.button);
  });
  
});