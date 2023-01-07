/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright (c) Wei-Hsu Lin(林韋旭) & All Contributors to FNGplot */

/*
FNGplot follows Douglas Crockford's naming convention for JS: https://www.crockford.com/code.html
- functionName
- GLOBAL_VARIABLE
- localVariable
- ObjectName
*Any variable name with ending "_MAP" is an ES6 Map.

HTML elements should ONLY use dashes as word seperators:
- html-element-id
- html-class-name
- data-shortname        // HTML5 dataset

Sections: Sections in this file can be navigated by searching for the following bookmarks:
- Big section: [!!]
- Section: [!]
*/

"use strict";

/* [!!] Global variable declaration */

/* [!] Classes: Parent */

class StrokeParent {  //parent of objects with stroke only
    constructor(sid){
        this.sid = sid;
        this.display = true;
        this.name = "Default Name";
        //Style
        this.strokeWidth = 10;
        this.lineCap = "butt";
        this.pathLength = 100;
        this.dashArray = '';
        this.dashOffset = 0;
        this.strokeColor = "#8a408b"; // Wisteria purple
        this.strokeOpacity = 1;
    }
    renderToSVG(s) {
        s.setAttribute("data-name", this.name); 
        s.setAttribute("display", this.display ? "" : "none");
        s.setAttribute("stroke", this.strokeColor);
        s.setAttribute("stroke-width", this.strokeWidth);
        s.setAttribute("stroke-opacity", this.strokeOpacity);
        s.setAttribute("stroke-linecap", this.lineCap);
        s.setAttribute("pathLength", this.pathLength);
        s.setAttribute("stroke-dasharray", this.dashArray);
        s.setAttribute("stroke-dashoffset", this.dashOffset); 
    }
}
class StrokeFillParent extends StrokeParent { //parent of objects with both fill and stroke(border)
    constructor(sid){
        super(sid);
        this.hasBorder = "true";
        this.hasFill = true;
        this.fillColor = "#ddcfff";
        this.fillOpacity = 1;
    }
    renderToSVG(s) {
        super.renderToSVG(s);
        s.setAttribute("stroke", this.hasBorder ? this.strokeColor : "none");
        s.setAttribute("fill", this.hasFill ? this.fillColor : "none");
        s.setAttribute("fill-opacity", this.fillOpacity); 
    }
}

/* [!] Classes: General */

class LinePP extends StrokeParent {
    constructor(sid) {
        super(sid);
        this.name = "2-point line";
        this.x1 = -5;
        this.y1 = -4;
        this.x2 = 5;
        this.y2 = 2;
    }
    renderToSVG() { 
        const s = SVG_CANVAS.querySelector(`[data-sid='${this.sid}']`); // Get element
        super.renderToSVG(s);
        s.setAttribute("x1",toPixelPosX(this.x1));
        s.setAttribute("y1",toPixelPosY(this.y1));
        s.setAttribute("x2",toPixelPosX(this.x2));
        s.setAttribute("y2",toPixelPosY(this.y2));
    }   
}
class Rect extends StrokeFillParent {
    constructor(sid){
        super(sid);
        this.name = "Rectangle";
        //Origin specified is used as the rectangle's "bottom left" corner
        this.originHoriz = "left";  
        this.originVert = "bottom";
        this.originX = -1;
        this.originY = -2;
        this.width = 7;
        this.height = 5;
        this.roundCorner = 0;
        this.lineJoin = "miter";
    }
    renderToSVG(){
        const s = SVG_CANVAS.querySelector(`[data-sid='${this.sid}']`);
        super.renderToSVG(s);
        s.setAttribute("x",toPixelPosX(this.originX - RECT_ORIGMAP.get(this.originHoriz) * this.width));
        s.setAttribute("y",toPixelPosY(this.originY + RECT_ORIGMAP.get(this.originVert) * this.height));
        s.setAttribute("width",toPixelLenX(this.width));
        s.setAttribute("height",toPixelLenY(this.height));
        s.setAttribute("rx",this.roundCorner);
        s.setAttribute("stroke-linejoin",this.lineJoin);
    }
}
class Circle extends StrokeFillParent {    //Actually uses an ellipse, in case XHAT != YHAT
    constructor(sid) {
        super(sid);
        this.name = "Circle";
        this.centerX = 2;
        this.centerY = 4;
        this.radius = 2.5;
    }
    renderToSVG() {
        const s = SVG_CANVAS.querySelector(`[data-sid='${this.sid}']`);
        super.renderToSVG(s);
        s.setAttribute("cx",toPixelPosX(this.centerX));
        s.setAttribute("cy",toPixelPosY(this.centerY));
        s.setAttribute("rx",toPixelLenX(this.radius));
        s.setAttribute("ry",toPixelLenY(this.radius));
    }
}

