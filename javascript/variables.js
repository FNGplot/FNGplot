"use strict";
/*
Naming convention used in FNGplot:

- functionName
- GLOBAL_VARIABLE
- localVariable
- ObjectName
- html-element-id
- html-class-name
*/

//------↓↓↓↓↓↓↓↓Global variable declare zone of the ENTIRE program↓↓↓↓↓↓↓↓-------------------

/* || Frequently referenced DOM objects & strings: */

// DOM objects
const BLOCK_FRAME = document.querySelector('#block-frame');
const SVG_FRAME = document.querySelector('#svg-frame');
const SVG_CANVAS = document.querySelector('#svg-canvas');

// Strings
const SVGNS = "http://www.w3.org/2000/svg";

/* || System data -- static*/
const TOOLBAR_CLR = ['#f0923b','#5f95f7','#9268f6','#c763d0','#67bc59','#6dbde2','#4868ce','#ed7082','#f3af42']; //(SCRATCH 2.0/3.0 && some of my own)
const OBJ_SPECIFIC_INPUTLIST = ["linepp x1", "linepp y1", "linepp x2", "linepp y2", "rect originX" ,"rect originY", "rect roundCornerX", "rect roundCornerY", "rect width", "rect height"]; //Used by real-time-update eventlistener
const OBJ_SPECIFIC_CHANGELIST = ["rect originHoriz", "rect originVert"]; //Used by real-time-update eventlistener
const RECT_ORIGMAP = { //A small key-value map used by "Rect" object
    top: 0, left: 0, middle: 0.5, bottom: 1, right: 1
};

/* || System data -- dynamic*/

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

//------↑↑↑↑↑↑↑↑Global variable declare zone of the ENTIRE project↑↑↑↑↑↑↑↑-------------------

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
    <div>Opacity: <input type="number" min="0" max="1" step="0.01" data-property="strokeOpacity" class="size-short" onKeyDown="return false"></div>
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
    <div>BorderOpacity: <input type="number" min="0" max="1" step="0.01" data-property="strokeOpacity" class="size-short" onKeyDown="return false"></div>
    <div>FillColor: <input type="color" data-property="fillColor" class="size-short"></div>
    <div>FillOpacity: <input type="number" min="0" max="1" step="0.01" data-property="fillOpacity" class="size-short" onKeyDown="return false"></div>
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
}

//------↑↑↑↑↑↑↑↑Edit panel templates↑↑↑↑↑↑↑↑-------------------
