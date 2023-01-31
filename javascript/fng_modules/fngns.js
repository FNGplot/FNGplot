/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright (c) Wei-Hsu Lin & All Contributors to FNGplot */

export let fngNameSpace = (function() {

    return {
        
        /* [!] Enums */
        MetaData: Object.freeze({
            AUTHOR: "Wei-Hsu Lin & All Contributors to FNGplot",
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
                return math.round(this.originX + this.xHat * xCord, 4);
            },
            toPxPosY(yCord){  // Translate calculation result to actual SVG coordinate. Y coordinate only.
                return math.round(this.originY - this.yHat * yCord, 4);
            },
            toPxLenX(length){ // Translate calculation result to actual SVG lengths. X direction only.
                return math.round(length * this.xHat, 4);
            },
            toPxLenY(length){ // Translate calculation result to actual SVG lengths. Y direction only.
                return math.round(length * this.yHat, 4);
            },
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