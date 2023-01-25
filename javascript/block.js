/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright (c) Wei-Hsu Lin(林韋旭) & All Contributors to FNGplot */

/*The block system is the UI of FNGplot. It allows users to manipulate math objects intuitively.

Terminology in my code:
- FNGobject: FNGobject refers to the smallest functioning unit of the block system. It consists of three parts:
    Object: The core. A JS object describing the math object.
        When created as a blank object, they get a set of default values as properties
    Sortable block: The input. This is the colorful & draggable blocks that the users manipulate.
    SVG element (SvgElem): The output. The FNGobject's rendering result.

- SID: Each FNGobject gets its own SID (system ID) upon creation/load.

- LinePP: A line between two points. This is the first object I complete, and most of my comments are on its related code.
  All the other ones are very similar to it.*/

"use strict";

function makeSID(){ // Generate a 10-character-long "random" alphanumeric system id
    const charList = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let sid = '';
    for (let i = 0; i<10; i++) {
        sid += charList.charAt(Math.floor(Math.random() * 62));
    }
    return sid;
}

//User operations
function createFNGObject(objName, data){
    if(data === null){                             //create a new FNGobject
        const sid = makeSID();
        const data = fngNS.Maps.CLASS_INITDATA.get(objName);   //["objName", [Class, Category, SVG Element]]

        // Step 1 of 3: FNGobject
        const newObj = new data[0](sid);                 //call class constructor        
        fngNS.SysData.objectList.push(newObj);                        //push new object into list
            
        // Step 2 of 3: draggable block
        let newBlock = fngNS.DOM.BASIC_BLOCK_TEMPLATE.cloneNode(true);                              //copy template     
        newBlock.classList.add(`dragblock--${data[1]}`);                                            //add object class
        newBlock.querySelector('.dragblock__icon').src = `svg/system/${data[1]}-icons/${objName}.svg`; //init the small icon
        newBlock.querySelector('.dragblock__label').value = newObj.label;           //display default label
        newBlock.dataset.sid = sid;                                    //assign this id-less block a sid, in sync with the hidden object
        fngNS.DOM.BLOCK_FRAME.appendChild(newBlock); //add the block to block frame

        // Step 3 of 3: SVG element(s)
        let newSVGElem = document.createElementNS(fngNS.Str.SVGNS, data[2]);
        newSVGElem.dataset.sid = sid;
        fngNS.DOM.SVG_CANVAS.appendChild(newSVGElem);    //add the new SVG element to canvas

        // Step 4: Initialize and render the FNGobject for the first time
        newObj.updateMath(newSVGElem);      // render the math part first
        for(const property in newObj.SvgStyle){     //render the svg part
            if (fngNS.Maps.EDITACTION_SI.has(property)) {
                fngNS.Maps.EDITACTION_SI.get(property)(newObj, newSVGElem);
            } else if (fngNS.Maps.EDITACTION_SC.has(property)) {
                fngNS.Maps.EDITACTION_SC.get(property)(newObj, newSVGElem);
            }
        }
    }
}
function moveFNGObject(sid,nextSid) {
    const svgElem = fngNS.DOM.SVG_CANVAS.querySelector(`[data-sid='${sid}']`);
    const refElem = fngNS.DOM.SVG_CANVAS.querySelector(`[data-sid='${nextSid}']`);
    fngNS.DOM.SVG_CANVAS.insertBefore(svgElem,refElem);
}
function deleteFNGObjects() {
    maskOn("mask__inv--blockframe-blocktlbr");
    const blockList = fngNS.DOM.BLOCK_FRAME.querySelectorAll(".dragblock");
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
    fngNS.DOM.BLOCK_FRAME.addEventListener("change", tmpListener);
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
            if (confirm(`Do you want to PERMANENTLY delete ${deleteSet.size} object(s) ?`)) {
                let obj, block, svgElem;
                for (const sid of deleteSet) {
                    obj = fngNS.SysData.objectList.find(item => item.sid === sid);
                    block = fngNS.DOM.BLOCK_FRAME.querySelector(`div[data-sid='${sid}']`);
                    svgElem = fngNS.DOM.SVG_CANVAS.querySelector(`[data-sid='${sid}']`);
                    fngNS.SysData.objectList.splice(fngNS.SysData.objectList.indexOf(obj), 1);
                    block.parentNode.removeChild(block);
                    svgElem.parentNode.removeChild(svgElem);
                }
            }
        }
        // cleanup & signing off
        document.querySelector(".workspace__block-toolbar__display").innerHTML = ">>";
        fngNS.DOM.BLOCK_FRAME.removeEventListener("change", tmpListener);
        document.querySelector(".workspace__block-toolbar__finish-btn").style.display = "none";
        for (const remainingCheckBox of fngNS.DOM.BLOCK_FRAME.querySelectorAll(".dragblock__checkbox")) {
            remainingCheckBox.parentNode.removeChild(remainingCheckBox);
        }
        for (const btn of tlbrList) {
            btn.disabled = false;
        }
        maskOff("mask__inv--blockframe-blocktlbr");
    }
}
function changeVisibility(sid) {
    const obj = fngNS.SysData.objectList.find(item => item.sid === sid);  //find the object with this sid
    const eyeBtn = fngNS.DOM.BLOCK_FRAME.querySelector(`div[data-sid='${sid}']`).querySelector('.dragblock__btn--visibility');
    const svgElem = fngNS.DOM.SVG_CANVAS.querySelector(`[data-sid='${sid}']`);
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
}
function toggleEditPanel(sid) {
    const block = fngNS.DOM.BLOCK_FRAME.querySelector(`div[data-sid='${sid}']`);
    const panel = block.querySelector(".editpanel");
    if(panel === null){ //It doesn't have an editpanel, give it one
        const objName = fngNS.SysData.objectList.find(item => item.sid === sid).constructor.name.toLowerCase(); //obj.constructor.name is the type name of object(ex: LinePP)
        block.insertAdjacentHTML("beforeend", fngNS.SysData.EDITPANEL_TEMPLATES[objName]);
        initEditPanel(block.querySelector(".editpanel"),sid);
    } else { //It has an editpanel, remove it
        panel.parentNode.removeChild(panel);
    }
}
function initEditPanel(panelElem, sid){
    const obj = fngNS.SysData.objectList.find(item => item.sid === sid);
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
}
function handleUserEdit(target, sid, event){ 
    const svgElem = fngNS.DOM.SVG_CANVAS.querySelector(`[data-sid='${sid}']`);    //room for optimization on this one (how to reduce query count for call-intensive operation like color change)
    const obj = fngNS.SysData.objectList.find(item => item.sid === sid);
    const prop = target.dataset.property;
    if (event === "input") {   // Real-time SVG rendering

        //save value to object
        if (prop in obj) {
            math.hasNumericValue(target.value) ? obj[prop] = parseFloat(target.value) : obj[prop] = target.value;
        } else if (prop in obj.SvgStyle) {
            math.hasNumericValue(target.value) ? obj.SvgStyle[prop] = parseFloat(target.value) : obj.SvgStyle[prop] = target.value;
        }

        // svg tyle properties
        if (fngNS.Maps.EDITACTION_SI.has(prop)) {
            fngNS.Maps.EDITACTION_SI.get(prop)(obj, svgElem);
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
            target.closest(".dragblock").querySelector(".dragblock__label").value = target.value;
        } else if (fngNS.Maps.EDITACTION_SC.has(prop)) {   // svg style properties
            fngNS.Maps.EDITACTION_SC.get(prop)(obj, svgElem);
        } else { // Calculate object
            obj.updateMath(svgElem);
        }
    }
}