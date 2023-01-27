/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright (c) Wei-Hsu Lin(林韋旭) & All Contributors to FNGplot */

export let fngNameSpace = (function() {

    return {
        
        /* [!] Enums */
        MetaData: Object.freeze({
            AUTHOR: "Wei-Hsu Lin(林韋旭) & All Contributors to FNGplot",
            LICENSE: "Apache-2.0",
            VERSION: "1.0.0-alpha",
            RELEASE_DATE: "2023-MM-DD",
            RELEASE_NOTE: "null",
        }),
        MagicNumber: Object.freeze({    // Make magic numbers less magical
            DEFAULT_REMSIZE: 8,      // Default: 1rem = 8px @ 100% Zoom
        }),
        DOM: Object.freeze({    // Frequently used DOM elements
            BLOCK_FRAME: document.querySelector('.workspace__block-frame'),
            SVG_CANVAS: document.querySelector('.workspace__svg-content--canvas'),
            SVG_DISPLAY: document.querySelector('.workspace__svg-content--display'),
            BASIC_BLOCK_TEMPLATE: document.querySelector('.template').content.firstElementChild,
        }),
        Str: Object.freeze({    // Frequently used strings
            SVGNS: "http://www.w3.org/2000/svg",    // Namespace of SVG
        }),

        /* [!] System data (read/write required for some of them, therefore it is only sealed but not frozen) */
        SysData: Object.seal({
            TOOLBAR_CLR: ['#f0923b','#5f95f7','#9268f6','#c763d0','#67bc59','#6dbde2','#4868ce','#ed7082','#f3af42'],  // Based on MIT Scratch 2.0/3.0
            EDITPANEL_TEMPLATES: {},  //initialized from editpanels.json
            objectList: [],   // Unordered object reference array
            sortableList: [], // SortableJS object reference array, in case I add more Sortable objects in the future
        }),
        Settings: Object.seal({
            Zoom: 100,
            remSize: 8,
        }),
        Coord: Object.seal({ //  Variables that control the coordinate system of FNGplot (Cartesian & Polar)
            // Math coordinate
            xMax: 10,
            xMin: -10,
            yMax: 10,
            yMin: -10,
            // SVG coordinate
            viewBox: [0, 0, 1000, 1000],
            xHat: 50,
            yHat: 50,
            originX: 500,
            originY: 500,
            // Methods
            updateSvgCoord(){   // Updates SVG coordinate after user changes x/y min/max.
                this.xHat = math.round(1000 / (this.xMax - this.xMin), 4);
                this.yHat = math.round(1000 / (this.yMax - this.yMin), 4);
                this.originX = math.round(1000 * -this.xMin / (this.xMax - this.xMin), 4);
                this.originY = math.round(1000 * -this.yMin / (this.yMax - this.yMin), 4);
                // console.log(this.xHat, this.yHat, this.originX, this.originY);
            },
            toPxPosX(xCord){  // Translate calculation result to actual SVG coordinate. X coordinate only.
                return math.round(this.originX + this.xHat*xCord, 3);
            },
            toPxPosY(yCord){  // Translate calculation result to actual SVG coordinate. Y coordinate only.
                return math.round(this.originY - this.yHat*yCord, 3);
            },
            toPxLenX(length){ // Translate calculation result to actual SVG lengths. X direction only.
                return math.round(length * this.xHat, 3);
            },
            toPxLenY(length){ // Translate calculation result to actual SVG lengths. Y direction only.
                return math.round(length * this.yHat, 3);
            },
        }),

        /* [!] Maps (Can't be 100% frozen, preferred over traditional Object because 1. Arrow functions can be used and 2. Lookup is faster) */
        Maps: Object.freeze({
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

        /* [!] Masks */
        maskOn: function(name) {
            document.querySelector(".mask-base").querySelector(`.${name}`).style.display = "block";
        },
        maskOff: function(name) {
            document.querySelector(".mask-base").querySelector(`.${name}`).style.display = "none";
        },
    };
})();