//-------Primary initializing sequence----------------------
//This file contains ALL the code that is immediately executed on page load.
console.log(`SYSTEM_EPOCH: ${SYSTEM_EPOCH}`);

document.querySelector("#left-panel-select").addEventListener("change", function(){
    toggleLeftPanel(this.value);
});
document.querySelector("#rootzoom-slider").addEventListener("input", function(){
    changeRootZoom(this.value,0);
});
document.querySelector("#rootzoom-slider").addEventListener("change", function(){
    changeRootZoom(this.value,1);
});

initToolbar(); //initialize toolbar's positions, colors and click handlers
toggleToolbar(1); //set it to "geometry" (default select)
    
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
        swapThreshold: 0.65,
        scroll: true,
        scrollSensitivity: 80,
        scrollSpeed: 10
    })
);

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
//-------Primary initializing sequence----------------------