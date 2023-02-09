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
            DRAGBLOCK_TEMPLATE: document.querySelector('.template').content.firstElementChild,
        }),
        Str: Object.freeze({    // Frequently used strings
            SVGNS: "http://www.w3.org/2000/svg",    // Namespace of SVG
        }),

        /* [!] System data (read/write required for some of them, therefore it is only sealed but not frozen) */
        SysData: Object.seal({
            TOOLBAR_CLR: ['#f0923b','#5f95f7','#9268f6','#c763d0','#67bc59','#6dbde2','#4868ce','#ed7082','#f3af42'],  // Based on MIT Scratch 2.0/3.0
            EDITPANELS: {},  //initialized from editpanels.json
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
        }),

        /* [!] Methods */
        toPxPosX(xCord) {  // Translate calculation result to actual SVG coordinate. X coordinate only.
            console.log("yojo");
            return math.round(this.Coord.originX + this.Coord.xHat * xCord, 4);
        },
        toPxPosY(yCord) {  // Translate calculation result to actual SVG coordinate. Y coordinate only.
            return math.round(this.Coord.originY - this.Coord.yHat * yCord, 4);
        },
        toPxLenX(length) { // Translate calculation result to actual SVG lengths. X direction only.
            return math.round(length * this.Coord.xHat, 4);
        },
        toPxLenY(length) { // Translate calculation result to actual SVG lengths. Y direction only.
            return math.round(length * this.Coord.yHat, 4);
        },
        updateSvgCoord() {   // Updates SVG coordinate after user changes x/y min/max.
            this.Coord.xHat = math.round(1000 / (this.Coord.xMax - this.Coord.xMin), 4);
            this.Coord.yHat = math.round(1000 / (this.Coord.yMax - this.Coord.yMin), 4);
            this.Coord.originX = math.round(1000 * -this.Coord.xMin / (this.Coord.xMax - this.Coord.xMin), 4);
            this.Coord.originY = math.round(1000 * -this.Coord.yMin / (this.Coord.yMax - this.Coord.yMin), 4);
            // console.log(this.Coord.xHat, this.Coord.yHat, this.Coord.originX, this.Coord.originY);
        },
        maskOn(name) { // Turn on specified UI mask
            document.querySelector(".mask-base").querySelector(`.${name}`).style.display = "block";
        },
        maskOff(name) { // Turn off specified UI mask
            document.querySelector(".mask-base").querySelector(`.${name}`).style.display = "none";
        },
    };
})();