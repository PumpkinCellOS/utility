/*
 * Tilify.js
 * Sppmacd (c) 2020 - 2021
*/

class TlfResizableTile extends HTMLAnchorElement {
    constructor() {
        super();
        
        // setup
        var name = this.innerHTML;
        
        // target
        if(this.getAttribute("noblank") !== "true")
            this.target = "_blank";

        // color
        var colorHTML = "";
        var color = this.getAttribute("color");
        if(color == undefined || color.length == 0)
            colorHTML = "";
        else
            colorHTML = "style='background-color: " + color + "'";

        // apply
        this.innerHTML = "<div class='resizable-tile'" + colorHTML + ">" + name + "</div>"
    }
}

class TlfButtonTile extends TlfResizableTile {
    constructor() {
        super();
        this.firstChild.classList.add("button-tile");
    }
}

class TlfBackgroundTile extends HTMLElement {
    constructor() {
        super();
        var paddingClass = "background-tile-padding";
        if(this.getAttribute("padding") != null)
            paddingClass = "background-tile-" + this.getAttribute("padding") + "-padding";
        var inner = this.innerHTML;
        this.innerHTML = `<div class='${paddingClass}'>` + inner + "</div>"
    }
}

// Register custom elements
customElements.define("tlf-resizable-tile", TlfResizableTile, { extends: 'a' })
customElements.define("tlf-button-tile", TlfButtonTile, { extends: 'a' })
customElements.define("tlf-background-tile", TlfBackgroundTile)
