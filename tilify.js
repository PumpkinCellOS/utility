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

// Register custom elements
customElements.define("tlf-resizable-tile", TlfResizableTile, { extends: 'a' })
customElements.define("tlf-button-tile", TlfButtonTile, { extends: 'a' })
