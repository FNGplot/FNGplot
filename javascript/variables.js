/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright (c) Wei-Hsu Lin(林韋旭) & All Contributors to FNGplot */

"use strict";

/* [!] Frequently referenced DOM objects & strings: */

// Meta
const FNGplot = Object.freeze({
    author: "Wei-Hsu Lin(林韋旭) & All Contributors to FNGplot",
    license: "Apache-2.0",
    version: "1.0.0-beta",
    releaseDate: "2023-MM-DD",
});

// DOM objects
const BLOCK_FRAME = document.querySelector('#block-frame');
const SVG_FRAME = document.querySelector('#svg-frame');
const SVG_CANVAS = document.querySelector('#svg-canvas');
const BASIC_BLOCK_TEMPLATE = document.querySelector('#basic-block-template').content.firstElementChild;

// Strings
const SVGNS = "http://www.w3.org/2000/svg";

/* [!] System data -- static*/

// https://stackoverflow.com/questions/1366127/how-do-i-make-javascript-object-using-a-variable-string-to-define-the-class-name/68016983#68016983
const CLASS_INITDATA_MAP = new Map([    // Data and reference used to initialize object
    //["Object Name", [Class, Category, SVG Element]],
    ["linepp", [LinePP, "geometry", "line"]],
    ["rect", [Rect, "geometry", "rect"]],
    ["circle", [Circle, "geometry", "ellipse"]],
    ["circle3p", [Circle3P, "geometry", "ellipse"]]
]);
const EDITACTION_MAP = new Map([
    // Actions that should be performed when user makes an edit
    // obj and svgElem will always be passed in, but whether or not svgElem is used depends on the situation

    //Used on init only
    ["name", (obj, svgElem) => { svgElem.setAttribute("data-name", obj.name) }],
    ["strokeColor", (obj, svgElem) => { svgElem.setAttribute("stroke",obj.strokeColor) }],
    ["fillColor", (obj, svgElem) => { svgElem.setAttribute("fill",obj.fillColor) }],   

    //Input -- Common
    ["strokeWidth", (obj, svgElem) => { svgElem.setAttribute("stroke-width", obj.strokeWidth) }],
    ["pathLength", (obj, svgElem) => { svgElem.setAttribute("pathLength", obj.pathLength) }],
    ["dashOffset", (obj, svgElem) => { svgElem.setAttribute("stroke-dashoffset", obj.dashOffset) }],
    ["strokeOpacity", (obj, svgElem) => { svgElem.setAttribute("stroke-opacity", obj.strokeOpacity) }],
    ["fillOpacity", (obj, svgElem) => { svgElem.setAttribute("fill-opacity", obj.fillOpacity) }],
    ["lineCap", (obj, svgElem) => { svgElem.setAttribute("stroke-linecap", obj.lineCap) }],
    ["lineJoin", (obj, svgElem) => { svgElem.setAttribute("stroke-linejoin", obj.lineJoin) }],

    //Input -- Object-specifc
    ["linepp x1", (obj, svgElem) => { svgElem.setAttribute("x1", toPixelPosX(obj.x1)) }],
    ["linepp x2", (obj, svgElem) => { svgElem.setAttribute("x2", toPixelPosX(obj.x2)) }],
    ["linepp y1", (obj, svgElem) => { svgElem.setAttribute("y1", toPixelPosY(obj.y1)) }],
    ["linepp y2", (obj, svgElem) => { svgElem.setAttribute("y2", toPixelPosY(obj.y2)) }],
    ["rect originX", (obj, svgElem) => { svgElem.setAttribute("x", toPixelPosX(obj.originX - RECT_ORIGMAP.get(obj.originHoriz) * obj.width)) }],
    ["rect originY", (obj, svgElem) => { svgElem.setAttribute("y", toPixelPosY(obj.originY + RECT_ORIGMAP.get(obj.originVert) * obj.height)) }],
    ["rect roundCorner", (obj, svgElem) => { svgElem.setAttribute("rx", obj.roundCorner) }],
    ["rect width", (obj, svgElem) => { svgElem.setAttribute("width", toPixelLenX(obj.width)) }],
    ["rect height", (obj, svgElem) => { svgElem.setAttribute("height", toPixelLenY(obj.height)) }],
    ["circle cx", (obj, svgElem) => { svgElem.setAttribute("cx", toPixelPosX(obj.cx)) }],
    ["circle cy", (obj, svgElem) => { svgElem.setAttribute("cy", toPixelPosY(obj.cy)) }],
    ["circle radius", (obj, svgElem) => {
        // SVG <ellipse>
        svgElem.setAttribute("rx", toPixelLenX(obj.radius));
        svgElem.setAttribute("ry", toPixelLenY(obj.radius));
    }],
    //Input -- Object-specifc -- Math-intensive (Their class's methods are called instead as they are too big to be put here)
    ["circle3p x1", (obj, svgElem) => { obj.updateMath(svgElem) }],
    ["circle3p y1", (obj, svgElem) => { obj.updateMath(svgElem) }],
    ["circle3p x2", (obj, svgElem) => { obj.updateMath(svgElem) }],
    ["circle3p y2", (obj, svgElem) => { obj.updateMath(svgElem) }],
    ["circle3p x3", (obj, svgElem) => { obj.updateMath(svgElem) }],
    ["circle3p y3", (obj, svgElem) => { obj.updateMath(svgElem) }],

    //Change -- Common
    ["dashArray", (obj, svgElem) => { svgElem.setAttribute("stroke-dasharray", obj.dashArray) }],

    //Change -- Object-specific
    ["rect originHoriz", (obj, svgElem) => { svgElem.setAttribute("x", toPixelPosX(obj.originX - RECT_ORIGMAP.get(obj.originHoriz) * obj.width)) }],
    ["rect originVert", (obj, svgElem) => { svgElem.setAttribute("y", toPixelPosY(obj.originY + RECT_ORIGMAP.get(obj.originVert) * obj.height)) }],
]);
const RECT_ORIGMAP = new Map([       //A small map used by "Rect" object
    ["top", 0],
    ["left", 0],
    ["middle", 0.5],
    ["bottom", 1],
    ["right", 1],
]);
const TOOLBAR_CLR = ['#f0923b','#5f95f7','#9268f6','#c763d0','#67bc59','#6dbde2','#4868ce','#ed7082','#f3af42']; // Based on MIT Scratch 2.0/3.0
/* [!] System data -- dynamic */

