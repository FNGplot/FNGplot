/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright (c) Wei-Hsu Lin(林韋旭) & All Contributors to FNGplot */

import {fngNameSpace as glob } from ".\glob.js";     // global variable module

export let fngObjects = (function() {

    "use strict";

    return {
        /* [!] FNGobject-exclusive data */
        InitMap: new Map([    // Data and reference used to initialize object
            //["Object Name", [Class, Category, SVG Element]],
            ["linepp", [LinePP, "geometry", "line"]],
            ["lineps", [LinePS, "geometry", "line"]],
            ["lineppext", [LinePPExt, "geometry", "line"]],
            ["rect", [Rect, "geometry", "rect"]],
            ["triangle", [Triangle, "geometry", "polygon"]],
            ["circle", [Circle, "geometry", "ellipse"]],
            ["circle3p", [Circle3P, "geometry", "ellipse"]],
        ]),
        LiteralOrigin: Object.freeze({  // A small key:value map used by FNGobjects that offer origin positioning
            TOP: 0,
            LEFT: 0,
            MIDDLE: 0.5,
            BOTTOM: 1,
            RIGHT: 1,
        }),

        /* [!] Classes: Parent */
        /* Class.SvgStyle: Anything that is a SVG presentation attribute, i.e, there is NEVER calculation on my part whatsoever */
        StrokeParent: class StrokeParent {  //parent of objects with stroke only
            constructor(sid) {
                this.sid = sid;
                this.SvgStyle = {
                    display: true,
                    strokeWidth: 10,
                    lineCap: "butt",
                    pathLength: 150,
                    dashArray: '',
                    dashOffset: 0,
                    strokeColor: "#8a408b", // Wisteria purple
                    strokeOpacity: 100,
                }
            }
        },
        StrokeFillParent: class StrokeFillParent { //parent of objects with both fill and stroke(border)
            constructor(sid) {
                this.sid = sid;
                this.SvgStyle = {
                    display: true,
                    strokeWidth: 10,
                    lineCap: "butt",
                    pathLength: 150,
                    dashArray: '',
                    dashOffset: 0,
                    strokeColor: "#8a408b", // Wisteria purple
                    strokeOpacity: 100,
                    fillColor: "#ddcfff",
                    fillOpacity: 100,
                }
            }
        },

        /* [!] Classes: Geometry */
        LinePP: class LinePP extends StrokeParent {
            constructor(sid) {
                super(sid);
                this.label = "2-point line";
                this.x1 = -5;
                this.y1 = -4;
                this.x2 = 5;
                this.y2 = 2;
            }
            updateMath(svgElem) {
                svgElem.setAttribute("x1", glob.Coord.toPxPosX(this.x1));
                svgElem.setAttribute("x2", glob.Coord.toPxPosX(this.x2));
                svgElem.setAttribute("y1", glob.Coord.toPxPosY(this.y1));
                svgElem.setAttribute("y2", glob.Coord.toPxPosY(this.y2));
            }
        },
        LinePPExt: class LinePPExt extends StrokeParent {
            constructor(sid) {
                super(sid);
                this.label = "Extended 2p line";
                this.x1 = -4;
                this.y1 = -3;
                this.x2 = 6;
                this.y2 = 3;
                this.startExtend = 0.7;
                this.endExtend = 1.3;
            }
            updateMath(svgElem) {
                if (this.x1 === this.x2) {   // vertical line
                    if (this.y1 <= this.y2) {   // goes up
                        svgElem.setAttribute("x1", glob.Coord.toPxPosX(this.x1));
                        svgElem.setAttribute("x2", glob.Coord.toPxPosX(this.x2));
                        svgElem.setAttribute("y1", glob.Coord.toPxPosY(this.y1 - this.startExtend));
                        svgElem.setAttribute("y2", glob.Coord.toPxPosY(this.y2 + this.endExtend));
                    } else if (this.y1 > this.y2) {  // goes down
                        svgElem.setAttribute("x1", glob.Coord.toPxPosX(this.x1));
                        svgElem.setAttribute("x2", glob.Coord.toPxPosX(this.x2));
                        svgElem.setAttribute("y1", glob.Coord.toPxPosY(this.y1 + this.startExtend));
                        svgElem.setAttribute("y2", glob.Coord.toPxPosY(this.y2 - this.endExtend));
                    }
                } else {    // normal line with meaningful slope
                    const [dx, dy] = [
                        this.x2 - this.x1,
                        this.y2 - this.y1,
                    ];
                    const distance = Math.sqrt(dx**2 + dy**2);
                    svgElem.setAttribute("x1", glob.Coord.toPxPosX(this.x1 - dx * this.startExtend / distance));
                    svgElem.setAttribute("x2", glob.Coord.toPxPosX(this.x2 + dx * this.endExtend / distance));
                    svgElem.setAttribute("y1", glob.Coord.toPxPosY(this.y1 - dy * this.startExtend / distance));
                    svgElem.setAttribute("y2", glob.Coord.toPxPosY(this.y2 + dy * this.endExtend / distance));
                }
            }
        },
        LinePS: class LinePS extends StrokeParent {
            constructor(sid) {
                super(sid);
                this.label = "Point-slope line";
                this.x = 1;
                this.y = 2;
                this.slope = 1.5;
                this.leftExtend = 4.5;
                this.rightExtend = 2.7;
            }
            updateMath(svgElem) {
                if(this.slope === ""){    //user admits that it is a vertical line (Note: 0 == "")
                    svgElem.setAttribute("x1", glob.Coord.toPxPosX(this.x));
                    svgElem.setAttribute("x2", glob.Coord.toPxPosX(this.x));
                    svgElem.setAttribute("y1", glob.Coord.toPxPosY(this.y - this.leftExtend));
                    svgElem.setAttribute("y2", glob.Coord.toPxPosY(this.y + this.rightExtend));
                } else {    //has a slope
                    svgElem.setAttribute("x1", glob.Coord.toPxPosX(this.x - this.leftExtend * Math.cos(Math.atan2(this.slope, 1))));
                    svgElem.setAttribute("x2", glob.Coord.toPxPosX(this.x + this.rightExtend * Math.cos(Math.atan2(this.slope, 1))));
                    svgElem.setAttribute("y1", glob.Coord.toPxPosY(this.y - this.leftExtend * Math.sin(Math.atan2(this.slope, 1))));
                    svgElem.setAttribute("y2", glob.Coord.toPxPosY(this.y + this.rightExtend * Math.sin(Math.atan2(this.slope, 1))));
                }
            }
        },
        Rect: class Rect extends StrokeFillParent {
            constructor(sid) {
                super(sid);
                this.label = "Rectangle";
                //Origin specified is used as the rectangle's "bottom left" corner. Value at enum "LiteralOrigin".
                this.originHoriz = "LEFT";
                this.originVert = "BOTTOM";
                this.originX = -1;
                this.originY = -2;
                this.width = 7;
                this.height = 5;
                this.roundCorner = 0;
                this.SvgStyle.lineJoin = "miter";
            }
            updateMath(svgElem) {
                svgElem.setAttribute("x", glob.Coord.toPxPosX(this.originX - LiteralOrigin[this.originHoriz] * this.width));
                svgElem.setAttribute("y", glob.Coord.toPxPosY(this.originY + LiteralOrigin[this.originVert] * this.height));
                svgElem.setAttribute("rx", this.roundCorner);
                svgElem.setAttribute("width", glob.Coord.toPxLenX(this.width));
                svgElem.setAttribute("height", glob.Coord.toPxLenY(this.height));
            }
        },
        Triangle: class Triangle extends StrokeFillParent {
            constructor(sid) {
                super(sid);
                this.label = "Triangle";
                this.x1 = -5;
                this.y1 = -6;
                this.x2 = 6;
                this.y2 = -5;
                this.x3 = 1;
                this.y3 = 5;
                this.SvgStyle.lineJoin = "miter";
                this.SvgStyle.miterLimit = "4";  // for acute triangles (4 is default value)
            }
            updateMath(svgElem) {
                const [x1, y1, x2, y2, x3, y3] = [
                    glob.Coord.toPxPosX(this.x1),
                    glob.Coord.toPxPosY(this.y1),
                    glob.Coord.toPxPosX(this.x2),
                    glob.Coord.toPxPosY(this.y2),
                    glob.Coord.toPxPosX(this.x3),
                    glob.Coord.toPxPosY(this.y3),
                ];
                svgElem.setAttribute("points", `${x1},${y1} ${x2},${y2} ${x3},${y3}`);
            }
        },
        Circle: class Circle extends StrokeFillParent {  // Actually uses an SVG <ellipse> in case user sets glob.Coord.xHat != glob.Coord.yHat
            constructor(sid) {
                super(sid);
                this.label = "Circle";
                this.cx = 2;
                this.cy = 4;
                this.radius = 2.5;
            }
            updateMath(svgElem) {
                    svgElem.setAttribute("cx", glob.Coord.toPxPosX(this.cx));
                    svgElem.setAttribute("cy", glob.Coord.toPxPosY(this.cy));
                    svgElem.setAttribute("rx", glob.Coord.toPxLenX(this.radius));
                    svgElem.setAttribute("ry", glob.Coord.toPxLenY(this.radius));
            }
        },
        Circle3P: class Circle3P extends StrokeFillParent {
            constructor(sid) {
                super(sid);
                this.label = "3-point circle";
                this.x1 = 1;
                this.y1 = 1;
                this.x2 = 2;
                this.y2 = 3;
                this.x3 = -2;
                this.y3 = 6;
            }
            updateMath(svgElem) {
                // Calculate circumcenter from three points
                // Formula: https://blog.csdn.net/liyuanbhu/article/details/52891868
                const [a, b, c, d, e, f] = 
                    [   
                        this.x1 - this.x2,
                        this.y1 - this.y2,
                        this.x1 - this.x3,
                        this.y1 - this.y3,
                        0.5 * ((this.x1**2 - this.x2**2) - (this.y2**2 - this.y1**2)),
                        0.5 * ((this.x1**2 - this.x3**2) - (this.y3**2 - this.y1**2)),
                    ];
                if (Math.abs(math.det([[a, b], [c, d]])) < 1e-6) {    //colinear
                    svgElem.setAttribute("cx", 0);
                    svgElem.setAttribute("cy", 0);
                    svgElem.setAttribute("rx", 0);
                    svgElem.setAttribute("ry", 0);
                } else {
                    const [cx,cy] = 
                        [
                            -(d * e - b * f) / (b * c - a * d),
                            -( a * f - c * e) / (b * c - a * d),
                        ];
                    svgElem.setAttribute("cx", glob.Coord.toPxPosX(cx));
                    svgElem.setAttribute("cy", glob.Coord.toPxPosY(cy));
                    svgElem.setAttribute("rx", glob.Coord.toPxLenX(math.distance([cx,cy], [this.x1, this.y1])));
                    svgElem.setAttribute("ry", glob.Coord.toPxLenY(math.distance([cx,cy], [this.x1, this.y1])));
                }
            }
        },

        /* [!] Methods */
        makeSID: function() { // Generate a 10-character-long "random" alphanumeric system id
            const charList = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
            let sid = '';
            for (let i = 0; i<10; i++) {
                sid += charList.charAt(Math.floor(Math.random() * 62));
            }
            return sid;
        },
        createFNGObject: function(objName, data) {
            if (data === null) {                             //create a new FNGobject
                const sid = makeSID();
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
            maskOn("mask__inv--blockframe-blocktlbr");
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
                    if (confirm(`Do you want to PERMANENTLY delete ${deleteSet.size} object(s) ?`)) {
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
                maskOff("mask__inv--blockframe-blocktlbr");
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
                initEditPanel(block.querySelector(".editpanel"),sid);
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