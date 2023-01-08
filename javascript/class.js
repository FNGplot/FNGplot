/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright (c) Wei-Hsu Lin(林韋旭) & All Contributors to FNGplot */

"use strict";

/* [!] Classes: Parent */

class StrokeParent {  //parent of objects with stroke only
    constructor(sid){
        this.sid = sid;
        this.display = true;
        this.name = "";
        //Style
        this.strokeWidth = 10;
        this.lineCap = "butt";
        this.pathLength = 150;
        this.dashArray = '';
        this.dashOffset = 0;
        this.strokeColor = "#8a408b"; // Wisteria purple
        this.strokeOpacity = 1;
    }
}
class StrokeFillParent extends StrokeParent { //parent of objects with both fill and stroke(border)
    constructor(sid){
        super(sid);
        this.fillColor = "#ddcfff";
        this.fillOpacity = 1;
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
        //Origin specified is used as the rectangle's "bottom left" corner
        this.originHoriz = "left";  
        this.originVert = "bottom";
        this.originX = -1;
        this.originY = -2;
        this.width = 7;
        this.height = 5;
        this.roundCorner = 0;
        this.lineJoin = "miter";
    }
}
class Circle extends StrokeFillParent {  // Actually uses an SVG <ellipse> in case user sets XHAT != YHAT
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
        this.y2 = 2;
        this.x3 = 3;
        this.y3 = 5;
    }
    updateMath(svgElem){
        //Calculate center of circumscribed circle from three points
        const [a, b, c, d, e, f] = [this.x1-this.x2, this.y1-this.y2, this.x1-this.x3, this.y1-this.y3, 0.5*((this.x1**2-this.x2**2)-(this.y2**2-this.y1**2)), 0.5*((this.x1**2-this.x3**2)-(this.y3**2-this.y1**2))];
        if(a*d-b*c < 1e-6){     //det = 0, colinear
            svgElem.setAttribute("cx", 0);
            svgElem.setAttribute("cy", 0);
            svgElem.setAttribute("rx", 0);
            svgElem.setAttribute("ry", 0);
        }
        else{
            const [cx,cy] = [-(d*e-b*f)/(b*c-a*d), -(a*f-c*e)/(b*c-a*d)];
            svgElem.setAttribute("cx", toPixelPosX(cx));
            svgElem.setAttribute("cy", toPixelPosY(cy));
            svgElem.setAttribute("rx", toPixelLenX(dist2D(cx, cy, this.x1, this.y1)));
            svgElem.setAttribute("ry", toPixelLenY(dist2D(cx, cy, this.x1, this.y1)));
        }
    }
}