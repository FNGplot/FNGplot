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



// Constructors
class LinePP {
    constructor(sid) {
        //------All attributes except sid have a default value before the user changes them.
        //System
        this.sid = sid;
        this.name = "2-point line";
        this.display = true;
        this.update = function() {
            let block = BLOCK_FRAME.querySelector(`div[data-sid='${this.sid}']`); //Find this object's draggable block





            //s.setAttribute("y1",toRealY(this.xy).toString());
            //s.setAttribute("x2",toRealX(this.x2).toString());
            //s.setAttribute("y2",toRealY(this.y2).toString());
        };
        //Element
        this.x1 = -5;
        this.y1 = -4;
        this.x2 = 5;
        this.y2 = 2;
        this.pathLength = 100;
        //Style
        this.lineWidth = 5;
        this.lineCap = "round";
        this.dashArray = '';
        this.dashOffset = 0;
        this.color = "#8a408b"; //Wisteria purple
        this.opacity = 1;
    }
}

//Create a new FNGobject
var createBlankObject = { 
    linepp: function(){                                         //LinePP will be the example here
        // Step 1 of 3: FNGobject
        let sid = makeSID();
        OBJECT_LIST.push(new LinePP(sid));                      //creates a blank LinePP object and push it into array
            
        // Step 2 of 3: draggable block
        let n = document.querySelector('#basic-block-template').content.firstElementChild.cloneNode(true); //copy a blank block template
        n.classList.add('geo');                                 //adds geometry object class
        n.querySelector('img').src = "svg/system/line_pp.svg";  //init the small icon
        n.querySelector('input').value = "2-point line";        //display default name
        n.dataset.sid = sid;                                    //assign this id-less block a data-id, in sync with the hidden object
        BLOCK_FRAME.appendChild(n); //add the block to block frame

        // Step 3 of 3: SVG element(s)
        // I set the atttributes the SVG way and not the CSS way for easier export later on.
        // As this varies greatly across different FNGobjects, I decided to set them up one by one and not use some property array trick.
        let s = document.createElementNS("http://www.w3.org/2000/svg", 'line');
        s.dataset.sid = sid;
        s.dataset.name = "2-point line";
        s.setAttribute("display"," "); // " " = true
        s.setAttribute("x1",toRealX(-5).toString());
        s.setAttribute("y1",toRealY(-4).toString());
        s.setAttribute("x2",toRealX(5).toString());
        s.setAttribute("y2",toRealY(2).toString());
        s.setAttribute("pathLength","100");
        s.setAttribute("stroke-width","5");
        s.setAttribute("stroke-linecap","round");
        s.setAttribute("stroke-dasharray","");
        s.setAttribute("stroke-dashoffset","0");
        s.setAttribute("stroke","#8a408b");
        s.setAttribute("stroke-opacity","1");
        SVG_CANVAS.appendChild(s);  //add the new SVG element to canvas
    }
}