/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright (c) Wei-Hsu Lin(林韋旭) & All Contributors to FNGplot */

"use strict";

function toPixelPosX(xCord){  // Translate calculation result to actual pixel positions. X coordinate only.
    return fngNS.Coord.originX + fngNS.Coord.xHat*xCord;
}
function toPixelPosY(yCord){  // Translate calculation result to actual pixel positions. Y coordinate only.
    return fngNS.Coord.originY - fngNS.Coord.yHat*yCord;
}
function toPixelLenX(length){ // Translate calculation result to actual pixel lengths. X direction only.
    return length * fngNS.Coord.xHat;
}
function toPixelLenY(length){ // Translate calculation result to actual pixel lengths. Y direction only.
    return length * fngNS.Coord.yHat;
}