function toPixelPosX(xCord){  // Translate calculation result to drawable pixel positions. X coordinate only.
    return ORIGIN_X + XHAT*xCord;
}
function toPixelPosY(yCord){  // Translate calculation result to drawable pixel positions. Y coordinate only.
    return ORIGIN_Y - YHAT*yCord;
}
function toPixelLenX(length){ // Translate calculation result to drawable pixel lengths. X direction only.
    return length * XHAT;
}
function toPixelLenY(length){ // Translate calculation result to drawable pixel lengths. Y direction only.
    return length * YHAT;
}