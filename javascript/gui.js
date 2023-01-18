/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright (c) Wei-Hsu Lin(林韋旭) & All Contributors to FNGplot */

/* gui.js: This file contains code used for GUI */

"use strict";

// [!] Left panel

//Left panel display switch

function switchLeftPanel(optn){
    const panelList = document.querySelectorAll(".side-menu__panel");                //select all panels
    for (let panel of panelList) {                                                   //hide everyone first
	    panel.style.display = "none";
    };
    document.querySelector(`.side-menu__panel[data-panelname="${optn}"]`).style.display = "flex";     //then show only the selected panel
}

//Change root zoom level

function changeRootZoom(mode, slider, divDisplay){
    if (mode == "change") {
        document.querySelector(":root").style.fontSize = `${10 * slider.value / 100}px`;
        fngNS.SysData.remSize = 10 * slider.value / 100;
    }
    divDisplay.innerHTML = `${slider.value}%`;
}

// Update environment data list 

function updateEnvirList(){
    document.querySelector("pre[data-id='envirdata-output']").innerHTML = `
Viewport:
--------------------------
innerWidth / innerHeight: 
${window.innerWidth}px / ${window.innerHeight}px

clientWidth / clientHeight: 
${document.documentElement.clientWidth}px / ${document.documentElement.clientHeight}px


Device:
--------------------------
ScreenWidth / ScreenHeight:
${window.screen.width}px / ${window.screen.height}px

`
}


// [!] Toolbar

//Toolbar display switch

function switchToolbar(optn){
    const tabList = document.querySelectorAll(".toolbar__tab");                                 //select all tabs
    for (let tab of tabList) {
        tab.style.background = "transparent";                                                   //set all tabs to transparent background (unselected)
        tab.style.color = "#000000";                                                            //set all tabs' text to black (unselected)
        tab.style.fontWeight = "normal";                                                        //set font weight to normal (unselected)
    };
    tabList[optn].style.background = fngNS.SysData.TOOLBAR_CLR[optn];                                         //set background to its border color (selected)
    tabList[optn].style.color = "#ffffff";                                                      //set text color to white (selected)
    tabList[optn].style.fontWeight = "bold";                                                    //set font weight to bold (selected)
    
    const panelList = document.querySelectorAll(".toolbar__panel");                             //select all  divs
    for (let panel of panelList) {                                                                //hide all divs first
        panel.style.display = "none";
    };
    panelList[optn].style.display = "block";                                                    //then show the selected div
}

// Toggle toolbar dropdown when down arrow is clicked

function toggleToolbarDropdown(arrowBtn){
    if (arrowBtn.style.transform == "rotate(0deg)") {                 //expand
        arrowBtn.style.transform = "rotate(180deg)";
        arrowBtn.parentNode.parentNode.style.overflow = "visible";
    } else if (arrowBtn.style.transform == "rotate(180deg)") {          //collapse
        arrowBtn.style.transform = "rotate(0deg)";
        arrowBtn.parentNode.parentNode.style.overflow = "hidden";
    }
}

// [!] Others
