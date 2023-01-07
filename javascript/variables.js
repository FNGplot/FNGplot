/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright (c) Wei-Hsu Lin(林韋旭) & All Contributors to FNGplot */

/*
FNGplot follows Douglas Crockford's naming convention for JS: https://www.crockford.com/code.html

- functionName
- GLOBAL_VARIABLE
- localVariable
- ObjectName

*Any variable name with ending "MAP" is an ES6 Map.


HTML elements should ONLY use dashes as word seperators:

- html-element-id
- html-class-name
- data-shortname        //HTML5 dataset

*/

"use strict";

/* || Classes */
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

/* || Frequently referenced DOM objects & strings: */

// DOM objects
const BLOCK_FRAME = document.querySelector('#block-frame');
const SVG_FRAME = document.querySelector('#svg-frame');
const SVG_CANVAS = document.querySelector('#svg-canvas');
const BASIC_BLOCK_TEMPLATE = document.querySelector('#basic-block-template').content.firstElementChild;

// Strings
const SVGNS = "http://www.w3.org/2000/svg";

/* || System data -- static*/

// Note: Calling constructor from window no longer works on ES6 classes. Checkout the following link for more detail on the topic:
// https://stackoverflow.com/questions/1366127/how-do-i-make-javascript-object-using-a-variable-string-to-define-the-class-name/68016983#68016983
const CLASS_INITDATA_MAP = new Map([
    //["key", [Object Class, Category, SVG Element] ],
    ["linepp", [LinePP, "geometry", "line"]],
    ["rect", [Rect, "geometry", "rect"]],
    ["circle", [Circle, "geometry", "ellipse"]]
]);
const TOOLBAR_CLR = ['#f0923b','#5f95f7','#9268f6','#c763d0','#67bc59','#6dbde2','#4868ce','#ed7082','#f3af42']; //(Based on MIT Scratch 2.0/3.0)
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
    <div>BorderOpacity: <input type="number" min="0" max="1" step="0.01" data-property="strokeOpacity" class="size-short" onKeyDown="return false"></div>
    <div>FillColor: <input type="color" data-property="fillColor" class="size-short"></div>
    <div>FillOpacity: <input type="number" min="0" max="1" step="0.01" data-property="fillOpacity" class="size-short" onKeyDown="return false"></div>
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

//------↑↑↑↑↑↑↑↑Edit panel templates↑↑↑↑↑↑↑↑-------------------
