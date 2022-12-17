//
//Naming convention:
//
//functionName
//GLOBAL_VARIABLE
//localVariable
//html-object-id
//html-class-name
//
//Any function using camelCase is a system function.
//Any function that has no underscores AND no capital letters are user functions, for example plotpolar(). This naming style is inspired by MATLAB.



//System Functions:

function isNat(num){         // Check if input is natural number
	if(num > 0 && Number.isInteger(num))
		return true;
	else if(Math.abs(num-Math.round(num)) <= 0.0000001 && num > 0) //float error compensation.
		return true;
	else
		return false;
}

function systemDisplay(str,color){ //Display text on system-display. ("string","string")
	document.querySelector("#system-display").style.color = color;
	document.querySelector("#system-display").innerHTML = str;
}

function realToPixX(xCord){  // Translate calculation result to drawable pixel positions. X coordinate only.
		return ORIGIN_X_2D + XHAT_2D*xCord;
}
function realToPixY(yCord){  // Translate calculation result to drawable pixel positions. Y coordinate only.
		return ORIGIN_Y_2D - YHAT_2D*yCord;
}

function clear(pos){            // Clear the canvas and its transparency settings.
	if(clear.length == arguments.length){
		if(pos == 0){           //upper layer(main script)
			CTX_2D.clearRect(0, 0, CTX_2D.canvas.width, CTX_2D.canvas.height);
			CTX_2D.globalAlpha = 1;
		}
		else if(pos == 1){      //bottom layer(backdrop)
			CTX_BKDP_2D.clearRect(0, 0, CTX_2D.canvas.width, CTX_2D.canvas.height);
			CTX_BKDP_2D.globalAlpha = 1;
		}
	}
	else{
		systemDisplay("clear() error: too many or too few arguments","red");
	}
}



//User Functions:

function linepp(x1,y1,x2,y2,lineWidth,lineCap,color){//Draw line segment between two points. (real,real,real,real,real,string,string)
	if(linepp.length == arguments.length){
		CTX_2D.strokeStyle = color;
		CTX_2D.lineWidth = lineWidth;
		CTX_2D.lineCap = lineCap;
		CTX_2D.beginPath();
		CTX_2D.moveTo(realToPixX(x1),realToPixY(y1));
		CTX_2D.lineTo(realToPixX(x2),realToPixY(y2));       
		CTX_2D.stroke();
	}
	else{
		systemDisplay("linepp() error: too many or too few arguments","red");
	}
}

function setcvsrgba(color,alpha){ //Set color and transparency of canvas ("string",real)
	if(setcvsrgba.length == arguments.length){
		if(alpha != 0){ //if alpha = 0 then the following steps are completely unnecessary.
			CTX_2D.fillStyle = color;
			CTX_2D.globalAlpha = alpha/100;
			CTX_2D.fillRect(0, 0, CTX_BKDP_2D.canvas.width, CTX_BKDP_2D.canvas.height);
			CTX_2D.globalAlpha = 1;
		}
	}
	else{
		systemDisplay("setcvsrgba() error: too many or too few arguments","red");
	}
}

function setgrid(xMin,xMax,yMin,yMax){ //Set up coordinate(real,real,real,real)
	if(setgrid.length == arguments.length){
		if(xMin < xMax && yMin < yMax){
			ORIGIN_X_2D = CTX_2D.canvas.width*-xMin/(xMax-xMin);
			ORIGIN_Y_2D = CTX_2D.canvas.width*yMax/(yMax-yMin);
			XMAX_2D = xMax;
			YMAX_2D = yMax;
			XMIN_2D = xMin;
			YMIN_2D = yMin;
			XHAT_2D = CTX_2D.canvas.width/(xMax-xMin);
			YHAT_2D = CTX_2D.canvas.height/(yMax-yMin);
		}
		else{
			systemDisplay("setgrid() error: range error","red");
		}
	}
	else{
		systemDisplay("setgrid() error: too many or too few arguments","red");
	}
}

function label(text,x,y,color,size,weight,style,family,fill){ //print text on canvas ("string",real,real,"string",nat,"string","string","string",bool)
	if(label.length == arguments.length){
		if(size == null || weight == null || style == null || family == null)
			CTX_2D.font = "normal italic 20px STIX Two Text";
		else{
			CTX_2D.font= style+' '+weight+' '+size.toString()+"px "+family;
		}
		if(fill){
			CTX_2D.fillStyle = color;
			CTX_2D.fillText(text,Math.round(realToPixX(x)),Math.round(realToPixY(y)));
		}
		else if(!fill){
			CTX_2D.strokeStyle = color;
			CTX_2D.strokeText(text,Math.round(realToPixX(x)),Math.round(realToPixY(y)));
		}
	}
	else{
		systemDisplay("label() error: too many or too few arguments","red");
	}
}

function point(x,y,size,color){ //print dot on canvas (real,real,real,"string")
	if(point.length == arguments.length){
		CTX_2D.beginPath();
		CTX_2D.fillStyle = color;
		CTX_2D.arc(realToPixX(x),realToPixY(y),size, 0, 2 * Math.PI);
		CTX_2D.fill();
	}
	else{
		systemDisplay("point() error: too many or too few arguments","red");
	}
}

function alpha(pct){ //change drawing alpha (real)
	if(alpha.length == arguments.length){
		if(pct < 0 || pct > 100)
			systemDisplay("alpha():  0<=percentage<=100","red");
		else{
			CTX_2D.globalAlpha = pct/100;
		}
	}
	else{
		systemDisplay("alpha() error: too many or too few arguments","red");
	}
}

function plot(func,start,end,color,width){ //plot basic univariate functions ("string",real,real,"string",real)
	if(plot.length == arguments.length){
		//increment: 1px
		if(end > start){
			//----process input function argument----------
			func = func+';';   //add ';' at the end
			func = func.replace(/\^/g,"**");  // replace all '^' with "**" in function input
			//---------------------------------------------
			
			var dash_buffer = CTX_2D.getLineDash(); //preserve dash line pattern for next function
			CTX_2D.setLineDash([]);  //clear out dotline settings
			CTX_2D.strokeStyle = color;
			CTX_2D.lineWidth = width;
			CTX_2D.lineCap = "round";
			CTX_2D.lineJoin = "round";

			start = start < XMIN_2D ? XMIN_2D : start;		//if start or end is out of bound, just draw the portions in bound
			end = end > XMAX_2D ? XMAX_2D : end;			//if start or end is out of bound, just draw the portions in bound
			
			var px_start = Math.round(realToPixX(start));
			var px_end = Math.round(realToPixX(end));
			var px_count = px_end-px_start+1;
			var increment = 1/XHAT_2D;
			
			var X = new Array(px_count); //x remains in pixel form
			var Y = new Array(px_count);
			var x = 0; //buffer for the eval(), a measure to prevent functions with 'x', 'y', 'r', 't' in their names being processed away.
			var y = 0;
			
			for(let i = 0;i<px_count;i++){  //the function is being plotted using many,many line segments
				x = start+increment*i;
				eval(func);
				X[i] = px_start+i;  //generate x coord list (pixel)
				Y[i] = y;  			//generate y coord list (Y[i] = f(X[i])) (actual)
			}
			
			for(let i = 0;i<px_count;i++){  //vertical asymptote prevention (singularity marked with 'x')
				if(Y[i] > YMAX_2D && Y[i+1] < YMIN_2D){
					X[i+1] = "x";
					i++;
				}
				else if(Y[i] < YMIN_2D && Y[i+1] > YMAX_2D){
					X[i+1] = "x";
					i++;
				}
			}
			
			CTX_2D.beginPath();
			CTX_2D.moveTo(X[0],realToPixY(Y[0]));
			for(let i = 0;i<px_count-1;i++){
				if(X[i+1] == "x"){ 		//singularity ahead
					CTX_2D.stroke(); 		//end this section
					CTX_2D.beginPath();	//start new section
					CTX_2D.moveTo(X[i+2],realToPixY(Y[i+2]));
					CTX_2D.lineTo(X[i+3],realToPixY(Y[i+3]));
					i+=2;
				}
				else{
					CTX_2D.lineTo(X[i+1],realToPixY(Y[i+1]));
				}
			}
			CTX_2D.stroke();
			CTX_2D.setLineDash(dash_buffer); //preserve dash line pattern for next function
		}
		else if(end < start){
			systemDisplay("plot() range error: end < start","red");
		}
		//if start = end then do absolutely nothing
	}
	else{
		systemDisplay("plot() error: too many or too few arguments","red");
	}
}

