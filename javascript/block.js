/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright (c) Wei-Hsu Lin(林韋旭) & All Contributors to FNGplot */

/*The block system is the UI of FNGplot. It allows users to manipulate math objects intuitively.

Terminology in my code:
- FNGobject: FNGobject refers to the smallest functioning unit of the block system. It consists of three parts:
    Object: The core. A JS object describing the math object.
        When created as a blank object, they get a set of default values as properties
    Sortable block: The input. This is the colorful & draggable blocks that the users see.
    SVG element: The output. The Object's rendering result on canvas.

- SID: Each FNGobject gets its own SID (system ID) upon creation/load.

- LinePP: A line between two points. This is the first object I complete, and most of my comments are on its related code.
  All the other ones are very similar to it.*/

"use strict";

function makeSID(){ // Generate a 10-character-long "random" alphanumeric system id.
    const charList = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let sid = '';
    for(let i = 0; i<10; i++) {
        sid += charList.charAt(Math.floor(Math.random()*62));
    }
    return sid;
}

//User operations
function createFNGObject(objName, data){
    if(data == null){                             //create a new FNGobject
        const sid = makeSID();
        const data = fngNS.Maps.CLASS_INITDATA_MAP.get(objName);   //["objName", [Class, Category, SVG Element]]

        // Step 1 of 3: FNGobject
        const newObj = new data[0](sid);                 //call class constructor        
        fngNS.SysData.objectList.push(newObj);                        //push new object into list
            
        // Step 2 of 3: draggable block
        let newBlock = fngNS.DOM.BASIC_BLOCK_TEMPLATE.cloneNode(true);                              //copy template     
        newBlock.classList.add(data[1]);                                                  //add object class
        newBlock.querySelector('img').src = `svg/system/${data[1]}-icons/${objName}.svg`; //init the small icon
        newBlock.querySelector('.nametag').value = newObj.name;           //display default name
        newBlock.dataset.sid = sid;                                    //assign this id-less block a data-id, in sync with the hidden object
        fngNS.DOM.BLOCK_FRAME.appendChild(newBlock); //add the block to block frame

        // Step 3 of 3: SVG element(s)
        let newSVGElem = document.createElementNS(fngNS.Str.SVGNS, data[2]);
        newSVGElem.dataset.sid = sid;
        fngNS.DOM.SVG_CANVAS.appendChild(newSVGElem);    //add the new SVG element to canvas

        // Step 4: Initialize and render the FNGobject for the first time
        let action = "";
        for(const property in newObj){               //render all properties one by one, uneditable ones like "sid" are ignored automatically
            action = fngNS.Maps.EDITACTION_MAP.get(property);   //first try, this would return a result if this property is a common one
            action != undefined ? action(newObj, newSVGElem) : action = fngNS.Maps.EDITACTION_MAP.get(`${objName} ${property}`);   //second try, this would return a result if this property is an object-specific one
            if(action != undefined){
                action(newObj, newSVGElem);
            }
            // else{ This property doesn't need to be initialized and/or rendered, like "sid" }
        }
    }
}
function moveObject(sid,nextSid) {
    const svgElem = fngNS.DOM.SVG_CANVAS.querySelector(`[data-sid='${sid}']`);
    const refElem = fngNS.DOM.SVG_CANVAS.querySelector(`[data-sid='${nextSid}']`);
    fngNS.DOM.SVG_CANVAS.insertBefore(svgElem,refElem);
}
function deleteObject(sid) {
    const obj = fngNS.SysData.objectList.find(item => item.sid == sid);
    const n = confirm(`Do you want to PERMANENTLY delete "${obj.name}" ?`);
    if(n){
        const block = fngNS.DOM.BLOCK_FRAME.querySelector(`div[data-sid='${sid}']`);
        const svgElem = fngNS.DOM.SVG_CANVAS.querySelector(`[data-sid='${sid}']`);
        fngNS.SysData.objectList.splice(fngNS.SysData.objectList.indexOf(obj), 1);
        block.parentNode.removeChild(block);
        svgElem.parentNode.removeChild(svgElem);
    }
}
function changeVisibility(sid) {
    const obj = fngNS.SysData.objectList.find(item => item.sid == sid);  //find the object with this sid
    const eyeBtn = fngNS.DOM.BLOCK_FRAME.querySelector(`div[data-sid='${sid}']`).querySelector('.visibility');
    const svgElem = fngNS.DOM.SVG_CANVAS.querySelector(`[data-sid='${sid}']`);
    if(obj.display == true){
        obj.display = false;
        eyeBtn.innerHTML = "visibility_off";                //change the icon to visibility off;
        svgElem.setAttribute("display","none");             //hide the SVG element               
    }
    else if(obj.display == false){
        obj.display = true;
        eyeBtn.innerHTML = "visibility";                    //change the icon to visibility(on);
        svgElem.setAttribute("display","");                 //show the SVG element
    }
}
function toggleEditPanel(sid) {
    const block = fngNS.DOM.BLOCK_FRAME.querySelector(`div[data-sid='${sid}']`);
    const panel = block.querySelector(".objblock-editpanel")
    if(panel == null){ //It doesn't have an editpanel, give it one
        const objName = fngNS.SysData.objectList.find(item => item.sid == sid).constructor.name.toLowerCase(); //obj.constructor.name is the type name of object(ex: LinePP)
        block.insertAdjacentHTML("beforeend", fngNS.SysData.EDITPANEL_TEMPLATES[objName]);
        initEditPanel(block.querySelector(".objblock-editpanel"),sid);
    }
    else{ //It has an editpanel, remove it
        fngNS.DOM.BLOCK_FRAME.querySelector(`div[data-sid='${sid}']`).style.height = "50px"; //initiate the closing animation
        fngNS.DOM.BLOCK_FRAME.querySelector(`div[data-sid='${sid}']`).addEventListener("webkitTransitionEnd", function tmp(){ // wait until transition end to remove the editpanel
            panel.parentNode.removeChild(panel);
            fngNS.DOM.BLOCK_FRAME.querySelector(`div[data-sid='${sid}']`).removeEventListener("webkitTransitionEnd", tmp); // tell the listener to remove itself
        });
    }
}
function initEditPanel(panelElem, sid){
    const obj = fngNS.SysData.objectList.find(item => item.sid == sid);
    const inputList = panelElem.querySelectorAll("[data-property]"); //return a list of textboxes(and some other stuff) waiting to be initialized
    for(let inputElem of inputList){
        if(inputElem.type == "checkbox"){
            inputElem.checked = obj[inputElem.dataset.property]; //get their respective properties and display them
        }
        else{
            inputElem.value = obj[inputElem.dataset.property]; //get their respective properties and display them
        }
    };
    fngNS.DOM.BLOCK_FRAME.querySelector(`div[data-sid='${sid}']`).style.height = `${panelElem.offsetHeight + fngNS.MagicNumber.EDITPANEL_TBMARGIN}px`; //A workaround for transition. See https://css-tricks.com/using-css-transitions-auto-dimensions/ for why I resort to this hard-coded method.
}
function handleUserEdit(target, sid, event){ 
    const svgElem = fngNS.DOM.SVG_CANVAS.querySelector(`[data-sid='${sid}']`);    //room for optimization on this one (how to reduce query count for call-intensive operation like color change)
    const obj = fngNS.SysData.objectList.find(item => item.sid == sid);
    const prop = target.dataset.property;

    // Note: Internal data update always occurs on "change" event, regardless of property

    if(event == "input"){   // Real-time SVG rendering

        /* Speed required, so I placed them here to eliminate map lookup */
        if(prop == "name"){ //special case: name (block nametag update required)
            target.parentNode.parentNode.parentNode.querySelector(".nametag").value = target.value;
            svgElem.setAttribute("data-name", obj.name);
        }
        else if(prop == "strokeColor"){  //special case: color (color input changes rapidly)
            svgElem.setAttribute("stroke",target.value);
        }
        else if(prop == "fillColor"){    //special case: color (color input changes rapidly)
            svgElem.setAttribute("fill",target.value);
        }

        /* Normal Flow*/
        else{
            math.hasNumericValue(target.value) ? obj[prop] = parseFloat(target.value) : obj[prop] = target.value;  //save value to object

            // Common properties of many FNGobjects
            if(["strokeWidth", "pathLength", "dashOffset", "strokeOpacity", "fillOpacity", "lineCap", "lineJoin"].includes(prop)){
                math.hasNumericValue(target.value) ? obj[prop] = parseFloat(target.value) : obj[prop] = target.value;
                fngNS.Maps.EDITACTION_MAP.get(prop)(obj, svgElem);
            }
            // Object-specific properties
            else{
                const objName = target.parentNode.parentNode.dataset.objname;
                const action = fngNS.Maps.EDITACTION_MAP.get(`${objName} ${prop}`); //search for the required action
                if(action != undefined){   // action found
                    action(obj, svgElem);  // then do it
                }
                // else { This input event should be ignored by FNGplot }
            }
        }
    }

    else if(event == "change"){
        math.hasNumericValue(target.value) ? obj[prop] = parseFloat(target.value) : obj[prop] = target.value;  //save value to object

        // Common properties of many FNGobjects
        if(["dashArray"].includes(prop)){
            math.hasNumericValue(target.value) ? obj[prop] = parseFloat(target.value) : obj[prop] = target.value;
            fngNS.Maps.EDITACTION_MAP.get(prop)(obj, svgElem);
        }
        // Object-specific properties
        else{
            const objName = target.parentNode.parentNode.dataset.objname;
            const action = fngNS.Maps.EDITACTION_MAP.get(`${objName} ${prop}`); //search for the required action
            if(action != undefined){   // action found
                action(obj, svgElem);  // then do it
            }
            // else { This change event should be ignored by FNGplot }
        }
    }
}