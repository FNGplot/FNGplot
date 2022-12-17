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
var SYSTEM_EPOCH = 0;              //Init on window.onload()

//Commonly used DOM objects
var BLOCK_FRAME = document.querySelector('#block-frame');
var SVG_FRAME = document.querySelector('#svg-frame');
var SVG_CANVAS = document.querySelector('#svg-canvas');

//Object database
var OBJECT_LIST = []; //Object database. The real(hidden) version of the blocks.
var SORTABLE_LIST = []; //Stores the Sortable objects

//System variables
const TOOLBAR_CLR = ['#f0923b','#5f95f7','#9268f6','#c763d0','#67bc59','#6dbde2','#4868ce','#ed7082','#f3af42']; //(SCRATCH 2.0/3.0 && some of my own)
const TOOLBAR_LPOS = ['10px','94px','183px','258px','378px','457px','627px','737px','938px']; //CSS "left" attribute of toolbar buttons(10 values)

//Cartesian coordinate
var XMAX = 10;
var XMIN = -10;
var YMAX = 10;
var YMIN = -10;
var XHAT = 30;
var YHAT = 30;
var ORIGIN_X = 300; //"real" x and y coordinates of the origin point in the SVG.
var ORIGIN_Y = 300;

//Fonts
const LZ_FONT_DATA = [ /*18 typefaces, 43(47-4) fonts*/
  /*[ "Name" ,"Weight", "Style",   "URL-ending"       ]*/
	["Caveat","normal","normal","Caveat-Regular.woff2"],
	["Caveat","bold","normal","Caveat-Bold.woff2"],
	["Caveat Brush","normal","normal","CaveatBrush-Regular.woff2"],
	["Dancing Script","normal","normal","DancingScript-Regular.woff2"],
	["Dancing Script","bold","normal","DancingScript-Bold.woff2"],
	["Inconsolata","normal","normal","Inconsolata-Regular.woff2"],
	["Inconsolata","bold","normal","Inconsolata-Bold.woff2"],
	["Lato","normal","italic","Lato-Italic.woff2"],
	["Lato","bold","italic","Lato-BoldItalic.woff2"],
	["Merriweather","normal","normal","Merriweather-Regular.woff2"],
	["Merriweather","bold","normal","Merriweather-Bold.woff2"],
	["Merriweather","normal","italic","Merriweather-Italic.woff2"],
	["Merriweather","bold","italic","Merriweather-BoldItalic.woff2"],
	["New Computer Modern","normal","normal","NewCMMath-Regular.woff2"],
	["Noto Sans","normal","normal","NotoSans-Regular.woff2"],
	["Noto Sans","bold","normal","NotoSans-Bold.woff2"],
	["Noto Sans","normal","italic","NotoSans-Italic.woff2"],
	["Noto Sans","bold","italic","NotoSans-BoldItalic.woff2"],
	["Noto Serif","normal","normal","NotoSerif-Regular.woff2"],
	["Noto Serif","bold","normal","NotoSerif-Bold.woff2"],
	["Noto Serif","normal","italic","NotoSerif-Italic.woff2"],
	["Noto Serif","bold","italic","NotoSerif-BoldItalic.woff2"],
	["Noto Sans Mono","normal","normal","NotoSansMono-Regular.woff2"],
	["Noto Sans Mono","bold","normal","NotoSansMono-Bold.woff2"],
	["Nunito","bold","normal","Nunito-Bold.woff2"],
	["Nunito","normal","italic","Nunito-Italic.woff2"],
	["Nunito","bold","italic","Nunito-BoldItalic.woff2"],
	["Open Sans","normal","normal","OpenSans-Regular.woff2"],
	["Open Sans","bold","normal","OpenSans-Bold.woff2"],
	["Open Sans","normal","italic","OpenSans-Italic.woff2"],
	["Open Sans","bold","italic","OpenSans-BoldItalic.woff2"],
	["Patrick Hand","normal","normal","PatrickHand-Regular.woff2"],
	["Roboto","normal","normal","Roboto-Regular.woff2"],
	["Roboto","bold","normal","Roboto-Bold.woff2"],
	["Roboto","normal","italic","Roboto-Italic.woff2"],
	["Roboto","bold","italic","Roboto-BoldItalic.woff2"],
	["Roboto Slab","normal","normal","RobotoSlab-Regular.woff2"],
	["Roboto Slab","bold","normal","RobotoSlab-Bold.woff2"],
	["Source Code Pro","bold","normal","SourceCodePro-Bold.woff2"],
	["Source Code Pro","normal","italic","SourceCodePro-Italic.woff2"],
	["Source Code Pro","bold","italic","SourceCodePro-BoldItalic.woff2"],
	["STIX2 Math","normal","normal","STIXTwoMath-Regular.woff2"],
	["STIX2 Text","normal","normal","STIXTwoText-Regular.woff2"],
	["STIX2 Text","bold","normal","STIXTwoText-Bold.woff2"],
	["STIX2 Text","normal","italic","STIXTwoText-Italic.woff2"],
	["STIX2 Text","bold","italic","STIXTwoText-BoldItalic.woff2"],
];
var LZ_FONTFACES = [];     //Initiliazed when asynchronous function loadLazyFonts() is called.
var LZ_FONTPROMISES = [];  //Initiliazed when asynchronous function loadLazyFonts() is called.

