/*
Copyright (c) Anthony Beaumont
This source code is licensed under the GNU GENERAL PUBLIC LICENSE Version 3
found in the LICENSE file in the root directory of this source tree.
*/

import { $select, $define } from "@xan105/vanilla-query";
import { localize } from "./l10n.js";
import settings from "./settings.json" assert { type: "json" };

const template =
`
<li>
  <div class="container">
    <div class="left">
      <label></label>
    </div>
    <div class="right">
      <div class="option-wrap">
        <div class="previous"><span class="arrow"><i class="fas fa-chevron-left"></i></span></div>
        <select autocomplete="off">
        </select>
        <div class="next"><span class="arrow"><i class="fas fa-chevron-right"></i></span></div>
      </div>
    </div>
  </div>
</li>
`;

const html =
`
<div class="container">
	<div class="help" data-title="Help">
		<div class="content">
			<div class="text"></div>
		</div>
	</div>
  
  <nav>
    <ul>
      <li class="active">
        <div class="gamepad L"></div>
        <span>Game</span>
      </li>
      <li>
        <span>Launcher</span>
        <div class="gamepad R"></div>
      </li>
    </ul>
  </nav>

	<div class="options">
    <section id="settings-game" class="active">
      <ul>
      </ul>
    </section>
    <section id="settings-launcher">
      <ul>
      </ul>
    </section>  
	</div>
</div>

	<div class="footer">
    <ul>
      <li>
        <div class="gamepad dpad vertical"></div>
        <span>Select</span>
      </li>
      <li>
        <div class="gamepad dpad horizontal"></div>
        <span>Change</span>
      </li>
      <li>
        <div class="gamepad A"></div>
        <span>Save</span>
      </li>
      <li>
        <div class="gamepad B"></div>
        <span>Cancel</span>
      </li>
    </ul>
	</div>
`;

export default class WebComponent extends HTMLElement {

  #helpHint;
  #options;
  #settings;
  
  constructor() {
    super();
    this.innerHTML = html;
    $define(this);
    
    this.#helpHint = $select(".container .help .text", this);
    this.#options = $select(".container .options", this);

    for(const [name, options] of Object.entries(settings)){
      for(const option of options){
        const li = this.#options.$select(`#settings-${name} ul`).$append(template);
        li.$attr("data-id", option.id);
        if(option.unx) li.$attr("data-unx", option.unx);
        
        const select = li.$select(".container .right select");
        for (const value of option.values){
          const opt = document.createElement("option");
          opt.value = value;
          opt.defaultSelected = value === option.values[option.default];
          select.add(opt);
        }
      }
    }
  }

  connectedCallback() {
    
    this.#options.$selectAll("li").forEach((el) => {
      el.$on("mouseenter", this.#setActive.bind(this, el));
    });

