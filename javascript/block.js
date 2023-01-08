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
        const data = CLASS_INITDATA_MAP.get(objName);   //["objName", [Class, Category, SVG Element]]

        // Step 1 of 3: FNGobject
        const obj = new data[0](sid);                 
        OBJECT_LIST.push(obj);                        //push new object into list
            
        // Step 2 of 3: draggable block
        let newBlock = BASIC_BLOCK_TEMPLATE.cloneNode(true);                              //copy template     
        newBlock.classList.add(data[1]);                                                  //add object class
        newBlock.querySelector('img').src = `svg/system/${data[1]}-icons/${objName}.svg`; //init the small icon
        newBlock.querySelector('.nametag').value = obj.name;           //display default name
        newBlock.dataset.sid = sid;                                    //assign this id-less block a data-id, in sync with the hidden object
        BLOCK_FRAME.appendChild(newBlock); //add the block to block frame

        // Step 3 of 3: SVG element(s)
        let newSVGElem = document.createElementNS(SVGNS, data[2]);
        newSVGElem.dataset.sid = sid;
        SVG_CANVAS.appendChild(newSVGElem);    //add the new SVG element to canvas
        obj.updateStyle();                     //render it for the first time
    }
}
function moveObject(sid,nextSid) {
    const svgElem = SVG_CANVAS.querySelector(`[data-sid='${sid}']`);
    const refElem = SVG_CANVAS.querySelector(`[data-sid='${nextSid}']`);
    SVG_CANVAS.insertBefore(svgElem,refElem);
}
function deleteObject(sid) {
    const obj = OBJECT_LIST.find(item => item.sid == sid);
    const n = confirm(`Do you want to PERMANENTLY delete "${obj.name}" ?`);
    if(n){
        const block = BLOCK_FRAME.querySelector(`div[data-sid='${sid}']`);
        const svgElem = SVG_CANVAS.querySelector(`[data-sid='${sid}']`);
        OBJECT_LIST.splice(OBJECT_LIST.indexOf(obj), 1);
        block.parentNode.removeChild(block);
        svgElem.parentNode.removeChild(svgElem);
    }
}
function changeVisibility(sid) {
    const obj = OBJECT_LIST.find(item => item.sid == sid);  //find the object with this sid
    const eyeBtn = BLOCK_FRAME.querySelector(`div[data-sid='${sid}']`).querySelector('.visibility');
    const svgElem = SVG_CANVAS.querySelector(`[data-sid='${sid}']`);
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
    const block = BLOCK_FRAME.querySelector(`div[data-sid='${sid}']`);
    const panel = block.querySelector(".objblock-editpanel")
    if(panel == null){ //It doesn't have an editpanel, give it one
        const objType = OBJECT_LIST.find(item => item.sid == sid).constructor.name.toLowerCase(); //obj.constructor.name is the type name of object(ex: LinePP)
        block.insertAdjacentHTML("beforeend", EDITPANEL_TEMPLATES[objType]); //use objType to find the panel HTML, then inject into block
        initEditPanel(block.querySelector(".objblock-editpanel"),sid);
    }
    else{ //It has an editpanel, remove it
        BLOCK_FRAME.querySelector(`div[data-sid='${sid}']`).style.height = "50px"; //initiate the closing transition
        BLOCK_FRAME.querySelector(`div[data-sid='${sid}']`).addEventListener("webkitTransitionEnd", function tmp(){ //wait until transition end to remove the editpanel
            panel.parentNode.removeChild(panel);
            BLOCK_FRAME.querySelector(`div[data-sid='${sid}']`).removeEventListener("webkitTransitionEnd", tmp); //remove itself
        });
    }
}
function initEditPanel(panelElem, sid){
    const obj = OBJECT_LIST.find(item => item.sid == sid);
    const inputList = panelElem.querySelectorAll("[data-property]"); //return a list of textboxes(and some other stuff) waiting to be initialized
    for(let inputElem of inputList){
        if(inputElem.type == "checkbox"){
            inputElem.checked = obj[inputElem.dataset.property]; //get their respective properties and display them
        }
        else{
            inputElem.value = obj[inputElem.dataset.property]; //get their respective properties and display them
        }
    };
    panelElem.dataset.objtype = obj.constructor.name.toLowerCase();
    BLOCK_FRAME.querySelector(`div[data-sid='${sid}']`).style.height = `${panelElem.offsetHeight + 65}px`; //A workaround for transition. See https://css-tricks.com/using-css-transitions-auto-dimensions/ for why I resort to this hard-coded method.
    //The magic number "65" is the size of margin-top(55) + margin-bottom(10)
}
function handleUserEdit(target, sid, event){
    const svgElem = SVG_CANVAS.querySelector(`[data-sid='${sid}']`);
    const obj = OBJECT_LIST.find(item => item.sid == sid);
    const objType = target.parentNode.parentNode.dataset.objtype;
    const prop = target.dataset.property;
    console.log(objType, prop);
    if(event == "input"){ 
        if(prop == "name"){
            target.parentNode.parentNode.parentNode.querySelector(".nametag").value = target.value;  //the name display on the block
            s.setAttribute("data-name", this.name);
        }
         //color input could possibly change dozens of times per second, thus bypassing updateStyle() can improve performance
        else if(prop == "strokeColor"){
            svgElem.setAttribute("stroke",target.value);
        }
        else if(prop == "fillColor"){
            svgElem.setAttribute("fill",target.value);
        }
        else if(["strokeWidth", "pathLength", "dashOffset", "strokeOpacity", "fillOpacity"].includes(prop) ||  OBJ_SPECIFIC_INPUTLIST.includes(`${objType} ${prop}`)){  //"linepp x1"
            isNumeric(target.value) ? obj[prop] = parseFloat(target.value) : obj[prop] = target.value;
            obj.updateStyle();
        }
    }
    else if(event == "change"){
        if(["lineCap", "lineJoin", "dashArray", "strokeColor", "fillColor"].includes(prop) || OBJ_SPECIFIC_CHANGELIST.includes(`${objType} ${prop}`)){
            isNumeric(target.value) ? obj[prop] = parseFloat(target.value) : obj[prop] = target.value;
            obj.updateStyle();
        }
    }
}


/*
Wish Lin Dec 2022

This bulky event listener is my naive attempt to strike a balance between real-time updating and generating errors due to transition values during editing.
Basic assumption: Inputs and changes inside BLOCK_FRAME must come from the editpanels.

Problem: Some properties in the editpanel can be updated real-time during editing, while others simply cannot. For (extrerme) example:
dashOffset can take in any value without error, so it can be updated real-time(aka oninput).
Plotted math functions can only be updated onchange(I "hope" it's finished by then, further error handling is needed of course). Anything during editing is not a valid math expression.

Due to performance considerations, there are also a few exceptions that I handle separately. See comments below for detailed information.

My solution is to register all of the cases, divide them into different categories and act accordingly. See below for example.
*/