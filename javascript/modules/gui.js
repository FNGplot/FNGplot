/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright (c) Wei-Hsu Lin(林韋旭) & All Contributors to FNGplot */

import {fngNameSpace as glob } from ".\glob.js";     // global variable module

export let guiFunctions = (function() {

    "use strict";

    return {
        // [!] Side menu

        // Side menu display switch

        switchSideMenu: function(optn) {
            const panelList = document.querySelectorAll(".side-menu__panel");                //select all panels
            for (let panel of panelList) {                                                   //hide everyone first
                panel.style.display = "none";
            };
            document.querySelector(`.side-menu__panel[data-panelname="${optn}"]`).style.display = "flex";     //then show only the selected panel
        },

        // Change root zoom level

        changeRootZoom: function(mode, slider, divDisplay) {
            if (mode == "change") {
                document.querySelector(":root").style.fontSize = `${math.round(glob.MagicNumber.DEFAULT_REMSIZE * slider.value / 100, 2)}px`;
                glob.Settings.remSize = glob.MagicNumber.DEFAULT_REMSIZE * slider.value / 100;
                updateEnvirList();
            }
            divDisplay.innerHTML = `${slider.value}%`;
        },

        // Change plotter coordinate settings

        changeCoordSettings: function(inputElem) {
            if (math.hasNumericValue(inputElem.value)) {    // is numerical input
                const property = inputElem.dataset.id;
                let svgElem = "";
                glob.Coord[property] = parseFloat(inputElem.value);
                glob.Coord.updateSvgCoord();
                for (const FNGobject of glob.SysData.objectList) {
                    svgElem = glob.DOM.SVG_CANVAS.querySelector(`[data-sid='${FNGobject.sid}']`);
                    FNGobject.updateMath(svgElem);
                }
                const textList = document.querySelector("[data-id='minmax-display']").querySelectorAll("text");
                for (const textLabel of textList) {
                    textLabel.textContent = glob.Coord[textLabel.dataset.id];
                }
            }
        },

        // Update environment data list 

        updateEnvirList: function() {
            document.querySelector("pre[data-id='sys-envirdata-output']").innerHTML = `
Settings:
--------------------------
remSize: ${glob.Settings.remSize}px

Viewport:
--------------------------
innerWidth / innerHeight: 
${window.innerWidth}px / ${window.innerHeight}px

Device:
--------------------------
ScreenWidth / ScreenHeight:
${window.screen.width}px / ${window.screen.height}px

`
        },

        // [!] Toolbar

        // Toolbar display switch

        switchToolbar: function(optn) {
            const tabList = document.querySelectorAll(".toolbar__tab");                                 //select all tabs
            for (let tab of tabList) {
                tab.style.background = "transparent";                                                   //set all tabs to transparent background (unselected)
                tab.style.color = "#000000";                                                            //set all tabs' text to black (unselected)
            };
            tabList[optn].style.background = glob.SysData.TOOLBAR_CLR[optn];                           //set background to its border color (selected)
            tabList[optn].style.color = "#ffffff";                                                      //set text color to white (selected)
            
            const panelList = document.querySelectorAll(".toolbar__panel");                             //select all  divs
            for (let panel of panelList) {                                                              //hide all divs first
                panel.style.display = "none";
            };
            panelList[optn].style.display = "block";                                                    //then show the selected div
        },

        // Toggle toolbar dropdown when down arrow is clicked

        toggleToolbarDropdown: function(arrowBtn) {
            if (arrowBtn.style.transform == "rotate(0deg)") {                   //expand
                arrowBtn.style.transform = "rotate(180deg)";
                arrowBtn.closest(".toolbar__panel").style.overflow = "visible";
            } else if (arrowBtn.style.transform == "rotate(180deg)") {          //collapse
                arrowBtn.style.transform = "rotate(0deg)";
                arrowBtn.closest(".toolbar__panel").style.overflow = "hidden";
            }
        },

        // [!] Masks

        maskOn: function(name) {
            document.querySelector(".mask-base").querySelector(`.${name}`).style.display = "block";
        },
        maskOff: function(name) {
            document.querySelector(".mask-base").querySelector(`.${name}`).style.display = "none";
        }

        // [!] Others

    }
})();