/* 
The block system is the UI of FNGplot. It allows users to manipulate math objects intuitively.

Terminology in my code:
- FNGobject: FNGobject refers to the smallest functioning unit of the block system. It consists of three parts:
    Object: The core. A JS object describing the math object.
    Sortable block: The input. This is the colorful blocks that the users see. Synchorinzed with Object.
    SVG element: The output. The Object's rendering result on canvas. Synchorinzed with Object.

- SID: Each FNGobject gets its own SID (system ID) upon creation/load.
- Root Folder: canvas of SVG and frame for sortable blocks are also treated as folders, aka root folders.
*/

function makeSID(){ //Generate a 10-character long "random" alphanumeric system id.
    let charList = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let sid = '';
    for(let i = 0; i<10; i++) {
        sid += charList.charAt(Math.floor(Math.random()*62));
    }
    return sid;
}

//User operations: Folders
//Folders are easier to deal with than blocks since they are all at root level
function upFolder(elmnt){
    let sid = elmnt.dataset.sid;
    let folderObject = OBJECT_LIST.find(item => item.sid == sid);
    if(OBJECT_LIST.indexOf(folderObject) != 0){ //not the first
        let svgGroup = SVG_CANVAS.querySelector(`[data-sid='${sid}']`);
        elmnt.parentNode.insertBefore(elmnt,elmnt.previousSibling); //sortable block move up
        svgGroup.parentNode.insertBefore(svgGroup,svgGroup.previousSibling); //SVG group move up
        OBJECT_LIST.splice(OBJECT_LIST.indexOf(folderObject)-1, 0, OBJECT_LIST.splice(OBJECT_LIST.indexOf(folderObject), 1)[0]); //Object move up
    }
    else{
        alert("Already at the top");
    }
}
function downFolder(elmnt){
    let sid = elmnt.dataset.sid;
    let folderObject = OBJECT_LIST.find(item => item.sid == sid);
    if(OBJECT_LIST.indexOf(folderObject) != OBJECT_LIST.length-1){ //not the last
        let svgGroup = SVG_CANVAS.querySelector(`[data-sid='${sid}']`);
        elmnt.parentNode.insertBefore(elmnt,elmnt.nextSibling.nextSibling); //sortable block move down
        svgGroup.parentNode.insertBefore(svgGroup,svgGroup.nextSibling.nextSibling); //SVG group move down
        OBJECT_LIST.splice(OBJECT_LIST.indexOf(folderObject)+1, 0, OBJECT_LIST.splice(OBJECT_LIST.indexOf(folderObject), 1)[0]); //Object move down
    }
    else{
        alert("Already at the bottom");
    }
}
function expandFolder(sid){
    let elmnt = BLOCK_FRAME.querySelector(`div[data-sid='${sid}']`);
    if(elmnt.dataset.expanded == "false"){
        elmnt.dataset.expanded = "true";
        elmnt.classList.toggle('folder-expand');
        elmnt.classList.toggle('folder-collapse');
    }
    else{ //expanded == true
        elmnt.dataset.expanded = "false";
        elmnt.classList.toggle('folder-expand');
        elmnt.classList.toggle('folder-collapse');
    }
}
function deleteFolder(sid){
    let folderObject = OBJECT_LIST.find(item => item.sid == sid);
    let n = confirm(`Do you want to PERMANENTLY delete folder "${folderObject.name}" ?`);
    if(n){
        let folder = BLOCK_FRAME.querySelector(`div[data-sid='${sid}']`);
        let svgGroup = SVG_CANVAS.querySelector(`[data-sid='${sid}']`);
        OBJECT_LIST.splice(OBJECT_LIST.indexOf(folderObject), 1);
        folder.parentNode.removeChild(folder);
        svgGroup.parentNode.removeChild(svgGroup);
    }
}
function changeVisibilityFolder(sid){
    let eyeBtn = BLOCK_FRAME.querySelector(`div[data-sid='${sid}']`).querySelectorAll('div')[0];
    let folderObject = OBJECT_LIST.find(item => item.sid == sid);  //find the folder with this sid
    let svgGroup = SVG_CANVAS.querySelector(`[data-sid='${sid}']`);
    if(folderObject.display == true){
        folderObject.display = false;
        eyeBtn.innerHTML = "visibility_off";                 //change the icon to visibility off;
        svgGroup.setAttribute("display","none");             //hide the SVG group               
    }
    else if(folderObject.display == false){
        folderObject.display = true;
        eyeBtn.innerHTML = "visibility";                     //change the icon to visibility(on);
        svgGroup.setAttribute("display"," ");                //show the SVG group
    }
}

