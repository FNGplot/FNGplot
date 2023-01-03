/* Left panel */

//Left panel display switch

function switchLeftPanel(optn){
    const panelList = document.querySelectorAll("div[id^=\"left-panel-item-\"]");  //select all panels
    panelList.forEach((panel) => {                                                 //hide everyone first
	panel.style.display = "none";
    });
    document.querySelector(`#left-panel-item-${optn}`).style.display = "flex";     //then show only the selected panel
}


/* Toolbar */

//Toolbar display switch

function switchToolbar(optn){
    const n = document.querySelectorAll("button[id^=\"toolbar-select-\"]");                     //perform an "and" selection and select all buttons
    n.forEach((btn) => {
        btn.style.background = "transparent";                                                   //set all buttons to transparent background (unselected)
        btn.style.color = "#000000";                                                            //set all buttons' text to black (unselected)
        btn.style.fontWeight = "normal";                                                        //set font weight to normal (unselected)
    });
    n[optn].style.background = TOOLBAR_CLR[optn];                                               //set background to its border color (selected)
    n[optn].style.color = "#ffffff";                                                            //set text color to white (selected)
    n[optn].style.fontWeight = "bold";                                                          //set font weight to bold (selected)
    
    const m = document.querySelectorAll("div[id^=\"toolbar-item-\"]");                          //perform an "and" selection and select all  divs
    m.forEach((d) => {                                                                          //hide all divs first
        d.style.display = "none";
    });
    m[optn].style.display = "block";                                                            //then show the selected div
}

//initializing
function initToolbar(){
    const btnList = document.querySelectorAll("button[id^=\"toolbar-select-\"]");
    btnList.forEach((btn, i) => {
	btn.style.borderColor = TOOLBAR_CLR[i]; //initialize them to their respective colors
        btn.addEventListener("click", () => {switchToolbar(i)}); //attach click eventlisteners
    });
    const togglers = document.querySelectorAll(".toolbar-grid-toggler > div");
    togglers.forEach(function(arrowBtn){
        arrowBtn.style.transform = "rotate(0deg)"; //have to set them inline so they can be manipulated later
    });
}

//update environment data list 
function updateEnvirList(){
    document.querySelector("#envir-datalist > pre").innerHTML = `
Root Frame:
--------------------------
Width / Height: 
${document.querySelector("#root-frame").getBoundingClientRect().width}px / ${document.querySelector("#root-frame").getBoundingClientRect().height}px


Viewport:
--------------------------
innerWidth / clientWidth: 
${window.innerWidth}px / ${document.documentElement.clientWidth}px
innerHeight / clientHeight: 
${window.innerHeight}px / ${document.documentElement.clientHeight}px


Device:
--------------------------
ScreenWidth / ScreenHeight:
${window.screen.width}px / ${window.screen.height}px (${window.screen.width/gcd(window.screen.width, window.screen.height)}:${window.screen.height/gcd(window.screen.width, window.screen.height)})


`
}

//Log system time
function systemTime(){
    console.log(`System Time: ${Date.now()-SYSTEM_EPOCH}ms\n`);
}

/*Left Panel*/

//Change root zoom level
function changeRootZoom(value,mode){
    if(mode == "change"){
        document.getElementById("root-frame").style.transform=`scale(${value/100})`;
    }
    document.getElementById("rootzoom-label").innerHTML = `Zoom: ${value}%`;
}
