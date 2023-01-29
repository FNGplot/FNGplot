/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright (c) Wei-Hsu Lin & All Contributors to FNGplot */

import {fngNameSpace as glob } from "./fngns.js";     // global variable module

export {
    // Parent
    StrokeParent,
    StrokeFillParent,
    // Geometry
    LinePP,
    LinePPExt,
    LinePS,
    Rect,
    Triangle,
    Circle,
    Circle3P,
    PolygonRI,
    PolygonRC,
    PolygonRS,
    PolygonRV,
    // Algebra
};

/* [!] private data & methods */
const LiteralOrigin = Object.freeze({  // A small key:value map used by FNGobjects that offer origin positioning
    TOP: 0,
    LEFT: 0,
    MIDDLE: 0.5,
    BOTTOM: 1,
    RIGHT: 1,
});
function toPoints(arr){     // Convert coordinate data to SVG "points" format
    let output = "";
    for (const pair of arr) {
        output = output + glob.Coord.toPxPosX(pair[0]) + "," + glob.Coord.toPxPosY(pair[1]) + " ";
    }
    return output.slice(0, -1);     // trim off the excess white space
};

/* [!] Classes: Parent */
/* Class.SvgStyle: Anything that is a SVG presentation attribute, i.e, there is NEVER calculation on my part whatsoever */
class StrokeParent {  //parent of objects with stroke only
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
};

class StrokeFillParent { //parent of objects with both fill and stroke(border)
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
};

/* [!] Classes: Geometry */
class LinePP extends StrokeParent {
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
};

class LinePPExt extends StrokeParent {
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
            const distance = math.sqrt(dx**2 + dy**2);
            svgElem.setAttribute("x1", glob.Coord.toPxPosX(this.x1 - dx * this.startExtend / distance));
            svgElem.setAttribute("x2", glob.Coord.toPxPosX(this.x2 + dx * this.endExtend / distance));
            svgElem.setAttribute("y1", glob.Coord.toPxPosY(this.y1 - dy * this.startExtend / distance));
            svgElem.setAttribute("y2", glob.Coord.toPxPosY(this.y2 + dy * this.endExtend / distance));
        }
    }
};

class LinePS extends StrokeParent {
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
            svgElem.setAttribute("x1", glob.Coord.toPxPosX(this.x - this.leftExtend * math.cos(math.atan2(this.slope, 1))));
            svgElem.setAttribute("x2", glob.Coord.toPxPosX(this.x + this.rightExtend * math.cos(math.atan2(this.slope, 1))));
            svgElem.setAttribute("y1", glob.Coord.toPxPosY(this.y - this.leftExtend * math.sin(math.atan2(this.slope, 1))));
            svgElem.setAttribute("y2", glob.Coord.toPxPosY(this.y + this.rightExtend * math.sin(math.atan2(this.slope, 1))));
        }
    }
};

class Rect extends StrokeFillParent {
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
};

class Triangle extends StrokeFillParent {
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
};

class Circle extends StrokeFillParent {  // Actually uses an SVG <ellipse> in case user sets glob.Coord.xHat != glob.Coord.yHat
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
};

class Circle3P extends StrokeFillParent {
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
        if (math.abs(math.det([[a, b], [c, d]])) < 1e-6) {    //colinear
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
};

class PolygonRI extends StrokeFillParent {
    constructor(sid) {
        super(sid);
        this.label = "Regular polygon (inscribed)";
        this.cx = 0;
        this.cy = 0;
        this.radius = 6;
        this.sides = 5;
        this.angle = 0;
        this.SvgStyle.lineJoin = "miter";
        this.SvgStyle.miterLimit = "4";  // for acute triangles (4 is default value)
    }
    updateMath(svgElem) {
        const rotStep = math.round(2 * math.PI / this.sides, 3);
        const startPoint = math.rotate([0, this.radius], math.unit(`${this.angle}deg`));
        let buf = [0, 0];
        let pointList = [];
        for (let i = 0; i < this.sides; i++) {  // construct list of points on circumference
            buf = math.rotate(startPoint, rotStep * i);
            pointList.push([buf[0] + this.cx, buf[1] + this.cy]);
        }
        svgElem.setAttribute("points", toPoints(pointList));
    }
};

class PolygonRC extends StrokeFillParent {

};

class PolygonRS extends StrokeFillParent {

};

class PolygonRV extends StrokeFillParent {

};