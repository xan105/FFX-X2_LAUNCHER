var win = nw.Window.get();
var fs = require('fs');
var os = require('os');
var path = require('path');
var nwPath = process.execPath;
var nwDir = path.dirname(nwPath);
var ini = require(nwDir+'\\package.nw\\lib\\node_modules\\ini');

var ffi = require(nwDir+'\\package.nw\\lib\\node_modules\\ffi');
var ref = require(nwDir+'\\package.nw\\lib\\node_modules\\ref');
var StructType = require(nwDir+'\\package.nw\\lib\\node_modules\\ref-struct');
var ArrayType = require(nwDir+'\\package.nw\\lib\\node_modules\\ref-array');

  var homedir = require(nwDir+'\\package.nw\\lib\\node_modules\\os-homedir');
  var ff_ini = homedir()+"\\Documents\\SQUARE ENIX\\FINAL FANTASY X&X-2 HD Remaster\\GameSetting.ini"; 
  var unx_ini = nwDir+'\\UnX.ini';
  var gamepad_ini = nwDir+'\\unx_gamepad.ini';
  var unx_lang = nwDir+'\\UnX_Language.ini';
  var launcher_ini = nwDir+'\\launcher.ini';
  
var isGamepadConnected = false;
var gamepad = undefined;
var LastFrameButtonStatus=[];
var AFirstPressed = false;
var insideSettings = false;
var insideLauncherSettings = false;
var unxIsPresent = false;
var curPosition = 0;
var curPosition_setting = 1;
var page = 1;
var nbr_page = 1;
var isRunning = false;
var resolutionList = [];
var currrentResolution = undefined;
var cursorTimeout = 0.0;
var volumeBGM = 0.3;
 if (localStorage.getItem("volumeBGM") === null){}
 else
 {
  volumeBGM = parseFloat(localStorage.volumeBGM);
 }

  $(document).ready(function() { 
  
  updateVolumeBGM(0);
  mouse_control();
  $('#popup').popup();
  
  GetResolutionList();

        if (localStorage.menuButton1Display == "false") { $('#button0').parent().detach() }
        if (localStorage.menuButton2Display == "false") { $('#button2').parent().detach() }
        if (localStorage.menuButton3Display == "false") { $('#button1').parent().detach() }
        if (localStorage.menuButton4Display == "false") { $('#button3').parent().detach() }
        if (localStorage.menuButton5Display == "false") { $('#button4').parent().detach() }



  //win.enterKioskMode(); //fullscreen
  
  
  if(!!navigator.getGamepads){

    $(window).on("gamepadconnected", function() {
                    isGamepadConnected = true;
                    $("#prompt").css("visibility","hidden")
                    cursorPosInit2FirstElem();
                    gamepad = navigator.getGamepads()[0];
                    for (i = 0; i < gamepad.buttons.length-4; i++) {
                      LastFrameButtonStatus[i] = false;
                    }
                    UserInput = window.setInterval(getGamepadInput,100);
    });

    $(window).on("gamepaddisconnected", function() {
        isGamepadConnected = false;
        $("#prompt").css("visibility","visible")
        $(".button").attr("gamepad","");
        window.clearInterval(UserInput);
    });
  }
  
});

function GetResolutionList(){

  var n = 50;

  var width = ref.types.int
  var height = ref.types.int

  var resolution = StructType({
    width: ref.types.int,
    height: ref.types.int
  })

  var table = ArrayType(resolution)

  var resolutionListing = new table(n)


  var lib = ffi.Library(nwDir+'\\package.nw\\dll\\ResolutionList\\ResolutionList.dll', {
   GetResolutionList: ["void", [table]]
  });

  lib.GetResolutionList(resolutionListing);

  var prev = undefined;
  for(var i=0;i<n;i++) {

  rez = resolutionListing[i].width+'*'+resolutionListing[i].height

  if ( rez == prev ) {  }else { resolutionList.push(rez);}

  prev = rez
  }
}


function updateVolumeBGM(i){

            var audio = document.getElementById('bgm');
    
               var volume = (volumeBGM+i)
               if (volume <= 0) { volume = 0 }
               else if (volume >= 1) { volume = 1 }

               audio.volume= volume.toFixed(2);
               volumeBGM= audio.volume;
               $('#volume').text(volumeBGM*100+"%");
}

function PlaySound(i){

            var audio = document.getElementById('sfx');
            var source = document.getElementById('oggSource');
            
            audio.volume=1
            switch (i){
                  case 0:
                      source.src='resources/sound/sfx_select.ogg'
                  break;
                  case 1:
                      source.src='resources/sound/sfx_cancel.ogg'
                  break;
                  case 2:
                      source.src='resources/sound/sfx_enter.ogg'
                  break;
                  case 3:
                      source.src='resources/sound/sfx_save.ogg'
                      audio.volume=0.5
                  break;
                  case 4:
                      source.src='resources/sound/sfx_change_page.ogg'
                      audio.volume=0.5
                  break;
            }
    
                audio.load();
                audio.play();
}


