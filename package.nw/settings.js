function settings_write_ini(){


         if ($('#menuButton1DisplayOFF').is("[selected='selected']")) { localStorage.menuButton1Display = "false"; }else{ localStorage.menuButton1Display = "true"; }
         if ($('#menuButton2DisplayOFF').is("[selected='selected']")) { localStorage.menuButton2Display = "false"; }else{ localStorage.menuButton2Display = "true"; }
         if ($('#menuButton3DisplayOFF').is("[selected='selected']")) { localStorage.menuButton3Display = "false"; }else{ localStorage.menuButton3Display = "true";}
         if ($('#menuButton4DisplayOFF').is("[selected='selected']")) { localStorage.menuButton4Display = "false"; }else{ localStorage.menuButton4Display = "true"; } 
         if ($('#menuButton5DisplayOFF').is("[selected='selected']")) { localStorage.menuButton5Display = "false"; }else{ localStorage.menuButton5Display = "true"; }
         
         if ($('#exitLauncherOFF').is("[selected='selected']")) { localStorage.exitAfterLaunchGame = "false"; exitAfterLaunchGame = false; } else { localStorage.exitAfterLaunchGame = "true"; exitAfterLaunchGame = true; }

  fs.stat(ff_ini, function(err, stat) {
      if(err == null) {

          var config = ini.parse(fs.readFileSync(ff_ini, 'utf8'));

          if ($('#text_en').is("[selected='selected']")) { config.Language = "en"; }
          else if ($('#text_fr').is("[selected='selected']")) { config.Language = "fr"; }
          else if ($('#text_de').is("[selected='selected']")) { config.Language = "de"; }
          else if ($('#text_it').is("[selected='selected']")) { config.Language = "it"; }
          else if ($('#text_es').is("[selected='selected']")) { config.Language = "es"; }
          else if ($('#text_jp').is("[selected='selected']")) { config.Language = "jp"; }
          else if ($('#text_cn').is("[selected='selected']")) { config.Language = "cn"; }
          else if ($('#text_kr').is("[selected='selected']")) { config.Language = "kr"; }
          else { config.Language = "en" };

          config.Resolution = resolutionList[currrentResolution];

          if ($('#screen_full').is("[selected='selected']")) { config.ScreenMode = "SM_FULLSCREEN"; }
          else if ($('#screen_border').is("[selected='selected']")) { config.ScreenMode = "SM_BORDERLESS"; }
          else if ($('#screen_win').is("[selected='selected']")) { config.ScreenMode = "SM_WINDOW"; }
          else { config.ScreenMode = "SM_FULLSCREEN"; }

          if ($('#quality_low').is("[selected='selected']")) { config.Quality = "VQ_LOW"; }
          else if ($('#quality_medium').is("[selected='selected']")) { config.Quality = "VQ_MEDIUM"; }
          else if ($('#quality_high').is("[selected='selected']")) { config.Quality= "VQ_HIGH"; }
          else { config.Quality = "VQ_MEDIUM"; }

          fs.writeFileSync(ff_ini, ini.stringify(config), 'utf8');
  }
  });

  if (unxIsPresent) {

      config = ini.parse(fs.readFileSync(unx_ini, 'utf16le').slice(1));

      if ($('#dpiFix_Enabled').is("[selected='selected']")) { config.UnX.Display.DisableDPIScaling = true; }
      else if ($('#dpiFix_Disabled').is("[selected='selected']")) { config.UnX.Display.DisableDPIScaling = false; }
      else { config.UnX.Display.DisableDPIScaling = false; }

      if ($('#hide_cursor').is("[selected='selected']")) { config.UnX.Input.ManageCursor = true; }
      else if ($('#show_cursor').is("[selected='selected']")) { config.UnX.Input.ManageCursor = false; }
      else { config.UnX.Input.ManageCursor = true; }

      if ($('#donothing_on_kinput').is("[selected='selected']")) { config.UnX.Input.KeysActivateCursor = false; }
      else if ($('#show_on_kinput').is("[selected='selected']")) { config.UnX.Input.KeysActivateCursor = true; }
      else { config.UnX.Input.KeysActivateCursor = false; }

      config.UnX.Input.CursorTimeout = cursorTimeout;
      
      if ($('#screen_exclu_ON').is("[selected='selected']")) { config.UnX.Display.EnableFullscreen = true; }
      if ($('#screen_exclu_OFF').is("[selected='selected']")) { config.UnX.Display.EnableFullscreen = false; }
      else { config.UnX.Display.EnableFullscreen = true;}
 
      if ($('#flipON').is("[selected='selected']")) { config.UnX.Render.FlipMode = true; }
      else if ($('#flipOFF').is("[selected='selected']")) { config.UnX.Render.FlipMode = false; }
      else { config.UnX.Render.FlipMode = false; }
   
      if ($('#BypassON').is("[selected='selected']")) { config.UnX.Render.BypassIntel = true; }
      else if ($('#BypassOFF').is("[selected='selected']")) { config.UnX.Render.BypassIntel = false; }
      else { config.UnX.Render.BypassIntel = true; }
     
      if ($('#saluteON').is("[selected='selected']")) { config.UnX.Input.FourFingerSalute = true; }
      else if ($('#saluteOFF').is("[selected='selected']")) { config.UnX.Input.FourFingerSalute = false; }
      else { config.UnX.Input.FourFingerSalute = true; }
      
      if ($('#bgMuteON').is("[selected='selected']")) { config.UnX.Audio.BackgroundMute = true; }
      else if ($('#bgMuteOFF').is("[selected='selected']")) { config.UnX.Audio.BackgroundMute = false; }
      else { config.UnX.Audio.BackgroundMute = true; }      
      
      if ($('#reducerON').is("[selected='selected']")) { config.UnX.Stutter.Reduce = true; }
      else if ($('#reducerOFF').is("[selected='selected']")) { config.UnX.Stutter.Reduce = false; }
      else { config.UnX.Stutter.Reduce = true; } 
      
      if ($('#centerON').is("[selected='selected']")) { config.UnX.Window.Center = true; }
      else if ($('#centerOFF').is("[selected='selected']")) { config.UnX.Window.Center = false; }
      else { config.UnX.Window.Center = true; } 

      if ($('#fastexitON').is("[selected='selected']")) { config.UnX.Input.FastExit = true; }
      else if ($('#fastexitOFF').is("[selected='selected']")) { config.UnX.Input.FastExit = false; }
      else { config.UnX.Input.FastExit = true; }       

      fs.writeFileSync(unx_ini, '\ufeff'+ini.stringify(config), 'utf16le');
      
         fs.stat(gamepad_ini, function(err, stat) {
         if(err == null) {
              config = ini.parse(fs.readFileSync(gamepad_ini, 'utf16le').slice(1));     
         }
         else{
              Type = { TextureSet:"", UsesXInput:true } 
              PC = { F1:"Select+Cross", F2:"Select+Circle", F3:"Select+Square", F4:"Select+L1", F5:"Select+R1", ESC:"L2+R2+Select", Fullscreen:"L2+L3" }
              Remap = { XInput_A:"2", XInput_B:"3", XInput_X:"1", XInput_Y:"4", XInput_Start:"10", XInput_Back:"9", XInput_LB:"5", XInput_RB:"6", XInput_LT:"7", XInput_RT:"8", XInput_LS:"11", XInput_RS:"12" }
              Steam = { Screenshot:"Select+R3" }
              Gamepad = { Type, PC, Remap, Steam }
              config = { Gamepad }
         }
             
              if ($('#skin_none').is("[selected='selected']")) { config.Gamepad.Type.TextureSet = ""; }
              else if ($('#skin_glossy').is("[selected='selected']")) { config.Gamepad.Type.TextureSet = 'PlayStation_Glossy'; }
              else if ($('#skin_ps3').is("[selected='selected']")) { config.Gamepad.Type.TextureSet = 'PS3'; }
              else if ($('#skin_ps4').is("[selected='selected']")) { config.Gamepad.Type.TextureSet = 'PS4'; }
              else if ($('#skin_x360').is("[selected='selected']")) { config.Gamepad.Type.TextureSet = 'Xbox360'; }
              else if ($('#skin_xone').is("[selected='selected']")) { config.Gamepad.Type.TextureSet = 'XboxOne'; }
              else { config.Gamepad.Type.TextureSet = ''; }
              
            var combo = [ ["","",""] , ["","",""] , ["","",""] , ["","",""] , ["","",""], ["","",""], ["","",""], ["","",""] ];
               
            for(var i=0;i<combo.length;i++) {
                for(var y=0;y<combo[i].length;y++) {
               
                if ($('#f'+i+'_'+y).is("[xbutton='a']")) { combo[i][y] = "A"; }
                else if ($('#f'+i+'_'+y).is("[xbutton='x']")) { combo[i][y] = "X"; }    
                else if ($('#f'+i+'_'+y).is("[xbutton='y']")) { combo[i][y] = "Y"; }   
                else if ($('#f'+i+'_'+y).is("[xbutton='b']")) { combo[i][y] = "B"; }   
                else if($('#f'+i+'_'+y).is("[xbutton='select']")) { combo[i][y] = "Select"; }     
                else if ($('#f'+i+'_'+y).is("[xbutton='start']")) { combo[i][y] = "Start"; }
                else if ($('#f'+i+'_'+y).is("[xbutton='LB']")) { combo[i][y] = "LB"; }   
                else if ($('#f'+i+'_'+y).is("[xbutton='LT']")) { combo[i][y] = "LT"; }   
                else if ($('#f'+i+'_'+y).is("[xbutton='RB']")) { combo[i][y] = "RB"; }   
                else if ($('#f'+i+'_'+y).is("[xbutton='RT']")) { combo[i][y] = "RT"; }   
                else if ($('#f'+i+'_'+y).is("[xbutton='L']")) { combo[i][y] = "L3"; }    
                else if ($('#f'+i+'_'+y).is("[xbutton='R']")) { combo[i][y] = "R3"; }   
                else if ($('#f'+i+'_'+y).is("[xbutton='up']")) { combo[i][y] = "UP"; }    
                else if ($('#f'+i+'_'+y).is("[xbutton='down']")) { combo[i][y] = "DOWN"; }    
                else if ($('#f'+i+'_'+y).is("[xbutton='left']")) { combo[i][y] = "LEFT"; }    
                else if ($('#f'+i+'_'+y).is("[xbutton='right']")) { combo[i][y] = "UP"; }             

              }
              
              if (( combo[i][1] != "" ) && ( combo[i][0] != "")) {
                combo[i][0] += '+'
              }
              if (( combo[i][2] != "" ) && ( combo[i][1] != "" )){ 
                combo[i][1] += '+'
              }
              else if (( combo[i][2] != "" ) && ( combo[i][0] != "" )) {
                combo[i][0] += '+'
              }
              
            }
  
            config.Gamepad.PC.F1 = combo[0][0]+combo[0][1]+combo[0][2];
            config.Gamepad.PC.F2 = combo[1][0]+combo[1][1]+combo[1][2];
            config.Gamepad.PC.F3 = combo[2][0]+combo[2][1]+combo[2][2];
            config.Gamepad.PC.F4 = combo[3][0]+combo[3][1]+combo[3][2];
            config.Gamepad.PC.F5 = combo[4][0]+combo[4][1]+combo[4][2];
            config.Gamepad.PC.ESC = combo[5][0]+combo[5][1]+combo[5][2];
            config.Gamepad.Steam.Screenshot = combo[6][0]+combo[6][1]+combo[6][2];
            config.Gamepad.PC.Fullscreen = combo[7][0]+combo[7][1]+combo[7][2];
 
            fs.writeFileSync(gamepad_ini, '\ufeff'+ini.stringify(config), 'utf16le');        
         });

         fs.stat(unx_lang, function(err, stat) {
         if(err == null) {
              config = ini.parse(fs.readFileSync(unx_lang, 'utf16le').slice(1));     
         }
         else{ 
              Master = { SoundEffects:"us", Voice:"us", Video:"us" }
              Language = { Master }
              config = { Language }
         }
             
              if ($('#audio_en').is("[selected='selected']")) { config.Language.Master.Voice = "us"; 
                                                                config.Language.Master.SoundEffects = "us"; 
                                                                config.Language.Master.Video = "us"; }
              else if ($('#audio_jp').is("[selected='selected']")) { config.Language.Master.Voice = "jp"; 
                                                                      config.Language.Master.SoundEffects = "jp"; 
                                                                      config.Language.Master.Video = "jp"; }
              else { config.Language.Master.Voice = "us";                                                              
                      config.Language.Master.SoundEffects = "us"; 
                      config.Language.Master.Video = "us"; }
              
              
            fs.writeFileSync(unx_lang, '\ufeff'+ini.stringify(config), 'utf16le');        
         });
         
         console.log(booster_ini);
         fs.stat(booster_ini, function(err, stat) {
         if(err == null) {
              config = ini.parse(fs.readFileSync(booster_ini, 'utf16le').slice(1));    
         }
         else{ 
              FFX = { EntirePartyEarnsAP: false }
              Boost = { FFX }
              config = { Boost }
         }
             
              if ($('#booster_ap_on').is("[selected='selected']")) {  config.Boost.FFX.EntirePartyEarnsAP = true;}
              else if ($('#booster_ap_off').is("[selected='selected']")) { config.Boost.FFX.EntirePartyEarnsAP = false; }
              else { config.Boost.FFX.EntirePartyEarnsAP = false; }
              
            fs.writeFileSync(booster_ini, '\ufeff'+ini.stringify(config), 'utf16le');        
         });

   }

  localStorage.volumeBGM = volumeBGM;

  PlaySound(3);
}

