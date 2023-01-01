/* 
The block system is the UI of FNGplot. It allows users to manipulate math objects intuitively.

Terminology in my code:
- FNGobject: FNGobject refers to the smallest functioning unit of the block system. It consists of three parts:
    Object: The core. A JS object describing the math object.
    Sortable block: The input. This is the colorful & draggable blocks that the users see.
    SVG element: The output. The Object's rendering result on canvas.

- SID: Each FNGobject gets its own SID (system ID) upon creation/load.
*/

function makeSID(){ //Generate a 10-character-long "random" alphanumeric system id.
    let charList = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let sid = '';
    for(let i = 0; i<10; i++) {
        sid += charList.charAt(Math.floor(Math.random()*62));
    }
    return sid;
}

//User operations
function moveObject(sid,nextSid) {
    let svgElem = SVG_CANVAS.querySelector(`[data-sid='${sid}']`);
    let refElem = SVG_CANVAS.querySelector(`[data-sid='${nextSid}']`);
    SVG_CANVAS.insertBefore(svgElem,refElem);
}
function deleteObject(sid) {
    let obj = OBJECT_LIST.find(item => item.sid == sid);
    let n = confirm(`Do you want to PERMANENTLY delete "${obj.name}" ?`);
    if(n){
        let block = BLOCK_FRAME.querySelector(`div[data-sid='${sid}']`);
        let svgElem = SVG_CANVAS.querySelector(`[data-sid='${sid}']`);
        OBJECT_LIST.splice(OBJECT_LIST.indexOf(obj), 1);
        block.parentNode.removeChild(block);
        svgElem.parentNode.removeChild(svgElem);
    }
}
function changeVisibility(sid) {
    let obj = OBJECT_LIST.find(item => item.sid == sid);  //find the object with this sid
    let eyeBtn = BLOCK_FRAME.querySelector(`div[data-sid='${sid}']`).querySelector('.visibility');
    let svgElem = SVG_CANVAS.querySelector(`[data-sid='${sid}']`);
    if(obj.display == true){
        obj.display = false;
        eyeBtn.innerHTML = "visibility_off";                //change the icon to visibility off;
        svgElem.setAttribute("display","none");             //hide the SVG element               
    }
    else if(obj.display == false){
        obj.display = true;
        eyeBtn.innerHTML = "visibility";                    //change the icon to visibility(on);
        svgElem.setAttribute("display","");                 //show the SVG element
    }
}
function toggleEditPanel(sid) {
    let block = BLOCK_FRAME.querySelector(`div[data-sid='${sid}']`);
    let panel = block.querySelector(".objblock-editpanel")
    if(panel == null){ //It doesn't have an editpanel, give it one
        let objType = OBJECT_LIST.find(item => item.sid == sid).constructor.name.toLowerCase(); //obj.constructor.name is the type name of object(ex: LinePP)
        block.insertAdjacentHTML("beforeend", EDITPANEL_TEMPLATES[objType]); //use objType to find the panel HTML, then inject into block
        initEditPanel(block.querySelector(".objblock-editpanel"),sid);
    }
    else{ //It has an editpanel, remove it
        BLOCK_FRAME.querySelector(`div[data-sid='${sid}']`).style.height = "50px"; //initiate the closing transition
        BLOCK_FRAME.querySelector(`div[data-sid='${sid}']`).addEventListener("webkitTransitionEnd", function tmp(){ //wait until transition end to remove the editpanel
            panel.parentNode.removeChild(panel);
            BLOCK_FRAME.querySelector(`div[data-sid='${sid}']`).removeEventListener("webkitTransitionEnd", tmp); //remove itself
        });
    }
}
function initEditPanel(panelElem,sid){
    let obj = OBJECT_LIST.find(item => item.sid == sid);
    let inputList = panelElem.querySelectorAll("[data-property]"); //return a list of textboxes(and some other stuff) waiting to be initialized
    inputList.forEach(function(inputElem){
        inputElem.value = obj[inputElem.dataset.property]; //get their respective properties and display them
    });
    panelElem.dataset.objtype = obj.constructor.name.toLowerCase();
    BLOCK_FRAME.querySelector(`div[data-sid='${sid}']`).style.height = `${panelElem.clientHeight + 63}px`; //A part of workaround for transition. See https://css-tricks.com/using-css-transitions-auto-dimensions/ for more details.
    //The magic number "63" is the size of margin-top(55) + margin-bottom(8)
}


// Constructors
class LinePP {
    constructor(sid) {
        //------All attributes except sid have a default value before the user changes them.
        //System
        this.sid = sid;
        this.name = "2-point line";
        this.display = true;
        //Math
        this.x1 = -5;
        this.y1 = -4;
        this.x2 = 5;
        this.y2 = 2;
        //Style
        this.lineWidth = 5;
        this.lineCap = "round";
        this.pathLength = 100;
        this.dashArray = '';
        this.dashOffset = 0;
        this.color = "#8a408b"; //Wisteria purple
        this.opacity = 1;
        //Method
        this.updateSVG = function() { //currently, all properties are updated together. There is room for optimization in the future.
            let s = SVG_CANVAS.querySelector(`[data-sid='${this.sid}']`); //Find this object's SVG output
            s.dataset.name = this.name; //equal to s.setAttribute("data-name",this.name)
            s.setAttribute("display"," "); // " " = true in this property
            s.setAttribute("x1",toRealX(this.x1));
            s.setAttribute("y1",toRealY(this.y1));
            s.setAttribute("x2",toRealX(this.x2));
            s.setAttribute("y2",toRealY(this.y2));
            s.setAttribute("stroke",this.color);
            s.setAttribute("stroke-width",this.lineWidth);
            s.setAttribute("stroke-opacity",this.opacity);
            s.setAttribute("stroke-linecap",this.lineCap);
            s.setAttribute("pathLength",this.pathLength);
            s.setAttribute("stroke-dasharray",this.dashArray);
            s.setAttribute("stroke-dashoffset",this.dashOffset);
        };
    }
}

//Create a new Geometry FNGobject
let createGeometryObject = { 
    linepp: function(){  //LinePP will be the example here
        // Step 1 of 3: FNGobject
        let sid = makeSID();
        let obj = new LinePP(sid);
        OBJECT_LIST.push(obj);                      //creates a blank LinePP object and push it into array
            
        // Step 2 of 3: draggable block
        let n = document.querySelector('#basic-block-template').content.firstElementChild.cloneNode(true); //copy a blank block template
        n.classList.add('geo');                                 //adds geometry object class
        n.querySelector('img').src = "svg/system/linepp.svg";   //init the small icon
        n.querySelector('input').value = "2-point line";        //display default name
        n.dataset.sid = sid;                                    //assign this id-less block a data-id, in sync with the hidden object
        BLOCK_FRAME.appendChild(n); //add the block to block frame

        // Step 3 of 3: SVG element(s)
        // I set the atttributes the SVG way and not the CSS way for easier export later on.
        // As this varies greatly across different FNGobjects, I decided to set them up one by one and not use some property array trick.
        let s = document.createElementNS("http://www.w3.org/2000/svg", 'line');
        s.dataset.sid = sid;
        SVG_CANVAS.appendChild(s);  //add the new SVG element to canvas
        obj.updateSVG();            //render it for the first time
    }
}