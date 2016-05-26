function cursorPosInit2FirstElem(){

    $(".button").attr("gamepad","");
    $("#menu").find("li").first().find(".button").attr("gamepad","selected");
    curPosition = 1;
    PlaySound(0);
    if (insideSettings){
      if (insideLauncherSettings){ 
        $("#setting31").find(".cursor").css("visibility","visible")
        curPosition_setting = 31;
      }
      else if (page == 1){ 
         $("#setting1").find(".cursor").css("visibility","visible")
         curPosition_setting = 1;
      }
      else if (page == 2){ 
         $("#setting11").find(".cursor").css("visibility","visible")
         curPosition_setting = 12;
      }
      else if (page == 3){ 
         $("#setting1").find(".cursor").css("visibility","visible")
         curPosition_setting = 22;
      }
    }                 
}

function change_page(){
  
    $('#page'+page).hide();
    page++;
    
    if (page == nbr_page+1) {
       page = 1;
    }

    $('#page'+page).show();
    $('#page_indicator').text(page+'/'+nbr_page);
    
    $(".cursor").css("visibility","hidden")
    if (page == 1){
        curPosition_setting = 1;
    }
    else if (page == 2){
        curPosition_setting = 12;
    }
    else if (page == 3){
        curPosition_setting = 22;
    }
    if (isGamepadConnected){
      $("#setting"+curPosition_setting).find(".cursor").css("visibility","visible")
    }
    PlaySound(4);
}


function menuSelect(i){
  if (!isRunning) {
    isRunning = true;
    
    var max = $('#menu').find("li").filter(':visible').length;

    $("#menu li:nth-child("+curPosition+")").children(".button").removeAttr("gamepad");
    curPosition += i;

    if ( curPosition == max+1 ) { curPosition = 1; }
    else if ( curPosition == 0 ) { curPosition = max; }
    
    $("#menu li:nth-child("+curPosition+")").children(".button").attr("gamepad","selected");
    
    
    PlaySound(0);
    
    setTimeout(function() {
        isRunning = false;
    }, 100);

  }
}


function settingSelect(i){

  if (!isRunning) {
    isRunning = true;
    $(".cursor").css("visibility","hidden")
    if (!unxIsPresent) { var previousPosition = curPosition_setting; }
    curPosition_setting += i;

    if (!unxIsPresent) { 
    
         if ( previousPosition < curPosition_setting && curPosition_setting == 6 ) { curPosition_setting += 6;}
         else if ( previousPosition < curPosition_setting && curPosition_setting == 2 ) { curPosition_setting += 1; }
         else if ( previousPosition > curPosition_setting && curPosition_setting == 2 ) { curPosition_setting -= 1; }    
             
    }
    
    
      
     if (insideLauncherSettings) {
     
              var nbr_element = ($('#launcher_settings').find( "li" ).length);
              if ( curPosition_setting == nbr_element+1+30 ) { curPosition_setting = 31; }
              else if ( curPosition_setting == 30 ) { curPosition_setting = nbr_element+30; }
     }
     else if (page == 1) {  
              var nbr_element = ($('#page1').find( "li" ).length);
              if ( curPosition_setting == nbr_element+1 ) { curPosition_setting = 1; }
              else if ( curPosition_setting == 0 ) { curPosition_setting = nbr_element; }
     }  
     else if (page == 2) {
              var nbr_element = ($('#page2').find( "li" ).length);
              if ( curPosition_setting == nbr_element+1+11 ) { curPosition_setting = 12; }
              else if ( curPosition_setting == 11 ) { curPosition_setting = nbr_element+11; }
     }
     else if (page == 3) {
              var nbr_element = ($('#page3').find( "li" ).length);
              if ( curPosition_setting == nbr_element+1+21 ) { curPosition_setting = 22; }
              else if ( curPosition_setting == 21 ) { curPosition_setting = nbr_element+21; }
     }
     
     if (!unxIsPresent) { 
        if ( curPosition_setting == 11 ) { curPosition_setting -= 6; }
     }

    $("#setting"+curPosition_setting).find(".cursor").css("visibility","visible")
    
    
    
    PlaySound(0);
    
    setTimeout(function() {
        isRunning = false;
    }, 100);


  } 
}

function updateSetting(i){

  if (!isRunning) {
    isRunning = true;
    
    
    if (i == 1) {
    
    
        if( curPosition_setting == 11 || curPosition_setting == 12 || curPosition_setting == 13 || curPosition_setting == 14 || curPosition_setting == 15) {
        
                   if ( $("#setting"+curPosition_setting).find(" .btn[selected='selected'] ").length===0 ){ 
                    
                         $("#setting"+curPosition_setting).find(" .gp_select_first").attr("selected","selected");  
                   }
                   else{
                        $("#setting"+curPosition_setting).find(" .btn[selected='selected'] ").removeAttr( "selected" ).next().attr("selected","selected");
                        if ( $("#setting"+curPosition_setting).find(" .btn[selected='selected'] ").length===0 ) { $("#setting"+curPosition_setting).find(" .btn ").last().attr("selected","selected"); }
                   }
        }
        else{
          $("#setting"+curPosition_setting).find(" .btn[selected='selected'] ").removeAttr( "selected" ).next().attr("selected","selected");
          if ( $("#setting"+curPosition_setting).find(" .btn[selected='selected'] ").length===0 ) { $("#setting"+curPosition_setting).find(" .btn ").last().attr("selected","selected"); }
        }
        
        
        if ( $("#setting"+curPosition_setting).find(" #resolution_setting ").length>0 ) {
            change_resolution(-1);
            setTimeout(function() {$("#setting"+curPosition_setting).find(" .btn[selected='selected'] ").removeAttr( "selected" )}, 100); 
        }
        else if ( $("#setting"+curPosition_setting).find(" #timeout_setting ").length>0 ) {
            change_timeout(1);
            setTimeout(function() {$("#setting"+curPosition_setting).find(" .btn[selected='selected'] ").removeAttr( "selected" )}, 100);
        }
        else if ( $("#setting"+curPosition_setting).find(" #volume_setting ").length>0 ) {
            updateVolumeBGM(0.1)
            setTimeout(function() {$("#setting"+curPosition_setting).find(" .btn[selected='selected'] ").removeAttr( "selected" )}, 100);
        }

    }
    else if (i == -1){

        $("#setting"+curPosition_setting).find(" .btn[selected='selected'] ").removeAttr( "selected" ).prev().attr("selected","selected");
        if ( $("#setting"+curPosition_setting).find(" .btn[selected='selected'] ").length===0 ) { $("#setting"+curPosition_setting).find(" .btn ").first().attr("selected","selected"); }
        
        if ( $("#setting"+curPosition_setting).find(" #resolution_setting ").length>0 ) {
            change_resolution(1);
            setTimeout(function() {$("#setting"+curPosition_setting).find(" .btn[selected='selected'] ").removeAttr( "selected" )}, 100);
        }
        else if ( $("#setting"+curPosition_setting).find(" #timeout_setting ").length>0 ) {
            change_timeout(-1);
            setTimeout(function() {$("#setting"+curPosition_setting).find(" .btn[selected='selected'] ").removeAttr( "selected" )}, 100);
        }
        else if ( $("#setting"+curPosition_setting).find(" #volume_setting ").length>0 ) {
            updateVolumeBGM(-0.1)
            setTimeout(function() {$("#setting"+curPosition_setting).find(" .btn[selected='selected'] ").removeAttr( "selected" )}, 100);
        }
    
    }   
      
    PlaySound(0);
    
    setTimeout(function() {
        isRunning = false;
    }, 100);

  } 
}

