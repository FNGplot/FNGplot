function toRealX(xCord){  // Translate calculation result to drawable pixel positions. X coordinate only.
    return ORIGIN_X + XHAT*xCord;
}
function toRealY(yCord){  // Translate calculation result to drawable pixel positions. Y coordinate only.
    return ORIGIN_Y - YHAT*yCord;
}