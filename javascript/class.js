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
        this.updateMath = function(svgElem){
            svgElem.setAttribute("x1", toPxPosX(this.x1));
            svgElem.setAttribute("x2", toPxPosX(this.x2));
            svgElem.setAttribute("y1", toPxPosY(this.y1));
            svgElem.setAttribute("y2", toPxPosY(this.y2));
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
        this.lineJoin = "miter";
        this.updateMath = function(svgElem){
            svgElem.setAttribute("x1", toPxPosX(obj.x1));
            svgElem.setAttribute("x2", toPxPosX(obj.x2));
            svgElem.setAttribute("y1", toPxPosY(obj.y1));
            svgElem.setAttribute("y2", toPxPosY(obj.y2));
        }
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
        if(Math.abs(math.det([[a, b], [c, d]])) < 1e-6){    //colinear
            svgElem.setAttribute("cx", 0);
            svgElem.setAttribute("cy", 0);
            svgElem.setAttribute("rx", 0);
            svgElem.setAttribute("ry", 0);
        }
        else{
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