function plotpolar(func,start,end,color,width){ //plot basic polar functions ("string",real,real,"string",real)
	if(plotpolar.length == arguments.length){
		//increment: PI/180 radian (1 degree)
		if(end > start || width > 0){
			//----process input function argument----------
			func = func+';';   //add ';' at the end
			func = func.replace(/\^/g,"**");  // replace all '^' with "**"
			//---------------------------------------------
			var dash_buffer = CTX_2D.getLineDash(); //preserve dash line pattern for next function
			CTX_2D.setLineDash([]);  //clear out dotline settings
			CTX_2D.strokeStyle = color;
			CTX_2D.lineWidth = width;
			CTX_2D.lineCap = "round";	
			CTX_2D.lineJoin = "round";
			
			var increment = PI/180;
			var point_count = Math.round((end-start)/increment+1);
			var x = new Array(point_count);
			var y = new Array(point_count);
			var t = 0;
			var r = 0;
			for(let i = 0;i<point_count;i++){  //the function is being plotted using many,many line segments
				t = start+increment*i;
				eval(func);
				x[i] = r*Math.cos(t);  //generate x coord list (directly translated)
				y[i] = r*Math.sin(t);  //generate y coord list (directly translated) (r[i] = f(t[i]))
			}
			for(let i = 0;i<point_count;i++){  //vertical and horizontal asymptote prevention (singularity marked with 'x')
				if(y[i] > YMAX_2D && y[i+1] < YMIN_2D || x[i] > XMAX_2D && x[i+1] < XMIN_2D){
					x[i+1] = "x";
					y[i+1] = "x";
					i++;
				}
				else if(y[i] < YMIN_2D && y[i+1] > YMAX_2D || x[i] < XMIN_2D && x[i+1] > XMAX_2D){
					x[i+1] = "x";
					y[i+1] = "x";
					i++;
				}
			}
			
			CTX_2D.beginPath();
			CTX_2D.moveTo(realToPixX(x[0]),realToPixY(y[0]));
			for(let i = 0;i<point_count-1;i++){
				if(x[i+1] == "x"){ 		//singularity ahead
					CTX_2D.stroke(); 		//end this section
					if(i+3 < point_count){
						CTX_2D.beginPath();	//start new section
						CTX_2D.moveTo(realToPixX(x[i+2]),realToPixY(y[i+2]));
						CTX_2D.lineTo(realToPixX(x[i+3]),realToPixY(y[i+3]));
					}
					i+=2;
				}
				else{
					CTX_2D.lineTo(realToPixX(x[i+1]),realToPixY(y[i+1]));
				}
			}
			CTX_2D.stroke();
			CTX_2D.setLineDash(dash_buffer); //preserve dash line pattern for next function
		}
		else if(end < start || width < 0){
			systemDisplay("plotpolar() error: end < start or width < 0","red");
		}
		//if start = end  or width = 0 then do absolutely nothing
	}
	else{
		systemDisplay("plotpolar() error: too many or too few arguments","red");
	}
}

function plotparam(funcX,funcY,start,end,color,width){ //plot basic 2D parametric functions ("string","string",real,real,"string",real)
	if(plotparam.length == arguments.length){
		if(end > start || width > 0){
			//increment: t = 0.01
			//----process input function_x argument----------
			funcX = funcX+';';   //add ';' at the end
			funcX = funcX.replace(/\^/g,"**");  // replace all '^' with "**"
			//----process input function_y argument----------
			funcY = funcY+';';   //add ';' at the end
			funcY = funcY.replace(/\^/g,"**");  // replace all '^' with "**"
			//---------------------------------------------
			var dash_buffer = CTX_2D.getLineDash(); //preserve dash line pattern for next function
			CTX_2D.setLineDash([]);  //clear out dotline settings
			CTX_2D.strokeStyle = color;
			CTX_2D.lineWidth = width;
			CTX_2D.lineCap = "round";
			CTX_2D.lineJoin = "round";
			var increment = 0.01;
			var point_count = Math.round((end-start)/increment+1);
			var T = new Array(point_count);
			var X = new Array(point_count);
			var Y = new Array(point_count);
			var t = 0;		//buffer for the eval(), a measure to prevent functions with 'x', 'y', 'r', 't' in their names being processed away.
			var x = 0;
			var y = 0;
			for(let i = 0;i<point_count;i++){  //the function is being plotted using many,many line segments
				t = start+increment*i;  //generate t coord list
				eval(funcX);           //generate x coord list (x[i] = fx(t[i]))
				eval(funcY);           //generate y coord list (y[i] = fy(t[i]))
				T[i] = t;
				X[i] = x;
				Y[i] = y;
			}
			
			for(let i = 0;i<point_count;i++){  //vertical and horizontal asymptote prevention (singularity marked with 'x')
				if(Y[i] > YMAX_2D && Y[i+1] < YMIN_2D || X[i] > XMAX_2D && X[i+1] < XMIN_2D){
					X[i+1] = "x";
					Y[i+1] = "x";
					i++;
				}
				else if(Y[i] < YMIN_2D && Y[i+1] > YMAX_2D || X[i] < XMIN_2D && X[i+1] > XMAX_2D){
					X[i+1] = "x";
					Y[i+1] = "x";
					i++;
				}
			}
			
			CTX_2D.beginPath();
			CTX_2D.moveTo(realToPixX(X[0]),realToPixY(Y[0]));
			for(let i = 0;i<point_count-1;i++){
				if(X[i+1] == "x"){ 		//singularity ahead
					CTX_2D.stroke(); 		//end this section
					if(i+3 < point_count){
						CTX_2D.beginPath();	//start new section
						CTX_2D.moveTo(realToPixX(X[i+2]),realToPixY(Y[i+2]));
						CTX_2D.lineTo(realToPixX(X[i+3]),realToPixY(Y[i+3]));
					}
					i+=2;
				}
				else{
					CTX_2D.lineTo(realToPixX(X[i+1]),realToPixY(Y[i+1]));
				}
			}
			CTX_2D.stroke();
			CTX_2D.setLineDash(dash_buffer); //preserve dash line pattern for next function
		}
		else if(end < start || width < 0){
			systemDisplay("plotparam() error: end < start or width < 0","red");
		}
		//if start = end or width = 0 then do absolutely nothing
	}
	else{
		systemDisplay("plotparam() error: too many or too few arguments","red");
	}
}

