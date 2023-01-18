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
        BLOCK_FRAME: document.querySelector('.workspace__block-frame'),
        SVG_CANVAS: document.querySelector('.workspace__svg-frame__canvas'),
        BASIC_BLOCK_TEMPLATE: document.querySelector('.template').content.firstElementChild,
    }),

    Str: Object.freeze({    // Frequently used strings
        SVGNS: "http://www.w3.org/2000/svg",    //Namespace of SVG
    }),

    /* [!] System data (read/write required for some of them, therefore it is only sealed but not frozen) */

    SysData: Object.seal({
        TOOLBAR_CLR: ['#f0923b','#5f95f7','#9268f6','#c763d0','#67bc59','#6dbde2','#4868ce','#ed7082','#f3af42'],  // Based on MIT Scratch 2.0/3.0
        EDITPANEL_TEMPLATES: {},  //initialized from editpanels.json
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
        CLASS_INITDATA: new Map([    // Data and reference used to initialize object
            //["Object Name", [Class, Category, SVG Element]],
            ["linepp", [LinePP, "geometry", "line"]],
            ["lineps", [LinePS, "geometry", "line"]],
            ["lineppext", [LinePPExt, "geometry", "line"]],
            ["rect", [Rect, "geometry", "rect"]],
            ["triangle", [Triangle, "geometry", "polygon"]],
            ["circle", [Circle, "geometry", "ellipse"]],
            ["circle3p", [Circle3P, "geometry", "ellipse"]],
        ]),
        EDITACTION_SI: new Map([    //SI: Style Input
            ["strokeWidth", (obj, svgElem) => { svgElem.setAttribute("stroke-width", obj.SvgStyle.strokeWidth) }],
            ["pathLength", (obj, svgElem) => { svgElem.setAttribute("pathLength", obj.SvgStyle.pathLength) }],
            ["dashOffset", (obj, svgElem) => { svgElem.setAttribute("stroke-dashoffset", obj.SvgStyle.dashOffset) }],
            ["strokeOpacity", (obj, svgElem) => { svgElem.setAttribute("stroke-opacity", math.round(obj.SvgStyle.strokeOpacity/100, 2)) }],
            ["fillOpacity", (obj, svgElem) => { svgElem.setAttribute("fill-opacity", math.round(obj.SvgStyle.fillOpacity/100, 2)) }],
            ["lineCap", (obj, svgElem) => { svgElem.setAttribute("stroke-linecap", obj.SvgStyle.lineCap) }],
            ["lineJoin", (obj, svgElem) => { svgElem.setAttribute("stroke-linejoin", obj.SvgStyle.lineJoin) }],
            ["miterLimit", (obj, svgElem) => { svgElem.setAttribute("stroke-miterlimit", obj.SvgStyle.miterLimit) }],
        ]),
        EDITACTION_SC: new Map([    //SC: Style Change (Only property in the map that's not a style: "label")
            ["label", (obj, svgElem) => { svgElem.setAttribute("data-label", obj.label) }],
            ["dashArray", (obj, svgElem) => { svgElem.setAttribute("stroke-dasharray", obj.SvgStyle.dashArray) }],
            ["strokeColor", (obj, svgElem) => { svgElem.setAttribute("stroke",obj.SvgStyle.strokeColor) }],
            ["fillColor", (obj, svgElem) => { svgElem.setAttribute("fill", obj.SvgStyle.fillColor) }],
        ]),
    }),
})
