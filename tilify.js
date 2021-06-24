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
            colorHTML = "--tlf-color: " + color + ";";

        // hovercolor
        var hovercolorHTML = "";
        var hovercolor = this.getAttribute("hovercolor");
        if(hovercolor == undefined || hovercolor.length == 0)
            hovercolorHTML = "";
        else
            hovercolorHTML = "--tlf-hover-color: " + hovercolor + ";";

        // apply
        this.innerHTML = "<div class='resizable-tile' style='" + colorHTML + hovercolorHTML + "'>" + name + "</div>"
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

class TlfCombobox extends HTMLElement {
    constructor() {
        super();

        this.attachShadow({mode: 'open'});
        
        const observer = new MutationObserver(function(record, observer) {
            connectedCallback();
        });
        observer.observe(this, { childList: true });
    }
    
    connectedCallback() {
        // TODO: Optimize it
        this.shadowRoot.innerHTML = "";
        
        var style = document.createElement("style");
        style.innerHTML = `

            option {
                display: none;
            }

            .tlf-selectbox {
                border-radius: 4px;
                display: inline-block;
                height: var(--tlf-widget-height);
                padding-left: 5px;
            }

            .tlf-optionbox {
                background-color: #555558;
                border-radius: 4px;
                display: none;
                left: 0px;
                max-height: 300px;
                overflow-y: auto;
                position: relative;
                top: 0px;
                width: 100%;
            }

            .tlf-option {
                padding: 3px 3px 3px 6px;
            }

            .tlf-option:hover {
                background-color: #656568;
            }
            
            button {
                background-color: #777777;
                border: none;
                border-radius: 3px;
                box-sizing: border-box;
                color: #dddddf;
                font-size: 12pt;
                margin: 5px;
                padding: 7px;
                transition: background-color 0.1s, border-color 0.1s;
            }

            button {
                height: var(--tlf-widget-height);
                float: right;
                margin: 0;
                width: var(--tlf-widget-height);
            }
        `;
        this.shadowRoot.appendChild(style);
        
        this.selectBox = document.createElement("div");
        this.selectBox.classList.add("tlf-selectbox");
        this.shadowRoot.appendChild(this.selectBox);
        
        this.openButton = document.createElement("button");
        this.openButton.onclick = () => {
            this.expand(!this.parentNode.expanded);
        };
        this.shadowRoot.appendChild(this.openButton);
        
        this.optionBox = document.createElement("div");
        this.optionBox.classList.add("tlf-optionbox");
        
        for(var optionElement of this.querySelectorAll("option"))
        {
            var option = document.createElement("div");
            option.classList.add("tlf-option");
            option.value =  optionElement.getAttribute("value");
            option.innerHTML = optionElement.innerHTML;
            option.onclick = function() {
                this.parentNode.parentNode.host.changeSelection(this);
                this.parentNode.parentNode.host.expand(false);
            }
            this.optionBox.appendChild(option);
        }
        
        this.shadowRoot.appendChild(this.optionBox);
    }
    
    expand(state) {
        if(!state)
        {
            this.expanded = false;
            this.optionBox.style.display = "";
        }
        else
        {
            this.expanded = true;
            this.optionBox.style.display = "block";
        }
    }
    
    changeSelection(node) {
        this.value = node.value;
        
        this.dispatchEvent(new Event("change"));
        
        this.selectBox.innerHTML = node.innerHTML;
    }
}

// Register custom elements
customElements.define("tlf-resizable-tile", TlfResizableTile, { extends: 'a' });
customElements.define("tlf-button-tile", TlfButtonTile, { extends: 'a' });
customElements.define("tlf-background-tile", TlfBackgroundTile);
customElements.define("tlf-combobox", TlfCombobox);