    this.#options.$selectAll("li .next").forEach((el) => {
      el.$click(() => {
        const select = el.$parent(".right").$select("select");
        const max = select.options.length;
        if(max === 0) return;
        const current = select.selectedIndex == -1 ? 0 : select.selectedIndex; //select first entry if none
        const next = current + 1;
        const index = next > max - 1 ? 0 : next; //reset when out of range
        select.options[index].selected = true;
        select.$trigger("change"); //emit event like the real thing
        this.dispatchEvent(new CustomEvent("changed"));
      });
    }); 
      
    this.#options.$selectAll("li .previous").forEach((el) => {
      el.$click(() => {
        const select = el.$parent(".right").$select("select");
        const max = select.options.length;
        if(max === 0) return;
        const current = select.selectedIndex == -1 ? 0 : select.selectedIndex; //select first entry if none
        const next = current - 1;
        const index = next < 0 ? max - 1 : next; //reset when out of range
        select.options[index].selected = true;
        select.$trigger("change"); //emit event like the real thing
        this.dispatchEvent(new CustomEvent("changed"));  
      });
    });

    this.$selectAll("nav ul li").forEach((el)=>{
      el.$click(()=>{
        if(el.$hasClass("active")) {
          this.dispatchEvent(new CustomEvent("deny"));
          return;
        }
        el.$addClass("active").$next().$removeClass("active");

        this.#options.$selectAll("section").forEach((section)=>{
          section.$toggleClass("active");
          section.$select("li.active")?.$removeClass("active");  
        });
        
      });
    });
    
  }
  
  disconnectedCallback() {
    this.#options.$selectAll("li .next").forEach((el) => {
      el.$off("click");
    });
    
    this.#options.$selectAll("li .previous").forEach((el) => {
      el.$off("click");
    });
  }
  
  async #populateAvailableDisplayResolution(){

    const el = this.#options.$select("#settings-game li[data-id=\"Resolution\"]");
    
    try{
      const select = el.$select(".container .right select");
      if (select.options.length > 0) return;
      
      const { available, current } = await ipcRenderer.displayResolution();
        
      for (const resolution of available){
        const opt = document.createElement("option");
        opt.value = opt.text = resolution;
        opt.defaultSelected = resolution === current;
        select.add(opt);
      }

    }catch{
      el.$hide();
    }
  }

  async show(){
    this.#populateAvailableDisplayResolution();
    
    this.#settings = await ipcRenderer.settingsRead().catch(console.error);
    console.log(this.#settings);
    
    const l10n = await localize(this.#settings.Language);
    console.log(l10n);

    const settings = {
      game: this.#options.$select("#settings-game").$selectAll("li"),
      launcher: this.#options.$select("#settings-launcher").$selectAll("li")
    };

    for(const [name, list] of Object.entries(settings)){
      for (const li of list){
        try{
          const id = li.$attr("data-id");
          const unx =  li.$attr("data-unx");
          if (unx && !this.#settings.unx) li.$hide();
          
          //Text
          
          const label = li.$select(".left label");
          label.$text(l10n.settings[id].display);
          label.$attr("data-hint", l10n.settings[id].hint);
          const options = li.$selectAll(".right select option");
          for (const option of options){
            const value = l10n.settings[id].values?.[option.value];
            if(option.value === "true" && value == null)
              option.$text(l10n.settings.common.enabled);
            else if (option.value === "false" && value == null)
              option.$text(l10n.settings.common.disabled);
            else            
              option.$text(value);
          }
          
          //Value
          const value = name === "launcher" ? localStorage.getItem(id) :
                        unx ? this.#settings.unx[unx][id] : this.#settings[id];
            
          const opt = li.$select(`.right select option[value="${value}"`);
          if(!opt) continue;
          opt.selected = true;
          console.log("set: ", id, value);
        }catch(err){
          console.warn(err);
        }
      }
    }

    this.$parent("#settings").$fadeIn(500);
  }
  
  save(){
    
    const settings = {
      game: this.#options.$select("#settings-game").$selectAll("li"),
      launcher: this.#options.$select("#settings-launcher").$selectAll("li")
    };
    
    for(const [name, list] of Object.entries(settings)){
      for (const li of list){
        try{
        
          if (li.$isHidden()) continue;
          const id = li.$attr("data-id");
          const unx =  li.$attr("data-unx");
 
          const value = li.$select(".right select").value;

          if(name === "launcher"){
            localStorage.setItem(id, value);
            console.log("changed (launcher): ", id, value);
          } else if(unx){
            this.#settings.unx[unx] ??= Object.create(null);
            this.#settings.unx[unx][id] = value;
            console.log("changed: ", unx, id, value);
          } else {
            this.#settings[id] = value;
            console.log("changed: ", id, value);
          }

        }catch(err){
          console.error(err);
        }
      }
    }
    
    console.log(this.#settings);

    ipcRenderer.settingsWrite(this.#settings)
    .catch(console.error)
    .finally(() => { 
      this.dispatchEvent(new CustomEvent("saved"));
      this.hide();
    });
  }
  
  exit(){
    this.dispatchEvent(new CustomEvent("exit"));
    this.hide();
  }
  
  hide(){
    this.#options.$selectAll("li.active").forEach(el => el.$removeClass("active"));
    this.$select("nav ul li:first-child").$addClass("active").$next().$removeClass("active");
    this.#options.$select("#settings-game").$addClass("active").$next().$removeClass("active");
    this.#options.scrollTo({top: 0, behavior: "auto"});
    this.$parent("#settings").$fadeOut(450);
  }

  #setHelp(el){
    const hint = el.$select(".left label").$attr("data-hint");
    if(hint) this.$select(".container .help .text").$text(hint);
  }
  
  #setActive(el, silent = true){
    this.#options.$selectAll("li.active").forEach(el => el.$removeClass("active"));
    this.#setHelp(el);
    if(!silent){
      el.$addClass("active");
      this.dispatchEvent(new CustomEvent("selected"));
    }
  }
  
  #scroll(root, el){
    //scrollIntoView() trigger mouve event when scrolling -.-"
    
    //disable mouse while scrolling
    root.$selectAll("li").forEach((el)=>{
      el.$css("pointer-events", "none");
    });

    //scrollend event isn't available yet 
    //so this will have to do...
    setTimeout(()=>{
      root.$selectAll("li").forEach((el)=>{
        el.$css("pointer-events", "auto");
      });
    }, 33); //One gamepad frame at 30hz

    el.scrollIntoView({
      behavior: "auto",
      block: "nearest",
      inline: "center"
    });
  }
  
  move(climb, rumble = true){
    const section = this.#options.$selectAll("section").find(el => !el.$isHidden());
    const current = section.$select("li.active") ??
                    section.$selectAll("li").at(climb ? 1 : -1); //default pos will result in first el in next                   
    
    const next = climb ? current.$prevUntilVisible() : current.$nextUntilVisible();
    this.#setActive(next, false);
    this.#scroll(section, next);

    if(rumble) ipcRenderer.gamepadVibrate().catch(console.error);
  }
  
  change(next = false){
    const section = this.#options.$selectAll("section").find(el => !el.$isHidden());
    const current = section.$select("li.active");
    if(!current) {
      this.dispatchEvent(new CustomEvent("deny"));
      return;
    }
    
    const direction = next ? ".next" : ".previous";
    current.$select(`li ${direction}`).$click();
  }
  
  swap(next = false){
    const direction = next ? "last-child" : "first-child";
    this.$select(`nav ul li:${direction}`).$click();
  }
  
  onGamepadInput(input){
    switch(input){
      case "XINPUT_GAMEPAD_DPAD_UP":
        this.move(true);
        break;
      case "XINPUT_GAMEPAD_DPAD_DOWN":
        this.move(false);
        break;
      case "XINPUT_GAMEPAD_DPAD_LEFT":
        this.change(false);
        break;
      case "XINPUT_GAMEPAD_DPAD_RIGHT":
        this.change(true);
        break;
      case "XINPUT_GAMEPAD_A":
        this.save();
        break;
      case "XINPUT_GAMEPAD_B":
        this.exit();
        break;
      case "XINPUT_GAMEPAD_START":
        this.exit();
        break;
      case "XINPUT_GAMEPAD_LEFT_SHOULDER":
        this.swap(false);
        break;
      case "XINPUT_GAMEPAD_RIGHT_SHOULDER":
        this.swap(true);
        break;
      default:
        this.dispatchEvent(new CustomEvent("unbound"));
        break;
    }
  }
  
  onKBMInput(input){
    switch(input){
      case "ArrowUp":
        this.move(true, false);
        break;
      case "ArrowDown":
        this.move(false, false);
        break;
      case "ArrowLeft":
        this.change(false);
        break;
      case "ArrowRight":
        this.change(true);
        break;
      case "Enter":
        this.save();
        break;
      case "Escape":
        this.exit();
        break;
      case "Mouse3":
        this.exit();
        break;
      default:
        this.dispatchEvent(new CustomEvent("unbound"));
        break;
    }
  }
  
}