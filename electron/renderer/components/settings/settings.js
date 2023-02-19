import { $select } from "@xan105/vanilla-query";
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
	<div class="footer"></div>
	
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
        const li = this.#options.$select(`#settings-${name}`).$append(template);
        li.$attr("data-id", option.id);
        if(option.unx) li.$attr("data-unx", option.unx);
        
        const select = li.$select(".container .right select");
        for (const value of option.values){
          const opt = document.createElement("option");
          opt.value = value;
          opt.text = value; //debug delete me
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

    const root = this.#options.$select("#settings-game");
    const list = root.$selectAll("li");

    for (const li of list){
      try{
        const id = li.$attr("data-id");
        const unx =  li.$attr("data-unx");
        if (unx && !this.#settings.unx) li.$hide();
        const value = unx ? this.#settings.unx[unx][id] : this.#settings[id];
        console.log("set: ", id, value);
        li.$select(`.right select option[value="${value}"`).selected  = true;
      }catch(err){
        console.error(err);
        //continue;
      }
    }

    this.$parent("#settings").$fadeIn(500).then(()=>{
      this.#options.scrollTo({top: 0, behavior: "smooth"});
    });
  }
  
  save(){
    const root = this.#options.$select("#settings-game");
    const list = root.$selectAll("li");
    
    for (const li of list){
      try{
        
        if (li.$isHidden()) continue;
        
        const id = li.$attr("data-id");
        const unx =  li.$attr("data-unx");
        
        let value = li.$select(".right select").value;
        if(value === "true") value = true;
        else if(value === "false") value = false;

        if(unx){
          this.#settings.unx[unx][id] = value;
          console.log("changed: ", unx, id, value);
        } else {
          this.#settings[id] = value;
          console.log("changed: ", id, value);
        }

      }catch(err){
        console.error(err);
        //continue;
      }
    }
    
    console.log(this.#settings);

    ipcRenderer.settingsWrite(this.#settings)
    .catch(console.error)
    .finally(this.$parent("#settings").$fadeOut(450))
  }
  
  hide(){
    this.$parent("#settings").$fadeOut(450);
  }
  
  onGamepadInput(input){
    switch(input){
      case "XINPUT_GAMEPAD_B":
        this.hide();
        break;
      case "XINPUT_GAMEPAD_START":
        this.hide();
        break;
    }
  }
  
  onKBMInput(input){
    switch(input){
      case "Enter":
        this.save();
        break;
      case "Escape":
        this.hide();
        break;
      case "Mouse3":
        this.hide();
        break;
    }
  }
  
}