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

// Forms
function tlfOpenForm(fields, callback, config)
{
    if(config === undefined)
    {
        config = {};
    }
    
    if(callback === null)
    {
        callback = function() {};
    }
    
    var fullScreenForm = document.createElement("form");
    fullScreenForm.classList.add("fullscreen-form");
    
    var title = document.createElement("h3");
    title.innerHTML = config.title ?? "Form";
    fullScreenForm.appendChild(title);
    
    for(var field of fields)
    {
        if(field.type == "label")
        {
            var widget = document.createElement("div");
            widget.innerHTML = field.value;
            fullScreenForm.appendChild(widget);
        }
        else if(field.type == "link")
        {
            var widget = document.createElement("a");
            widget.innerHTML = field.name ?? field.value;
            widget.href = field.value;
            fullScreenForm.appendChild(widget);
            fullScreenForm.appendChild(document.createElement("br"));
        }
        else
        {
            var widget = document.createElement("input");
            widget.type = field.type ?? "text";
            widget.name = field.name ?? widget.type;
            widget.value = field.value ?? "";
            widget.placeholder = field.placeholder ?? "";
            if(field.type == "button")
            {
                if(field.onclick instanceof Function)
                    widget.onclick = field.onclick; 
                else if(field.onclick == "close")
                    widget.onclick = function() { fullScreenForm.parentNode.removeChild(fullScreenForm); };
            }
            fullScreenForm.appendChild(widget);
            fullScreenForm.appendChild(document.createElement("br"));
        }
    }
    
    var submit = document.createElement("input");
    submit.type = "submit";
    submit.value = config.submitName ?? "Ok";
    submit.onclick = function() {
        var args = {};
        for(var field of fields)
        {
            if(field.type != "label" && field.type != "link")
                args[field.name] = fullScreenForm[field.name].value;
        }
        
        if(!callback(args))
        {
            // FIXME: Allow setting some error message
            return false;
        }
        fullScreenForm.parentNode.removeChild(fullScreenForm);
        return false;
    }
    fullScreenForm.appendChild(submit);
    
    if(!config.noCancel)
    {
        var cancel = document.createElement("input");
        cancel.type = "submit";
        cancel.value = config.cancelName ?? "Cancel";
        cancel.onclick = function() {
            fullScreenForm.parentNode.removeChild(fullScreenForm);
            return false;
        }
        fullScreenForm.appendChild(cancel);
    }
    
    document.body.insertBefore(fullScreenForm, document.body.firstChild);
}
