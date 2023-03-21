/*
Copyright (c) Anthony Beaumont
This source code is licensed under the GNU GENERAL PUBLIC LICENSE Version 3
found in the LICENSE file in the root directory of this source tree.
*/

import { $define } from "@xan105/vanilla-query";

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

<footer>
  <ul>
    <li>
      <div class="gamepad dpad vertical"></div>
      <span>Select</span>
    </li>
    <li>
      <div class="gamepad btn A"></div>
      <span>Enter</span>
    </li>
  </ul>
</footer>
`;

export default class WebComponent extends HTMLElement {

  #menu;

  constructor() {
    super();
    this.innerHTML = html;
    $define(this);
    this.#menu = this.$select("nav ul");
  }

  connectedCallback() {
    this.#menu.$selectAll("li").forEach((el) => {
      el.$click(this.#onClick.bind(this, el));
      el.$on("mouseenter", this.#setActive.bind(this, el));
      el.$on("mouseleave", this.#setInactive.bind(this, el));
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
  
  #setActive(el){
    this.#menu.$select("li.active")?.$removeClass("active");
    el.$addClass("active");
    this.dispatchEvent(new CustomEvent("selected"));
  }
  
  #setInactive(el){
    el.$removeClass("active");
  }
  
  #onClick(el){
    const name = el.$attr("data-name");
    if (name === "settings") 
      this.dispatchEvent(new CustomEvent("exit"));
    else 
    {
      this.dispatchEvent(new CustomEvent("spawn"));
      ipcRenderer.menuAction(
        name, 
        (localStorage.getItem("waitProcess") ?? "false") === "true", 
        (localStorage.getItem("cleanup") ?? "false") === "true"
      ).catch(console.error)
      .finally(()=>{
        this.dispatchEvent(new CustomEvent("spawned"));
      });
      
    }
  }

  #move(climb, rumble = true){
    const current = this.#menu.$select("li.active") ??
                    this.#menu.$selectAll("li").at(climb ? 1 : -1); //default pos will result in first el in next                   
   
    const next = climb ? current.$prevUntilVisible() : current.$nextUntilVisible();
    this.#setActive(next);
    
    if(rumble) ipcRenderer.gamepadVibrate().catch(console.error);
  }

  #enter(name = null){
    if(name){
      this.#menu.$select("li.active")?.$removeClass("active");
      this.#menu.$select(`li[data-name="${name}"]`)?.$click();
    } else {
      this.#menu.$select("li.active")?.$removeClass("active")?.$click();
    }
  }
  
  update(){

    if(localStorage.getItem("menuBackground") === "alternate") 
      this.$addClass("alternate");
    else
      this.$removeClass("alternate");
    
    this.#menu
    .$selectAll("li:not([data-name='exit'], [data-name='settings'])")
    .forEach((el) => {
      const name = el.$attr("data-name");
      const visible = localStorage.getItem("menuEntry-" + name) ?? "true";
      if(visible === "false") 
        el.$hide();
      else 
        el.$show();
    });
  }
  
  onGamepadInput(input){
    switch(input){
      case "XINPUT_GAMEPAD_DPAD_UP":
        this.#move(true);
        break;
      case "XINPUT_GAMEPAD_DPAD_DOWN":
        this.#move(false);
        break;
      case "XINPUT_GAMEPAD_A":
        this.#enter();
        break;
      case "XINPUT_GAMEPAD_START":
        this.#enter("settings");
        break;
      default:
        this.dispatchEvent(new CustomEvent("unbound"));
        break;
    }
  }
  
  onKBMInput(input){
    switch(input){
      case "ArrowUp":
        this.#move(true, false);
        break;
      case "ArrowDown":
        this.#move(false, false);
        break;
      case "Enter":
        this.#enter();
        break;
    }
  }
}