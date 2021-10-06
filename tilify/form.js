// -- tlfOpenForm(fields: Array, callback: Function(data), config: Object)
//
// fields: [
//   {
//     type: string, label|link|textarea|select|<type as in input element>
//     name: string, the property name in object passed to callback
//     callback: Function(), the onclick event handler (for buttons)
//     value: string, the preset value
//     placeholder: string, <as in input element>
//     displayName: string, the display name of field (only used by radiogroup)
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
                let label = document.createElement("div");
                label.classList.add("tlf-form-label");
                label.innerHTML = field.displayName;
                widget.appendChild(label);
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

window.tlfOpenForm = tlfOpenForm;
