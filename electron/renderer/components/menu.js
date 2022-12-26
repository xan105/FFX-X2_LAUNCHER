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

export default class Component extends HTMLElement {

  constructor() {
    super();
    this.innerHTML = html;
    this.menu = $select("#mainMenuSelection .menu", this);
    
    this.events = [];
  }

  connectedCallback() {
    this.menu.$selectAll("li").forEach((el) => {
      
      this.events[0] = this.onClick.bind(this, el);
      el.$click(this.events[0]);
      
      this.events[1] = this.active.bind(this, el);
      el.$on("mouseenter", this.events[1]);
      
      this.events[2] = this.inactive.bind(this, el);
      el.$on("mouseleave", events[2]); 
    });
  }
  
  disconnectedCallback() {
    this.menu.$selectAll("li").forEach((el) => {  
      el.$off("click", this.events[0]);
      el.$off("mouseenter", this.events[1]);
      el.$off("mouseleave", this.events[2]); 
    });
  }
  
  active(el){
    this.menu.$select("li.active")?.$removeClass("active");
    el.$addClass("active");
  }
  
  inactive(el){
    el.$removeClass("active");
  }
  
  onClick(el){
    const name = el.$select("div").$attr("data-name");
    window.ipcRenderer.menuAction(name)
    .catch((err)=>{ console.error(err) });
  }

  move(climb = false){
    
    const current = this.menu.$select("li.active") ??
                    this.menu.$selectAll("li").at(climb ? 1 : -1); //default pos will result in first el in next
                          
    current.$removeClass("active");

    const next = climb ? current.$prev() ?? 
                 this.menu.$selectAll("li").at(-1) : //restart from bottom
                 current.$next() ?? 
                 this.menu.$selectAll("li").at(0); //restart from top

    next.$toggleClass("active");
  }

  enter(){
    const current = this.menu.$select("li.active"); 
    current?.$removeClass("active")?.$click(); 
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
    }
  }
}