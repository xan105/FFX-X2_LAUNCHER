import { $select } from "@xan105/vanilla-query";

const html = 
`
<nav>
  <ul>
    <li data-name="ffx"></li>
    <li data-name="ffx_ec"></li>
    <li data-name="ffx2"></li>
    <li data-name="ffx2_lm"></li>
    <li data-name="credits"></li>
    <li data-name="exit"></li>
    <li data-name="settings"></li>
  </ul>
</nav>
`;

export default class WebComponent extends HTMLElement {

  #menu;

  constructor() {
    super();
    this.innerHTML = html;
    this.#menu = $select("nav ul", this);
  }

  connectedCallback() {
    this.#menu.$selectAll("li").forEach((el) => {
      el.$click(this.click.bind(this, el));
      el.$on("mouseenter", this.active.bind(this, el));
      el.$on("mouseleave", this.inactive.bind(this, el));
    });
    this.update();
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
    this.dispatchEvent(new CustomEvent("selected"));
  }
  
  inactive(el){
    el.$removeClass("active");
  }
  
  click(el){
    this.dispatchEvent(new CustomEvent("enter"));
    
    const name = el.$attr("data-name");
    if (name === "settings")
      this.dispatchEvent(new CustomEvent("exit"));
    else {
      const detach = localStorage.getItem("detachFromProcess") ?? "false";
      const clean = localStorage.getItem("cleanup") ?? "false";

      ipcRenderer
      .menuAction(name, detach === "false", clean === "true")
      .catch(console.error);
    }
  }

  move(climb = false){
    
    const current = this.#menu.$select("li.active") ??
                    this.#menu.$selectAll("li").at(climb ? 1 : -1); //default pos will result in first el in next                   
   
    const next = climb ? current.$prev() : current.$next();
    this.active(next);
    ipcRenderer.gamepadVibrate().catch(console.error);
  }

  enter(name = null){
    if(name){
      this.#menu.$select("li.active")?.$removeClass("active");
      this.#menu.$select(`li[data-name="${name}"]`)?.$click();
    } else {
      this.#menu.$select("li.active")?.$removeClass("active")?.$click();
    }
  }
  
  update(){
    this.#menu
    .$selectAll("li:not([data-name='exit'], [data-name='settings'])")
    .forEach((el) => {
      const name = el.$attr("data-name");
      const visible = localStorage.getItem("menuEntry-" + name) ?? "true";
      if(visible === "false") el.$hide();
    });
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
  
  onKBMInput(input){
    switch(input){
      case "ArrowUp":
        this.move(true);
        break;
      case "ArrowDown":
        this.move(false);
        break;
      case "Enter":
        this.enter();
        break;
    }
  }
}