//SortableJS
var NESTED_SORTABLES = [];
//------↑↑↑↑↑↑↑↑Global variable declare zone of the ENTIRE project↑↑↑↑↑↑↑↑-------------------

window.onload = function(){
	SYSTEM_EPOCH = Date.now();  //Start system timer. It is mainly used for debugging and optimizing purposes.
	logConsole(`SYSTEM_EPOCH: ${SYSTEM_EPOCH}`);
	logConsole("-------------------------------------------------------------------------");
	
	
	//Init all dropdowns
	document.querySelector("#left-panel-select").addEventListener("change", function(){    //init 'left panel select'
		toggleLeftPanel(this.value);
	});
	logConsole("Initialize Dropdowns: Complete");
	systemTime();
	
	
	//Init console
	document.querySelector("#console-open").addEventListener("click", function(){  //init console open 'button'
		document.querySelector("#console").style.display = "block";
	});
	document.querySelector("#console-close").addEventListener("click", function(){    //init console close button
		document.querySelector("#console").style.display = "none";
	});
	logConsole("Initialize Console: Complete");
	systemTime();
	
	//Init everything else that needs to be initialized
	initAll();
	logConsole("Primary initialization Complete");
	systemTime();
	
	//Async function to load the lazy fonts
	loadLazyFonts();
	
	//Init sortable container (the only one present on onload should be #block-frame, but I'll keep this code for possible future changes)
	//NESTED_SORTABLES = [].slice.call(document.querySelectorAll('.nested-sortable')); //A weird but concise way to transfrom a NodeList into an Array
	NESTED_SORTABLES = document.querySelector("#block-frame");
	SORTABLE_LIST.push(
		new Sortable(NESTED_SORTABLES, {
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
	logConsole("Initialize Sortable: Complete");
	systemTime();
	
	logConsole("UI LOADING COMPLETE");
	systemTime();
	highlightConsole(); //highlight the console;
	
	document.querySelector("#root-frame").style.transform = `scale(${window.innerWidth/1440})`;
	
}

window.onerror = function(e){
	logConsole("Execution Failed.");
}

window.onkeydown = function(e){ //hotkey override
	
	if(e.keyCode == 120){ //F9: Run script
		e.preventDefault();
		console.log(window.innerWidth);
		console.log(window.innerHeight);
		console.log(document.documentElement.clientWidth);
		console.log(document.documentElement.clientHeight);
	}
}