/*  Frequently referenced DOM objects & strings: */

// DOM objects
const BLOCK_FRAME = document.querySelector('#block-frame');
const SVG_FRAME = document.querySelector('#svg-frame');
const SVG_CANVAS = document.querySelector('#svg-canvas');
const BASIC_BLOCK_TEMPLATE = document.querySelector('#basic-block-template').content.firstElementChild;

// Strings
const SVGNS = "http://www.w3.org/2000/svg";

/* [!] System data -- static*/

// https://stackoverflow.com/questions/1366127/how-do-i-make-javascript-object-using-a-variable-string-to-define-the-class-name/68016983#68016983
const CLASS_INITDATA_MAP = new Map([
    //["key", [Object Class, Category, SVG Element] ],
    ["linepp", [LinePP, "geometry", "line"]],
    ["rect", [Rect, "geometry", "rect"]],
    ["circle", [Circle, "geometry", "ellipse"]]
]);
const TOOLBAR_CLR = ['#f0923b','#5f95f7','#9268f6','#c763d0','#67bc59','#6dbde2','#4868ce','#ed7082','#f3af42']; // Based on MIT Scratch 2.0/3.0
const OBJ_SPECIFIC_INPUTLIST = [    //Used by real-time-update eventlistener
    "linepp x1", "linepp y1", "linepp x2", "linepp y2",
    "rect originX" ,"rect originY", "rect roundCornerX", "rect roundCornerY", "rect width", "rect height",
    "circle centerX", "circle centerY", "circle radius"
];
const OBJ_SPECIFIC_CHANGELIST = [    //Used by real-time-update eventlistener
    "rect originHoriz", "rect originVert"
];
const RECT_ORIGMAP = new Map([       //A small map used by "Rect" object
    ["top", 0],
    ["left", 0],
    ["middle", 0.5],
    ["bottom", 1],
    ["right", 1],
]);

/* [!] System data -- dynamic*/

// Object database
let OBJECT_LIST = [];   //Unordered object reference array
let SORTABLE_LIST = []; //SortableJS object reference array

// Cartesian coordinate
let XMAX = 10;
let XMIN = -10;
let YMAX = 10;
let YMIN = -10;
let XHAT = 50;
let YHAT = 50;
let ORIGIN_X = 500; //"real" x and y coordinates of the origin point in the SVG.
let ORIGIN_Y = 500;

//------↓↓↓↓↓↓↓↓Edit panel templates↓↓↓↓↓↓↓↓-------------------

