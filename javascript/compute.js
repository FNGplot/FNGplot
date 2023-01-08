/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright (c) Wei-Hsu Lin(林韋旭) & All Contributors to FNGplot */

"use strict";

function isNumeric(num){
    // Credit: https://stackoverflow.com/questions/18082/validate-decimal-numbers-in-javascript-isnumeric  Thank you for this awesome solution
    //(This is way too short to be copyrighted)
    return !isNaN(parseFloat(num)) && isFinite(num);
}
function gcd(a,b){
    a = Math.abs(a);
    b = Math.abs(b);
    if(b > a){
        let tmp = a;
        a = b;
        b = tmp;
    }
    while(true){
        if(b == 0){
            return a;
        }
        a %= b;
        if(a == 0) {
            return b;
        }
        b %= a;
    }
}
function toPixelPosX(xCord){  // Translate calculation result to actual pixel positions. X coordinate only.
    return ORIGIN_X + XHAT*xCord;
}
function toPixelPosY(yCord){  // Translate calculation result to actual pixel positions. Y coordinate only.
    return ORIGIN_Y - YHAT*yCord;
}
function toPixelLenX(length){ // Translate calculation result to actual pixel lengths. X direction only.
    return length * XHAT;
}
function toPixelLenY(length){ // Translate calculation result to actual pixel lengths. Y direction only.
    return length * YHAT;
}

function dist2D(x1,y1,x2,y2){
	return Math.sqrt((x2-x1)**2+(y2-y1)**2);
}