function rect(blX,blY,width,height,color,lineWidth,fill){//(real,real,real,real,"string",real,bool) Draw rectangle
	if(rect.length == arguments.length){
		CTX_2D.strokeStyle = color;
		CTX_2D.fillStyle = color;
		CTX_2D.lineWidth = lineWidth;
		CTX_2D.beginPath();
		CTX_2D.lineCap = "round";
		CTX_2D.lineJoin = "miter";
		CTX_2D.moveTo(realToPixX(blX),realToPixY(blY));
		CTX_2D.lineTo(realToPixX(blX+width),realToPixY(blY));
		CTX_2D.lineTo(realToPixX(blX+width),realToPixY(blY+height));
		CTX_2D.lineTo(realToPixX(blX),realToPixY(blY+height));
		CTX_2D.closePath();
		if(!fill)
			CTX_2D.stroke();
		else if(fill)
			CTX_2D.fill();
	}
	else{
		systemDisplay("rect() error: too many or too few arguments","red");
	}
}

function trian(x1,y1,x2,y2,x3,y3,color,lineWidth,fill){//(real,real,real,real,real,real,"string",real,bool) Draw triangle
	if(trian.length == arguments.length){
		CTX_2D.strokeStyle = color;
		CTX_2D.fillStyle = color;
		CTX_2D.lineWidth = lineWidth;
		CTX_2D.beginPath();
		CTX_2D.lineCap = "round";
		CTX_2D.lineJoin = "round";
		CTX_2D.moveTo(realToPixX(x1),realToPixY(y1));
		CTX_2D.lineTo(realToPixX(x2),realToPixY(y2));
		CTX_2D.lineTo(realToPixX(x3),realToPixY(y3));
		CTX_2D.closePath();
		if(!fill)
			CTX_2D.stroke();
		else if(fill)
			CTX_2D.fill();
	}
	else{
		systemDisplay("trian() error: too many or too few arguments","red");
	}
}

function ode1e(pX,qX,x0,y0,start,end,increment,width,color){ //numerically plot basic first order ODE using Euler's method. ("string","string",real,real,real,real,real,real,"string")
	if(ode1e.length == arguments.length){
		CTX_2D.setLineDash([]);  //clear out dotline settings
		CTX_2D.strokeStyle = color;
		CTX_2D.lineWidth = width;
		CTX_2D.lineCap = "round";
		if(!isNat((end-start)/increment+1) || !isNat((end-x0)/increment+1) || !isNat((x0-start)/increment+1)){
			systemDisplay("foh_ode_euler increment error","red");
		}
		else{ 
			pX = pX.replace(/\^/g,"**");  // replace all '^' with "**"
			qX = qX.replace(/\^/g,"**");  // replace all '^' with "**"
			//----process p(x) argument----------
			pXr = pX.replace(/x/g, "xR[i]");  // x -> x[i] (right side use)
			pXl = pX.replace(/x/g, "x__l[i]");  // x -> x[i] (left side use)
			//----process q(x) argument----------
			qXr = qX.replace(/x/g, "xR[i]");  // x -> x[i] (right side use)
			qXl = qX.replace(/x/g, "x__l[i]");  // x -> x[i] (left side use)
			//---------------------------------------------
			if(end > x0){ //right side
				var cmd = "yPrimeR[i] = ("+qXr+")-("+pXr+")*(yR[i]);";           // ##y'[n] = qX[n]-pX[n]*y[n]## ->  y' = q(x) - p(x)y   //Euler's method related argument
				//systemDisplay(cmd);
				//----process input function argument----------
				var pointCountR = Math.round((end-x0)/increment+1);
				var xR = new Array(pointCountR);
				var yR = new Array(pointCountR);
				var yPrimeR = new Array(pointCountR);
				xR[0] = x0;
				for(let i = 0;i<pointCountR;i++){ //generate x coord list
					xR[i] = x0+increment*i;     											//from center to right
				}
				yR[0] = y0;
				for(let i = 0;i<pointCountR;i++){ //generate y coord list
					eval(cmd);
					yR[i+1] = yR[i]+increment*yPrimeR[i];               			 //Euler's method related argument
				}
				for(let i = 0;i<pointCountR;i++){            						 //#For some reason, drawing as one consecutive line results in bad resolution.
					CTX_2D.beginPath();
					CTX_2D.moveTo(realToPixX(xR[i]),realToPixY(yR[i]));
					CTX_2D.lineTo(realToPixX(xR[i+1]),realToPixY(yR[i+1]));
					CTX_2D.stroke();
				}
			}
			//---------------------------------------------
			if(start < x0){ //left side
				var cmd = "y_prime__l[i] = ("+qXl+")-("+pXl+")*(y__l[i]);";           // ##y'[n] = qX[n]-pX[n]*y[n]## ->  y' = q(x) - p(x)y   //Euler's method related argument
				//systemDisplay(cmd);
				//----process input function argument----------
				var point_count__l = Math.round((x0-start)/increment+1);
				var x__l = new Array(point_count__l);
				var y__l = new Array(point_count__l);
				var y_prime__l = new Array(point_count__l);
				x__l[0] = x0;
				for(let i = 0;i<point_count__l;i++){ //generate x coord list
					x__l[i] = x0-increment*i;                                             //from center to left
				}
				y__l[0] = y0;
				for(let i = 0;i<point_count__l;i++){ //generate y coord list
					eval(cmd);
					y__l[i+1] = y__l[i]-increment*y_prime__l[i];               			 //Euler's method related argument
				}
				for(let i = 0;i<point_count__l;i++){            						 //#For some reason, drawing as one consecutive line results in bad resolution.
					CTX_2D.beginPath();
					CTX_2D.moveTo(realToPixX(x__l[i]),realToPixY(y__l[i]));
					CTX_2D.lineTo(realToPixX(x__l[i+1]),realToPixY(y__l[i+1]));
					CTX_2D.stroke();
				}
			}
			
		}
	}
	else{
		systemDisplay("ode1e() error: too many or too few arguments","red");
	}
}

function circle(cx,cy,radius,color,width,fill){ //Draw circle (real,real,real,"string",real,bool)
	if(circle.length == arguments.length){
		if(radius > 0 && width > 0){
			CTX_2D.lineWidth = width;
			CTX_2D.fillStyle = color;
			CTX_2D.strokeStyle = color;
			CTX_2D.beginPath()
			CTX_2D.ellipse(realToPixX(cx),realToPixY(cy),radius*XHAT_2D,radius*YHAT_2D,0,0,2 * Math.PI);
			if(fill)
				CTX_2D.fill();
			else if(!fill)
				CTX_2D.stroke();
		}
		else if(radius < 0 || width < 0){
			systemDisplay("circle() error: radius or width < 0","red");
		}
		//if radius = 0 or width = 0 then do absolutely nothing
	}
	else{
		systemDisplay("circle() error: too many or too few arguments","red");
	}
}