function convert(){

if ( $("#menu li:nth-child("+curPosition+")").children('#button0[gamepad="selected"]').length>0 )
{
  launch(0);
}
else if ( $("#menu li:nth-child("+curPosition+")").children('#button1[gamepad="selected"]').length>0 )
{
  launch(1);
}
else if ( $("#menu li:nth-child("+curPosition+")").children('#button2[gamepad="selected"]').length>0 )
{
  launch(2);
}
else if ( $("#menu li:nth-child("+curPosition+")").children('#button3[gamepad="selected"]').length>0 )
{
  launch(3);
}
else if ( $("#menu li:nth-child("+curPosition+")").children('#button4[gamepad="selected"]').length>0 )
{
  launch(4);
}
else if ( $("#menu li:nth-child("+curPosition+")").children('#button5[gamepad="selected"]').length>0 )
{
  launch(5);
}
else if ( $("#menu li:nth-child("+curPosition+")").children('#button6[gamepad="selected"]').length>0 )
{
  launch(6);
}
else if ( $("#menu li:nth-child("+curPosition+")").children('#button7[gamepad="selected"]').length>0 )
{
  launch(7);
}

}


function launch(button_id){

var spawn = require("child_process").spawn

      switch(button_id) {

        case 0:
                file = nwDir+'\\FFX.exe';
                var exec = spawn(file,{stdio:[ 'ignore', 'ignore', 'ignore' ], detached: true});
                exec.unref(); 
                win.close(); 
        break;
        case 1:
                file = nwDir+'\\FFX.exe';
                var exec = spawn(file,['_ECalm'],{stdio:[ 'ignore', 'ignore', 'ignore' ], detached: true});
                exec.unref();
                win.close(); 
        break;
        case 2:
                file = nwDir+'\\FFX-2.exe';
                var exec = spawn(file,{stdio:[ 'ignore', 'ignore', 'ignore' ], detached: true});
                exec.unref(); 
                win.close(); 
        break;
        case 3:
                file = nwDir+'\\FFX-2.exe';
                var exec = spawn(file,['FFX2_LASTMISSION'],{stdio:[ 'ignore', 'ignore', 'ignore' ], detached: true});
                exec.unref(); 
                win.close(); 
        break;
        case 4:
                file = nwDir+'\\FFX&X-2_Will.exe';
                var exec = spawn(file,{stdio:[ 'ignore', 'ignore', 'ignore' ], detached: true});
                exec.unref(); 
                win.close(); 
        break;
        case 5:
                win.close(); 
        break;
        case 6:
                      settings_read_ini();       
                      setTimeout(function() {
                      enter_launcher_settings();
                      }, 100); 
                      
                      
        break;
        case 7:
                      settings_read_ini();       
                      setTimeout(function() {
                      enter_settings();
                      }, 100); 
        break;
      }             
}


function enter_launcher_settings(){

       insideSettings = true;
       insideLauncherSettings = true;
       PlaySound(2);
      
      if (isGamepadConnected){
          $("#setting31").find(".cursor").css("visibility","visible")
          curPosition_setting = 31;
       }
      

    $('.page').hide();
    $('#launcher_settings').show();
    $('.next_page').hide(); 
    $('#page_indicator').hide();
    $('#settings').fadeIn("slow"); 

}

function enter_settings(){
 
       if (insideLauncherSettings){ $('#launcher_settings').hide(); insideLauncherSettings = false;}
       insideSettings = true;
       PlaySound(2);
       $("#settings .container").find(".cursor").css("visibility","hidden")

       if (isGamepadConnected){
          $("#setting1").find(".cursor").css("visibility","visible")
          curPosition_setting = 1;
       }

       page = 1;
       $('.page').hide();
       $('#page'+page).show();
       if (nbr_page == 1){
          $('#page_indicator').hide();
          $('.next_page').hide();
       }
       else{
          $('.next_page').show();
          $('#page_indicator').show();
          $('#page_indicator').text(page+'/'+nbr_page);
       }    
  
  $('#settings').fadeIn("slow"); 
  
    
}

function exit_settings(){

      insideSettings = false;
      insideLauncherSettings = false;
      PlaySound(1);
      $('#settings').fadeOut("slow");
      $('#launcher_settings').hide();
      
}

function save_settings(){

    settings_write_ini();
    insideSettings = false;
    $('#settings').fadeOut("slow");

}

function change_resolution(i) {

    if (i == -1) {
        currrentResolution--;
        if (currrentResolution <= 0) { currrentResolution = 0 }
    }
    else if (i == 1) {
        currrentResolution++;
        if (currrentResolution >= resolutionList.length-1) { currrentResolution = resolutionList.length-1 }
    }
  $("#resolution").text(resolutionList[currrentResolution]);
  
}

function change_timeout(i){

    if (i == -1) {
        cursorTimeout -= 0.5;
        if (cursorTimeout <= 0) { cursorTimeout = 0 }
    }
    else if (i == 1) {
       cursorTimeout += 0.5;
       if (cursorTimeout >= 60) { cursorTimeout = 60 }
    }
    $('#cursortimeout').text(cursorTimeout+"s");

}

function configure_button(){

 if ( curPosition_setting == 11 || curPosition_setting == 12 || curPosition_setting == 13 || curPosition_setting == 14 || curPosition_setting == 15) {
 
  var id = $("#setting"+curPosition_setting).find(" .btn[selected='selected'] ").attr('id');

  $("#"+id).trigger("click", [false]);
 
 }

}