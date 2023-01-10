/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright (c) Wei-Hsu Lin(林韋旭) & All Contributors to FNGplot */

"use strict";

/* [!] Event Listeners */

document.querySelector("#left-panel-select").addEventListener("change", () => {
    switchLeftPanel(document.querySelector("#left-panel-select").value);
});

document.querySelector("#envir-datalist-refresh").addEventListener("click", () => {
	updateEnvirList();
});

for(const item of ["input", "change"]){
    document.querySelector("#rootzoom-slider").addEventListener(item, () => {
        changeRootZoom(document.querySelector("#rootzoom-slider").value,item);
    });
};

BLOCK_FRAME.addEventListener("click",(event) => {       //event delegation
    if(event.target.classList.contains("visibility")){  //change visibility
        changeVisibility(event.target.parentElement.dataset.sid);
    }
    else if(event.target.classList.contains("edit")){   //toggle editpanel
        toggleEditPanel(event.target.parentElement.dataset.sid);
    }
    else if(event.target.classList.contains("delete")){ //delete block
        deleteObject(event.target.parentElement.dataset.sid);
    }
});

for(const item of ["input", "change"]){
    BLOCK_FRAME.addEventListener(item, (event) => { 
        if(event.target.closest(".objblock-editpanel") != null){    //verify that the input/change came from inside an editpanel
            const sid = event.target.parentNode.parentNode.parentNode.dataset.sid;
            handleUserEdit(event.target, sid, event.type);
        }
    });
};

document.querySelector("#toolbar-root").addEventListener("click", (event) => {  //event delegation
    const target = event.target;
    const parent = event.target.parentNode;
    if(target.tagName.toLowerCase() == "img"){                                  //SVG icon clicked
        createFNGObject(target.dataset.objname, null);                          //create a brand new object of the specified kind
    }
    else if(parent.classList.contains("toolbar-grid-toggler")){                 //expand or collapse the toolbar
        toggleToolbarDropdown(target);
    }
});

window.addEventListener("error", function(){
    console.error("Execution Failed");
    alert("Execution Failed.");
});

/* [!] Primary initialization sequence */

console.log(`Welcome to FNGplot ${MetaData.VERSION}`);
updateEnvirList();

//Initialize toolbar's positions, colors and click handlers
{
    const btnList = document.querySelectorAll("button[id^=\"toolbar-select-\"]");
    const togglers = document.querySelectorAll(".toolbar-grid-toggler > div");
    for(let [i, btn] of btnList.entries()){
        btn.style.borderColor = TOOLBAR_CLR[i];                                    //initialize them to their respective colors
        btn.addEventListener("click", () => {                                      //attach eventlisteners
            switchToolbar(i);
        });
    };
    for(let arrowBtn of togglers){
        arrowBtn.style.transform = "rotate(0deg)";                                 //set them inline so they can be manipulated later
    };
    switchToolbar(1);                                                              //switch to "Geometry" (default)
}

//Init sortable container
SORTABLE_LIST.push(
    new Sortable(document.querySelector("#block-frame"), {
        group: 'block-frame',
        animation: 150,
        fallbackOnBody: true,
        forceFallback: true,
        onEnd: function (evt) {
            if(evt.oldIndex != evt.newIndex){  //If the position actually changed
                moveObject(evt.item.dataset.sid, evt.item.nextSibling != null ? evt.item.nextSibling.dataset.sid : null);
                //passes null as reference if there is no next neighbor. insertBefore() will take care of it.
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
