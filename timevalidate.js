jQuery.fn.timeValidater = function(settings) {
  //settings = jQuery.extend({	
	//}, settings);

    //for now lets just validate the format HH:MM(am|pm) and also allow blank, we aren't valdating for required here
	$(this).bind( "blur" , function(e){
	  var timeMatch = /^([0-1]?[0-9]|[2][0-3])(:([0-5][0-9]))?(am|pm)$/i;
	  	  
	  if($(this).val().match(timeMatch)){
		  $(this).addClass("go");
		  $(this).removeClass("stop");	
	  } else if($.trim($(this).val()) == ''){
	    $(this).removeClass("stop");	
	  } else {
	    $(this).addClass("stop");	
	  } 
	});
};

//allows you to put duration in the formation HH:MM or MMM and will convert to HH:MM
jQuery.fn.durationValidater = function(settings) {
  
  //for now lets just validate the format HH:MM
  $(this).bind( "blur" , function(e){
    var timeMatch = /^(\d{1,3}):*(\d{2})*$/;
    var duration = $(this).val();
    var durationMinutes;

    if(duration.match(timeMatch)){
      var timePieces = duration.split(":")
      var minutes;
      var rawTime;
      if(timePieces[1] == undefined){
	       rawTime = Number(timePieces[0]);
	       minutes = (rawTime % 60)
	       hours = (rawTime - minutes) / 60
	       parsedHours = (hours == 0) ? "00" : hours
	       parsedMinutes = (minutes < 10) ? ("0" + minutes) : minutes
         durationMinutes = parsedHours + ":" + parsedMinutes;
         $(this).val(durationMinutes)
      }     
      
      $(this).addClass("go");
  	  $(this).removeClass("stop");	
    } else {
      $(this).addClass("stop");	
    } 
  });
  
};



//sets stop and go classes if time is invalid
//assigns valid input from time24 into time12
function test12HourTime(time12input,time24input){
	 var time12 = $(time12input);
	 var time24 = $(time24input);
	 var value12 = time12.val();
	
   var timeMatch = /^(\d{1,2}):*(\d{2})*([ap]m)?$/i
   
   if(value12.match(timeMatch) != null){
     time12.removeClass("stop");
   
     var hours = RegExp.$1;
     var mins  = RegExp.$2;
     var ampm  = RegExp.$3; 
     if(Number(hours) > 0 && Number(hours) < 13 && Number(mins) < 60 && Number(mins) > -1){
       time12.addClass("go");
       time24.val(format24HourTimeFrom12HourPieces(hours,mins,ampm));
       time24.change();
        //do nothing right now for blanks
     } else {
       time12.addClass("stop");
     } 
   } else if( $.trim(value12) == '' ) {
     time12.addClass("yield");
   } else {
     time12.addClass("stop");
   }
}


//sets format HH:MMam|pm from 24 hour clock time and creates a container for it
//hides source container and places new 12 hour input on page instead
//returns a reference to the 12hour input that has been created
function set12HourTimeFrom24HourTarget(source){
	var time24 = $(source).val()
	var time12 = $("<input class='notifies_time time_12_mask' size='6'>");
	
	var timePieces = time24.split(":")
	var rawHour  = Number(timePieces[0])
	var hour;
	var minute;
	var formattedTime;
	
	var ampm = ( rawHour > 11 ) ? "pm" : "am"
	console.log(rawHour + " " + ampm)
	
	if (isNaN(rawHour)){
		hour = 12 
	} else if (rawHour > 12){
	 hour = rawHour - 12
	} else if (rawHour == 0) { 
	 hour = 12;
	} else {
	 hour = rawHour;
  }

	minute = isNaN(timePieces[1]) ? undefined : timePieces[1]
	
	$(source).css("display","none");
  $(source).after(time12);

  //if all components are correctly defined we will parse it in to the
  //12 hour time component
	if($.inArray(undefined,[ampm,hour,minute]) == -1 ){
    formattedTime = hour + ":" + minute + ampm
  
	  time12.val(formattedTime);
  }

  return time12;
}

//formats hours, minutes and ampm into 24 hour time
function format24HourTimeFrom12HourPieces(hours12,minutes,ampm){
  var hours24;
  var numHours12 = Number(hours12);
  var parsedTime;
	var numericMinutes = Number(minutes);

  if(ampm == "pm" && numHours12 < 12){  
    hours24 = (numHours12 + 12) 
  } else if(ampm == "am" && numHours12 == 12){
    hours24 = "00"
  } else {
    hours24 = hours12
  } 
    
  parsedTime = (hours24 + ":" + (isNaN(numericMinutes) ? "00" : numericMinutes)) 
  return parsedTime;
}

function initializeTimeFields(){
	$(document).ready(function(){
     $(".time24").each( function(){
       var time24 = $(this);
       var time12 = set12HourTimeFrom24HourTarget(this)
       
       time12.bind("change", function(){
         test12HourTime(time12,time24);
       })
     })
  })
}

//find out the time between a start and end time and add the  
//collection of durations to it
function accumulateDuration(start,end,duration){
	var accumulatedTime;
	var startPieces = start.split(":");
	var endPieces   = end.split(":");
	var durationPieces;
	var accumulatedHours; 
	var accumulatedMinutes; 
	var actualMinutes;
	var actualHours;
	var hoursDuration;
	var minutesDuration;
	
 	//raw difference between hours
	accumulatedHours   = Number(endPieces[0]) - Number(startPieces[0]);
  //minutes on start hour are negative, subtract them from end minutes to get net minutes
  accumulatedMinutes =  Number(endPieces[1]) - Number(startPieces[1]);
  durationPieces = duration.split(":");
  
  hoursDuration = (durationPieces[0] > 0 && (durationPieces.length == 2)) ? durationPieces[0] : 0
  minutesDuration = (durationPieces[1] > 0) ? durationPieces[1] : durationPieces[0]

  accumulatedHours   = Number(accumulatedHours) + Number(hoursDuration);
  accumulatedMinutes = Number(accumulatedMinutes) + Number(minutesDuration);

  actualMinutes = (Number(accumulatedMinutes) % 60)

  actualHours = accumulatedHours + ((Number(accumulatedMinutes) - Number(actualMinutes)) / 60);
	accumulatedTime = actualHours + ":" + ((actualMinutes < 10) ? ("0" + actualMinutes) : actualMinutes);

	return accumulatedTime;
}


function doubleDuration(duration){
  var durationPieces = duration.split(":");
  var rawMinutes = Number(durationPieces[1]) * 2;
  var rawHours   = Number(durationPieces[0]) * 2;
  var actualMinutes = (rawMinutes % 60);
  var actualHours   = rawHours + ((rawMinutes - actualMinutes) / 60);
  var returnDuration;
  
  if(actualHours == 0){
	  returnDuration = "00:" + ((actualMinutes < 10) ? ("0" + actualMinutes) : actualMinutes )
  } else {	
	  returnDuration = actualHours + ":" + ((Number(actualMinutes) < 10) ? ("0" + actualMinutes) : actualMinutes )
  }

  return returnDuration;
}