const EDITPANEL_TEMPLATES = {
    linepp:`
<div class="objblock-editpanel">
    <div class="label-monospace">-----------User-----------------</div>
    <div>Name: <input type="text" data-property="name" class="size-long"></div>
    <div class="label-monospace">-----------Math-----------------</div>
    <div>Start Point: ( <input type="number" step="0.5" data-property="x1" class="size-short"> , <input type="number" step="0.5" data-property="y1" class="size-short"> )</div>
    <div>End Point: ( <input type="number" step="0.5" data-property="x2" class="size-short"> , <input type="number" step="0.5" data-property="y2" class="size-short"> )</div>
    <div class="label-monospace">-----------Style: Basic---------</div>
    <div>Width: <input type="number" min="0" data-property="strokeWidth" class="size-short"></div>
    <div>Color: <input type="color" data-property="strokeColor" class="size-short"></div>
    <div>Opacity: <input type="number" min="0" max="1" step="0.01" data-property="strokeOpacity" class="size-short"></div>
    <div class="label-monospace">-----------Style: Advanced------</div>
    <div>LineCap: 
        <select data-property="lineCap" class="size-medium">
            <option value="round" selected>Round</option>
            <option value="butt">Butt</option>
            <option value="square">Square</option>
        </select>
    </div>
    <div>PathLength: <input type="number" min="0" data-property="pathLength" class="size-short"></div>
    <div>DashArray: <input type="text" data-property="dashArray" class="size-medium"> </div>
    <div>DashOffset: <input type="number" data-property="dashOffset" class="size-short"></div>
    <div class="label-monospace">-----------System---------------</div>
    <div>SystemID: <input type="text" data-property="sid" class="idtag" disabled></div>
</div>`,

    rect:`
<div class="objblock-editpanel">
    <div class="label-monospace">-----------User-----------------</div>
    <div>Name: <input type="text" data-property="name" class="size-long"></div>
    <div class="label-monospace">-----------Math-----------------</div>
    <div>Origin: ( <input type="number" step="0.5" data-property="originX" class="size-short"> , <input type="number" step="0.5" data-property="originY" class="size-short"> )</div>
    <div>OriginMode: 
        <select data-property="originVert" class="size-medium">
            <option value="top">Top</option>
            <option value="middle">Middle</option>
            <option value="bottom" selected>Bottom</option>
        </select>
        <select data-property="originHoriz" class="size-medium">
            <option value="left" selected>Left</option>
            <option value="middle">Middle</option>
            <option value="right">Right</option>
        </select>
    </div>
    <div>Width: <input type="number" min="0" data-property="width" class="size-short"></div>
    <div>Height: <input type="number" min="0" data-property="height" class="size-short"></div>
    <div class="label-monospace">-----------Style: Basic---------</div>
    <div>Show Border: <input type="checkbox" data-property="hasBorder"> Show Fill: <input type="checkbox" data-property="hasFill"></div>
    <div>BorderColor: <input type="color" data-property="strokeColor" class="size-short"></div>
    <div>BorderWidth: <input type="number" min="0" data-property="strokeWidth" class="size-short"></div>
    <div>BorderOpacity: <input type="number" min="0" max="1" step="0.01" data-property="strokeOpacity" class="size-short"></div>
    <div>FillColor: <input type="color" data-property="fillColor" class="size-short"></div>
    <div>FillOpacity: <input type="number" min="0" max="1" step="0.01" data-property="fillOpacity" class="size-short"></div>
    <div class="label-monospace">-----------Style: Advanced------</div>
    <div>RoundedCorner: <input type="number" min="0" data-property="roundCornerX" class="size-short"></div>
    <div>BorderLineJoin:
        <select data-property="lineJoin" class="size-medium">
            <option value="miter" selected>Miter</option>
            <option value="bevel">Bevel</option>
            <option value="round">Round</option>
        </select>
    </div>
    <div>BorderLineCap(dash):
        <select data-property="lineCap" class="size-medium">
            <option value="round" selected>Round</option>
            <option value="butt">Butt</option>
            <option value="square">Square</option>
        </select>
    </div>
    <div>PathLength: <input type="number" min="0" data-property="pathLength" class="size-short"></div>
    <div>DashArray: <input type="text" data-property="dashArray" class="size-medium"> </div>
    <div>DashOffset: <input type="number" data-property="dashOffset" class="size-short"></div>
    <div class="label-monospace">-----------System---------------</div>
    <div>SystemID: <input type="text" data-property="sid" class="idtag" disabled></div>
</div>`,

    circle:`
<div class="objblock-editpanel">
    <div class="label-monospace">-----------User-----------------</div>
    <div>Name: <input type="text" data-property="name" class="size-long"></div>
    <div class="label-monospace">-----------Math-----------------</div>
    <div>Center: ( <input type="number" step="0.5" data-property="centerX" class="size-short"> , <input type="number" step="0.5" data-property="centerY" class="size-short"> )</div>
    <div>Radius: <input type="number" min="0" data-property="radius" class="size-short"></div>
    <div class="label-monospace">-----------Style: Basic---------</div>
    <div>Show Border: <input type="checkbox" data-property="hasBorder"> Show Fill: <input type="checkbox" data-property="hasFill"></div>
    <div>BorderColor: <input type="color" data-property="strokeColor" class="size-short"></div>
    <div>BorderWidth: <input type="number" min="0" data-property="strokeWidth" class="size-short"></div>
    <div>BorderOpacity: <input type="number" min="0" max="1" step="0.01" data-property="strokeOpacity" class="size-short"></div>
    <div>FillColor: <input type="color" data-property="fillColor" class="size-short"></div>
    <div>FillOpacity: <input type="number" min="0" max="1" step="0.01" data-property="fillOpacity" class="size-short"></div>
    <div class="label-monospace">-----------Style: Advanced------</div>
    <div>BorderLineCap(dash):
        <select data-property="lineCap" class="size-medium">
            <option value="round" selected>Round</option>
            <option value="butt">Butt</option>
            <option value="square">Square</option>
        </select>
    </div>
    <div>PathLength: <input type="number" min="0" data-property="pathLength" class="size-short"></div>
    <div>DashArray: <input type="text" data-property="dashArray" class="size-medium"> </div>
    <div>DashOffset: <input type="number" data-property="dashOffset" class="size-short"></div>
    <div class="label-monospace">-----------System---------------</div>
    <div>SystemID: <input type="text" data-property="sid" class="idtag" disabled></div>
</div>`,

}

