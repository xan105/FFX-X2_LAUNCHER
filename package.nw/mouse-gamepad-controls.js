function mouse_control() {
  $(".button").on("mouseenter", function(e){
    $(".button").attr("gamepad","");
    PlaySound(0);
  });
  
  $(".button").on("mouseleave", function(e){
    
    if (isGamepadConnected){
       $("#menu li:nth-child("+curPosition+")").children(".button").attr("gamepad","selected");
    }
  });
  
   $("#button0").click(function() { launch(0); });
   $("#button1").click(function() { launch(1); });  
   $("#button2").click(function() { launch(2); });  
   $("#button3").click(function() { launch(3); });  
   $("#button4").click(function() { launch(4); });  
   $("#button5").click(function() { launch(5); });  
   $("#button6").click(function() { launch(6); }); 
   $("#button7").click(function() { launch(7); }); 
   
   $(".cancel_button").click(function() { 
              if (insideSettings){  exit_settings(); }
   });
   
   $("#save_button").click(function() { 
                save_settings();
   });
   
   $("#changePage_button").click(function() { 
                change_page();
   });
   
   
   var xbutton = undefined;
   $(".configurable").click(function(event, noPulse) {  
         $('#popup').popup('show');
         $('#select-gamepad-button').show();
         xbutton = $(this);
         if (noPulse === undefined) { setTimeout(function(){xbutton.removeAttr( "selected" );}, 200); }
   });
   
         $("#LT").click(function(){xbutton.attr("xbutton","LT" ); $('#popup').popup('hide');$('#select-gamepad-button').hide();});
         $("#RT").click(function(){xbutton.attr("xbutton","RT" ); $('#popup').popup('hide');$('#select-gamepad-button').hide();});
         $("#LB").click(function(){xbutton.attr("xbutton","LB" ); $('#popup').popup('hide');$('#select-gamepad-button').hide();});
         $("#RB").click(function(){xbutton.attr("xbutton","RB" ); $('#popup').popup('hide');$('#select-gamepad-button').hide();});
         $("#xleft").click(function(){xbutton.attr("xbutton","left" ); $('#popup').popup('hide');$('#select-gamepad-button').hide();});
         $("#xup").click(function(){xbutton.attr("xbutton","up" ); $('#popup').popup('hide');$('#select-gamepad-button').hide();});
         $("#xdown").click(function(){xbutton.attr("xbutton","down" ); $('#popup').popup('hide');$('#select-gamepad-button').hide();});
         $("#xright").click(function(){xbutton.attr("xbutton","right" ); $('#popup').popup('hide');$('#select-gamepad-button').hide();});
         $("#a").click(function(){xbutton.attr("xbutton","a" ); $('#popup').popup('hide');$('#select-gamepad-button').hide();});
         $("#b").click(function(){xbutton.attr("xbutton","b" ); $('#popup').popup('hide');$('#select-gamepad-button').hide();});
         $("#y").click(function(){xbutton.attr("xbutton","y" ); $('#popup').popup('hide');$('#select-gamepad-button').hide();});
         $("#x").click(function(){xbutton.attr("xbutton","x" ); $('#popup').popup('hide');$('#select-gamepad-button').hide();});
         $("#L").click(function(){xbutton.attr("xbutton","L" ); $('#popup').popup('hide');$('#select-gamepad-button').hide();});
         $("#select").click(function(){xbutton.attr("xbutton","select" ); $('#popup').popup('hide');$('#select-gamepad-button').hide();});
         $("#start").click(function(){xbutton.attr("xbutton","start" ); $('#popup').popup('hide');$('#select-gamepad-button').hide();});
         $("#R").click(function(){xbutton.attr("xbutton","R" ); $('#popup').popup('hide');$('#select-gamepad-button').hide();});
  
   $(".btn").click(function() { 
   
        $(this).parent().find(" .btn[selected='selected'] ").removeAttr( "selected" ); $(this).attr("selected","selected" ); PlaySound(0); 
   
         if ($(this).parent().find(" #resolution_setting ").length>0) {  
                  if($(this).is(':contains("+")'))  {
                    change_resolution(1);
                  }
                  else if($(this).is(':contains("-")')) {
                    change_resolution(-1);
                  }
                  var that = $(this);
                  setTimeout(function(){that.removeAttr( "selected" );}, 200);
          }
            
          else if ($(this).parent().find(" #timeout_setting ").length>0) {  
                  if($(this).is(':contains("+")'))  {
                    change_timeout(1);
                  }
                  else if($(this).is(':contains("-")')) {
                      change_timeout(-1);
                  }
                  var that = $(this);
                  setTimeout(function(){that.removeAttr( "selected" );}, 200);
          } 
              
          else if ($(this).parent().find(" #volume_setting ").length>0) {  
        
                  if($(this).is(':contains("+")'))  {
                      updateVolumeBGM(0.1)
                  }
                  else if($(this).is(':contains("-")')) {
                      updateVolumeBGM(-0.1)
                  }
                  var that = $(this);
                  setTimeout(function(){that.removeAttr( "selected" );}, 200);
          } 

   });
   
}


    function getGamepadInput() {
    
        gamepad = navigator.getGamepads()[0];
    
        for(var i=0;i<gamepad.buttons.length;i++) {
        
// Button Pressed (No 'Auto Fire')
            if (gamepad.buttons[0].pressed) { LastFrameButtonStatus[0] = true; }                                                                           
            else if (!gamepad.buttons[0].pressed && LastFrameButtonStatus[0] && AFirstPressed) { 
                    if (!insideSettings) { launch(convert()); }else if(insideSettings){ save_settings(); }
                    LastFrameButtonStatus[0] = false;  
            } // A

            else if (gamepad.buttons[0].pressed) { LastFrameButtonStatus[0] = true; }  // Prevent Launcher from insta closing/lauching game if user push for too long A when using A as front button gamepad detection
            else if (!gamepad.buttons[0].pressed && LastFrameButtonStatus[0] ) { AFirstPressed = true; LastFrameButtonStatus[0] = false; }
                
            else if (gamepad.buttons[1].pressed) { LastFrameButtonStatus[1] = true;}
            else if (!gamepad.buttons[1].pressed && LastFrameButtonStatus[1] ) { if (insideSettings){ exit_settings(); } LastFrameButtonStatus[1] = false; } // B
            
            else if (gamepad.buttons[2].pressed) { LastFrameButtonStatus[2] = true;}
            else if (!gamepad.buttons[2].pressed && LastFrameButtonStatus[2] ) { if(insideSettings && unxIsPresent){ configure_button(); } LastFrameButtonStatus[2] = false; } // X
                       
            else if (gamepad.buttons[3].pressed) { LastFrameButtonStatus[3] = true;}
            else if (!gamepad.buttons[3].pressed && LastFrameButtonStatus[3] ) { if (insideSettings && unxIsPresent && !insideLauncherSettings){ change_page(); } LastFrameButtonStatus[3] = false; } // Y
                        
            else if (gamepad.buttons[4].pressed) { LastFrameButtonStatus[4] = true;}
            else if (!gamepad.buttons[4].pressed && LastFrameButtonStatus[4] ) { LastFrameButtonStatus[4] = false; } // LB
                       
            else if (gamepad.buttons[5].pressed) { LastFrameButtonStatus[5] = true;}
            else if (!gamepad.buttons[5].pressed && LastFrameButtonStatus[5] ) { LastFrameButtonStatus[5] = false; } // RB
                       
            else if (gamepad.buttons[6].pressed) { LastFrameButtonStatus[6] = true;}
            else if (!gamepad.buttons[6].pressed && LastFrameButtonStatus[6] ) { LastFrameButtonStatus[6] = false; } // LT
                       
            else if (gamepad.buttons[7].pressed) { LastFrameButtonStatus[7] = true;}
            else if (!gamepad.buttons[7].pressed && LastFrameButtonStatus[7] ) { LastFrameButtonStatus[7] = false; } // RT
                       
            else if (gamepad.buttons[8].pressed) { LastFrameButtonStatus[8] = true;}
            else if (!gamepad.buttons[8].pressed && LastFrameButtonStatus[8] ) { LastFrameButtonStatus[8] = false; } // Back
                       
            else if (gamepad.buttons[9].pressed) { LastFrameButtonStatus[9] = true;}
            else if (!gamepad.buttons[9].pressed && LastFrameButtonStatus[9] ) { LastFrameButtonStatus[9] = false; } // Start
                       
            else if (gamepad.buttons[10].pressed) { LastFrameButtonStatus[10] = true;}
            else if (!gamepad.buttons[10].pressed && LastFrameButtonStatus[10] ) { LastFrameButtonStatus[10] = false; } // JoyLeftButton (1)
                        
            else if (gamepad.buttons[11].pressed) { LastFrameButtonStatus[11] = true;}
            else if (!gamepad.buttons[11].pressed && LastFrameButtonStatus[11] ) { LastFrameButtonStatus[11] = false; } // JoyRightButton (2)

// Button Pressed ('Auto Fire') 
            else if (gamepad.buttons[12].pressed) { 
                  if (!insideSettings) { menuSelect(-1)}
                  else if(insideSettings) { settingSelect(-1) } 
            } // D-Pad up
            else if (gamepad.buttons[13].pressed) { 
                  if (!insideSettings) { menuSelect(1)} 
                  else if(insideSettings) { settingSelect(1) }
            } // D-Pad Down
            else if (gamepad.buttons[14].pressed) { if(insideSettings) { updateSetting(-1) } } // D-Pad Left
            else if (gamepad.buttons[15].pressed) { if(insideSettings) { updateSetting(1) } } // D-Pad Right
        }
 
        for(var i=0;i<gamepad.axes.length; i+=2) {
 
            if (gamepad.axes[0] == -1 ) { if(insideSettings) { updateSetting(-1) } } //Joy1 Left
            else if (gamepad.axes[0] == 1 ) { if(insideSettings) { updateSetting(1) } } //Joy1 Right
            else if (gamepad.axes[1] == -1 ) { 
                  if (!insideSettings) { menuSelect(-1)}
                  else if(insideSettings) { settingSelect(-1) }  
            } //Joy1 Up
            else if (gamepad.axes[1] == 1 ) { 
                  if (!insideSettings) { menuSelect(1)} 
                  else if(insideSettings) { settingSelect(1) }
             } //Joy1 Down 
            
            if (gamepad.axes[2] == -1 ) {} //Joy2 Left
            else if (gamepad.axes[2] == 1 ) {} //Joy2 Right
            else if (gamepad.axes[3] == -1 ) {} //Joy2 Up
            else if (gamepad.axes[3] == 1 ) {} //Joy2 Down 
        }
    }