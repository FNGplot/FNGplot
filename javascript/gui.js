/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright (c) Wei-Hsu Lin(林韋旭) & All Contributors to FNGplot */

/* gui.js: This file contains code used for GUI */

"use strict";

// [!] Side menu

// Side menu display switch

function switchSideMenu(optn){
    const panelList = document.querySelectorAll(".side-menu__panel");                //select all panels
    for (let panel of panelList) {                                                   //hide everyone first
	    panel.style.display = "none";
    };
    document.querySelector(`.side-menu__panel[data-panelname="${optn}"]`).style.display = "flex";     //then show only the selected panel
}

// Change root zoom level

function changeRootZoom(mode, slider, divDisplay){
    if (mode == "change") {
        document.querySelector(":root").style.fontSize = `${math.round(fngNS.MagicNumber.DEFAULT_REMSIZE * slider.value / 100, 2)}px`;
        fngNS.Settings.remSize = fngNS.MagicNumber.DEFAULT_REMSIZE * slider.value / 100;
        updateEnvirList();
    }
    divDisplay.innerHTML = `${slider.value}%`;
}

// Change plotter coordinate settings

function changeCoordSettings(inputElem){
    if (math.hasNumericValue(inputElem.value)) {    // is numerical input
        const property = inputElem.dataset.id;
        let svgElem = "";
        fngNS.Coord[property] = parseFloat(inputElem.value);
        fngNS.Coord.updateSvgCoord();
        for (const FNGobject of fngNS.SysData.objectList) {
            svgElem = fngNS.DOM.SVG_CANVAS.querySelector(`[data-sid='${FNGobject.sid}']`);
            FNGobject.updateMath(svgElem);
        }
        const textList = document.querySelector("[data-id='minmax-display']").querySelectorAll("text");
        for (const textLabel of textList) {
            textLabel.textContent = fngNS.Coord[textLabel.dataset.id];
        }
    }
}

// Update environment data list 

function updateEnvirList(){
    document.querySelector("pre[data-id='sys-envirdata-output']").innerHTML = `
Settings:
--------------------------
remSize: ${fngNS.Settings.remSize}px

Viewport:
--------------------------
innerWidth / innerHeight: 
${window.innerWidth}px / ${window.innerHeight}px

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
    };
    tabList[optn].style.background = fngNS.SysData.TOOLBAR_CLR[optn];                           //set background to its border color (selected)
    tabList[optn].style.color = "#ffffff";                                                      //set text color to white (selected)
    
    const panelList = document.querySelectorAll(".toolbar__panel");                             //select all  divs
    for (let panel of panelList) {                                                              //hide all divs first
        panel.style.display = "none";
    };
    panelList[optn].style.display = "block";                                                    //then show the selected div
}

// Toggle toolbar dropdown when down arrow is clicked

function toggleToolbarDropdown(arrowBtn){
    if (arrowBtn.style.transform == "rotate(0deg)") {                   //expand
        arrowBtn.style.transform = "rotate(180deg)";
        arrowBtn.closest(".toolbar__panel").style.overflow = "visible";
    } else if (arrowBtn.style.transform == "rotate(180deg)") {          //collapse
        arrowBtn.style.transform = "rotate(0deg)";
        arrowBtn.closest(".toolbar__panel").style.overflow = "hidden";
    }
}

// [!] Masks

function maskOn(name){
    document.querySelector(".mask-base").querySelector(`.${name}`).style.display = "block";
}
function maskOff(name){
    document.querySelector(".mask-base").querySelector(`.${name}`).style.display = "none";
}

// [!] Others