function arc(cx,cy,radius,start,end,color,width){ //Draw part of a circumference (real,real,real,real,real,"string",real)
	if(arc.length == arguments.length){
		if(radius > 0 && width > 0 && start != end){
			CTX_2D.lineWidth = width;
			CTX_2D.strokeStyle = color;
			CTX_2D.beginPath();
			CTX_2D.ellipse(realToPixX(cx),realToPixY(cy),radius*XHAT_2D,radius*YHAT_2D,0,-start*Math.PI/180,-end*Math.PI/180,true);
			CTX_2D.stroke();
		}
		else if(radius < 0 || width < 0){
			systemDisplay("arc() error: radius or width < 0","red");
		}
		//if radius = 0 or width = 0 or start = end then do absolutely nothing
	}
	else{
		systemDisplay("arc() error: too many or too few arguments","red");
	}
}

function bdarea(func1,func2,start,end,color){ //Draw bounded area of functions on canvas. ("string","string",real,real,"string") 
	if(bdarea.length == arguments.length){
		//increment: 1px
		if(end > start){
			//----process input function argument----------
			func1 = func1+';';   //add ';' at the end
			func1 = func1.replace(/\^/g,"**");  // replace all '^' with "**"
			func2 = func2+';';   //add ';' at the end
			func2 = func2.replace(/\^/g,"**");  // replace all '^' with "**"
			//---------------------------------------------
			
			var dash_buffer = CTX_2D.getLineDash(); //preserve dash line pattern for next function
			CTX_2D.setLineDash([]);  //clear out dotline settings
			CTX_2D.fillStyle = color;

			start = start < XMIN_2D ? XMIN_2D : start;		//if start or end is out of bound, just draw the portions in bound
			end = end > XMAX_2D ? XMAX_2D : end;			//if start or end is out of bound, just draw the portions in bound
			
			var px_start = Math.round(realToPixX(start));
			var px_end = Math.round(realToPixX(end));
			var px_count = px_end-px_start+1;
			var increment = 1/XHAT_2D;
			
			var X = new Array(px_count); //x remains in pixel form
			var Y1 = new Array(px_count);
			var Y2 = new Array(px_count);
			var x = 0; //buffer for the eval(), a measure to prevent functions with 'x', 'y', 'r', 't' in their names being processed away.
			var y = 0;
			
			for(let i = 0;i<px_count;i++){  //the function is being plotted using many,many line segments
				x = start+increment*i;
				X[i] = px_start+i;  //generate x coord list (pixel)
				eval(func1);
				Y1[i] = y;  			//generate y coord list (Y1[i] = f1(X[i])) (actual)
				eval(func2);
				Y2[i] = y;  			//generate y coord list (Y2[i] = f2(X[i])) (actual)
			}
			
			CTX_2D.beginPath();
			CTX_2D.moveTo(X[0],realToPixY(Y1[0]));
			for(let i = 0;i<px_count-1;i++){
				CTX_2D.lineTo(X[i+1],realToPixY(Y1[i+1]));
			}
			CTX_2D.lineTo(X[px_count-1],realToPixY(Y2[px_count-1]));
			for(let i = px_count-1;i>0;i--){
				CTX_2D.lineTo(X[i-1],realToPixY(Y2[i-1]));
			}
			CTX_2D.closePath();
			CTX_2D.fill();
			CTX_2D.setLineDash(dash_buffer); //preserve dash line pattern for next function
		}
		else if(end < start){
			systemDisplay("bdarea() range error: end < start","red");
		}
		//if start = end then do absolutely nothing
	}
	else{
		systemDisplay("bdarea() error: too many or too few arguments","red");
	}
}

function bdareapolar(func,start,end,color){ //Draw bounded area of polar functions on canvas. ("string",real,real,"string") 
	if(bdareapolar.length == arguments.length){
		//increment: PI/180 radian (1 degree)
		if(end > start){
			//----process input function argument----------
			func = func+';';   //add ';' at the end
			func = func.replace(/\^/g,"**");  // replace all '^' with "**"
			//---------------------------------------------
			var dash_buffer = CTX_2D.getLineDash(); //preserve dash line pattern for next function
			CTX_2D.setLineDash([]);  //clear out dotline settings
			CTX_2D.fillStyle = color;
			
			var increment = PI/180;
			var point_count = Math.round((end-start)/increment+1);
			var x = new Array(point_count);
			var y = new Array(point_count);
			var t = 0;
			var r = 0;
			for(let i = 0;i<point_count;i++){  //the function is being plotted using many,many line segments
				t = start+increment*i;
				eval(func);
				x[i] = r*Math.cos(t);  //generate x coord list (directly translated)
				y[i] = r*Math.sin(t);  //generate y coord list (directly translated) (r[i] = f(t[i]))
			}
			
			CTX_2D.beginPath();
			CTX_2D.moveTo(realToPixX(0),realToPixY(0));
			for(let i = 0;i<point_count;i++){
				CTX_2D.lineTo(realToPixX(x[i]),realToPixY(y[i]));
			}
			CTX_2D.closePath();
			CTX_2D.fill();
			CTX_2D.setLineDash(dash_buffer); //preserve dash line pattern for next function
		}
		else if(end < start){
			systemDisplay("bdareapolar() range error: end < start","red");
		}
		//if start = end then do absolutely nothing
	}
	else{
		systemDisplay("bdareapolar() error: too many or too few arguments","red");
	}
}

function ellipseab(cx,cy,a,b,theta,color,width,fill){ //Draw ellipse of any angle defined by major/minor axis and tilt angle. (real,real,real,real,real,"string",real,bool)
	if(ellipseab.length == arguments.length){
		if(a > 0 && width > 0){
			//increment: t = 0.01
			
			//based on ezplot_param() instead of ellipse() API for full support under any xhat:yhat ratio
			
			//draw from 0 to 6.29 (point_count = 630)
			
			//formula from https://math.stackexchange.com/questions/2645689/what-is-the-parametric-equation-of-a-rotated-ellipse-given-the-angle-of-rotatio

			//---------------------------------------------
			
			var r_theta = theta*Math.PI/180;  //degrees to radians
			var func_x = `x = ${a}*Math.cos(t)*Math.cos(${r_theta}) - ${b}*Math.sin(t)*Math.sin(${r_theta}) + ${cx}`;
			var func_y = `y = ${a}*Math.cos(t)*Math.sin(${r_theta}) + ${b}*Math.sin(t)*Math.cos(${r_theta}) + ${cy}`;
			
			var dash_buffer = CTX_2D.getLineDash(); //preserve dash line pattern for next function
			CTX_2D.setLineDash([]);  //clear out dotline settings
			CTX_2D.strokeStyle = color;
			CTX_2D.fillStyle = color;
			CTX_2D.lineWidth = width;
			CTX_2D.lineCap = "round";
			CTX_2D.lineJoin = "round";
			var T = new Array(630);
			var X = new Array(630);
			var Y = new Array(630);
			var t = 0;		//buffer for the eval(), a measure to prevent functions with 'x', 'y', 'r', 't' in their names being processed away.
			var x = 0;
			var y = 0;
			for(let i = 0;i<630;i++){  //the function is being plotted using many,many line segments
				t = 0.01*i;  			//generate t coord list
				eval(func_x);           //generate x coord list (x[i] = fx(t[i]))
				eval(func_y);           //generate y coord list (y[i] = fy(t[i]))
				T[i] = t;
				X[i] = x;
				Y[i] = y;
			}
			
			CTX_2D.beginPath();
			CTX_2D.moveTo(realToPixX(X[0]),realToPixY(Y[0]));
			for(let i = 0;i<629;i++){
				CTX_2D.lineTo(realToPixX(X[i+1]),realToPixY(Y[i+1]));
			}
			if(fill){
				CTX_2D.closePath();
				CTX_2D.fill();
			}
			else if(!fill)
				CTX_2D.stroke();
			CTX_2D.setLineDash(dash_buffer); //preserve dash line pattern for next function
		}
		else if(width < 0 || a < 0){
			systemDisplay("ellipseab() error: a,b or width < 0","red");
		}
		//if width = 0 or a = 0 then do absolutely nothing
	}
	else{
		systemDisplay("ellipseab() error: too many or too few arguments","red");
	}
}

