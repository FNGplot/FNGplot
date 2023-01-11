/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright (c) Wei-Hsu Lin(林韋旭) & All Contributors to FNGplot */

"use strict";

// Note for future self: fngNS should NOT have more than three layers

const fngNS = Object.freeze({   // Object.freeze() is "shallow freeze"

    /* [!] Enums */

    MetaData: Object.freeze({
        AUTHOR: "Wei-Hsu Lin(林韋旭) & All Contributors to FNGplot",
        LICENSE: "Apache-2.0",
        VERSION: "1.0.0-beta",
        RELEASE_DATE: "2023-MM-DD",
        RELEASE_NOTE: "null",
    }),

    RectOrigin: Object.freeze({  // A small key:value map used by "Rect" class
        TOP: 0,
        LEFT: 0,
        MIDDLE: 0.5,
        BOTTOM: 1,
        RIGHT: 1,
    }),

    MagicNumber: Object.freeze({    // Make magic numbers less magical
        EDITPANEL_TBMARGIN: 65, // Top(55) and bottom(10) margin of editpanels. Used to calculate the expansion animation of parent block.
    }),

    DOM: Object.freeze({    // Frequently used DOM elements
        BLOCK_FRAME: document.querySelector('#block-frame'),
        SVG_CANVAS: document.querySelector('#svg-canvas'),
        BASIC_BLOCK_TEMPLATE: document.querySelector('#basic-block-template').content.firstElementChild,
    }),

    Str: Object.freeze({    // Frequently used strings
        SVGNS: "http://www.w3.org/2000/svg",    //Namespace of SVG
    }),

    /* [!] System data (read/write required for some of them, therefore it is only sealed but not frozen) */

    SysData: Object.seal({
        TOOLBAR_CLR: ['#f0923b','#5f95f7','#9268f6','#c763d0','#67bc59','#6dbde2','#4868ce','#ed7082','#f3af42'],  // Based on MIT Scratch 2.0/3.0
        EDITPANEL_TEMPLATES: new DocumentFragment(),    //fetch()ed from editpanel.html on page init
        objectList: [],   //Unordered object reference array
        sortableList: [], //SortableJS object reference array, in case I add more Sortable objects in the future
    }),

    Coord: Object.seal({ //  Variables that control the coordinate system of FNGplot (Cartesian & Polar)
        xMax: 10,
        xMin: -10,
        yMax: 10,
        yMin: -10,
        xHat: 50,
        yHat: 50,
        originX: 500, //"real" x and y coordinates of the origin point in the SVG canvas.
        originY: 500, //"real" x and y coordinates of the origin point in the SVG canvas.
    }),

    /* [!] Maps (Can't be 100% frozen, preferred over traditional Object because 1. Arrow functions can be used and 2. Lookup is faster) */

    Maps: Object.freeze({
        CLASS_INITDATA_MAP: new Map([    // Data and reference used to initialize object
            //["Object Name", [Class, Category, SVG Element]],
            ["linepp", [LinePP, "geometry", "line"]],
            ["rect", [Rect, "geometry", "rect"]],
            ["circle", [Circle, "geometry", "ellipse"]],
            ["circle3p", [Circle3P, "geometry", "ellipse"]],
        ]),
        EDITACTION_MAP: new Map([
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
            ["rect originX", (obj, svgElem) => { svgElem.setAttribute("x", toPixelPosX(obj.originX - fngNS.RectOrigin[obj.originHoriz] * obj.width)) }],
            ["rect originY", (obj, svgElem) => { svgElem.setAttribute("y", toPixelPosY(obj.originY + fngNS.RectOrigin[obj.originVert] * obj.height)) }],
            ["rect roundCorner", (obj, svgElem) => { svgElem.setAttribute("rx", obj.roundCorner) }],
            ["rect width", (obj, svgElem) => { svgElem.setAttribute("width", toPixelLenX(obj.width)) }],
            ["rect height", (obj, svgElem) => { svgElem.setAttribute("height", toPixelLenY(obj.height)) }],
            ["circle cx", (obj, svgElem) => { svgElem.setAttribute("cx", toPixelPosX(obj.cx)) }],
            ["circle cy", (obj, svgElem) => { svgElem.setAttribute("cy", toPixelPosY(obj.cy)) }],
            ["circle radius", (obj, svgElem) => {
                // SVG <ellipse> element
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
            ["rect originHoriz", (obj, svgElem) => { svgElem.setAttribute("x", toPixelPosX(obj.originX - fngNS.RectOrigin[obj.originHoriz] * obj.width)) }],
            ["rect originVert", (obj, svgElem) => { svgElem.setAttribute("y", toPixelPosY(obj.originY + fngNS.RectOrigin[obj.originVert] * obj.height)) }],
        ]),
    }),
})