/*
 * Tilify.js
 * Sppmacd (c) 2020 - 2021
*/

// TODO: Split it into multiple files // USE GULP

class TlfResizableTile extends HTMLAnchorElement {
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

class TlfButtonTile extends TlfResizableTile {
    constructor() {
        super();
        this.classList.add("button-tile");
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
//     callback: Function(), the onclick event handler (for buttons)
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
//  - radiogroup - Like select, but with radio buttons instead of combobox
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
            else if(field.type == "radiogroup")
            {
                let widget = document.createElement("fieldset");
                widget.id = field.name;
                for(const option of field.options)
                {
                    // FIXME: This sadly uses global ids, consider shadow roots or sth
                    const id = "tlfopenform-option-" + field.name + "-" + option.value;
                    let optionElement = document.createElement("input");
                    optionElement.type = "radio";
                    optionElement.id = id;
                    optionElement.name = field.name;
                    optionElement.value = option.value;
                    optionElement.checked = option.value == field.value;
                    widget.appendChild(optionElement);

                    let optionLabel = document.createElement("label");
                    optionLabel.setAttribute("for", id);
                    optionLabel.innerText = option.displayName;
                    widget.appendChild(optionLabel);

                    widget.appendChild(document.createElement("br"));
                }
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
                if(field.callback)
                    widget.onclick = field.callback;
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
            // TODO: Port this everything to FormData
            for(var field of fields)
            {
                if(field.type != "label" && field.type != "link")
                {
                    if(field.type == "radiogroup")
                    {
                        console.log(fullScreenForm);
                        for(const entry of new FormData(fullScreenForm))
                        {
                            if(entry[0] == field.name)
                                args[entry[0]] = entry[1];
                        }
                    }
                    else
                        args[field.name] = fullScreenForm[field.name].value;
                }
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
        if(url[0] == '/')
            url = "/pcu" + url;
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

class TlfDataTable
{
    constructor(config = {})
    {
        this.entries = [];
        this.fields = [];
    }

    // property: string, the property used in `entry` argument to `addEntry()`.
    // header: string, the header used in <thead>
    // generator: Function(data: object): Element, the entry DOM generator.
    addField(property, header, generator)
    {
        this.fields.push({property: property, header: header, generator: generator});
    }
    addEntry(entry)
    {
        this.entries.push(entry);
    }
    generate()
    {
        var dataTable = document.createElement("div");
        dataTable.className = "data-table";
        
        var table = document.createElement("table");

        var thead = document.createElement("thead");
        for(var field of this.fields)
        {
            var td = document.createElement("td");
            td.innerHTML = field.header;
            thead.appendChild(td);
        }
        var tbody = document.createElement("tbody");
        for(var entry of this.entries)
        {
            var tr = document.createElement("tr");
            for(var field of this.fields)
            {
                var td = document.createElement("td");
                td.appendChild(field.generator.call({
                    text(str) { return document.createTextNode(str); },
                    div(str) { var element = document.createElement("div"); element.innerHTML = str; return element; },
                    span(str) { var element = document.createElement("span"); element.innerHTML = str; return element; },
                    anchor(label, href) { var element = document.createElement("a"); element.href = href; element.innerHTML = label; return element; }
                }, [entry[field.property]]));
                tr.appendChild(td);
            }
            tbody.appendChild(tr);
        }

        table.appendChild(thead);
        table.appendChild(tbody);

        dataTable.appendChild(table);
        return dataTable;
    }
}

function tlfGetURLParam(name)
{
    var url = new URL(window.location);
    var v = url.searchParams.get(name);
    return (v === undefined || v === null) ? "" : v;
}

class TlfPlot
{
    // mapFunction: function(number): number, the function 
    // config: {
    //   mode: string, the plot mode (currently supported: 'line')
    //   xRange: Array[2], the X axis range of plot (e.g. [0, 100])
    //   yRange: Array[2], the Y axis range of plot (e.g. [0, 100])
    //   step: number, the distance between individual points
    //   xLabelStep: number, the distance between labels on X axis in pixels
    //   yLabelStep: number, the distance between labels on Y axis in pixels
    //   xAxisDst: number, the distance of X axis from left border
    //   yAxisDst: number, the distance of Y axis from bottom border
    // }
    constructor(mapFunction, config = {})
    {
        this.config = config;
        // DEFAULTS
        this.config.xRange =     this.config.xRange ?? [0, 1];
        this.config.yRange =     this.config.yRange ?? [0, 1];
        this.config.step =       this.config.step ?? 1;
        this.config.xLabelStep = this.config.xLabelStep ?? 40;
        this.config.yLabelStep = this.config.yLabelStep ?? 20;
        this.config.xAxisDst =   this.config.xAxisDst ?? 15;
        this.config.yAxisDst =   this.config.yAxisDst ?? 30;
        this.mapFunction = mapFunction;
        this.pan = [0, 0];
    }

    map(coord, in_, out)
    {
        const in_min = in_[0];
        const in_max = in_[1];
        const out_min = out[0];
        const out_max = out[1];
        return (coord - in_min) * (out_max - out_min) / (in_max - in_min) + out_min;
    }

    mapCoords(coords, outArea)
    {
        // Invert Y axis
        return [this.map(coords[0], this.config.xRange, [this.pan[0] + this.config.yAxisDst, this.pan[0] + outArea[0]]),
                this.map(coords[1], this.config.yRange, [this.pan[1] + outArea[1] - this.config.xAxisDst, this.pan[1]])];
    }

    mapPixels(pixels, inArea)
    {
        // Invert Y axis
        return [this.map(pixels[0], [this.pan[0] + this.config.yAxisDst, this.pan[0] + inArea[0]], this.config.xRange),
                this.map(pixels[1], [this.pan[1] + inArea[1] - this.config.xAxisDst, this.pan[1]], this.config.yRange)];
    }

    moveToMapped(context, size, x, y)
    {
        const coord = this.mapCoords([x, y], size);
        console.log(coord);
        context.moveTo(coord[0], coord[1]);
    }

    lineToMapped(context, size, x, y)
    {
        const coord = this.mapCoords([x, y], size);
        console.log(coord);
        context.lineTo(coord[0], coord[1]);
    }

    drawInto(canvas)
    {
        this.doDrawInto(canvas);
        // TODO: events
        canvas.addEventListener("mousedown", ()=> {
            console.log("DRAGGING=true");
            this.dragging = true;
        });
        canvas.addEventListener("mousemove", (ev)=> {
            if(this.dragging)
            {
                this.pan[0] += ev.movementX;
                this.pan[1] += ev.movementY;
                this.doDrawInto(canvas);
            }
        });
        canvas.addEventListener("mouseup", ()=> {
            console.log("DRAGGING=false");
            this.dragging = false;
        });
        canvas.addEventListener("mouseleave", ()=> {
            console.log("DRAGGING=false");
            this.dragging = false;
        });
    }

    doDrawInto(canvas)
    {
        const size = [canvas.width, canvas.height];

        let context = canvas.getContext("2d");
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Axises
        context.beginPath();
        context.moveTo(this.config.yAxisDst, canvas.height);
        context.lineTo(this.config.yAxisDst, 0);
        context.moveTo(0, canvas.height - this.config.xAxisDst);
        context.lineTo(canvas.width, canvas.height - this.config.xAxisDst);
        context.closePath();
        context.stroke();

        // TODO: Make precision configurable
        // Axis labels X
        for(let i = this.config.yAxisDst + this.config.xLabelStep; i < canvas.width; i += this.config.xLabelStep)
        {
            context.moveTo(i, canvas.height - this.config.xAxisDst - 5);
            context.lineTo(i, canvas.height - this.config.xAxisDst + 5);
            const x = Number(this.mapPixels([i, 0], size)[0], 2).toFixed(2);
            context.fillText(x, i - 15, canvas.height);
        }
        context.stroke();

        // Axis labels Y
        for(let i = this.config.xAxisDst + this.config.yLabelStep; i < canvas.height; i += this.config.yLabelStep)
        {
            context.moveTo(this.config.yAxisDst - 5, i);
            context.lineTo(this.config.yAxisDst + 5, i);
            const y = Number(this.mapPixels([0, i], size)[1], 2).toFixed(2);
            context.fillText(y, this.config.yAxisDst - 30, i + 5);
        }
        context.stroke();

        // Data
        let first = true;
        const mapStart = this.mapPixels([this.config.yAxisDst, 0], size);
        const mapEnd = this.mapPixels([canvas.width, 0], size);
        for(let i = mapStart[0]; i < mapEnd[0]; i += this.config.step)
        {
            if(first)
            {
                this.moveToMapped(context, size, i, this.mapFunction(i));
                first = false;
            }
            else
                this.lineToMapped(context, size, i, this.mapFunction(i));
        }
        context.stroke();
    }
}
