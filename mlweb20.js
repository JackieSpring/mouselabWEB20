//
// 		MouselabWEB  script: mlweb20.js
//                
//     this script contains functions to display MouselabWEB content
// 								
//
//     (c) 2003-2017 Martijn C. Willemsen and Eric J. Johnson 
//
//    This program is free software; you can redistribute it and/or modify
//    it under the terms of the GNU General Public License as published by
//    the Free Software Foundation; either version 2 of the License, or
//    (at your option) any later version.
//
//    This program is distributed in the hope that it will be useful,
//    but WITHOUT ANY WARRANTY; without even the implied warranty of
//    MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
//    GNU General Public License for more details.
//
//    You should have received a copy of the GNU General Public License
//    along with this program; if not, write to the Free Software
//    Foundation, Inc., 59 Temple Place, Suite 330, Boston, MA  02111-1307  USA


dtNewDate = new Date(); 
starttime = dtNewDate.getTime(); // abs. starttime of experiment

// default values 
mlweb_outtype="XML"; 	// format for output to database in [XML,CSV]
mlweb_fname=0;			// name of form [0=is first or only form]
chkFrm = false // flag to test whether additional form elements have to be checked on submission
warningTxt = "Some questions have not been answered. Please answer all questions before continuing!";


//define basic blur settings 
var foggyset = {
	blurRadius: 7, // In pixels.
	opacity: 0.8, // Falls back to a filter for IE.
	cssFilterSupport: true  // Use "-webkit-filter" where available.
};

currentid = "";



/****************************************/
/* timefunction (event, name, value)	*/
/* This function saves the event data   */
/* into the hidden field (procdata).	*/
/* Can be called directly or indirectly */
/* via RecordEventData					*/
/*										*/
/* event: event type (e.g. mouseover)	*/
/* name: name of element on which event	*/
/*			occurred					*/
/* value: possible extra value of event */
/*		   (i.e. value of field)		*/
/****************************************/


function timefunction(event,name,value) {
// Record proc data in form element
mlweb_form=document.forms[mlweb_fname].elements['procdata'] // handle to hidden form field for process data

	dtNewDate = new Date();
	eventtime = dtNewDate.getTime();
  	var curtime = eventtime-starttime; // calculate time relative to starttime of script

	if (mlweb_outtype=="XML")
	   	{
	   	var str="<eventblock><event>"+event+"</event><name>"+name+"</name><value>"+value+"</value><time>"+curtime+"</time></eventblock>";
  		var headerstr="<?xml version=1.0?>"
		}
		else 
		{
		var str="\""+event+"\",\""+name+"\",\""+value+"\",\""+curtime+"\"\n"
		var headerstr="\"event\",\"name\",\"value\",\"time\"\n"
		};
		
	if(mlweb_form.value=='') 
		{
		mlweb_form.value=headerstr;
  		}
 	mlweb_form.value+=str;
}	


/****************************************/
/*	RecordEventData (element, event)	*/
/*										*/
/* function extracts event name and     */
/*	value from object types and calles	*/
/*  timefunction to save event in 		*/
/*	procdata hidden field				*/
/*	USAGE:								*/
/*  Use the following line to record	*/
/*  a click inside a <input> or <A>		*/
/* OnClick="RecordEventData(this,event)"*/
/****************************************/

function RecordEventData(objActionElement, objEvent)
	{
	var strName, strEventType, strFormValue;
	strName = objActionElement.name;
	strFormValue = (objActionElement.value) ? objActionElement.value : "";
	strEventType = objEvent.type;

	//call timefunction 
	timefunction(strEventType,strName, strFormValue)
	return false;
	}
	
function checkForm(formHandle)
{
if (chkFrm) 
	{
	noElm = document.forms[mlweb_fname].elements.length;

	var filled=true;

	for (i=0;i<noElm;i++)
		{	
		elemHandle = document.forms[0].elements[i];
		if (elemHandle.type=="hidden") {continue}; 
		if (elemHandle.value=="") {filled = false; break};
		if (elemHandle.type=="select-one") {if (elemHandle.options[elemHandle.selectedIndex].value=="") {filled = false; break};}
		if (elemHandle.type=="radio")   // procedure to check radio buttons
		   { 
	   		 radio_name=elemHandle.name;  // get name (needed to retrieve length)

		 							  // get length of radio button group	   
	   	 	r_length = eval("document.forms[0]."+radio_name).length

		 	for (ri=0;ri<r_length;ri++)  // check each button and break loop if checked button was found
		 	{ radioHandle = document.forms[0].elements[i+ri];
		 	  if (radioHandle.checked) {filled=true; break} else {filled=false};
			}
			if (filled) {i=i+r_length-1; continue} else {break};  // if checked button found; continue
		   							 		   				  // else break loop and show warning
			}
		
	}
if (!filled) {alert(warningTxt);timefunction('submit','submit','failed');return false};
}

timefunction('submit','submit','succeeded');
return true
}

function hideBox(bid, evt)
{
	timefunction(evt, $("#"+bid).attr("name"), "");
	
	if ($("#" + bid + "_box").length)
	{
		$("#" + bid + "_box").show();
		$("#" + bid + "_txt").hide();
	} else
	{
		$("#" + bid + "_txt").foggy(foggyset);
	}
}

function showBox(bid, evt)
{
	timefunction(evt, $("#"+bid).attr("name"), "");
	//blur if not _box div
	if ($("#" + bid + "_box").length)
	{
		$("#" + bid + "_box").hide();
		$("#" + bid + "_txt").show();
	} else
	{
		$("#" + bid + "_txt").foggy(false);
	}
}



//function to activate the boxes and the choiceButtons
// 
function InitBoxes(){
	
	
	// function that responds to mouseovers and tocuhes
	$("#container .Hoverable").on({
		mouseenter : function () {
			if (currentid != "") {
				hideBox(currentid, 'mouseout')
			}
			;
			currentid = $(this).attr("id"); // stores the current open box 
			showBox(currentid, 'mouseover');
		},
		touchstart: function (event) {
			event.preventDefault();
			if (currentid != "") {
				hideBox(currentid, 'touchout')
			}
			;
			currentid = $(this).attr("id"); // stores the current open box 
			showBox(currentid, 'touchover');
		},
		mouseleave: function () {
			if (currentid == "")
				return false;
			currentid = "";
			hideBox($(this).attr("id"), 'mouseout')
		},
		touchend: function (event) {
			event.preventDefault();
			if (currentid == "")
				return false;
			currentid = "";
			hideBox($(this).attr("id"), 'touchout')
		},
		dblclick: function () {

			alert($("#" + $(this).attr("id") + "_txt").html());
		}

	});

	$("#container .choiceButton").click(function (event) {
		choice = $(this).val();
		$("#choice").val(choice);
		$(".choiceButton").removeClass(def_buttonclick);
		$(this).addClass(def_buttonclick);
		timefunction("btnClick", choice, "");
		});

	$(".confirm").click(function (event) {
		if (choice=="" && $(".choiceButton").length>0) {event.preventDefault();return false;}           

	});
		blurBoxes.forEach(function (item) {
			$("#" + item).foggy(foggyset).show();
			});

};



/////////////////////////
// end of mouselabcode //
/////////////////////////