function settings_read_ini(){

  $('.btn').removeAttr( "selected" );
  $('.btn.configurable').removeAttr( "xbutton" );
  
        if (localStorage.menuButton1Display == "false") { $('#menuButton1DisplayOFF').attr('selected', 'selected' ); }else{ $('#menuButton1DisplayON').attr('selected', 'selected' );}
        if (localStorage.menuButton2Display == "false") { $('#menuButton2DisplayOFF').attr('selected', 'selected' ); }else{ $('#menuButton2DisplayON').attr('selected', 'selected' );}
        if (localStorage.menuButton3Display == "false") { $('#menuButton3DisplayOFF').attr('selected', 'selected' ); }else{ $('#menuButton3DisplayON').attr('selected', 'selected' );}
        if (localStorage.menuButton4Display == "false") { $('#menuButton4DisplayOFF').attr('selected', 'selected' ); }else{ $('#menuButton4DisplayON').attr('selected', 'selected' );}
        if (localStorage.menuButton5Display == "false") { $('#menuButton5DisplayOFF').attr('selected', 'selected' ); }else{ $('#menuButton5DisplayON').attr('selected', 'selected' );}
        
        if (exitAfterLaunchGame == false) { $('#exitLauncherOFF').attr('selected', 'selected' ); }else{ $('#exitLauncherON').attr('selected', 'selected' ); }

  fs.stat(ff_ini, function(err, stat) {
      if(err == null) {
  
      var config = ini.parse(fs.readFileSync(ff_ini, 'utf8'));
      
        switch (config.Language) {
            case 'en':
                    $('#text_en').attr('selected', 'selected' ); 
            break;
            case 'fr':
                    $('#text_fr').attr('selected', 'selected' ); 
            break;
            case 'de':
                    $('#text_de').attr('selected', 'selected' ); 
            break;
            case 'it':
                    $('#text_it').attr('selected', 'selected' ); 
            break;
            case 'es':
                    $('#text_es').attr('selected', 'selected' ); 
            break;
            case 'jp':
                    $('#text_jp').attr('selected', 'selected' ); 
            break;
            case 'cn':
                    $('#text_cn').attr('selected', 'selected' ); 
            break;
            case 'kr':
                    $('#text_kr').attr('selected', 'selected' ); 
            break;
            default:
                    $('#text_en').attr('selected', 'selected' );
            break;
        }

        for (i = 0; i < resolutionList.length; i++) {  
          if (config.Resolution == resolutionList[i]) { currrentResolution = i; break; }
          else if ( i == resolutionList.length-1) { currrentResolution = 1; }
        } 
        $("#resolution").text(resolutionList[currrentResolution]);

      switch (config.ScreenMode) {
            case 'SM_FULLSCREEN':
                    $('#screen_full').attr('selected', 'selected' ); 
            break;
            case 'SM_BORDERLESS':
                    $('#screen_border').attr('selected', 'selected' ); 
            break;
            case 'SM_WINDOW':
                    $('#screen_win').attr('selected', 'selected' ); 
            break;
            default:
                    $('#screen_full').attr('selected', 'selected' );
            break;
        }
        
        switch (config.Quality) {
            case 'VQ_HIGH':
                    $('#quality_high').attr('selected', 'selected' ); 
            break;
            case 'VQ_MEDIUM':
                    $('#quality_medium').attr('selected', 'selected' ); 
            break;
            case 'VQ_LOW':
                    $('#quality_low').attr('selected', 'selected' ); 
            break;
            default:
                    $('#quality_medium').attr('selected', 'selected' ); 
            break; 
        }
        
      }
      });
      
      fs.stat(unx_ini, function(err, stat) {
      if(err == null) {
          
          config = ini.parse(fs.readFileSync(unx_ini, 'utf16le').slice(1));
          unxIsPresent = true;
          nbr_page = 3;

          switch (config.UnX.Display.DisableDPIScaling) {
              case true:
                      $('#dpiFix_Enabled').attr('selected', 'selected' ); 
              break;
              case false:
                      $('#dpiFix_Disabled').attr('selected', 'selected' ); 
              break;
              default:
                      $('#dpiFix_Disabled').attr('selected', 'selected' );
              break;
          }
          
          switch (config.UnX.Display.EnableFullscreen) {
              case true:
                      $('#screen_exclu_ON').attr('selected', 'selected' );
              break;
              case false:
                      $('#screen_exclu_OFF').attr('selected', 'selected' );
              break;
              default:
                      $('#screen_exclu_ON').attr('selected', 'selected' );
              break;
          }
          
          switch (config.UnX.Render.FlipMode) {
              case true:
                      $('#flipON').attr('selected', 'selected' ); 
              break;
              case false:
                      $('#flipOFF').attr('selected', 'selected' ); 
              break;
              default:
                      $('#flipOFF').attr('selected', 'selected' );
              break;
          }
          
          switch (config.UnX.Render.BypassIntel) {
              case true:
                      $('#BypassON').attr('selected', 'selected' ); 
              break;
              case false:
                      $('#BypassOFF').attr('selected', 'selected' ); 
              break;
              default:
                      $('#BypassON').attr('selected', 'selected' );
              break;
          }
          
           switch (config.UnX.Audio.BackgroundMute) {
              case true:
                      $('#bgMuteON').attr('selected', 'selected' ); 
              break;
              case false:
                      $('#bgMuteOFF').attr('selected', 'selected' ); 
              break;
              default:
                      $('#bgMuteOFF').attr('selected', 'selected' );
              break;
          }
             
           switch (config.UnX.Stutter.Reduce) {
              case true:
                      $('#reducerON').attr('selected', 'selected' ); 
              break;
              case false:
                      $('#reducerOFF').attr('selected', 'selected' ); 
              break;
              default:
                      $('#reducerON').attr('selected', 'selected' );
              break;
          }
          
          switch (config.UnX.Window.Center) {
              case true:
                      $('#centerON').attr('selected', 'selected' ); 
              break;
              case false:
                      $('#centerOFF').attr('selected', 'selected' ); 
              break;
              default:
                      $('#centerON').attr('selected', 'selected' );
              break;
          }
          
          switch (config.UnX.Input.ManageCursor) {
              case true:
                      $('#hide_cursor').attr('selected', 'selected' ); 
              break;
              case false:
                      $('#show_cursor').attr('selected', 'selected' ); 
              break;
              default:
                      $('#hide_cursor').attr('selected', 'selected' );
              break;
          }
          
          switch (config.UnX.Input.KeysActivateCursor) {
              case true:
                      $('#show_on_kinput').attr('selected', 'selected' ); 
              break;
              case false:
                      $('#donothing_on_kinput').attr('selected', 'selected' ); 
              break;
              default:
                      $('#donothing_on_kinput').attr('selected', 'selected' );
              break;
          }
          
          switch (config.UnX.Input.FourFingerSalute) {
              case true:
                      $('#saluteON').attr('selected', 'selected' ); 
              break;
              case false:
                      $('#saluteOFF').attr('selected', 'selected' ); 
              break;
              default:
                      $('#saluteON').attr('selected', 'selected' ); 
              break;
          }
          
          switch (config.UnX.Input.FastExit) {
              case true:
                      $('#fastexitON').attr('selected', 'selected' ); 
              break;
              case false:
                      $('#fastexitOFF').attr('selected', 'selected' ); 
              break;
              default:
                      $('#fastexitON').attr('selected', 'selected' ); 
              break;
          }
 
          cursorTimeout = parseFloat(config.UnX.Input.CursorTimeout);
          $('#cursortimeout').text(cursorTimeout+"s")

              fs.stat(gamepad_ini, function(err, stat) {
              if(err == null) {
          
                config = ini.parse(fs.readFileSync(gamepad_ini, 'utf16le').slice(1));

                switch (config.Gamepad.Type.TextureSet) {
                case "":
                      $('#skin_none').attr('selected', 'selected' );
                break;
                case "PlayStation_Glossy":
                      $('#skin_glossy').attr('selected', 'selected' ); 
                break;
                case "PS3":
                      $('#skin_ps3').attr('selected', 'selected' );    
                break;
                case "PS4":
                      $('#skin_ps4').attr('selected', 'selected' );    
                break;
                case "Xbox360":
                      $('#skin_x360').attr('selected', 'selected' );    
                break;
                case "XboxOne":
                      $('#skin_xone').attr('selected', 'selected' );    
                break;
                default:
                      $('#skin_none').attr('selected', 'selected' );   
                break;
                }
                    
               
               var combo = [ config.Gamepad.PC.F1.split("+"), config.Gamepad.PC.F2.split("+"), config.Gamepad.PC.F3.split("+"), config.Gamepad.PC.F4.split("+"), config.Gamepad.PC.F5.split("+"), config.Gamepad.PC.ESC.split("+"), config.Gamepad.Steam.Screenshot.split("+"), config.Gamepad.PC.Fullscreen.split("+")  ] 
               
               for(var i=0;i<combo.length;i++) {
                    for(var y=0;y<combo[i].length;y++) {
                    
                                switch (combo[i][y]) {
                                case 'A':
                                case 'Cross':
                                      $('#f'+i+'_'+y).attr('xbutton', 'a' ); 
                                break;
                                case 'B':
                                case 'Circle':
                                      $('#f'+i+'_'+y).attr('xbutton', 'b' );    
                                break;
                                case 'X':
                                case 'Square':
                                      $('#f'+i+'_'+y).attr('xbutton', 'x' );     
                                break;
                                case 'Y':
                                case 'Triangle':
                                      $('#f'+i+'_'+y).attr('xbutton', 'y' );     
                                break;
                                case 'Back':
                                case 'Select':
                                      $('#f'+i+'_'+y).attr('xbutton', 'select' );     
                                break;
                                case 'Start':
                                      $('#f'+i+'_'+y).attr('xbutton', 'start' ); 
                                break;
                                case 'LB':
                                case 'L1':
                                      $('#f'+i+'_'+y).attr('xbutton', 'LB' );    
                                break;
                                case 'LT':
                                case 'L2':
                                      $('#f'+i+'_'+y).attr('xbutton', 'LT' );    
                                break;
                                case 'RB':
                                case 'R1':
                                      $('#f'+i+'_'+y).attr('xbutton', 'RB' );    
                                break;
                                case 'RT':
                                case 'R2':
                                      $('#f'+i+'_'+y).attr('xbutton', 'RT' );    
                                break;
                                case 'L3':
                                      $('#f'+i+'_'+y).attr('xbutton', 'L' );    
                                break;
                                case 'R3':
                                      $('#f'+i+'_'+y).attr('xbutton', 'R' );    
                                break;
                                case 'UP':
                                      $('#f'+i+'_'+y).attr('xbutton', 'up' );    
                                break;
                                case 'DOWN':
                                      $('#f'+i+'_'+y).attr('xbutton', 'down' );    
                                break;
                                case 'LEFT':
                                      $('#f'+i+'_'+y).attr('xbutton', 'left' );    
                                break;
                                case 'RIGHT':
                                      $('#f'+i+'_'+y).attr('xbutton', 'right' );    
                                break;
                               }
                    
                    
                      }
                    }
              }else{
                  $('#skin_none').attr('selected', 'selected' );
              }
              }); 
              
              
              fs.stat(unx_lang, function(err, stat) {
              if(err == null) {
          
                config = ini.parse(fs.readFileSync(unx_lang, 'utf16le').slice(1));

                switch (config.Language.Master.Voice) {
                  case 'jp':
                          $('#audio_jp').attr('selected', 'selected' ); 
                  break;
                  case 'us':
                          $('#audio_en').attr('selected', 'selected' ); 
                  break;
                  default:
                          $('#audio_en').attr('selected', 'selected' ); 
                  break;
                }

              }else{
                  $('#audio_en').attr('selected', 'selected' );          
              }
              
              }); 
              
              fs.stat(booster_ini, function(err, stat) {
              if(err == null) {
          
                config = ini.parse(fs.readFileSync(booster_ini, 'utf16le').slice(1));

                switch (config.Boost.FFX.EntirePartyEarnsAP) {
                  case true:
                          $('#booster_ap_on').attr('selected', 'selected' ); 
                  break;
                  case false:
                          $('#booster_ap_off').attr('selected', 'selected' ); 
                  break;
                  default:
                          $('#booster_ap_off').attr('selected', 'selected' ); 
                  break;
                }

              }else{
                  $('#booster_ap_off').attr('selected', 'selected' );          
              }
              
              });
              
              
              
          } else {
          
          $('#input').hide();
          $('#gamepad_button_skin').hide();
          $('#gamepad_key').hide();
          $('#setting2').hide();
          $('#setting6').hide();
          $('#setting7').hide();
          $('#setting8').hide();
          $('#setting9').hide();
          $('#setting10').hide();
          $('#audio').hide();
          
      }
  });
    
    
}