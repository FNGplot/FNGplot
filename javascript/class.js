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
        this.pathLength = 100;
        this.dashArray = '';
        this.dashOffset = 0;
        this.strokeColor = "#8a408b"; // Wisteria purple
        this.strokeOpacity = 1;
    }
    updateStyle(s) { 
        s.setAttribute("display", this.display ? "" : "none");
        s.setAttribute("stroke", this.strokeColor);
        s.setAttribute("stroke-width", this.strokeWidth);
        s.setAttribute("stroke-opacity", this.strokeOpacity);
        s.setAttribute("stroke-linecap", this.lineCap);
        s.setAttribute("pathLength", this.pathLength);
        s.setAttribute("stroke-dasharray", this.dashArray);
        s.setAttribute("stroke-dashoffset", this.dashOffset); 
    }
}
class StrokeFillParent extends StrokeParent { //parent of objects with both fill and stroke(border)
    constructor(sid){
        super(sid);
        this.fillColor = "#ddcfff";
        this.fillOpacity = 1;
    }
    updateStyle(s) {
        super.updateStyle(s);
        s.setAttribute("stroke", this.strokeColor);
        s.setAttribute("fill", this.fillColor);
        s.setAttribute("fill-opacity", this.fillOpacity); 
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
    updateStyle() { 
        const s = SVG_CANVAS.querySelector(`[data-sid='${this.sid}']`); // Get element
        super.updateStyle(s);
        s.setAttribute("x1",toPixelPosX(this.x1));
        s.setAttribute("y1",toPixelPosY(this.y1));
        s.setAttribute("x2",toPixelPosX(this.x2));
        s.setAttribute("y2",toPixelPosY(this.y2));
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
    updateStyle(){
        const s = SVG_CANVAS.querySelector(`[data-sid='${this.sid}']`);
        super.updateStyle(s);
        s.setAttribute("x",toPixelPosX(this.originX - RECT_ORIGMAP.get(this.originHoriz) * this.width));
        s.setAttribute("y",toPixelPosY(this.originY + RECT_ORIGMAP.get(this.originVert) * this.height));
        s.setAttribute("width",toPixelLenX(this.width));
        s.setAttribute("height",toPixelLenY(this.height));
        s.setAttribute("rx",this.roundCorner);
        s.setAttribute("stroke-linejoin",this.lineJoin);
    }
}
class Circle extends StrokeFillParent {  // Actually uses an SVG <ellipse> in case XHAT != YHAT
    constructor(sid) {
        super(sid);
        this.name = "Circle";
        this.centerX = 2;
        this.centerY = 4;
        this.radius = 2.5;
    }
    updateStyle() {
        const s = SVG_CANVAS.querySelector(`[data-sid='${this.sid}']`);
        super.updateStyle(s);
        s.setAttribute("cx",toPixelPosX(this.centerX));
        s.setAttribute("cy",toPixelPosY(this.centerY));
        s.setAttribute("rx",toPixelLenX(this.radius));
        s.setAttribute("ry",toPixelLenY(this.radius));
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
    updateStyle() {
        const s = SVG_CANVAS.querySelector(`[data-sid='${this.sid}']`);
        super.updateStyle(s);
        const [cx,cy] = this.circumCenter(this.x1, this.y1, this.x2, this.y2, this.x3, this.y3);
        s.setAttribute("cx",toPixelPosX(cx));
        s.setAttribute("cy",toPixelPosY(cy));
        s.setAttribute("rx",toPixelLenX(dist2D(this.x1,this.y1,cx,cy)));
        s.setAttribute("ry",toPixelLenY(dist2D(this.x1,this.y1,cx,cy)));
    }
    circumCenter(x1, y1, x2, y2, x3, y3){
        const [a, b, c, d, e, f] = [x1-x2, y1-y2, x1-x3, y1-y3, 0.5*((x1**2-x2**2)-(y2**2-y1**2)), 0.5*((x1**2-x3**2)-(y3**2-y1**2))];
        const [cx,cy] = [-(d*e-b*f)/(b*c-a*d), -(a*f-c*e)/(b*c-a*d)];
        return [cx,cy];
    }
}