// Object database
let OBJECT_LIST = [];   //Unordered object reference array
let SORTABLE_LIST = []; //SortableJS object reference array, in case I add more Sortable objects in the future

// Cartesian coordinate
let XMAX = 10;
let XMIN = -10;
let YMAX = 10;
let YMIN = -10;
let XHAT = 50;
let YHAT = 50;
let ORIGIN_X = 500; //"real" x and y coordinates of the origin point in the SVG.
let ORIGIN_Y = 500;

/* [!] Editpanel template */

const EDITPANEL_TEMPLATES = {
    linepp:`
<div class="objblock-editpanel" data-objname="linepp">
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
            <option value="butt" selected>Butt</option>
            <option value="round">Round</option>
            <option value="square">Square</option>
        </select>
    </div>
    <div>PathLength: <input type="number" min="0" data-property="pathLength" class="size-short"></div>
    <div>DashArray: <input type="text" data-property="dashArray" placeholder="empty" class="size-medium"> </div>
    <div>DashOffset: <input type="number" data-property="dashOffset" class="size-short"></div>
    <div class="label-monospace">-----------System---------------</div>
    <div>SystemID: <input type="text" data-property="sid" class="idtag" disabled></div>
</div>`,

    rect:`
<div class="objblock-editpanel" data-objname="rect">
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
    <div>BorderColor: <input type="color" data-property="strokeColor" class="size-short"></div>
    <div>BorderWidth: <input type="number" min="0" data-property="strokeWidth" class="size-short"></div>
    <div>BorderOpacity: <input type="number" min="0" max="1" step="0.01" data-property="strokeOpacity" class="size-short"></div>
    <div>FillColor: <input type="color" data-property="fillColor" class="size-short"></div>
    <div>FillOpacity: <input type="number" min="0" max="1" step="0.01" data-property="fillOpacity" class="size-short"></div>
    <div class="label-monospace">-----------Style: Advanced------</div>
    <div>RoundedCorner: <input type="number" min="0" data-property="roundCorner" class="size-short"></div>
    <div>BorderLineJoin:
        <select data-property="lineJoin" class="size-medium">
            <option value="miter" selected>Miter</option>
            <option value="bevel">Bevel</option>
            <option value="round">Round</option>
        </select>
    </div>
    <div>BorderLineCap(dash):
        <select data-property="lineCap" class="size-medium">
            <option value="butt" selected>Butt</option>
            <option value="round">Round</option>
            <option value="square">Square</option>
        </select>
    </div>
    <div>PathLength: <input type="number" min="0" data-property="pathLength" class="size-short"></div>
    <div>DashArray: <input type="text" data-property="dashArray" placeholder="empty" class="size-medium"> </div>
    <div>DashOffset: <input type="number" data-property="dashOffset" class="size-short"></div>
    <div class="label-monospace">-----------System---------------</div>
    <div>SystemID: <input type="text" data-property="sid" class="idtag" disabled></div>
</div>`,

    circle:`
<div class="objblock-editpanel" data-objname="circle">
    <div class="label-monospace">-----------User-----------------</div>
    <div>Name: <input type="text" data-property="name" class="size-long"></div>
    <div class="label-monospace">-----------Math-----------------</div>
    <div>Center: ( <input type="number" step="0.5" data-property="cx" class="size-short"> , <input type="number" step="0.5" data-property="cy" class="size-short"> )</div>
    <div>Radius: <input type="number" min="0" step="0.1" data-property="radius" class="size-short"></div>
    <div class="label-monospace">-----------Style: Basic---------</div>
    <div>BorderColor: <input type="color" data-property="strokeColor" class="size-short"></div>
    <div>BorderWidth: <input type="number" min="0" data-property="strokeWidth" class="size-short"></div>
    <div>BorderOpacity: <input type="number" min="0" max="1" step="0.01" data-property="strokeOpacity" class="size-short"></div>
    <div>FillColor: <input type="color" data-property="fillColor" class="size-short"></div>
    <div>FillOpacity: <input type="number" min="0" max="1" step="0.01" data-property="fillOpacity" class="size-short"></div>
    <div class="label-monospace">-----------Style: Advanced------</div>
    <div>BorderLineCap(dash):
        <select data-property="lineCap" class="size-medium">
        <option value="butt" selected>Butt</option>
            <option value="round">Round</option>
            <option value="square">Square</option>
        </select>
    </div>
    <div>PathLength: <input type="number" min="0" data-property="pathLength" class="size-short"></div>
    <div>DashArray: <input type="text" data-property="dashArray" placeholder="empty" class="size-medium"> </div>
    <div>DashOffset: <input type="number" data-property="dashOffset" class="size-short"></div>
    <div class="label-monospace">-----------System---------------</div>
    <div>SystemID: <input type="text" data-property="sid" class="idtag" disabled></div>
</div>`,

    circle3p:`
<div class="objblock-editpanel" data-objname="circle3p">
    <div class="label-monospace">-----------User-----------------</div>
    <div>Name: <input type="text" data-property="name" class="size-long"></div>
    <div class="label-monospace">-----------Math-----------------</div>
    <div>Point 1: ( <input type="number" step="0.5" data-property="x1" class="size-short"> , <input type="number" step="0.5" data-property="y1" class="size-short"> )</div>
    <div>Point 2: ( <input type="number" step="0.5" data-property="x2" class="size-short"> , <input type="number" step="0.5" data-property="y2" class="size-short"> )</div>
    <div>Point 3: ( <input type="number" step="0.5" data-property="x3" class="size-short"> , <input type="number" step="0.5" data-property="y3" class="size-short"> )</div>
    <div class="label-monospace">-----------Style: Basic---------</div>
    <div>BorderColor: <input type="color" data-property="strokeColor" class="size-short"></div>
    <div>BorderWidth: <input type="number" min="0" data-property="strokeWidth" class="size-short"></div>
    <div>BorderOpacity: <input type="number" min="0" max="1" step="0.01" data-property="strokeOpacity" class="size-short"></div>
    <div>FillColor: <input type="color" data-property="fillColor" class="size-short"></div>
    <div>FillOpacity: <input type="number" min="0" max="1" step="0.01" data-property="fillOpacity" class="size-short"></div>
    <div class="label-monospace">-----------Style: Advanced------</div>
    <div>BorderLineCap(dash):
        <select data-property="lineCap" class="size-medium">
            <option value="butt" selected>Butt</option>
            <option value="round">Round</option>
            <option value="square">Square</option>
        </select>
    </div>
    <div>PathLength: <input type="number" min="0" data-property="pathLength" class="size-short"></div>
    <div>DashArray: <input type="text" data-property="dashArray" placeholder="empty" class="size-medium"> </div>
    <div>DashOffset: <input type="number" data-property="dashOffset" class="size-short"></div>
    <div class="label-monospace">-----------System---------------</div>
    <div>SystemID: <input type="text" data-property="sid" class="idtag" disabled></div>
</div>`,
}
