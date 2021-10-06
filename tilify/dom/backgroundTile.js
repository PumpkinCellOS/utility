module.exports = class TlfBackgroundTile extends HTMLElement {
    constructor() {
        super();
        var paddingClass = "background-tile-padding";
        if(this.getAttribute("padding") != null)
            paddingClass = "background-tile-" + this.getAttribute("padding") + "-padding";
        var inner = this.innerHTML;
        this.innerHTML = `<div class='${paddingClass}'>` + inner + "</div>"
    }
}
