//Init.js: This file contains ALL the code that is immediately executed on page load.

//-------Primary initializing sequence----------------------
console.log(`SYSTEM_EPOCH: ${SYSTEM_EPOCH}`);

//eventlisteners
document.querySelector("#left-panel-select").addEventListener("change", () => {
    switchLeftPanel(document.querySelector("#left-panel-select").value);
});

document.querySelector("#envir-datalist-refresh").addEventListener("click", () => {updateEnvirList();});

for(const item of ["input", "change"]){
    document.querySelector("#rootzoom-slider").addEventListener(item, () => {
        changeRootZoom(document.querySelector("#rootzoom-slider").value,item);
    });
};

BLOCK_FRAME.addEventListener("click",(event) => {  //event delegation
    const target = event.target;
    if(target.classList.contains("visibility")){  //change visibility
        changeVisibility(target.parentElement.dataset.sid);
    }
    else if(target.classList.contains("edit")){  //toggle editpanel
        toggleEditPanel(target.parentElement.dataset.sid);
    }
    else if(target.classList.contains("delete")){  //delete block
        deleteObject(target.parentElement.dataset.sid);
    }
});

/*
Wish Lin Dec 2022

This bulky event listener is my naive attempt to strike a balance between real-time updating and generating errors due to transition values during editing.
Basic assumption: Inputs and changes inside BLOCK_FRAME must come from the editpanels.

Problem: Some properties in the editpanel can be updated real-time during editing, while others simply cannot. For (extrerme) example:
dashOffset can take in any value without error, so it can be updated real-time(aka oninput).
Plotted math functions can only be updated onchange(I "hope" it's finished by then, further error handling is needed of course). Anything during editing is not a valid math expression.

Due to performance considerations, there are also a few exceptions that I handle separately. See comments below for detailed information.

My solution is to register all of the cases, divide them into different categories and act accordingly. See below for example.

List of FNGobjects registered:
LinePP: Complete
Rect: 
*/
for(const item of ["input", "change"]){ //comment example: I changed a LinePP object's "x1" attribute through typing (not using arrows)
    BLOCK_FRAME.addEventListener(item, (event) => {  
        const target = event.target;
        const svgElem = SVG_CANVAS.querySelector(`[data-sid='${event.target.parentNode.parentNode.parentNode.dataset.sid}']`);
        const obj = OBJECT_LIST.find(item => item.sid == event.target.parentNode.parentNode.parentNode.dataset.sid); //the object
        const type = event.target.parentNode.parentNode.dataset.objtype; //"linepp"
        const prop = target.dataset.property; //x1
        if(event.type == "input"){ 
            if(prop == "name"){ //names need to sync with label in the parent block, so they are handled separately
                event.target.parentNode.parentNode.parentNode.querySelector(".nametag").value = target.value;
                //Only update object on "change" event (or onBlur) to imporve performance
            }
            else if(prop == "strokeColor"){ //color input could possibly change dozens of times per second, thus bypassing renderToSVG() greatly improves performance
                svgElem.setAttribute("stroke",target.value);
                //Only update object on "change" event (or onBlur) to imporve performance
            }
            else if(prop == "fillColor"){
                svgElem.setAttribute("fill",target.value);
            }
            else if(["strokeWidth", "pathLength", "dashOffset", "strokeOpacity", "fillOpacity"].includes(prop) || SPECIAL_PROPERTY_INPUT.includes(`${type} ${prop}`)){  //"linepp x1"
                isNumeric(target.value) ? obj[prop] = parseFloat(target.value) : obj[prop] = target.value;
                obj.renderToSVG();
            }
        }
        else if(event.type == "change"){
            if(["name", "lineCap", "lineJoin", "dashArray", "strokeColor", "fillColor"].includes(prop) || SPECIAL_PROPERTY_CHANGE.includes(`${type} ${prop}`)){
                isNumeric(target.value) ? obj[prop] = parseFloat(target.value) : obj[prop] = target.value;
                obj.renderToSVG();
            }
            else if(["hasBorder", "hasFill"].includes(prop)){ //checkboxes are naughty
                obj[prop] = target.checked;
                obj.renderToSVG();
            }
        }
    });
};

document.querySelector("#toolbar-root").addEventListener("click", (event) => {   //event delegation
    const target = event.target;
    const parent = event.target.parentNode;
    if(target.tagName.toLowerCase() == "img"){         //SVG icon clicked
        switch(target.closest("div[id^='toolbar-item-']").dataset.category){ //figure out which function to call based on category
            case "geometry": createGeometryObject[target.dataset.method]();
        }
    }
    else if(parent.classList.contains("toolbar-grid-toggler")){ //Expand or collapse the toolbar
        if(target.style.transform == "rotate(0deg)"){  //expand
            target.style.transform = "rotate(180deg)";
            parent.parentNode.style.overflow = "visible"; //using "previousElementSibling" here because plian HTML written by me (not JS inserted) contains whitespaces, which fails "previousSibling".
        }
        else if(target.style.transform == "rotate(180deg)"){  //collapse
            target.style.transform = "rotate(0deg)";
            parent.parentNode.style.overflow = "hidden";
        }
    }
});


//Initialize toolbar's positions, colors and click handlers
{
    const btnList = document.querySelectorAll("button[id^=\"toolbar-select-\"]");
    const togglers = document.querySelectorAll(".toolbar-grid-toggler > div");
    for(let [i, btn] of btnList.entries()){
        btn.style.borderColor = TOOLBAR_CLR[i];                                    //initialize them to their respective colors
        btn.addEventListener("click", () => {                                      //attach eventlisteners
            switchToolbar(i)
        });
    };
    for(let arrowBtn of togglers){
        arrowBtn.style.transform = "rotate(0deg)";                                 //set them inline so they can be manipulated later
    };
    switchToolbar(1); //switch to "Geometry" (default)
}

    
//Init sortable container (the only one present on onload should be #block-frame, but I'll keep this code for possible future changes)
//NESTED_SORTABLES = [].slice.call(document.querySelectorAll('.nested-sortable')); //A weird but concise way to transfrom a NodeList into an Array
SORTABLE_LIST.push(
    new Sortable(document.querySelector("#block-frame"), {
        group: 'block-frame',
        animation: 150,
        fallbackOnBody: true,
        forceFallback: true,
        onEnd: function (evt) {
            if(evt.oldIndex != evt.newIndex){  //If the position actually changed
                moveObject(evt.item.dataset.sid, evt.item.nextSibling != null ? evt.item.nextSibling.dataset.sid : null); //passes null as reference if there is no next neighbor. insertBefore() will take care of it.
            }
        },
        ghostClass: 'ghost-class',
        draggable: ".obj-block",
        handle: ".small-icon",
        swapThreshold: 0.65,
        scroll: true,
        scrollSensitivity: 80,
        scrollSpeed: 10
    })
);

window.addEventListener("error", function(){
    console.error("Execution Failed");
    alert("Execution Failed.");
});

/*
window.addEventListener("keydown", function(event){
    if(event.key == "F9"){ //F9: Run script
        event.preventDefault();
        

    }
}); */
//-------Primary initializing sequence----------------------