function ellipseff(f1x,f1y,f2x,f2y,a,color,width,fill){ //Draw ellipse of any angle defined by major axis and two foci. (real,real,real,real,real,"string",real,bool)
	if(ellipseff.length == arguments.length){
		if(a >= Math.sqrt((f1x-f2x)**2+(f1y-f2y)**2)/2 && width > 0){
			ellipseab((f1x+f2x)/2,(f1y+f2y)/2,a,Math.sqrt(a**2-(Math.sqrt((f1x-f2x)**2+(f1y-f2y)**2)/2)**2),Math.atan2(f2y-f1y,f2x-f1x)*180/Math.PI,color,width,fill);
		}
		else if(a < Math.sqrt((f1x-f2x)**2+(f1y-f2y)**2)/2 || width < 0){
			systemDisplay("ellipseff() error: a illegal or width < 0","red");
		}
		//if width = 0 then do absolutely nothing
	}
	else{
		systemDisplay("ellipseff() error: too many or too few arguments","red");
	}
}

function slopefield(pX,qX,xMin,xMax,yMin,yMax,increment,length,width,color){ //Draw slope field of basic first order ODE. ("string","string",real,real,real,real,real,real,real,"string") 
	if(slopefield.length == arguments.length){
		var dash_buffer = CTX_2D.getLineDash(); //preserve dash line pattern for next function
		CTX_2D.setLineDash([]);  //clear out dotline settings
		CTX_2D.strokeStyle = color;
		CTX_2D.lineWidth = width;
		CTX_2D.lineCap = "round";
		if(!isNat((xMax-xMin)/increment+1) || !isNat((yMax-yMin)/increment+1)){
			systemDisplay("slopefield increment or range error","red");
		}
		else{
			var slope;
			//----process p(x) argument----------
			p = pX.replace(/x/g, "i");  // x -> i
			//----process q(x) argument----------
			q = qX.replace(/x/g, "i");  // x -> i
			//---------------------------------------------
			var cmd = "slope = ("+q+")-("+p+")*(j);";
			var x_dis = 0;
			var y_dis = 0;
			for(let i = xMin;i<=xMax;i+=increment){
				for(let j = yMin;j<=yMax;j+=increment){
					eval(cmd);
					x_dis = (length/2)*Math.cos(Math.atan(slope));
					y_dis = (length/2)*Math.sin(Math.atan(slope));
					CTX_2D.beginPath();
					CTX_2D.moveTo(realToPixX(i-x_dis),realToPixY(j-y_dis));
					CTX_2D.lineTo(realToPixX(i+x_dis),realToPixY(j+y_dis));  
					CTX_2D.stroke();
				}
			}
		}
		CTX_2D.setLineDash(dash_buffer); //preserve dash line pattern for next function
	}
	else{
		systemDisplay("slopefield() error: too many or too few arguments","red");
	}
}

function polyrc(cx,cy,r,n,theta,color,lineWidth,fill){  //Draw circumscribed regular polygons. (real,real,real,nat,real,"string",real,bool) 
	if(polyrc.length == arguments.length){
		if(!isNat(n) || n<3)
			systemDisplay("polyrc n incorrect","red","red");
		else{
			var x = new Array(n);
			var y = new Array(n);
			var angle = 2*PI/n;
			var theta_now = 0;
			x[0] = 0;
			y[0] = r;
			for(let i = 0;i<n-1;i++){
				theta_now+=angle;			                        //generate the list of points by rotating counterclockwise
				x[i+1] = cos(theta_now)*x[0] - sin(theta_now)*y[0];
				y[i+1] = sin(theta_now)*x[0] + cos(theta_now)*y[0];
			}
			var temp_x = 0;
			var temp_y = 0;
			for(let i = 0;i<n;i++){		                            //rotate it theta degrees + displace (cx,cy)
				temp_x = cos(theta*PI/180)*x[i] - sin(theta*PI/180)*y[i];
				temp_y = sin(theta*PI/180)*x[i] + cos(theta*PI/180)*y[i];
				x[i] = temp_x+cx;
				y[i] = temp_y+cy;
			}
			CTX_2D.strokeStyle = color;
			CTX_2D.fillStyle = color;
			CTX_2D.lineWidth = lineWidth;
			CTX_2D.lineCap = "round";
			CTX_2D.beginPath();
			CTX_2D.moveTo(realToPixX(x[0]),realToPixY(y[0]));
				for(let i = 0;i<n-1;i++){
					CTX_2D.lineTo(realToPixX(x[i+1]),realToPixY(y[i+1]));
			}    
			CTX_2D.closePath();
			if(!fill)
				CTX_2D.stroke();
			else if(fill)
				CTX_2D.fill();
			
		}
	}
	else{
		systemDisplay("polyrc() error: too many or too few arguments","red");
	}
}

function polyri(cx,cy,r,n,theta,color,lineWidth,fill){	//Draw inscribed regular polygons. (real,real,real,nat,real,"string",real,bool) 
	if(polyri.length == arguments.length){
		if(!isNat(n) || n<3)
			systemDisplay("polyri n incorrect","red");
		else{
			var r2 = r*sec(2*PI/(2*n));
			polyrc(cx,cy,r2,n,theta,color,lineWidth,fill);
		}
	}
	else{
		systemDisplay("polyri() error: too many or too few arguments","red");
	}
}

function polyrs(cx,cy,s,n,theta,color,lineWidth,fill){  //Draw regular polygons by defining center and sidelength. (real,real,real,nat,real,"string",real,bool) 
	if(polyrs.length == arguments.length){
		if(!isNat(n) || n<3)
			systemDisplay("polyrs n incorrect","red");
		else{
			var r2 = (s/2)*csc(2*PI/(2*n));
			polyrc(cx,cy,r2,n,theta,color,lineWidth,fill);
		}
	}
	else{
		systemDisplay("polyrs() error: too many or too few arguments","red");
	}
}

