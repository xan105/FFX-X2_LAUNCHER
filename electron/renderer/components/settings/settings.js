import { $select } from "@xan105/vanilla-query";
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
	<div class="help" data-title="">
		<div class="content">
			<div class="text"></div>
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
	
	<div class="options">
    <section id="settings-game">
      <ul>
      </ul>
    </section>
    <section id="settings-launcher">
      <ul>
      </ul>
    </section>  
	</div>
</div>
`;

export default class WebComponent extends HTMLElement {

  #helpHint;
  #options;
  #settings;

  constructor() {
    super();
    this.innerHTML = html;
    this.#helpHint = $select(".container .help", this);
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
    this.#options.$selectAll("li .next").forEach((el) => {
      el.$click(function(){
        const select = this.$parent(".right").$select("select");
        const max = select.options.length;
        if(max === 0) return;
        const current = select.selectedIndex == -1 ? 0 : select.selectedIndex; //select first entry if none
        const next = current + 1;
        const index = next > max - 1 ? 0 : next; //reset when out of range
        select.options[index].selected = true;
        select.$trigger("change");  
      });
    }); 
      
    this.#options.$selectAll("li .previous").forEach((el) => {
      el.$click(function(){
        const select = this.$parent(".right").$select("select");
        const max = select.options.length;
        if(max === 0) return;
        const current = select.selectedIndex == -1 ? 0 : select.selectedIndex; //select first entry if none
        const next = current - 1;
        const index = next < 0 ? max - 1 : next; //reset when out of range
        select.options[index].selected = true;
        select.$trigger("change");  
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
  
  
  async populateAvailableDisplayResolution(){

    const el = this.#options.$select("#settings-game li[data-id=\"Resolution\"]");
    const select = el.$select(".container .right select");
    
    if (select.options.length > 0) return;
    try{

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
    this.populateAvailableDisplayResolution().catch(console.error);
    
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
          li.$select(".left label").$text(l10n.settings[id].display);
          li.$attr("data-hint", l10n.settings[id].hint);
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

    this.$parent("#settings").$fadeIn(500).then(()=>{
      this.#options.scrollTo({top: 0, behavior: "smooth"});
    });
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
    this.$parent("#settings").$fadeOut(450);
  }
  
  move(climb = false){
    
    const root = this.#options.$select("#settings-game");
    const current = root.$select("li.active") ??
                    root.$selectAll("li").at(climb ? 1 : -1); //default pos will result in first el in next                   
    current.$removeClass("active");

    const next = climb ? current.$prev() : current.$next();
    next.$toggleClass("active");
    
    root.scrollIntoView();
    ipcRenderer.gamepadVibrate().catch(console.error);
  }
  
  change(next = false){
    
    const root = this.#options.$select("#settings-game");
    const current = root.$select("li.active");
    if(!current) return;
    
    if(next)
      current.$select("li .next").$click();
    else
      current.$select("li .previous").$click();

    ipcRenderer.gamepadVibrate().catch(console.error);
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
    }
  }
  
}