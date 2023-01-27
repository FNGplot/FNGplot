/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright (c) Wei-Hsu Lin(林韋旭) & All Contributors to FNGplot */

import {fngNameSpace as glob } from "./fngns.js";       // global variable module
import * as fngObjects  from "./fngobjects.js";    // get all the fngobject classes

export let gui = (function() {

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
                this.updateEnvirList();
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

        // [!] FNGobject related

        makeSID: function() { // Generate a 10-character-long "random" alphanumeric system id
            const charList = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            let sid = '';
            for (let i = 0; i<10; i++) {
                sid += charList.charAt(Math.floor(Math.random() * 62));
            }
            return sid;
        },
        createFNGObject: function(objName, data) {
            const InitMap = new Map([    // Data and reference used to initialize object
                //["Object Name", [Class, Category, SVG Element]],
                ["linepp", [fngObjects.LinePP, "geometry", "line"]],
                ["lineps", [fngObjects.LinePS, "geometry", "line"]],
                ["lineppext", [fngObjects.LinePPExt, "geometry", "line"]],
                ["rect", [fngObjects.Rect, "geometry", "rect"]],
                ["triangle", [fngObjects.Triangle, "geometry", "polygon"]],
                ["circle", [fngObjects.Circle, "geometry", "ellipse"]],
                ["circle3p", [fngObjects.Circle3P, "geometry", "ellipse"]],
            ]);
            if (data === null) {                             //create a new FNGobject
                const sid = this.makeSID();
                const data = InitMap.get(objName);   // ["objName", [Class, Category, SVG Element]]
        
                // Step 1 of 3: FNGobject
                const newObj = new data[0](sid);                 //call class constructor        
                glob.SysData.objectList.push(newObj);                        //push new object into list
                    
                // Step 2 of 3: draggable block
                let newBlock = glob.DOM.BASIC_BLOCK_TEMPLATE.cloneNode(true);                              //copy template     
                newBlock.classList.add(`dragblock--${data[1]}`);                                            //add object class
                newBlock.querySelector('.dragblock__icon').src = `svg/system/${data[1]}-icons/${objName}.svg`; //init the small icon
                newBlock.querySelector('.dragblock__label').innerHTML = newObj.label;           //display default label
                newBlock.dataset.sid = sid;                                    //assign this id-less block a sid, in sync with the hidden object
                glob.DOM.BLOCK_FRAME.appendChild(newBlock); //add the block to block frame
        
                // Step 3 of 3: SVG element(s)
                let newSVGElem = document.createElementNS(glob.Str.SVGNS, data[2]);
                newSVGElem.dataset.sid = sid;
                glob.DOM.SVG_CANVAS.appendChild(newSVGElem);    //add the new SVG element to canvas
        
                // Step 4: Initialize and render the FNGobject for the first time
                newObj.updateMath(newSVGElem);      // render the math part first
                for (const property in newObj.SvgStyle) {     //render the svg part
                    if (glob.Maps.EDITACTION_SI.has(property)) {
                        glob.Maps.EDITACTION_SI.get(property)(newObj, newSVGElem);
                    } else if (glob.Maps.EDITACTION_SC.has(property)) {
                        glob.Maps.EDITACTION_SC.get(property)(newObj, newSVGElem);
                    }
                }
            }
        },
        moveFNGObject: function(sid, nextSid) {
            const svgElem = glob.DOM.SVG_CANVAS.querySelector(`[data-sid='${sid}']`);
            const refElem = glob.DOM.SVG_CANVAS.querySelector(`[data-sid='${nextSid}']`);
            glob.DOM.SVG_CANVAS.insertBefore(svgElem,refElem);
        },
        deleteFNGObjects: function() {
            glob.maskOn("mask__inv--blockframe-blocktlbr");
            const blockList = glob.DOM.BLOCK_FRAME.querySelectorAll(".dragblock");
            const deleteSet = new Set();    // I believe Set() is the simplest option here
        
            // Declare temporary eventlistener
            const tmpListener = function(event){
                if (event.target.className === "dragblock__checkbox") {
                    if (event.target.checked) {
                        deleteSet.add(event.target.closest(".dragblock").dataset.sid);
                    } else {
                        deleteSet.delete(event.target.closest(".dragblock").dataset.sid);
                    }
                    document.querySelector(".workspace__block-toolbar__display").innerHTML = `>>Delete:&nbsp;<span class='bold'>${deleteSet.size}</span>&nbsp;blocks selected`;
                }
            }
        
            // Disable the toolbar temporarily before action is complete
            const tlbrList = document.querySelectorAll(".workspace__block-toolbar__option-btn");
            for (const btn of tlbrList) {
                btn.disabled = true;
            }
        
            // Give every dragblock a checkbox
            const checkBox = document.createElement("input");
            checkBox.setAttribute("type", "checkbox");
            checkBox.classList.add("dragblock__checkbox");
            glob.DOM.BLOCK_FRAME.addEventListener("change", tmpListener);
            for (const block of blockList) {
                block.querySelector(".dragblock__header").insertBefore(checkBox.cloneNode(false), block.querySelector(".dragblock__header").firstElementChild);
            }
        
            // prepare for user selection...
            document.querySelector(".workspace__block-toolbar__finish-btn").style.display = "flex";             // show finish button
            document.querySelector(".workspace__block-toolbar__finish-btn").addEventListener("click", endFunc, {once: true});  // single fire event listener on finish button
            document.querySelector(".workspace__block-toolbar__display").innerHTML = ">>Delete:&nbsp;<span class='bold'>0</span>&nbsp;blocks selected";
        
            // The actual FNGobject deletion
            function endFunc(){
                if (deleteSet.size != 0) {
                    if (confirm(`Are you sure you want to PERMANENTLY delete these ${deleteSet.size} items ?`)) {
                        let obj, block, svgElem;
                        for (const sid of deleteSet) {
                            obj = glob.SysData.objectList.find(item => item.sid === sid);
                            block = glob.DOM.BLOCK_FRAME.querySelector(`div[data-sid='${sid}']`);
                            svgElem = glob.DOM.SVG_CANVAS.querySelector(`[data-sid='${sid}']`);
                            glob.SysData.objectList.splice(glob.SysData.objectList.indexOf(obj), 1);
                            block.parentNode.removeChild(block);
                            svgElem.parentNode.removeChild(svgElem);
                        }
                    }
                }
                // cleanup & signing off
                document.querySelector(".workspace__block-toolbar__display").innerHTML = ">>";
                glob.DOM.BLOCK_FRAME.removeEventListener("change", tmpListener);
                document.querySelector(".workspace__block-toolbar__finish-btn").style.display = "none";
                for (const remainingCheckBox of glob.DOM.BLOCK_FRAME.querySelectorAll(".dragblock__checkbox")) {
                    remainingCheckBox.parentNode.removeChild(remainingCheckBox);
                }
                for (const btn of tlbrList) {
                    btn.disabled = false;
                }
                glob.maskOff("mask__inv--blockframe-blocktlbr");
            }
        },
        changeVisibility: function(sid) {
            const obj = glob.SysData.objectList.find(item => item.sid === sid);  //find the object with this sid
            const eyeBtn = glob.DOM.BLOCK_FRAME.querySelector(`div[data-sid='${sid}']`).querySelector('.dragblock__btn--visibility');
            const svgElem = glob.DOM.SVG_CANVAS.querySelector(`[data-sid='${sid}']`);
            if(obj.SvgStyle.display === true){
                obj.SvgStyle.display = false;
                eyeBtn.innerHTML = "visibility_off";                //change the icon to visibility off;
                svgElem.setAttribute("display","none");             //hide the SVG element               
            }
            else if(obj.SvgStyle.display === false){
                obj.SvgStyle.display = true;
                eyeBtn.innerHTML = "visibility";                    //change the icon to visibility(on);
                svgElem.setAttribute("display","");                 //show the SVG element
            }
        },
        toggleEditPanel: function(sid) {
            const block = glob.DOM.BLOCK_FRAME.querySelector(`div[data-sid='${sid}']`);
            const panel = block.querySelector(".editpanel");
            if(panel === null){ //It doesn't have an editpanel, give it one
                const objName = glob.SysData.objectList.find(item => item.sid === sid).constructor.name.toLowerCase(); //obj.constructor.name is the type name of object(ex: LinePP)
                block.insertAdjacentHTML("beforeend", glob.SysData.EDITPANEL_TEMPLATES[objName]);
                this.initEditPanel(block.querySelector(".editpanel"),sid);
            } else { //It has an editpanel, remove it
                panel.parentNode.removeChild(panel);
            }
        },
        initEditPanel: function(panelElem, sid) {
            const obj = glob.SysData.objectList.find(item => item.sid === sid);
            const inputList = panelElem.querySelectorAll("[data-property]"); //return a list of textboxes(and some other stuff) waiting to be initialized
            for(let inputElem of inputList){
        
                /*if(inputElem.type === "checkbox"){   //currently useless
                    //get their respective properties and display them
                    inputElem.checked = obj[inputElem.dataset.property];
                }*/
        
                //  Get their respective properties and display them (normal or SvgStyle)
                if (inputElem.dataset.property in obj){
                    inputElem.value = obj[inputElem.dataset.property];
                } else if (inputElem.dataset.property in obj.SvgStyle) {
                    inputElem.value = obj.SvgStyle[inputElem.dataset.property];
                } 
            }
        },
        handleUserEdit: function(target, sid, event) { 
            const svgElem = glob.DOM.SVG_CANVAS.querySelector(`[data-sid='${sid}']`);    //room for optimization on this one (how to reduce query count for call-intensive operation like color change)
            const obj = glob.SysData.objectList.find(item => item.sid === sid);
            const prop = target.dataset.property;
            if (event === "input") {   // Real-time SVG rendering
        
                //save value to object
                if (prop in obj) {
                    math.hasNumericValue(target.value) ? obj[prop] = parseFloat(target.value) : obj[prop] = target.value;
                } else if (prop in obj.SvgStyle) {
                    math.hasNumericValue(target.value) ? obj.SvgStyle[prop] = parseFloat(target.value) : obj.SvgStyle[prop] = target.value;
                }
        
                // svg tyle properties
                if (glob.Maps.EDITACTION_SI.has(prop)) {
                    glob.Maps.EDITACTION_SI.get(prop)(obj, svgElem);
                } else { // Calculate object
                    obj.updateMath(svgElem);
                }
            } else if (event === "change") {
        
                //save value to object
                if (prop in obj) {
                    math.hasNumericValue(target.value) ? obj[prop] = parseFloat(target.value) : obj[prop] = target.value;
                } else if (prop in obj.SvgStyle) {
                    math.hasNumericValue(target.value) ? obj.SvgStyle[prop] = parseFloat(target.value) : obj.SvgStyle[prop] = target.value;
                }
        
                if(prop === "label"){ //special case: label (block labeltag update required)
                    target.closest(".dragblock").querySelector(".dragblock__label").innerHTML = target.value;
                } else if (glob.Maps.EDITACTION_SC.has(prop)) {   // svg style properties
                    glob.Maps.EDITACTION_SC.get(prop)(obj, svgElem);
                } else { // Calculate object
                    obj.updateMath(svgElem);
                }
            }
        }

    }
})();