import { DOMReady, $select } from "@xan105/vanilla-query";

DOMReady(()=>{ 

	console.log("hello world");
	
	const mainMenu = $select("#main main-menu");
	
	/*mainMenu.$on("user-select", ({ name })=>{
    window.ipcRenderer.menuAction(name)
    .catch((err)=>{ console.error(err) });
	});*/

	window.ipcRenderer.onGamepadInput((event, input) => {
    mainMenu.onGamepadInput(input);
  });

});