function polyrv(cx,cy,vx,vy,n,color,lineWidth,fill){    //Draw regular polygons by defining center and one vertex. (real,real,real,real,nat,"string",real,bool) 
	if(polyrv.length == arguments.length){
		if(!isNat(n) || n<3)
			systemDisplay("polyrv n incorrect","red");
		else if(cx == vx && cy == vy)
			systemDisplay("polyrv center and vertex are the same point","red");
		else{
			var angle = 0;
			if(vx-cx > 0)
				angle = arctan((vy-cy)/(vx-cx));
			else if(vx-cx < 0)
				angle = arctan((vy-cy)/(vx-cx))+PI;
			else if(vx-cx == 0){
				if(vy > cy)
					angle = PI/2;
				else if(vy < cy)
					angle = -PI/2;
			}
			var r = dist2D(cx,cy,vx,vy);
			polyrc(cx,cy,r,n,-90+(angle*180/PI),color,lineWidth,fill);
		}
	}
	else{
		systemDisplay("polyrv() error: too many or too few arguments","red");
	}
}

function lineps(x,y,m,ll,rl,lineWidth,lineCap,color){//(real,real,real,real,real,real,string,string) Draw line segment with point and slope.  
	if(lineps.length == arguments.length){
		if(m == NaN || m == "inf"){ //manual or function-returned infinity
			linepp(x,y-ll,x,y+rl,lineWidth,lineCap,color);
		}
		else{
			linepp(x-Math.sqrt((ll**2)/(m**2+1)),y-m*Math.sqrt((ll**2)/(m**2+1)),x+Math.sqrt((rl**2)/(m**2+1)),y+m*Math.sqrt((rl**2)/(m**2+1)),lineWidth,lineCap,color);
		}
	}
	else{
		systemDisplay("lineps() error: too many or too few arguments","red");
	}
}

function arrowpp(x1,y1,x2,y2,color,linewidth){ //Draw arrow on canvas. (real,real,real,real,"string",real)
	
	//This one is particularly difficult to implement, because of the dynamic tip size and the annoying <canvas> coordinate system, AND I need to make sure this works under any coordinate setting...tired.
	
	//Note: When working with pixel coordinates directly, origin is at top-left corner and the basis vectors point right and downwards.
	
	/*
		I get my dynamic tip size formula from LibreOfiice 7.2 Impress. I called out many arrows with different widths and analyzed them one by one.
	
		The result I get is that for an arrow with width "n" px, its head width is roughly n*( 4/3 + 35/(6*n) ) px.
		
		The tip triangle is bounded by a square. It is NOT a right triangle.
	*/
	
	//Step: Draw vertical downwards arrow from origin -> rotate -> translate
	
	if(arrowpp.length == arguments.length){
		var rx1 = realToPixX(x1);
		var rx2 = realToPixX(x2);
		var ry1 = realToPixY(y1);
		var ry2 = realToPixY(y2);
		var length = Math.sqrt((rx2-rx1)**2+(ry2-ry1)**2);
		var tip_width = linewidth*(4/3 + 35/(6*linewidth));   //adjusting the tip size according to linewidth
		
		//p1 = arrowstart, p2 = tip, p3&4 = side, p5 = end of line segment(embedded in triangle)
		
		//downward arrow
		
		//at this point, p1x = 0,p1y = 0, p2x = 0, p2y = length, p3x = -(tip_width/2), p3y = length-tip_width, p4x = (tip_width/2), p4y = length-tip_width, p5x = 0, p5y = length-tip_width+2;
		
		//get rotation angle
		var angle = 0;
		
		if(Math.abs(rx1-rx2) >= 0.0001){ //rx1 != rx2 (not vertical)
			angle = Math.atan((ry2-ry1)/(rx2-rx1));
			if(rx2-rx1 > 0){ //arrow point to right
				var s = Math.sin(angle-Math.PI/2); 
				var c = Math.cos(angle-Math.PI/2);
			}
			else if(rx2-rx1 < 0){ //arrow point to left
				var s = Math.sin(angle+Math.PI/2); 
				var c = Math.cos(angle+Math.PI/2);
			}
		}
		else{
			if(ry2 > ry1){	//pointing down
				var s = 0;
				var c = 1;
			}
			else if(ry2 < ry1){	//pointing straight up
				var s = 0;
				var c = -1;
			}
		}
		
		//constructing the arrow. declaration itself contains rotation matrix and translation.
		var p1x = rx1; 
		var p1y = ry1;
		var p2x = length*-s+rx1;
		var p2y = length*c+ry1;
		var p3x = (-tip_width/2)*c + (length-tip_width)*-s+rx1;
		var p3y = (-tip_width/2)*s + (length-tip_width)*c+ry1;
		var p4x = (tip_width/2)*c + (length-tip_width)*-s+rx1;
		var p4y = (tip_width/2)*s + (length-tip_width)*c+ry1;
		var p5x = (length-tip_width+2)*-s+rx1;
		var p5y = (length-tip_width+2)*c+ry1;


		// draw arrow body

		var dash_buffer = CTX_2D.getLineDash(); //preserve dash line pattern for next function
		CTX_2D.setLineDash([]);  //clear out dotline settings
		CTX_2D.strokeStyle = color;
		CTX_2D.fillStyle = color;
		CTX_2D.lineWidth = linewidth;
		CTX_2D.lineCap = "butt";
		CTX_2D.beginPath();
		CTX_2D.moveTo(p1x,p1y);
		CTX_2D.lineTo(p5x,p5y);       
		CTX_2D.stroke();
		
		// draw arrow tip
		
		CTX_2D.beginPath();
		CTX_2D.lineJoin = "round";
		CTX_2D.moveTo(p2x,p2y);
		CTX_2D.lineTo(p3x,p3y);
		CTX_2D.lineTo(p4x,p4y);
		CTX_2D.closePath();
		CTX_2D.fill();
		CTX_2D.setLineDash(dash_buffer); //preserve dash line pattern for next function
	}
	else{
		systemDisplay("arrowpp() error: too many or too few arguments","red");
	}
}

function lineppext(x1,y1,x2,y2,linewidth,linecap,color,d1,d2){// Draw line segment with extension between two points. (real,real,real,real,real,string,string,real,real)
	if(lineppext.length == arguments.length){
		//division point formula
		var nx1 = x1+(x1-x2)*(d1/dist2D(x1,y1,x2,y2));
		var nx2 = x2+(x2-x1)*(d2/dist2D(x1,y1,x2,y2));
		var ny1 = y1+(y1-y2)*(d1/dist2D(x1,y1,x2,y2));
		var ny2 = y2+(y2-y1)*(d2/dist2D(x1,y1,x2,y2));
		console.log(nx1);
		console.log(ny1);
		console.log(nx2);
		console.log(ny2);
		linepp(nx1,ny1,nx2,ny2,linewidth,linecap,color);
	}
	else{
		systemDisplay("lineppext() error: too many or too few arguments","red");
	}
}

function sector(cx,cy,radius,start,end,color,width,fill){ //Draw part of a circle (real,real,real,real,real,"string",real,bool)
	if(sector.length == arguments.length){
		if(radius > 0 && width > 0 && start != end){
			CTX_2D.lineWidth = width;
			CTX_2D.fillStyle = color;
			CTX_2D.strokeStyle = color;
			CTX_2D.lineJoin = "round";
			CTX_2D.beginPath();
			CTX_2D.moveTo(realToPixX(cx),realToPixY(cy));
			CTX_2D.lineTo(realToPixX(cx)+XHAT_2D*radius*Math.cos(start*Math.PI/180),realToPixY(cy)-YHAT_2D*radius*Math.sin(start*Math.PI/180));
			CTX_2D.ellipse(realToPixX(cx),realToPixY(cy),radius*XHAT_2D,radius*YHAT_2D,0,-start*Math.PI/180,-end*Math.PI/180,true);
			CTX_2D.closePath();
			if(fill)
				CTX_2D.fill();
			else if(!fill)
				CTX_2D.stroke();
		}
		else if(radius < 0 || width < 0){
			systemDisplay("sector() error: radius or width < 0","red");
		}
		//if radius = 0 or width = 0 or start = end then do absolutely nothing
	}
	else{
		systemDisplay("sector() error: too many or too few arguments","red");
	}
}