/* [!!] Primary initialization sequence */

// [!] Event Listeners

document.querySelector("#left-panel-select").addEventListener("change", () => {
    switchLeftPanel(document.querySelector("#left-panel-select").value);
});

document.querySelector("#envir-datalist-refresh").addEventListener("click", () => {
	updateEnvirList();
});

for(const item of ["input", "change"]){
    document.querySelector("#rootzoom-slider").addEventListener(item, () => {
        changeRootZoom(document.querySelector("#rootzoom-slider").value,item);
    });
};

BLOCK_FRAME.addEventListener("click",(event) => {  //event delegation
    const target = event.target;
    if(target.classList.contains("visibility")){  //change visibility
        changeVisibility(target.parentElement.dataset.sid);
    }
    else if(target.classList.contains("edit")){  //toggle editpanel
        toggleEditPanel(target.parentElement.dataset.sid);
    }
    else if(target.classList.contains("delete")){  //delete block
        deleteObject(target.parentElement.dataset.sid);
    }
});

/*
Wish Lin Dec 2022

This bulky event listener is my naive attempt to strike a balance between real-time updating and generating errors due to transition values during editing.
Basic assumption: Inputs and changes inside BLOCK_FRAME must come from the editpanels.

Problem: Some properties in the editpanel can be updated real-time during editing, while others simply cannot. For (extrerme) example:
dashOffset can take in any value without error, so it can be updated real-time(aka oninput).
Plotted math functions can only be updated onchange(I "hope" it's finished by then, further error handling is needed of course). Anything during editing is not a valid math expression.

Due to performance considerations, there are also a few exceptions that I handle separately. See comments below for detailed information.

My solution is to register all of the cases, divide them into different categories and act accordingly. See below for example.

List of FNGobjects registered:
LinePP: Complete
Rect: Complete
Circle: Complete
*/
for(const item of ["input", "change"]){ //comment example: I changed a LinePP object's "x1" attribute through typing (not using arrows)
    BLOCK_FRAME.addEventListener(item, (event) => {  
        const target = event.target;
        const svgElem = SVG_CANVAS.querySelector(`[data-sid='${event.target.parentNode.parentNode.parentNode.dataset.sid}']`);
        const obj = OBJECT_LIST.find(item => item.sid == event.target.parentNode.parentNode.parentNode.dataset.sid); //the object
        const type = event.target.parentNode.parentNode.dataset.objtype; //"linepp"
        const prop = target.dataset.property; //x1
        if(event.type == "input"){ 
            if(prop == "name"){ //names need to sync with label in the parent block, so they are handled separately
                event.target.parentNode.parentNode.parentNode.querySelector(".nametag").value = target.value;
                //Only update object on "change" event (or onBlur) to imporve performance
            }
            else if(prop == "strokeColor"){ //color input could possibly change dozens of times per second, thus bypassing renderToSVG() greatly improves performance
                svgElem.setAttribute("stroke",target.value);
                //Only update object on "change" event (or onBlur) to imporve performance
            }
            else if(prop == "fillColor"){
                svgElem.setAttribute("fill",target.value);
            }
            else if(["strokeWidth", "pathLength", "dashOffset", "strokeOpacity", "fillOpacity"].includes(prop) ||  OBJ_SPECIFIC_INPUTLIST.includes(`${type} ${prop}`)){  //"linepp x1"
                isNumeric(target.value) ? obj[prop] = parseFloat(target.value) : obj[prop] = target.value;
                obj.renderToSVG();
            }
        }
        else if(event.type == "change"){
            if(["name", "lineCap", "lineJoin", "dashArray", "strokeColor", "fillColor"].includes(prop) || OBJ_SPECIFIC_CHANGELIST.includes(`${type} ${prop}`)){
                isNumeric(target.value) ? obj[prop] = parseFloat(target.value) : obj[prop] = target.value;
                obj.renderToSVG();
            }
            else if(["hasBorder", "hasFill"].includes(prop)){ //checkboxes are naughty
                obj[prop] = target.checked;
                obj.renderToSVG();
            }
        }
    });
};

