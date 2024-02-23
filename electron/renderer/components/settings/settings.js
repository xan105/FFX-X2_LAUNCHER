/*
Copyright (c) Anthony Beaumont
This source code is licensed under the GNU GENERAL PUBLIC LICENSE Version 3
found in the LICENSE file in the root directory of this source tree.
*/

import { $select, $define } from "@xan105/vanilla-query";
import scrollIntoView from "smooth-scroll";
import { localize } from "./l10n/l10n.js";
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

<footer>
  <ul>
    <li>
      <div class="gamepad dpad vertical"></div>
      <span>Select</span>
    </li>
    <li>
      <div class="gamepad dpad horizontal"></div>
      <span>Change</span>
    </li>
    <li class="action">
      <div class="gamepad btn A"></div>
      <span>Save</span>
    </li>
    <li class="action">
      <div class="gamepad btn B"></div>
      <span>Cancel</span>
    </li>
  </ul>
</footer>
`;

export default class WebComponent extends HTMLElement {

  #options;
  #settings;
  
  constructor() {
    super();
    this.innerHTML = html;
    this.scrollLast = 0;
    $define(this);
    
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
      el.$on("mouseenter", this.#setActive.bind(this, el, true));
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
        
        this.#options.scrollTo({top: 0, behavior: "auto"});
        this.$select(".container .help .text").$text("");
        
        this.dispatchEvent(new CustomEvent("swaped"));
      });
    });
    
    this.$select(".gamepad.btn.A").$parent().$click(() => this.onGamepadInput("XINPUT_GAMEPAD_A"));
    this.$select(".gamepad.btn.B").$parent().$click(() => this.onGamepadInput("XINPUT_GAMEPAD_B"));
  }
  
  disconnectedCallback() {
  
    this.#options.$selectAll("li").forEach((el) => {
      el.$off("mouseenter");
    });
  
    this.#options.$selectAll("li .next").forEach((el) => {
      el.$off("click");
    });
    
    this.#options.$selectAll("li .previous").forEach((el) => {
      el.$off("click");
    });
    
    this.$selectAll("nav ul li").forEach((el)=>{
      el.$off("click");
    });
    
    this.$select(".gamepad.btn.A").$parent().$off("click");
    this.$select(".gamepad.btn.B").$parent().$off("click");
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
    const l10n = await localize(this.#settings.Language);

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
        }catch(err){
          console.warn(err);
        }
      }
    }

    this.$select(".container .help .text").$text("");
    this.$fadeIn(800);
  }
  
  #save(){
    const settings = {
      game: this.#options.$select("#settings-game").$selectAll("li"),
      launcher: this.#options.$select("#settings-launcher").$selectAll("li")
    };
    
    for(const [name, list] of Object.entries(settings)){
      for (const li of list){
        try{
          
          const id = li.$attr("data-id");
          const unx =  li.$attr("data-unx");
          const value = li.$select(".right select").value;

          if(name === "launcher"){
            localStorage.setItem(id, value);
          } else if(unx){
            if(!this.#settings.unx) continue;
            this.#settings.unx[unx] ??= Object.create(null);
            this.#settings.unx[unx][id] = value;
          } else {
            this.#settings[id] = value;
          }

        }catch(err){
          console.error(err);
        }
      }
    }

    ipcRenderer.settingsWrite(this.#settings)
    .catch(console.error)
    .finally(() => { 
      this.dispatchEvent(new CustomEvent("saved"));
      this.#hide();
    });
  }
  
  #exit(){
    this.dispatchEvent(new CustomEvent("exit"));
    this.#hide();
  }
  
  #hide(){
    this.#options.$selectAll("li.active").forEach(el => el.$removeClass("active"));
    this.$select("nav ul li:first-child").$addClass("active").$next().$removeClass("active");
    this.#options.$select("#settings-game").$addClass("active").$next().$removeClass("active");
    this.#options.scrollTo({top: 0, behavior: "auto"});
    this.$fadeOut(600);
  }

  #setHelp(el){
    const hint = el.$select(".left label").$attr("data-hint");
    if(hint) this.$select(".container .help .text").$text(hint);
  }
  
  #setActive(el, mouse = false){
    //scrollIntoView() trigger mouse event
    if(mouse && Date.now() <= this.scrollLast + 100) return;
  
    this.#options.$selectAll("li.active").forEach(el => el.$removeClass("active"));
    this.#setHelp(el);
    
    if(!mouse){
      el.$addClass("active");
      this.dispatchEvent(new CustomEvent("selected"));
    }
  }
  
  #move(climb, rumble = true){
    const section = this.#options.$selectAll("section").find(el => !el.$isHidden());
    const current = section.$select("li.active") ??
                    section.$selectAll("li").at(climb ? 1 : -1); //default pos will result in first el in next                   
    
    const next = climb ? current.$prevUntilVisible() : current.$nextUntilVisible();
    this.#setActive(next, false);
    
    //scrollIntoView() trigger mouse event
    scrollIntoView(next, { 
      behavior: "auto",
      block: "nearest",
      inline: "start",
      scrollMode: "if-needed"
    }).then(()=>{
      this.scrollLast = Date.now();
    });

    if(rumble) ipcRenderer.gamepadVibrate().catch(console.error);
  }
  
  #change(next = false){
    const section = this.#options.$selectAll("section").find(el => !el.$isHidden());
    const current = section.$select("li.active");
    if(!current) {
      this.dispatchEvent(new CustomEvent("deny"));
      return;
    }
    
    const direction = next ? ".next" : ".previous";
    current.$select(`li ${direction}`).$click();
  }
  
  #swap(next = false){
    const direction = next ? "last-child" : "first-child";
    this.$select(`nav ul li:${direction}`).$click();
  }
  
  onGamepadInput(input){
    switch(input){
      case "XINPUT_GAMEPAD_DPAD_UP":
        this.#move(true);
        break;
      case "XINPUT_GAMEPAD_DPAD_DOWN":
        this.#move(false);
        break;
      case "XINPUT_GAMEPAD_DPAD_LEFT":
        this.#change(false);
        break;
      case "XINPUT_GAMEPAD_DPAD_RIGHT":
        this.#change(true);
        break;
      case "XINPUT_GAMEPAD_A":
        this.#save();
        break;
      case "XINPUT_GAMEPAD_B":
        this.#exit();
        break;
      case "XINPUT_GAMEPAD_START":
        this.#exit();
        break;
      case "XINPUT_GAMEPAD_LEFT_SHOULDER":
        this.#swap(false);
        break;
      case "XINPUT_GAMEPAD_RIGHT_SHOULDER":
        this.#swap(true);
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
      case "ArrowLeft":
        this.#change(false);
        break;
      case "ArrowRight":
        this.#change(true);
        break;
      case "Enter":
        this.#save();
        break;
      case "Escape":
        this.#exit();
        break;
      case "Mouse3":
        this.#exit();
        break;
    }
  }
  
}