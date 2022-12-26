import { DOMReady, $select, $selectAll } from "@xan105/vanilla-query";

function move(climb = false){
  
  const menu = $select("#mainMenuSelection .menu");

  const current = menu.$select("li.active") ??
                  menu.$selectAll("li").at(climb ? 1 : -1);
                        
  current.$removeClass("active");

  const next = climb ? current.$prev() ?? 
               menu.$selectAll("li").at(-1) : //restart from bottom
               current.$next() ?? 
               menu.$selectAll("li").at(0); //restart from top

  next.$toggleClass("active");
}

function enter(){

  const menu = $select("#mainMenuSelection .menu");

  const current = menu.$select("li.active"); 
  
  current?.$removeClass("active")?.$click(); 
}

DOMReady(()=>{ 

	console.log("hello world");
	
	const menu = $select("#mainMenuSelection .menu");
	menu.$selectAll("li").forEach((el) => {

    el.$click(()=>{
      const name = el.$select("div").$attr("data-name");
      console.log(name);
      
      window.ipcRenderer.menuAction(name)
      .catch((err)=>{ console.error(err) });
      
    });
    
    el.$on("mouseenter", () => {
      menu.$select("li.active")?.$removeClass("active");
      el.$addClass("active");
    });
    
    el.$on("mouseleave", () => {
      el.$removeClass("active");
    });
    
	});

	window.ipcRenderer.onGamepadInput((event, input) => {
    switch(input){
      case "XINPUT_GAMEPAD_DPAD_UP":
        move(true);
        break;
      case "XINPUT_GAMEPAD_DPAD_DOWN":
        move(false);
        break;
      case "XINPUT_GAMEPAD_A":
        enter();
        break;
      default:
        console.log(input);
    }
  });

});

