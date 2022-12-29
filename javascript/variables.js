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
var SYSTEM_EPOCH = Date.now();  //Start system timer. It is mainly used for debugging and optimizing purposes.

//Commonly used DOM objects
var BLOCK_FRAME = document.querySelector('#block-frame');
var SVG_FRAME = document.querySelector('#svg-frame');
var SVG_CANVAS = document.querySelector('#svg-canvas');

//Object database
var OBJECT_LIST = [];   //Unordered object array
var SORTABLE_LIST = []; //SortableJS object array

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