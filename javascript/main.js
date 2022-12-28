//
//Naming convention:
//
//functionName
//GLOBAL_VARIABLE
//localVariable
//ObjectName
//html-object-id
//html-class-name

//------↓↓↓↓↓↓↓↓Global variable declare zone of the ENTIRE program↓↓↓↓↓↓↓↓-------------------
var SYSTEM_EPOCH = Date.now();

//Commonly used DOM objects
var BLOCK_FRAME = document.querySelector('#block-frame');
var SVG_FRAME = document.querySelector('#svg-frame');
var SVG_CANVAS = document.querySelector('#svg-canvas');

//Object database
var OBJECT_LIST = []; //Object database. The real(hidden) version of the blocks.
var SORTABLE_LIST = []; //Stores the Sortable objects

//System variables
const TOOLBAR_CLR = ['#f0923b','#5f95f7','#9268f6','#c763d0','#67bc59','#6dbde2','#4868ce','#ed7082','#f3af42']; //(SCRATCH 2.0/3.0 && some of my own)

//Cartesian coordinate
var XMAX = 10;
var XMIN = -10;
var YMAX = 10;
var YMIN = -10;
var XHAT = 50;
var YHAT = 50;
var ORIGIN_X = 500; //"real" x and y coordinates of the origin point in the SVG.
var ORIGIN_Y = 500;

//------↑↑↑↑↑↑↑↑Global variable declare zone of the ENTIRE project↑↑↑↑↑↑↑↑-------------------

window.onload = function(){
	SYSTEM_EPOCH = Date.now();  //Start system timer. It is mainly used for debugging and optimizing purposes.
	console.log(`SYSTEM_EPOCH: ${SYSTEM_EPOCH}`);

	
	//Init left panel
	document.querySelector("#left-panel-select").addEventListener("change", function(){
		toggleLeftPanel(this.value);
	});
	document.querySelector("#rootzoom-slider").addEventListener("input", function(){
		changeRootZoom(this.value,0);
	});
	document.querySelector("#rootzoom-slider").addEventListener("change", function(){
		changeRootZoom(this.value,1);
	});
	console.log("Initialize Left Panel: Complete");
	systemTime();
	
	//Init everything else that needs to be initialized
	initAll();
	console.log("Primary initialization Complete");
	systemTime();
	
	//Init sortable container (the only one present on onload should be #block-frame, but I'll keep this code for possible future changes)
	//NESTED_SORTABLES = [].slice.call(document.querySelectorAll('.nested-sortable')); //A weird but concise way to transfrom a NodeList into an Array
	SORTABLE_LIST.push(
		new Sortable(document.querySelector("#block-frame"), {
			group: 'block-frame',
			animation: 150,
			fallbackOnBody: true,
			forceFallback: true,
			onEnd: function (evt) {
				if(!(evt.to.dataset.sid == evt.from.dataset.sid && evt.oldIndex == evt.newIndex)){  //If the position actually changed
					moveObject(evt.item, evt.from.dataset.sid, evt.oldIndex+1, evt.to.dataset.sid, evt.newIndex+1);
				}
			},
			ghostClass: 'ghost-class',
			draggable: ".obj-block",
			filter: ".folder",  //folders are not draggable
			swapThreshold: 0.65,
			scroll: true,
			scrollSensitivity: 80,
			scrollSpeed: 10
		})
	);
	console.log("Initialize Sortable: Complete");
	systemTime();
	
	console.log("UI LOADING COMPLETE");
	systemTime();


window.addEventListener("error", function(){
	alert("Execution Failed.");
});

window.addEventListener("keydown", function(event){
	if(event.key == "F9"){ //F9: Run script
		event.preventDefault();
		console.log(window.innerWidth);
		console.log(window.innerHeight);
		console.log(document.documentElement.clientWidth);
		console.log(document.documentElement.clientHeight);
	}
});