/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright (c) Wei-Hsu Lin(林韋旭) & All Contributors to FNGplot */

/* 
The block system is the UI of FNGplot. It allows users to manipulate math objects intuitively.

Terminology in my code:
- FNGobject: FNGobject refers to the smallest functioning unit of the block system. It consists of three parts:
    Object: The core. A JS object describing the math object.
    Sortable block: The input. This is the colorful & draggable blocks that the users see.
    SVG element: The output. The Object's rendering result on canvas.

- SID: Each FNGobject gets its own SID (system ID) upon creation/load.

- LinePP: A line between two points. This is the first object I complete, and most of my comments are on its related code.
  All the other ones are very similar to it.
*/

"use strict";

function makeSID(){ //Generate a 10-character-long "random" alphanumeric system id.
    const charList = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let sid = '';
    for(let i = 0; i<10; i++) {
        sid += charList.charAt(Math.floor(Math.random()*62));
    }
    return sid;
}

//User operations
function createFNGObject(objName, loadData){
    if(loadData == null){                             //create a new FNGobject
        const sid = makeSID();
        const data = CLASS_INITDATA_MAP.get(objName);

        // Step 1 of 3: FNGobject
        const obj = new data[0](sid);                 //data[0] is the class
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
        obj.renderToSVG();                     //render it for the first time
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
function initEditPanel(panelElem,sid){
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


// Constructors
class LinePP {
    constructor(sid) {
        //------All attributes except sid have a default value before the user changes them.
        //System
        this.sid = sid;
        this.display = true;
        //User
        this.name = "2-point line";
        //Math
        this.x1 = -5;
        this.y1 = -4;
        this.x2 = 5;
        this.y2 = 2;
        //Style
        this.strokeWidth = 10;
        this.lineCap = "round";
        this.pathLength = 100;
        this.dashArray = '';
        this.dashOffset = 0;
        this.strokeColor = "#8a408b"; //Wisteria purple
        this.strokeOpacity = 1;
        //Method
        this.renderToSVG = function() { //currently, all properties are updated together. There is room for optimization in the future.
            const s = SVG_CANVAS.querySelector(`[data-sid='${this.sid}']`); //Find this object's SVG output
            s.setAttribute("display",this.display ? "" : "none"); // everything other than "none" is true for this property
            //--user--
            s.dataset.name = this.name; //equal to s.setAttribute("data-name",this.name)
            //--math--
            s.setAttribute("x1",toPixelPosX(this.x1));
            s.setAttribute("y1",toPixelPosY(this.y1));
            s.setAttribute("x2",toPixelPosX(this.x2));
            s.setAttribute("y2",toPixelPosY(this.y2));
            //--style--
            s.setAttribute("stroke",this.strokeColor);
            s.setAttribute("stroke-width",this.strokeWidth);
            s.setAttribute("stroke-opacity",this.strokeOpacity);
            s.setAttribute("stroke-linecap",this.lineCap);
            s.setAttribute("pathLength",this.pathLength);
            s.setAttribute("stroke-dasharray",this.dashArray);
            s.setAttribute("stroke-dashoffset",this.dashOffset);
        };
    }
}
class Rect {
    constructor(sid) {
        //System
        this.sid = sid;
        this.display = true;
        //User
        this.name = "Rectangle";
        //Math
        this.originHoriz = "left";  //these two properties means that the origin specified is the rectangle's "bottom left" corner
        this.originVert = "bottom";
        this.originX = -1;
        this.originY = -2;
        this.width = 7;
        this.height = 5;
        //Style
        this.roundCornerX = 0;
        //--stroke--
        this.hasBorder = true;
        this.strokeColor = "#8a408b";
        this.strokeOpacity = 1;
        this.strokeWidth = 10;
        this.lineJoin = "miter";  //miterlimit is not a problem here since all angles are 90 degrees
        this.lineCap = "butt";          //only relevant on dashline mode
        this.pathLength = 100;
        this.dashArray = '';
        this.dashOffset = 0;
        //--fill--
        this.hasFill = true;
        this.fillColor = "#ddcfff";
        this.fillOpacity = 1;
        //Method
        this.renderToSVG = function() {
            const s = SVG_CANVAS.querySelector(`[data-sid='${this.sid}']`);
            s.setAttribute("display",this.display ? "" : "none");
            //--user--
            s.dataset.name = this.name; 
            //--math--
            s.setAttribute("x",toPixelPosX(this.originX - RECT_ORIGMAP.get(this.originHoriz) * this.width));
            s.setAttribute("y",toPixelPosY(this.originY + RECT_ORIGMAP.get(this.originVert) * this.height));
            s.setAttribute("width",toPixelLenX(this.width));
            s.setAttribute("height",toPixelLenY(this.height));
            //--style--
            s.setAttribute("rx",this.roundCornerX);
            s.setAttribute("stroke",this.hasBorder ? this.strokeColor : "none");
            s.setAttribute("stroke-width",this.strokeWidth);
            s.setAttribute("stroke-opacity",this.strokeOpacity);
            s.setAttribute("stroke-linejoin",this.lineJoin);
            s.setAttribute("stroke-linecap",this.lineCap);
            s.setAttribute("pathLength",this.pathLength);
            s.setAttribute("stroke-dasharray",this.dashArray);
            s.setAttribute("stroke-dashoffset",this.dashOffset);
            s.setAttribute("fill",this.hasFill ? this.fillColor : "none");
            s.setAttribute("fill-opacity",this.fillOpacity);
        };
    }
}
class Circle {                 //Actually uses an ellipse, in case XHAT != YHAT
    constructor(sid) {
        //System
        this.sid = sid;
        this.display = true;
        //User
        this.name = "Circle";
        //Math
        this.centerX = 2;
        this.centerY = 4;
        this.radius = 2.5;
        //Style
        //--stroke--
        this.hasBorder = true;
        this.strokeColor = "#8a408b";
        this.strokeOpacity = 1;
        this.strokeWidth = 10;
        this.lineCap = "butt";          //only relevant on dashline mode
        this.pathLength = 100;
        this.dashArray = '';
        this.dashOffset = 0;
        //--fill--
        this.hasFill = true;
        this.fillColor = "#ddcfff";
        this.fillOpacity = 1;
        //Method
        this.renderToSVG = function() {
            const s = SVG_CANVAS.querySelector(`[data-sid='${this.sid}']`);
            s.setAttribute("display",this.display ? "" : "none");
            //--user--
            s.dataset.name = this.name; 
            //--math--
            s.setAttribute("cx",toPixelPosX(this.centerX));
            s.setAttribute("cy",toPixelPosY(this.centerY));
            s.setAttribute("rx",toPixelLenX(this.radius));
            s.setAttribute("ry",toPixelLenY(this.radius));
            //--style--
            s.setAttribute("stroke",this.hasBorder ? this.strokeColor : "none");
            s.setAttribute("stroke-width",this.strokeWidth);
            s.setAttribute("stroke-opacity",this.strokeOpacity);
            s.setAttribute("stroke-linejoin",this.lineJoin);
            s.setAttribute("stroke-linecap",this.lineCap);
            s.setAttribute("pathLength",this.pathLength);
            s.setAttribute("stroke-dasharray",this.dashArray);
            s.setAttribute("stroke-dashoffset",this.dashOffset);
            s.setAttribute("fill",this.hasFill ? this.fillColor : "none");
            s.setAttribute("fill-opacity",this.fillOpacity);
        };
    }
}
