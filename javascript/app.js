/* SPDX-License-Identifier: Apache-2.0 */
/* Copyright (c) Wei-Hsu Lin & All Contributors to FNGplot */

import { fngNameSpace as glob } from "./fng_modules/fngns.js";
import { gui } from "./fng_modules/gui.js";

"use strict";

/* [!] Event Listeners */

document.querySelector(".side-menu__select").addEventListener("change", () => {
    gui.switchSideMenu(document.querySelector(".side-menu__select").value);
});

document.querySelector("[data-id='sys-envirdata-refreshbtn']").addEventListener("click", () => {
	gui.updateEnvirList();
});

document.querySelector("[data-id='sys-ui-zoom-slider']").addEventListener("change", function() {
    gui.changeRootZoom(this.querySelector("input"));
});

document.querySelector("[data-id='plt-coord-settings']").addEventListener("input", (event) => {
    gui.changeCoordSettings(event.target);
});

document.querySelector(".workspace__block-toolbar__btn-ctnr").addEventListener("click", (event) => {  //event delegation
    if (event.target.classList.contains("workspace__block-toolbar__option-btn")) {
        switch (event.target.dataset.cmd) {
            case "import":
                // nothing yet
            case "export":
                // nothing yet
            case "copy":
                // nothing yet
            case "delete": 
                gui.deleteFNGObjects(1);
        }
    }
});

glob.DOM.BLOCK_FRAME.addEventListener("click", (event) => {       // event delegation
    if (event.target.classList.contains("dragblock__btn--visibility")) {  // change visibility
        gui.changeVisibility(event.target.closest(".dragblock").dataset.sid);
    } else if (event.target.classList.contains("dragblock__btn--edit")) {   // toggle editpanel
        gui.toggleEditPanel(event.target.closest(".dragblock").dataset.sid);
    }
});

for (const item of ["input", "change"]) {
    glob.DOM.BLOCK_FRAME.addEventListener(item, (event) => { 
        if (event.target.closest(".editpanel") != null) {    //verify that the input/change came from inside an editpanel
            const sid = event.target.closest(".dragblock").dataset.sid;
            gui.handleUserEdit(event.target, sid, event.type);
        }
    });
};

document.querySelector(".toolbar").addEventListener("click", (event) => {  //event delegation
    const target = event.target;
    if (target.tagName.toLowerCase() === "img") {                                  //SVG icon clicked
        gui.createFNGObject(target.dataset.objname, null);                            //create a brand new object of the specified kind
    } else if (target.classList.contains("toolbar__toggler__arrowbtn")) {         // Arrow button clicked
        gui.toggleToolbarDropdown(target);                                            // Expand or collapse the respective panel
    }
});

window.addEventListener("error", function(){
    console.error("Execution Failed");
    alert("Execution Failed.");
});

/* [!] Primary initialization sequence */

console.info(`Welcome to FNGplot ${glob.MetaData.VERSION}`);
console.info("Copyright (c) Wei-Hsu Lin & All Contributors to FNGplot");

// Init side_menu -> sys-settings -> environment data
gui.updateEnvirList();

// Init side_menu -> plt-settings -> coordinate settings
{
    const inputList = document.querySelector("div[data-id='plt-coord-settings']").querySelectorAll("input");    // length = 4
    for (let input of inputList) {
        input.value = glob.Coord[input.dataset.id];    // map them to variables and assign to them
    }
}

// Fetch editpanel data from editpanels.json (Note for future me: Realtive path of fetch() starts from the HTML page, NOT this JS file)
fetch("javascript/fng_modules/editpanel-data/editpanels.json")
.then((response) => {
    return response.json();
})
.then((data) => {
    glob.SysData.EDITPANEL_TEMPLATES = data;
    Object.defineProperty(glob.SysData, "EDITPANEL_TEMPLATES", {   // Lock it up
        configurable: false,
        writable: false,
    });
})
.catch( (error) => {
    alert("Fatal Error: Could not load file \"editpanels.json\"");
    console.error(error);
});

//Initialize positions, colors and click handlers of toolbar's tabs and expand/retract togglers
{
    const tabList = document.querySelectorAll(".toolbar__tab");
    const arrowBtnList = document.querySelectorAll(".toolbar__toggler__arrowbtn");
    for (let [i, tab] of tabList.entries()) {
        tab.style.borderColor = glob.SysData.TOOLBAR_CLR[i];                      //initialize them to their respective colors
        tab.addEventListener("click", () => {                                      //attach eventlisteners
            gui.switchToolbar(i);
        });
    };
    for (let arrowBtn of arrowBtnList) {
        arrowBtn.style.transform = "rotate(0deg)";                                 //set them inline so they can be manipulated later
    };
    gui.switchToolbar(1);                                                              //switch to "Geometry" (default)
}

//Init sortable container
glob.SysData.sortableList.push(
    new Sortable(glob.DOM.BLOCK_FRAME, {
        group: 'block-frame',
        animation: 150,
        fallbackOnBody: true,
        forceFallback: true,
        onEnd: function (evt) {
            if (evt.oldIndex != evt.newIndex) {  //If the position actually changed
                moveFNGObject(evt.item.dataset.sid, evt.item.nextSibling != null ? evt.item.nextSibling.dataset.sid : null);
                //passes null as reference if there is no next neighbor. insertBefore() will take care of it.
            }
        },
        ghostClass: 'ghost-class',
        draggable: '.dragblock',
        handle: '.dragblock__icon',
        swapThreshold: 0.65,
        scroll: true,
        scrollSensitivity: 80,
        scrollSpeed: 10
    })
);