function segment(cx,cy,radius,start,end,color,width,fill){ //Draw a circle segment(real,real,real,real,real,"string",real,bool)
	if(segment.length == arguments.length){
		if(radius > 0 && width > 0 && start != end){
			CTX_2D.lineWidth = width;
			CTX_2D.fillStyle = color;
			CTX_2D.strokeStyle = color;
			CTX_2D.lineJoin = "round";
			CTX_2D.beginPath();
			CTX_2D.ellipse(realToPixX(cx),realToPixY(cy),radius*XHAT_2D,radius*YHAT_2D,0,-start*Math.PI/180,-end*Math.PI/180,true);
			CTX_2D.closePath();
			if(fill)
				CTX_2D.fill();
			else if(!fill)
				CTX_2D.stroke();
		}
		else if(radius < 0 || width < 0){
			systemDisplay("segment() error: radius or width < 0","red");
		}
		//if radius = 0 or width = 0 or start = end then do absolutely nothing
	}
	else{
		systemDisplay("segment() error: too many or too few arguments","red");
	}
}

function setdash(dash,space){ //Set global dashline setting(real,real)
	if(setdash.length == arguments.length){
		if(dash > 0 && space > 0){
			CTX_2D.setLineDash([dash,space]);
		}
		else{
			systemDisplay("setdash() error: parameter error","red");
		}
	}
	else{
		systemDisplay("setdash() error: too many or too few arguments","red");
	}

}

function cleardash(){ //Clear global dashline setting
	if(cleardash.length == arguments.length)
		CTX_2D.setLineDash([]);
	else
		systemDisplay("cleardash() error: too many or too few arguments","red");
}

function hypbolab(cx,cy,a,b,theta,color,width){ //Draw hyperbola of any angle defined by major/minor axis and tilt angle. (real,real,real,real,real,"string",real)
	if(hypbolab.length == arguments.length){
		if(a > 0 && width > 0){
			//increment: t = 0.01
			
			//based on ezplot_param() instead of ellipse() API for full support under any xhat:yhat ratio
			
			//draw from 0 to 6.29 (point_count = 630)
			
			//formula from https://math.stackexchange.com/questions/2707394/rotation-of-hypbol-with-any-angle

			//---------------------------------------------
			
			var r_theta = theta*Math.PI/180;  //degrees to radians
			var func_x = `x = ${a}*(1/Math.cos(t))*Math.cos(${r_theta}) - ${b}*Math.tan(t)*Math.sin(${r_theta}) + ${cx}`;
			var func_y = `y = ${a}*(1/Math.cos(t))*Math.sin(${r_theta}) + ${b}*Math.tan(t)*Math.cos(${r_theta}) + ${cy}`;
			
			var dash_buffer = CTX_2D.getLineDash(); //preserve dash line pattern for next function
			CTX_2D.setLineDash([]);  //clear out dotline settings
			CTX_2D.strokeStyle = color;
			CTX_2D.fillStyle = color;
			CTX_2D.lineWidth = width;
			CTX_2D.lineCap = "round";
			CTX_2D.lineJoin = "round";
			var T = new Array(630);
			var X = new Array(630);
			var Y = new Array(630);
			var t = 0;		//buffer for the eval(), a measure to prevent functions with 'x', 'y', 'r', 't' in their names being processed away.
			var x = 0;
			var y = 0;
			for(let i = 0;i<630;i++){  //the function is being plotted using many,many line segments
				t = 0.01*i;  			//generate t coord list
				eval(func_x);           //generate x coord list (x[i] = fx(t[i]))
				eval(func_y);           //generate y coord list (y[i] = fy(t[i]))
				T[i] = t;
				X[i] = x;
				Y[i] = y;
			}
			
			
			
			for(let i = 0;i<630;i++){  //vertical and horizontal asymptote prevention (singularity marked with 'x')
				if(Y[i] > YMAX_2D && Y[i+1] < YMIN_2D || X[i] > XMAX_2D && X[i+1] < XMIN_2D){
					X[i+1] = "x";
					Y[i+1] = "x";
					i++;
				}
				else if(Y[i] < YMIN_2D && Y[i+1] > YMAX_2D || X[i] < XMIN_2D && X[i+1] > XMAX_2D){
					X[i+1] = "x";
					Y[i+1] = "x";
					i++;
				}
			}
			
			CTX_2D.beginPath();
			CTX_2D.moveTo(realToPixX(X[0]),realToPixY(Y[0]));
			for(let i = 0;i<629;i++){
				if(X[i+1] == "x"){ 		//singularity ahead
					CTX_2D.stroke(); 		//end this section
					if(i+3 < 630){
						CTX_2D.beginPath();	//start new section
						CTX_2D.moveTo(realToPixX(X[i+2]),realToPixY(Y[i+2]));
						CTX_2D.lineTo(realToPixX(X[i+3]),realToPixY(Y[i+3]));
					}
					i+=2;
				}
				else{
					CTX_2D.lineTo(realToPixX(X[i+1]),realToPixY(Y[i+1]));
				}
			}
			CTX_2D.stroke();
			CTX_2D.setLineDash(dash_buffer); //preserve dash line pattern for next function			
		}
		else if(width < 0 || a < 0){
			systemDisplay("hypbolab() error: a,b or width < 0","red");
		}
		//if width = 0 or a = 0 then do absolutely nothing
	}
	else{
		systemDisplay("hypbolab() error: too many or too few arguments","red");
	}
}

function hypbolff(f1x,f1y,f2x,f2y,a,color,width){ //Draw hyperbola of any angle defined by major axis and two foci. (real,real,real,real,real,"string",real)
	if(hypbolff.length == arguments.length){
		if(a <= Math.sqrt((f1x-f2x)**2+(f1y-f2y)**2)/2 && width > 0){
			hypbolab((f1x+f2x)/2,(f1y+f2y)/2,a,Math.sqrt((Math.sqrt((f1x-f2x)**2+(f1y-f2y)**2)/2)**2-a**2),Math.atan2(f2y-f1y,f2x-f1x)*180/Math.PI,color,width);
		}
		else if(a > Math.sqrt((f1x-f2x)**2+(f1y-f2y)**2)/2 || width < 0){
			systemDisplay("hypbolff() error: a illegal or width < 0","red");
		}
		//if width = 0 then do absolutely nothing
	}
	else{
		systemDisplay("hypbolff() error: too many or too few arguments","red");
	}
}

