import { $select } from "@xan105/vanilla-query";

const html = 
`
<aside id="mainMenuSelection">
  <ul class="menu">
    <li><div class="button launch_ffx" data-name="ffx"></div></li>
    <li><div class="button launch_ffx_ec" data-name="ffx_ec"></div></li>
    <li><div class="button launch_ffx2" data-name="ffx2"></div></li>
    <li><div class="button launch_ffx2_lm" data-name="ffx2_lm"></div></li>
    <li><div class="button launch_credits" data-name="credits"></div></li>
    <li><div class="button exit" data-name="exit"></div></li>
    <li><div class="button settings" data-name="settings"></div></li>
  </ul>
</aside>
`;

export default class WebComponent extends HTMLElement {

  #menu;

  constructor() {
    super();
    this.innerHTML = html;
    this.#menu = $select("#mainMenuSelection .menu", this);
  }

  connectedCallback() {
    this.#menu.$selectAll("li").forEach((el) => {
      el.$click(this.click.bind(this, el));
      el.$on("mouseenter", this.active.bind(this, el));
      el.$on("mouseleave", this.inactive.bind(this, el)); 
    });
  }
  
  disconnectedCallback() {
    this.#menu.$selectAll("li").forEach((el) => {  
      el.$off("click");
      el.$off("mouseenter");
      el.$off("mouseleave"); 
    });
  }
  
  active(el){
    this.#menu.$select("li.active")?.$removeClass("active");
    el.$addClass("active");
  }
  
  inactive(el){
    el.$removeClass("active");
  }
  
  click(el){
    const name = el.$select("div").$attr("data-name");
    
    if (name === "settings"){
      this.dispatchEvent(new CustomEvent("exit"));
    } 
    else{
      ipcRenderer.menuAction(name).catch(console.error);
    }
  }

  move(climb = false){
    
    const current = this.#menu.$select("li.active") ??
                    this.#menu.$selectAll("li").at(climb ? 1 : -1); //default pos will result in first el in next                   
    current.$removeClass("active");

    const next = climb ? current.$prev() : current.$next();
    next.$toggleClass("active");
    
    ipcRenderer.gamepadVibrate().catch(console.error);
  }

  enter(name = null){
    if(name){
      this.#menu.$select("li.active")?.$removeClass("active");
      this.#menu.$select(`li div[data-name="${name}"]`)?.$click();
    } else {
      this.#menu.$select("li.active")?.$removeClass("active")?.$click();
    }  
  }
  
  onGamepadInput(input){
    switch(input){
      case "XINPUT_GAMEPAD_DPAD_UP":
        this.move(true);
        break;
      case "XINPUT_GAMEPAD_DPAD_DOWN":
        this.move(false);
        break;
      case "XINPUT_GAMEPAD_A":
        this.enter();
        break;
      case "XINPUT_GAMEPAD_START":
        this.enter("settings");
        break;
    }
  }
}