// -- tlfOpenForm(fields: Array, callback: Function(data), config: Object)
//
// fields: [
//   {
//     type: string, label|link|textarea|select|<type as in input element>
//     name: string, the property name in object passed to callback
//     value: string, the preset value
//     placeholder: string, <as in input element>
//     options: [, the options for `select` type
//       {
//         displayName: string, the displayed name
//         value: string, the value passed to callback
//       }
//     ]
//   }
// ]
// config: {
//   title: string
//   submitName: string
//   cancelName: string
//   noCancel: boolean
//
// Special field types:
//  - label - The label. No output. Uses `value` as text.
//  - link - The link. No output. Uses `name` as text and `value` as href (or as fallback text, if `name` is not specified).
//  - textarea - The <textarea> element. Uses properties like normal input element.
//  - select - The combobox (<select> element). Uses `options` as options. Other properties are used like in normal input element.
function tlfOpenForm(fields, callback, config)
{
    try
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
        
        var description = document.createElement("p");
        description.innerHTML = config.description ?? "";
        fullScreenForm.appendChild(description);
        
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
            else if(field.type == "textarea")
            {
                var widget = document.createElement("textarea");
                widget.value = field.value ?? "";
                widget.name = field.name ?? widget.type;
                fullScreenForm.appendChild(widget);
                fullScreenForm.appendChild(document.createElement("br"));
            }
            else if(field.type == "select")
            {
                var widget = document.createElement("select");
                for(var option of field.options)
                {
                    var optionElement = document.createElement("option");
                    optionElement.value = option.value;
                    optionElement.innerText = option.displayName;
                    widget.appendChild(optionElement);
                }
                widget.name = field.name ?? widget.type;
                widget.value = field.value;
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
        
        var formObject = {
            callback: callback,
            
            close: function() {
                this.element.parentNode.removeChild(this.element);
            },
            
            element: fullScreenForm
        };
        
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
            
            if(formObject.callback(args) === false)
            {
                // FIXME: Allow setting some error message
                return false;
            }
            formObject.close();
            return false;
        }
        fullScreenForm.appendChild(submit);
        
        if(!config.noCancel)
        {
            var cancel = document.createElement("input");
            cancel.type = "submit";
            cancel.value = config.cancelName ?? "Cancel";
            cancel.onclick = function() {
                formObject.close();
                return false;
            }
            fullScreenForm.appendChild(cancel);
        }
        
        document.body.insertBefore(fullScreenForm, document.body.firstChild);
    }
    catch(e)
    {
        console.log(e);
        fullScreenForm.parentNode.removeChild(fullScreenForm);
    }
}

const TlfNotificationType = {
    Info: "info",
    Error: "error",
    Warning: "warning"
};

function tlfNotification(text, type = TlfNotificationType.Info, config = { displayTime: 3500 })
{
    var box = document.getElementById("tlf-notification-box");
    
    var notification = document.createElement("div");
    notification.classList.add("tlf-notification");
    notification.style.backgroundColor = `var(--tlf-notify-bg-${type})`;
    
    notification.innerHTML = text;
    
    const DISAPPEAR_TIME = 500; /* keep this in sync with tilify.css opacity transition */
    const DISPLAY_TIME = config.displayTime;
    
    setTimeout(function() {
        notification.style.opacity = "0%";
        setTimeout(function() {
            box.removeChild(notification);
        }, DISAPPEAR_TIME);
    }, DISPLAY_TIME);
    
    box.appendChild(notification);
}

class TlfAPI {
    // config: {
    //   endpoint: string
    //   calls: {
    //     <name>: {
    //       method: GET|POST
    //     }
    //   }
    //   onerror: function(response: object, msg: string)
    // }
    constructor(config)
    {
        if(config === undefined)
            throw Error("You must give a config!");
        this.config = config;
    }
    
    _doXHR(xhr, args, method, callback, errorCallback)
    {
        // HACK
        var _this = this;
        xhr.onreadystatechange = function() {
            if(this.readyState == 4)
            {
                try
                {
                    if(this.status == 200 && callback instanceof Function)
                        callback(JSON.parse(this.responseText)); 
                    else
                    {
                        var response;
                        try
                        {
                            response = JSON.parse(this.responseText);
                        }
                        catch(e)
                        {
                            console.log(e);
                            response = {};
                        }
                        var serverMessage = response.message;
                        if(serverMessage === undefined)
                            serverMessage = "Server error :(";
                        var msg = serverMessage + " (" + this.status + ")";
                        console.log(msg);
                        errorCallback(response);
                        _this.config.onerror(response, msg);
                    }
                }
                catch(e)
                {
                    console.log(e);
                }
            }
        };
        
        if(method == "POST")
            xhr.send(args); // args in JSON
        else
            xhr.send(); // args in URL
    }
    
    json2uri(json)
    {
        return Object.keys(json).map(function(k)
        {
            return encodeURIComponent(k) + "=" + encodeURIComponent(json[k]);
        }).join('&');
    }
    
    call(command, args = {}, callback = function() {}, errorCallback = function() {})
    {
        console.info(`API call ${command} with args=${JSON.stringify(args)}`);
        var xhr = new XMLHttpRequest();
        var method = this.config.calls[command].method;
        
        var url = this.config.endpoint;
        args.command = command;
        if(method != "POST")
            url += `?${this.json2uri(args)}`;
        else
        {
            args = JSON.stringify(args);
        }
        
        xhr.open(method, url);
        this._doXHR(xhr, args, method, callback, errorCallback);
    }
}

function tlfApiCall(method, endpoint, command, args = {}, callback = function() {}, errorCallback = function() {})
{
    var config = {};
    config.endpoint = endpoint;
    config.calls = {};
    config.calls[command] = {
        method: method
    };
    var api = new TlfAPI(config);
    api.call(command, args, callback, errorCallback);
}
