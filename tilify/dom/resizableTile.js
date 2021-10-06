module.exports = class TlfResizableTile extends HTMLAnchorElement {
    constructor() {
        super();
        
        // TODO: This is very common to specify width of these using a fraction
        // of width, maybe add this possibility here?

        // target
        if(this.getAttribute("noblank") !== "true")
            this.target = "_blank";

        // color
        var colorHTML = "";
        var color = this.getAttribute("color");
        if(color == undefined || color.length == 0)
            colorHTML = "";
        else
            colorHTML = "--tlf-color: " + color + ";";

        // hovercolor
        var hovercolorHTML = "";
        var hovercolor = this.getAttribute("hovercolor");
        if(hovercolor == undefined || hovercolor.length == 0)
            hovercolorHTML = "";
        else
            hovercolorHTML = "--tlf-hover-color: " + hovercolor + ";";

        // apply
        this.classList.add("resizable-tile");
        // FIXME: This is hacky
        this.setAttribute("style", this.getAttribute("style") + "; " + colorHTML + hovercolorHTML);
    }
}
