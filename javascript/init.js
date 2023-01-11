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

fngNS.DOM.BLOCK_FRAME.addEventListener("click",(event) => {       //event delegation
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
    fngNS.DOM.BLOCK_FRAME.addEventListener(item, (event) => { 
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

console.log(`Welcome to FNGplot ${fngNS.MetaData.VERSION}`);
updateEnvirList();

//Fetch editpanel data from editpanel.html
{
    
}

//Initialize toolbar's positions, colors and click handlers
{
    const btnList = document.querySelectorAll("button[id^=\"toolbar-select-\"]");
    const togglers = document.querySelectorAll(".toolbar-grid-toggler > div");
    for(let [i, btn] of btnList.entries()){
        btn.style.borderColor = fngNS.SysData.TOOLBAR_CLR[i];                                    //initialize them to their respective colors
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
fngNS.SysData.sortableList.push(
    new Sortable(fngNS.DOM.BLOCK_FRAME, {
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



//Temporary solution before Electron.js is implemented:
fngNS.SysData.EDITPANEL_TEMPLATES = {
    linepp:
    `<div class="objblock-editpanel" data-objname="linepp">
    <div class="label-monospace">-----------User-----------------</div>
    <div>Name: <input type="text" data-property="name" class="size-long"></div>
    <div class="label-monospace">-----------Math-----------------</div>
    <div>Start Point: ( <input type="number" step="0.5" data-property="x1" class="size-short"> , <input type="number" step="0.5" data-property="y1" class="size-short"> )</div>
    <div>End Point: ( <input type="number" step="0.5" data-property="x2" class="size-short"> , <input type="number" step="0.5" data-property="y2" class="size-short"> )</div>
    <div class="label-monospace">-----------Style: Basic---------</div>
    <div>Width: <input type="number" min="0" data-property="strokeWidth" class="size-short"></div>
    <div>Color: <input type="color" data-property="strokeColor" class="size-short"></div>
    <div>Opacity: <input type="number" min="0" max="1" step="0.01" data-property="strokeOpacity" class="size-short"></div>
    <div class="label-monospace">-----------Style: Advanced------</div>
    <div>LineCap: 
        <select data-property="lineCap" class="size-medium">
            <option value="butt" selected>Butt</option>
            <option value="round">Round</option>
            <option value="square">Square</option>
        </select>
    </div>
    <div>PathLength: <input type="number" min="0" data-property="pathLength" class="size-short"></div>
    <div>DashArray: <input type="text" data-property="dashArray" placeholder="NULL" class="size-medium"> </div>
    <div>DashOffset: <input type="number" data-property="dashOffset" class="size-short"></div>
    <div class="label-monospace">-----------System---------------</div>
    <div>SystemID: <input type="text" data-property="sid" class="idtag" disabled></div>
</div>`,

    rect: `
<div class="objblock-editpanel" data-objname="rect">
    <div class="label-monospace">-----------User-----------------</div>
    <div>Name: <input type="text" data-property="name" class="size-long"></div>
    <div class="label-monospace">-----------Math-----------------</div>
    <div>Origin: ( <input type="number" step="0.5" data-property="originX" class="size-short"> , <input type="number" step="0.5" data-property="originY" class="size-short"> )</div>
    <div>OriginMode: 
        <select data-property="originVert" class="size-medium">
            <option value="TOP">Top</option>
            <option value="MIDDLE">Middle</option>
            <option value="BOTTOM" selected>Bottom</option>
        </select>
        <select data-property="originHoriz" class="size-medium">
            <option value="LEFT" selected>Left</option>
            <option value="MIDDLE">Middle</option>
            <option value="RIGHT">Right</option>
        </select>
    </div>
    <div>Width: <input type="number" min="0" data-property="width" class="size-short"></div>
    <div>Height: <input type="number" min="0" data-property="height" class="size-short"></div>
    <div class="label-monospace">-----------Style: Basic---------</div>
    <div>BorderColor: <input type="color" data-property="strokeColor" class="size-short"></div>
    <div>BorderWidth: <input type="number" min="0" data-property="strokeWidth" class="size-short"></div>
    <div>BorderOpacity: <input type="number" min="0" max="1" step="0.01" data-property="strokeOpacity" class="size-short"></div>
    <div>FillColor: <input type="color" data-property="fillColor" class="size-short"></div>
    <div>FillOpacity: <input type="number" min="0" max="1" step="0.01" data-property="fillOpacity" class="size-short"></div>
    <div class="label-monospace">-----------Style: Advanced------</div>
    <div>RoundedCorner: <input type="number" min="0" data-property="roundCorner" class="size-short"></div>
    <div>BorderLineJoin:
        <select data-property="lineJoin" class="size-medium">
            <option value="miter" selected>Miter</option>
            <option value="bevel">Bevel</option>
            <option value="round">Round</option>
        </select>
    </div>
    <div>BorderLineCap(dash):
        <select data-property="lineCap" class="size-medium">
            <option value="butt" selected>Butt</option>
            <option value="round">Round</option>
            <option value="square">Square</option>
        </select>
    </div>
    <div>PathLength: <input type="number" min="0" data-property="pathLength" class="size-short"></div>
    <div>DashArray: <input type="text" data-property="dashArray" placeholder="NULL" class="size-medium"> </div>
    <div>DashOffset: <input type="number" data-property="dashOffset" class="size-short"></div>
    <div class="label-monospace">-----------System---------------</div>
    <div>SystemID: <input type="text" data-property="sid" class="idtag" disabled></div>
</div>`,

    circle:`
<div class="objblock-editpanel" data-objname="circle">
    <div class="label-monospace">-----------User-----------------</div>
    <div>Name: <input type="text" data-property="name" class="size-long"></div>
    <div class="label-monospace">-----------Math-----------------</div>
    <div>Center: ( <input type="number" step="0.5" data-property="cx" class="size-short"> , <input type="number" step="0.5" data-property="cy" class="size-short"> )</div>
    <div>Radius: <input type="number" min="0" step="0.1" data-property="radius" class="size-short"></div>
    <div class="label-monospace">-----------Style: Basic---------</div>
    <div>BorderColor: <input type="color" data-property="strokeColor" class="size-short"></div>
    <div>BorderWidth: <input type="number" min="0" data-property="strokeWidth" class="size-short"></div>
    <div>BorderOpacity: <input type="number" min="0" max="1" step="0.01" data-property="strokeOpacity" class="size-short"></div>
    <div>FillColor: <input type="color" data-property="fillColor" class="size-short"></div>
    <div>FillOpacity: <input type="number" min="0" max="1" step="0.01" data-property="fillOpacity" class="size-short"></div>
    <div class="label-monospace">-----------Style: Advanced------</div>
    <div>BorderLineCap(dash):
        <select data-property="lineCap" class="size-medium">
        <option value="butt" selected>Butt</option>
            <option value="round">Round</option>
            <option value="square">Square</option>
        </select>
    </div>
    <div>PathLength: <input type="number" min="0" data-property="pathLength" class="size-short"></div>
    <div>DashArray: <input type="text" data-property="dashArray" placeholder="NULL" class="size-medium"> </div>
    <div>DashOffset: <input type="number" data-property="dashOffset" class="size-short"></div>
    <div class="label-monospace">-----------System---------------</div>
    <div>SystemID: <input type="text" data-property="sid" class="idtag" disabled></div>
</div>`,

    circle3p: 
`<div class="objblock-editpanel" data-objname="circle3p">
    <div class="label-monospace">-----------User-----------------</div>
    <div>Name: <input type="text" data-property="name" class="size-long"></div>
    <div class="label-monospace">-----------Math-----------------</div>
    <div>Point 1: ( <input type="number" step="0.5" data-property="x1" class="size-short"> , <input type="number" step="0.5" data-property="y1" class="size-short"> )</div>
    <div>Point 2: ( <input type="number" step="0.5" data-property="x2" class="size-short"> , <input type="number" step="0.5" data-property="y2" class="size-short"> )</div>
    <div>Point 3: ( <input type="number" step="0.5" data-property="x3" class="size-short"> , <input type="number" step="0.5" data-property="y3" class="size-short"> )</div>
    <div class="label-monospace">-----------Style: Basic---------</div>
    <div>BorderColor: <input type="color" data-property="strokeColor" class="size-short"></div>
    <div>BorderWidth: <input type="number" min="0" data-property="strokeWidth" class="size-short"></div>
    <div>BorderOpacity: <input type="number" min="0" max="1" step="0.01" data-property="strokeOpacity" class="size-short"></div>
    <div>FillColor: <input type="color" data-property="fillColor" class="size-short"></div>
    <div>FillOpacity: <input type="number" min="0" max="1" step="0.01" data-property="fillOpacity" class="size-short"></div>
    <div class="label-monospace">-----------Style: Advanced------</div>
    <div>BorderLineCap(dash):
        <select data-property="lineCap" class="size-medium">
            <option value="butt" selected>Butt</option>
            <option value="round">Round</option>
            <option value="square">Square</option>
        </select>
    </div>
    <div>PathLength: <input type="number" min="0" data-property="pathLength" class="size-short"></div>
    <div>DashArray: <input type="text" data-property="dashArray" placeholder="NULL" class="size-medium"> </div>
    <div>DashOffset: <input type="number" data-property="dashOffset" class="size-short"></div>
    <div class="label-monospace">-----------System---------------</div>
    <div>SystemID: <input type="text" data-property="sid" class="idtag" disabled></div>
</div>`
}