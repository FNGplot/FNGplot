/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright (c) Wei-Hsu Lin(林韋旭) & All Contributors to FNGplot */

"use strict";

/* [!] Classes: Parent */

/* Class.SvgStyle: Anything that is a SVG presentation attribute, i.e, there is NEVER calculation on my part whatsoever */
class StrokeParent {  //parent of objects with stroke only
    constructor(sid){
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
}
class StrokeFillParent { //parent of objects with both fill and stroke(border)
    constructor(sid){
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
}

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
    updateMath(svgElem){
        svgElem.setAttribute("x1", toPxPosX(this.x1));
        svgElem.setAttribute("x2", toPxPosX(this.x2));
        svgElem.setAttribute("y1", toPxPosY(this.y1));
        svgElem.setAttribute("y2", toPxPosY(this.y2));
    }
}
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
    updateMath(svgElem){
        if (this.x1 == this.x2) {   // vertical line
            if (this.y1 <= this.y2) {   // goes up
                svgElem.setAttribute("x1", toPxPosX(this.x1));
                svgElem.setAttribute("x2", toPxPosX(this.x2));
                svgElem.setAttribute("y1", toPxPosY(this.y1 - this.startExtend));
                svgElem.setAttribute("y2", toPxPosY(this.y2 + this.endExtend));
            } else if (this.y1 > this.y2) {  // goes down
                svgElem.setAttribute("x1", toPxPosX(this.x1));
                svgElem.setAttribute("x2", toPxPosX(this.x2));
                svgElem.setAttribute("y1", toPxPosY(this.y1 + this.startExtend));
                svgElem.setAttribute("y2", toPxPosY(this.y2 - this.endExtend));
            }
        } else {    // normal line with meaningful slope
            const [dx, dy] = [
                this.x2 - this.x1,
                this.y2 - this.y1,
            ];
            const distance = Math.sqrt(dx**2 + dy**2);
            svgElem.setAttribute("x1", toPxPosX(this.x1 - dx * this.startExtend / distance));
            svgElem.setAttribute("x2", toPxPosX(this.x2 + dx * this.endExtend / distance));
            svgElem.setAttribute("y1", toPxPosY(this.y1 - dy * this.startExtend / distance));
            svgElem.setAttribute("y2", toPxPosY(this.y2 + dy * this.endExtend / distance));
        }
    }
}
class LinePS extends StrokeParent {
    constructor(sid) {
        super(sid);
        this.label = "Point-slope line";
        this.x = 1;
        this.y = 2;
        this.slope = 1.5;
        this.leftExtend = 2;
        this.rightExtend = 2;
    }
    updateMath(svgElem){
        if(this.slope === ""){    //user admits that it is a vertical line (use === becuase 0 == "")
            svgElem.setAttribute("x1", toPxPosX(this.x));
            svgElem.setAttribute("x2", toPxPosX(this.x));
            svgElem.setAttribute("y1", toPxPosY(this.y - this.leftExtend));
            svgElem.setAttribute("y2", toPxPosY(this.y + this.rightExtend));
        } else {    //has a slope
            svgElem.setAttribute("x1", toPxPosX(this.x - this.leftExtend * Math.cos(Math.atan2(this.slope, 1))));
            svgElem.setAttribute("x2", toPxPosX(this.x + this.rightExtend * Math.cos(Math.atan2(this.slope, 1))));
            svgElem.setAttribute("y1", toPxPosY(this.y - this.leftExtend * Math.sin(Math.atan2(this.slope, 1))));
            svgElem.setAttribute("y2", toPxPosY(this.y + this.rightExtend * Math.sin(Math.atan2(this.slope, 1))));
        }
    }
}
class Rect extends StrokeFillParent {
    constructor(sid){
        super(sid);
        this.label = "Rectangle";
        //Origin specified is used as the rectangle's "bottom left" corner. Value at enum "RectOrigin".
        this.originHoriz = "LEFT";
        this.originVert = "BOTTOM";
        this.originX = -1;
        this.originY = -2;
        this.width = 7;
        this.height = 5;
        this.roundCorner = 0;
        this.SvgStyle.lineJoin = "miter";
    }
    updateMath(svgElem){
        svgElem.setAttribute("x", toPxPosX(this.originX - fngNS.RectOrigin[this.originHoriz] * this.width));
        svgElem.setAttribute("y", toPxPosY(this.originY + fngNS.RectOrigin[this.originVert] * this.height));
        svgElem.setAttribute("rx", this.roundCorner);
        svgElem.setAttribute("width", toPxLenX(this.width));
        svgElem.setAttribute("height", toPxLenY(this.height));
    }
}
class Circle extends StrokeFillParent {  // Actually uses an SVG <ellipse> in case user sets fngNS.Coord.xHat != fngNS.Coord.yHat
    constructor(sid) {
        super(sid);
        this.label = "Circle";
        this.cx = 2;
        this.cy = 4;
        this.radius = 2.5;
    }
    updateMath(svgElem){
            svgElem.setAttribute("cx", toPxPosX(this.cx));
            svgElem.setAttribute("cy", toPxPosY(this.cy));
            svgElem.setAttribute("rx", toPxLenX(this.radius));
            svgElem.setAttribute("ry", toPxLenY(this.radius));
    }
}
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
    updateMath(svgElem){
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
        if (Math.abs(math.det([[a, b], [c, d]])) < 1e-6) {    //colinear
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
            svgElem.setAttribute("cx", toPxPosX(cx));
            svgElem.setAttribute("cy", toPxPosY(cy));
            svgElem.setAttribute("rx", toPxLenX(math.distance([cx,cy], [this.x1, this.y1])));
            svgElem.setAttribute("ry", toPxLenY(math.distance([cx,cy], [this.x1, this.y1])));
        }
    }
}