document.querySelector("#toolbar-root").addEventListener("click", (event) => {  //event delegation
    const target = event.target;
    const parent = event.target.parentNode;
    if(target.tagName.toLowerCase() == "img"){                                  //SVG icon clicked
        createFNGObject(target.dataset.objname, null);                          //create a brand new object of the specified kind
    }
    else if(parent.classList.contains("toolbar-grid-toggler")){                 //expand or collapse the toolbar
        toggleToolbarDropdown(target);
    }
});

window.addEventListener("error", function(){
    console.error("Execution Failed");
    alert("Execution Failed.");
});


// [!] Primary initializing sequence

console.log("Welcome to FNGplot beta version");
updateEnvirList();

//Initialize toolbar's positions, colors and click handlers
{
    const btnList = document.querySelectorAll("button[id^=\"toolbar-select-\"]");
    const togglers = document.querySelectorAll(".toolbar-grid-toggler > div");
    for(let [i, btn] of btnList.entries()){
        btn.style.borderColor = TOOLBAR_CLR[i];                                    //initialize them to their respective colors
        btn.addEventListener("click", () => {                                      //attach eventlisteners
            switchToolbar(i);
        });
    };
    for(let arrowBtn of togglers){
        arrowBtn.style.transform = "rotate(0deg)";                                 //set them inline so they can be manipulated later
    };
    switchToolbar(1);                                                              //switch to "Geometry" (default)
}

    
//Init sortable container
SORTABLE_LIST.push(
    new Sortable(document.querySelector("#block-frame"), {
        group: 'block-frame',
        animation: 150,
        fallbackOnBody: true,
        forceFallback: true,
        onEnd: function (evt) {
            if(evt.oldIndex != evt.newIndex){  //If the position actually changed
                moveObject(evt.item.dataset.sid, evt.item.nextSibling != null ? evt.item.nextSibling.dataset.sid : null);
                //passes null as reference if there is no next neighbor. insertBefore() will take care of it.
            }
        },
        ghostClass: 'ghost-class',
        draggable: ".obj-block",
        handle: ".small-icon",
        swapThreshold: 0.65,
        scroll: true,
        scrollSensitivity: 80,
        scrollSpeed: 10
    })
);