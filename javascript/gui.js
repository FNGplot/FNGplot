/* toggles left panel*/
function toggleLeftPanel(value){
    let n = document.querySelectorAll("div[id^=\"left-panel-item-\"]");                 //selects all 7 subpages
    n.forEach((subpage) => {                                                            //hide everyone first
        subpage.style.display = "none";
    });
    document.querySelector(`#left-panel-item-${value}`).style.display = "flex";        //then show only the selected subpage
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

//Log system time
function systemTime(){
	console.log(`System Time: ${Date.now()-SYSTEM_EPOCH}ms\n`);
}

/*Left Panel*/

//Change root zoom level
function changeRootZoom(value,mode){ //mode 0 = still dragging. 1 = release thumb.
	if(mode){
		document.getElementById("root-frame").style.transform=`scale(${value/100})`;
		document.getElementById("rootzoom-label").innerHTML = `Zoom: ${value}%`;
	}
	else{
		document.getElementById("rootzoom-label").innerHTML = `Zoom: ${value}%`;
	}
}