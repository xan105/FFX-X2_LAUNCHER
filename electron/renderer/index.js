/*
Copyright (c) Anthony Beaumont
This source code is licensed under the GNU GENERAL PUBLIC LICENSE Version 3
found in the LICENSE file in the root directory of this source tree.
*/

import { DOMReady, $select } from "@xan105/vanilla-query";

function updateGamepadStyle(){
  const style = localStorage.getItem("gamepadStyle") ?? "xbox";
  $select("body").$attr("data-gamepad", style);
}

DOMReady(()=>{ 

  updateGamepadStyle();

  const audio = {
    sfx: $select("#sfx"),
    bgm: $select("#bgm"),
    start: function(){
      const soundtrack = localStorage.getItem("soundtrack") ?? "ffx_fleeting_dream";
      if (this.bgm.$attr("data-name") !== soundtrack){
        this.bgm.$attr("data-name", soundtrack);
        this.bgm.src = "./resources/sound/bgm/" + soundtrack + ".ogg";
        this.bgm.load();
      }
      this.bgm.volume = parseFloat(localStorage.getItem("volume") ?? "0.1");
      this.bgm.play();
    },
    play: function(name){
      //Load (new sound)
      if (this.sfx.$attr("data-name") !== name){
        this.sfx.$attr("data-name", name);
        this.sfx.src = "./resources/sound/sfx/" + name + ".ogg";
        this.sfx.load();
      //Reload (same sound)
      } else {
        this.sfx.currentTime = 0;
      }
      //Play
      this.sfx.volume = parseFloat(localStorage.getItem("volumeSFX") ?? "0.5");  
      this.sfx.play();
    }
  };

  audio.start();
  
  const menu = {
    main: $select("main-menu"),
    settings: $select("settings-menu")
	};

  menu.main.$on("selected", ()=>{
    audio.play("select");
  });

  menu.main.$on("unbound", ()=>{
    audio.play("deny");
  });

  menu.main.$on("spawn", ()=>{
    audio.bgm.pause();
  });
  
  menu.main.$on("spawned", ()=>{
    audio.bgm.play();
  });

  menu.main.$on("exit", ()=>{
    audio.play("sphere");
    menu.settings.show();
  });

  menu.settings.$on("saved", ()=>{
    menu.main.update();
    updateGamepadStyle();
    audio.start();
    audio.play("save");
  });
  
  menu.settings.$on("swaped", ()=>{
    audio.play("change_page");
  });

  menu.settings.$on("selected", ()=>{
    audio.play("select");
  });
  
  menu.settings.$on("unbound", ()=>{
    audio.play("deny");
  });
  
  menu.settings.$on("deny", ()=>{
    audio.play("deny");
  });
  
  menu.settings.$on("changed", ()=>{
    audio.play("select");
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
    if (event.button <= 2 ) return; //ignore left/right click

    const component = menu.settings.$isHidden() ? "main" : "settings";
    menu[component].onKBMInput("Mouse" + event.button);
  });
  
});