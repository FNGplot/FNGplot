/* [!] Classes: Parent */

"use strict";

class StrokeParent {  //parent of objects with stroke only
    constructor(sid){
        this.sid = sid;
        this.display = true;
        this.name = "Default Name";
        //Style
        this.strokeWidth = 10;
        this.lineCap = "butt";
        this.pathLength = 100;
        this.dashArray = '';
        this.dashOffset = 0;
        this.strokeColor = "#8a408b"; // Wisteria purple
        this.strokeOpacity = 1;
    }
    updateSVG(s) {
        s.setAttribute("data-name", this.name); 
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
        this.hasBorder = "true";
        this.hasFill = true;
        this.fillColor = "#ddcfff";
        this.fillOpacity = 1;
    }
    updateSVG(s) {
        super.updateSVG(s);
        s.setAttribute("stroke", this.hasBorder ? this.strokeColor : "none");
        s.setAttribute("fill", this.hasFill ? this.fillColor : "none");
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
    updateSVG() { 
        const s = SVG_CANVAS.querySelector(`[data-sid='${this.sid}']`); // Get element
        super.updateSVG(s);
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
    updateSVG(){
        const s = SVG_CANVAS.querySelector(`[data-sid='${this.sid}']`);
        super.updateSVG(s);
        s.setAttribute("x",toPixelPosX(this.originX - RECT_ORIGMAP.get(this.originHoriz) * this.width));
        s.setAttribute("y",toPixelPosY(this.originY + RECT_ORIGMAP.get(this.originVert) * this.height));
        s.setAttribute("width",toPixelLenX(this.width));
        s.setAttribute("height",toPixelLenY(this.height));
        s.setAttribute("rx",this.roundCorner);
        s.setAttribute("stroke-linejoin",this.lineJoin);
    }
}
class Circle extends StrokeFillParent {    //Actually uses an ellipse, in case XHAT != YHAT
    constructor(sid) {
        super(sid);
        this.name = "Circle";
        this.centerX = 2;
        this.centerY = 4;
        this.radius = 2.5;
    }
    updateSVG() {
        const s = SVG_CANVAS.querySelector(`[data-sid='${this.sid}']`);
        super.updateSVG(s);
        s.setAttribute("cx",toPixelPosX(this.centerX));
        s.setAttribute("cy",toPixelPosY(this.centerY));
        s.setAttribute("rx",toPixelLenX(this.radius));
        s.setAttribute("ry",toPixelLenY(this.radius));
    }
}