function bezier2(x1,y1,x2,y2,x3,y3,color,width){ //Draw quadratic bezier curve. (real,real,real,real,real,real,"string",real)
	if(bezier2.length == arguments.length){
		if(x1 != x3 || y1 != y3){
			CTX_2D.strokeStyle = color;
			CTX_2D.lineWidth = width;
			CTX_2D.beginPath();
			CTX_2D.moveTo(realToPixX(x1),realToPixY(y1));
			CTX_2D.quadraticCurveTo(realToPixX(x2),realToPixY(y2),realToPixX(x3),realToPixY(y3));       
			CTX_2D.stroke();
		}
		else if(x1 == y1 && x3 == y3 || width < 0){
			systemDisplay("bezier2() error: illegal parameter or width < 0","red");
		}
		//if width = 0 then do absolutely nothing
	}
	else{
		systemDisplay("bezier2() error: too many or too few arguments","red");
	}
}

function bezier3(x1,y1,x2,y2,x3,y3,x4,y4,color,width){ //Draw cubic bezier curve. (real,real,real,real,real,real,real,real,"string",real)
	if(bezier3.length == arguments.length){
		if(x1 != x4 || y1 != y4){
			CTX_2D.strokeStyle = color;
			CTX_2D.lineWidth = width;
			CTX_2D.beginPath();
			CTX_2D.moveTo(realToPixX(x1),realToPixY(y1));
			CTX_2D.bezierCurveTo(realToPixX(x2),realToPixY(y2),realToPixX(x3),realToPixY(y3),realToPixX(x4),realToPixY(y4));       
			CTX_2D.stroke();
		}
		else if(x1 == y1 && x4 == y4 || width < 0){
			systemDisplay("bezier3() error: illegal parameter or width < 0","red");
		}
		//if width = 0 then do absolutely nothing
	}
	else{
		systemDisplay("bezier3() error: too many or too few arguments","red");
	}
}




//------↓↓↓↓↓↓↓↓Mathematical variables declare zone↓↓↓↓↓↓↓↓-------------------

//currently unused

//------↑↑↑↑↑↑↑↑Mathematical variables declare zone↑↑↑↑↑↑↑↑-------------------


//------↓↓↓↓↓↓↓↓Mathematical constant and function declare zone↓↓↓↓↓↓↓↓-------------------
const PI = 3.14159;              //PI
const E = 2.71828;               //Euler's number
const GOLD = 1.61803;       	 //Golden ratio
const SLIVER = 2.41421;          //Sliver ratio
const BRONZE = 3.30278;          //Bronze ratio
const GAMMA = 0.57722;           //Euler-Mascheroni constant
const APERY = 1.20206;           //Apery's constant
function sin(x){           
	return Math.sin(x);
}
function cos(x){
	return Math.cos(x);
}
function tan(x){
	return Math.tan(x);
}
function cot(x){
	return 1 / Math.tan(x);
}
function sec(x){
	return 1 / Math.cos(x);
}
function csc(x){
	return 1 / Math.sin(x);
}
function arcsin(x){
	return Math.asin(x);
}
function arccos(x){
	return Math.acos(x);
}
function arctan(x){
	return Math.atan(x);
}
function arccot(x){
	return Math.atan(1/x);
}
function arcsec(x){
	return Math.acos(1/x);
}
function arccsc(x){
	return Math.asin(1/x);
}
function sinh(x){
	return Math.sinh(x);
}
function cosh(x){
	return Math.cosh(x);
}
function tanh(x){
	return Math.tanh(x);
}
function coth(x){
	return 1/Math.tanh(x);
}
function sech(x){
	return 1/Math.cosh(x);
}
function csch(x){
	return 1/Math.sinh(x);
}
function arsinh(x){
	return Math.asinh(x);
}
function arcosh(x){
	return Math.acosh(x);
}
function artanh(x){
	return Math.atanh(x);
}
function arcoth(x){
	return Math.atanh(1/x);
}
function arsech(x){
	return Math.acosh(1/x);
}
function arcsch(x){
	return Math.asinh(1/x);
}
//----------------------------------
function abs(x){
	return Math.abs(x);
}
function pow(base,exponent){
	return Math.pow(base,exponent);
}
function log(base,real){
	return Math.log(real)/Math.log(base);
}
function sqrt(x){
	return Math.sqrt(x);
}
function cbrt(x){
	return Math.cbrt(x);
}
//----------------------------------
function floor(x){
	return Math.floor(x);
}
function round(x){
	return Math.round(x);
}
function roundTo(x,digit){
	return x.toFixed(digit);
}
function ceil(x){
	return Math.ceil(x);
}
function trunc(x){
	return Math.trunc(x);
}
function sgn(x){
	return Math.sign(x);
}
function sinc(x){
	if(x == 0)
		return 1;
	else
		return Math.sin(x)/x;
}
//----------------------------------
function factorial(x){
	var out = 1;
	if(x == 0)
		return 1;
	else if(!isNat(x))
		systemDisplay("factorial() error: x is not a natural number","red");
	else if(x>20)
		systemDisplay("factorial() error: x too large(>20)","red");
	else{
		for(let i = 1;i<=x;i++){
			out*=i;
		}
		return out;
	}
}
function nPr(n,r){
	if(r == 0)
		return 1;
	else if(!isNat(n) || !isNat(r) || r>n)
		systemDisplay("nPr() error","red");
	else{
		var tmp = n;
		var out = 1;
		for(let i = 0;i<r;i++){
			out *= tmp;
			tmp--;
		}
		return out;
	}
}
function nCr(n,r){
	if(r == 0)
		return 1;
	else if(!isNat(n) || !isNat(r) || r>n)
		systemDisplay("nCr() error","red");
	else{
		if(r > n/2)
			r = n-r;
		return nPr(n,r)/factorial(r);
	}
}
//----------------------------------
function erf(x){
	if(x > 6)
		return 1;
	else if(x < -6)
		return -1;
	else if(x == 0)
		return 0;
	else if(x<=6 && x > 0){
		var out = 1-(1/(pow((1+0.278393*x+0.230389*pow(x,2)+0.000972*pow(x,3)+0.078108*pow(x,4)),4)));
		return out;
	}
	else if(x>=-6 && x < 0){
		var k = -x;
		var out = 1-(1/(pow((1+0.278393*k+0.230389*pow(k,2)+0.000972*pow(k,3)+0.078108*pow(k,4)),4)));
		return -out;
	}
}
function normPDF(mean,variance,x){
	if(variance <= 0)
		systemDisplay("normPDF() error: variance <= 0","red");
	else{
		var stdev = sqrt(variance);
		var out = (1/(stdev*sqrt(2*PI)))*pow(E,-0.5*((x-mean)/stdev)**2);
		return out;
	}
}
function normCDF(mean,variance,x){
	if(variance <= 0)
		systemDisplay("normCDF() error: variance <= 0","red");
	else{
		var stdev = sqrt(variance);
		var out = 0.5*(1+erf((x-mean)/(stdev*sqrt(2))));
		return out;
	}
}
//----------------------------------
function dist2D(x1,y1,x2,y2){
	return Math.sqrt((x2-x1)**2+(y2-y1)**2);
}
function dist3D(x1,y1,z1,x2,y2,z2){
	return Math.sqrt((x2-x1)**2+(y2-y1)**2+(z2-z1)**2);
}
function toDeg(x){
	return x*180/Math.PI;
}
function toRad(x){
	return x*Math.PI/180;
}
//------↑↑↑↑↑↑↑↑Mathematical constant and function declare zone↑↑↑↑↑↑↑↑-------------------