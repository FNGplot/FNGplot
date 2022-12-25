/* Async load of lazy fonts*/

//Load the fonts listed in LZ_FONT_DATA
async function loadLazyFonts(){        
	for(var i = 0; i<LZ_FONT_DATA.length; i++){  
		//Declare the fontface
		LZ_FONTFACES.push(new FontFace(`${LZ_FONT_DATA[i][0]}`, `url(fonts/WOFF2/${LZ_FONT_DATA[i][3]})`,   { style: `${LZ_FONT_DATA[i][2]}`, weight: `${LZ_FONT_DATA[i][1]}`}));  //Initialize LZ_FONTFACES one by one
		document.fonts.add(LZ_FONTFACES[LZ_FONTFACES.length-1]); //Add the new fontface to FontFaceSet
		LZ_FONTPROMISES.push(LZ_FONTFACES[LZ_FONTFACES.length-1].load()); //Start async load of the new fontface and push its promise into LZ_FONTPROMISES
	}
	Promise.all(LZ_FONTPROMISES)    //The big promise of all fontface's load() promise
	   .then((results) => {
		   logConsole(`ASYNC FONT LOAD COMPLETE --  ${results.length} more fonts loaded`);
		   systemTime();
		   logConsole(`-------------------------------------------------------------------------`);
		   highlightConsole();
	   })
	   .catch((e) => {
		   logConsole("ERROR: Lazy font load failed. One or more font files missing or corrupted.");
		   systemTime();
		   alert("Async font load failed: One or more font files missing or corrupted.");
	});
}

/* toggles left panel*/
function toggleLeftPanel(value){
    let n = document.querySelectorAll("div[id^=\"left-panel-item-\"]");                 //selects all 7 subpages
    n.forEach((subpage) => {                                                            //hide everyone first
        subpage.style.display = "none";
    });
    document.querySelector(`#left-panel-item-${value}`).style.display = "block";        //then show only the selected subpage
}




/* Miscellaneous initializations on window.onload()*/
function initAll(){
	initToolbar(); //initialize toolbar's positions, colors and click handlers
	toggleToolbar(1); //set it to "geometry" (default select)
}



/* Toolbar*/

//toggling
function toggleToolbar(optn){
	let n = document.querySelectorAll("button[id^=\"toolbar-select-\"]");                       //perform an "and" selection and select all 9 buttons
    n.forEach((btn) => {
        btn.style.background = "transparent";                                                   //set all buttons to transparent background (unselected)
		btn.style.color = "#000000";                                                            //set all buttons' text to black (unselected)
		btn.style.fontWeight = "normal";                                                        //set font weight to normal (unselected)
    });
	n[optn].style.background = TOOLBAR_CLR[optn];                                               //set background to its border color (selected)
	n[optn].style.color = "#ffffff";                                                            //set text color to white (selected)
	n[optn].style.fontWeight = "bold";                                                          //set font weight to bold (selected)
	
	n = document.querySelectorAll("div[id^=\"toolbar-item-\"]");                  //perform an "and" selection and select all 9 divs
    n.forEach((d) => {                                                                          //hide all divs first
        d.style.display = "none";
    });
	n[optn].style.display = "block";                                                            //then show the selected div
}

//initializing
function initToolbar(){
	let n = document.querySelectorAll("button[id^=\"toolbar-select-\"]");
	for(let i = 0;i<9;i++){
		n[i].style.borderColor = TOOLBAR_CLR[i]; //initialize them to their respective colors
		n[i].addEventListener("click", function() {toggleToolbar(i)}); //attach click eventlisteners
	}
}

/* Console: My own syntax-highlighted console*/
// These are the ones used by the program, not by the user.
/* Others are Eventlisteners. They are short one-liners that can be found in window.onload()'s console section*/

//basic use: log a line to console
function logConsole(txt){
	document.querySelector("#console-code").innerHTML += `> ${txt}\n`;
}

//basic use: log system time
function systemTime(){
	document.querySelector("#console-code").innerHTML += `                                                           System Time: ${Date.now()-SYSTEM_EPOCH}ms\n`;
}

//basic use: highlight the console
function highlightConsole(){
	Prism.highlightElement(document.querySelector("#console-code")); //re-highlight
}