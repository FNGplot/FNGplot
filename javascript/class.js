/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright (c) Wei-Hsu Lin(林韋旭) & All Contributors to FNGplot */

"use strict";

/* [!] Classes: Parent */

class StrokeParent {  //parent of objects with stroke only
    constructor(sid){
        this.sid = sid;
                                    //this.name = "";
        this.display = true;
        //Style
        this.strokeWidth = 10;
        this.lineCap = "butt";
        this.pathLength = 150;
        this.dashArray = '';
        this.dashOffset = 0;
        this.strokeColor = "#8a408b"; // Wisteria purple
        this.strokeOpacity = 100;
    }
}
class StrokeFillParent extends StrokeParent { //parent of objects with both fill and stroke(border)
    constructor(sid){
        super(sid);
        this.fillColor = "#ddcfff";
        this.fillOpacity = 100;
    }
}

/* [!] Classes: Geometry */

class LinePP extends StrokeParent {
    constructor(sid) {
        super(sid);
        this.name = "2-point line";
        this.x1 = -5;
        this.y1 = -4;
        this.x2 = 5;
        this.y2 = 2;
    }  
}
class Rect extends StrokeFillParent {
    constructor(sid){
        super(sid);
        this.name = "Rectangle";
        //Origin specified is used as the rectangle's "bottom left" corner. Value at enum "RectOrigin".
        this.originHoriz = "LEFT";
        this.originVert = "BOTTOM";
        this.originX = -1;
        this.originY = -2;
        this.width = 7;
        this.height = 5;
        this.roundCorner = 0;
        this.lineJoin = "miter";
    }
}
class Circle extends StrokeFillParent {  // Actually uses an SVG <ellipse> in case user sets fngNS.Coord.xHat != fngNS.Coord.yHat
    constructor(sid) {
        super(sid);
        this.name = "Circle";
        this.cx = 2;
        this.cy = 4;
        this.radius = 2.5;
    }
}
class Circle3P extends StrokeFillParent {
    constructor(sid) {
        super(sid);
        this.name = "3-point circle";
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
            svgElem.setAttribute("cx", toPixelPosX(cx));
            svgElem.setAttribute("cy", toPixelPosY(cy));
            svgElem.setAttribute("rx", toPixelLenX(math.distance([cx,cy], [this.x1, this.y1])));
            svgElem.setAttribute("ry", toPixelLenY(math.distance([cx,cy], [this.x1, this.y1])));
        }
    }
}