//User operations: Folders & Blocks
function moveObject(target, oldFolderSID, oldIndex, newFolderSID, newIndex) {  //Index in this function starts from 1 due to parameters from SortableJS
    //Sortable block has changed position. Now we need to update the object list and the svg
    oldFolderSID = oldFolderSID.replace(/fc-/g,"");
    newFolderSID = newFolderSID.replace(/fc-/g,"");
    //SVG
    console.log(oldFolderSID);
    console.log(oldIndex);
    console.log(newFolderSID);
    console.log(newIndex);
    let oldSVGFolder = SVG_FRAME.querySelector(`[data-sid='${oldFolderSID}']`); //Used SVG_FRAME as it may get SVG_CANVAS
    let newSVGFolder = SVG_FRAME.querySelector(`[data-sid='${newFolderSID}']`);
    let targetSVG = oldSVGFolder.querySelector(`[data-sid='${target.dataset.sid}']`);
    let destinationSVG = '';
    if(oldFolderSID == newFolderSID && oldIndex < newIndex){ //compensation for insertBeofre
        destinationSVG = newSVGFolder.querySelector(`div[class~='obj-block']:nth-child(${newIndex+1})`);
    }
    else{
        destinationSVG = newSVGFolder.querySelector(`div[class~='obj-block']:nth-child(${newIndex})`);
    }
    console.log(targetSVG);
    console.log(destinationSVG);
    newSVGFolder.insertBefore(targetSVG,destinationSVG);

    //ObjectList
    //Step 1: Get the object and cut it down.
    let tmpObject = '';
    if(oldFolderSID == 'root'){
        tmpObject = OBJECT_LIST[oldIndex-1];
        OBJECT_LIST.splice(oldIndex-1, 1);
    }
    else{ //In a folder
        let oldObjFolder = OBJECT_LIST.find(item => item.sid == oldFolderSID);
        tmpObject = oldObjFolder.content[oldIndex-1];
        oldObjFolder.content.splice(oldIndex-1, 1);
    }
    //Step 2: Paste it to destination
    if(newFolderSID == 'root'){
        OBJECT_LIST.splice(newIndex-1, 0, tmpObject);
    }
    else{ //In a folder
        let newObjFolder = OBJECT_LIST.find(item => item.sid == newFolderSID);
        newObjFolder.content.splice(newIndex-1, 0, tmpObject);
    }
}
function deleteObject(sid, folderSID) {
    folderSID = folderSID.replace(/fc-/g,"");
    if(folderSID == 'root'){ //In a folder
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
    else{ //In a folder
        let folder = OBJECT_LIST.find(item => item.sid == folderSID);
        let obj = folder.content.find(item => item.sid == sid);
        let n = confirm(`Do you want to PERMANENTLY delete "${obj.name}" ?`);
        if(n){
            let block = BLOCK_FRAME.querySelector(`div[data-sid='${sid}']`);
            let svgElem = SVG_CANVAS.querySelector(`[data-sid='${sid}']`);
            folder.content.splice(OBJECT_LIST.indexOf(obj), 1);
            block.parentNode.removeChild(block);
            svgElem.parentNode.removeChild(svgElem);
        }
    }
}

//User operations: Blocks
function changeVisibility(sid, folderSID) {
    folderSID = folderSID.replace(/fc-/g,"");
    let obj='';
    if(folderSID == 'root'){ //In a folder
        obj = OBJECT_LIST.find(item => item.sid == sid);  //find the object with this sid
    }
    else{ //In a folder
        let folder = OBJECT_LIST.find(item => item.sid == folderSID);
        obj = folder.content.find(item => item.sid == sid);  //find the object with this sid
    }
    let eyeBtn = BLOCK_FRAME.querySelector(`div[data-sid='${sid}']`).querySelectorAll('div')[0];
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
function LinePP(sid) {
    //------All attributes except sid have a default value before the user changes them.
    //System
    this.sid = sid;
    this.name = "2-point line";
    this.display = true;
    this.updatePos = function () {
        let avatar = BLOCK_FRAME.querySelector(`div[data-sid='${this.sid}']`); //Find this object's block avatar



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
    this.lineWidth = 4;
    this.lineCap = "round";
    this.dashArray = '';
    this.dashOffset = 0;
    this.color = "#8a408b"; //Wisteria purple
    this.opacity = 1;
}
function Folder(sid){
    //System
    this.sid = sid;
    this.name = "Folder";
    this.display = true;
    this.content = [];  //this is where the blocks (and child folders) are stored
}

//Create a new FNGobject
function createBlankObject(objName) { 
    let sid = makeSID();
    switch(objName){
        case "LinePP": {                                             //LinePP will be the example here
            // Step 1 of 3: FNGobject
            OBJECT_LIST.push(new LinePP(sid));                      //creates a blank LinePP object and push it into array
            
            // Step 2 of 3: draggable block
            let n = document.querySelector('#basic-block-template').content.firstElementChild.cloneNode(true); //copy a blank block template
            n.classList.add('geo');                                 //adds geometry class
            n.querySelector('img').src = "svg/system/line_pp.svg";  //init the small icon
            n.querySelector('input').value = "2-point line";        //display default name
            n.dataset.sid = sid;                                    //assign this id-less block a data-id, in sync with the hidden object
            BLOCK_FRAME.appendChild(n); //add the block to the UI

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
            s.setAttribute("stroke-width","4");
            s.setAttribute("stroke-linecap","round");
            s.setAttribute("stroke-dasharray","");
            s.setAttribute("stroke-dashoffset","0");
            s.setAttribute("stroke","#8a408b");
            s.setAttribute("stroke-opacity","1");
            SVG_CANVAS.appendChild(s);  //add the new SVG element to canvas
            break;
        }
        case "Folder": {
            // Step 1 of 3: FNGobject
            OBJECT_LIST.push(new Folder(sid));                      
            
            // Step 2 of 3: draggable block
            let n = document.querySelector('#folder-template').content.firstElementChild.cloneNode(true);
            n.querySelector('input').value = "New folder";
            n.querySelector('.folder-content').dataset.sid = 'fc-' + sid; //The inner list also needs an (almost)identical sid to its parent
            n.dataset.sid = sid;                                    
            BLOCK_FRAME.appendChild(n);
            SORTABLE_LIST.push(
                new Sortable(n.querySelector('.folder-content'), {
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
                    draggable: ".obj-block",  //prevents folder nesting (nf = not folder)
                    swapThreshold: 0.65,
                    scroll: true,
                    scrollSensitivity: 80,
                    scrollSpeed: 10
                })
            );

            // Step 3 of 3: SVG element(s)
            let s = document.createElementNS("http://www.w3.org/2000/svg", 'g');
            s.dataset.sid = sid;
            s.dataset.name = "New folder";
            s.setAttribute("display"," "); // " " = true
            SVG_CANVAS.appendChild(s);  //add the new SVG element to canvas
            break;
        }
    }
}