import { DOMReady, $select } from "@xan105/vanilla-query";
import { locale } from "./l10n.js";

DOMReady(()=>{ 

  $select("html").lang = locale;

	const menu = {
    main: $select("main-menu"),
    settings: $select("#settings settings-menu")
	};

  const audio = {
    sfx: $select("#sfx"),
    play: function(name, volume = 0.5){
      //Load
      if (this.sfx.$attr("data-name") !== name){
        this.sfx.$attr("data-name", name);
        this.sfx.src = "./resources/sound/" + name + ".ogg";
        this.sfx.load();
      //Reload
      } else {
        this.sfx.currentTime = 0;
      }
      //Play
      this.sfx.volume = volume;  
      this.sfx.play();
    }
  };
  
  menu.main.$on("selected", ()=>{
    audio.play("select");
  });
  
  menu.main.$on("enter", ()=>{
    audio.play("enter");
  });

  menu.main.$on("exit", ()=>{
    menu.settings.show();
  });

  menu.settings.$on("saved", ()=>{
    audio.play("save");
  });
  
  menu.settings.$on("exit", ()=>{
    audio.play("cancel");
  });

	/* Input handling */
	
	ipcRenderer.onGamepadInput((event, input) => {
    const component = menu.settings.$isHidden() ? "main" : "settings";
    menu[component].onGamepadInput(input[0]);
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