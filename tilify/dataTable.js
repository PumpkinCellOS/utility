class TlfDataTable
{
    constructor(config = {})
    {
        this.entries = [];
        this.fields = [];
        this.controls = [];
    }

    // property: string, the property used in `entry` argument to `addEntry()`.
    // header: string, the header used in <thead>
    // generator: Function(data: object): Element, the entry DOM generator.
    addField(header, generator)
    {
        this.fields.push({header: header, generator: generator});
    }
    addControl(label, callback, predicate)
    {
        this.controls.push({label: label, callback: callback, predicate: predicate});
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
            var th = document.createElement("th");
            th.innerHTML = field.header;
            thead.appendChild(th);
        }
        var tbody = document.createElement("tbody");
        for(const entry of this.entries)
        {
            var tr = document.createElement("tr");
            for(const field of this.fields)
            {
                var td = document.createElement("td");
                td.appendChild(field.generator.call({
                    text(str) { return document.createTextNode(str); },
                    div(str) { var element = document.createElement("div"); element.innerHTML = str; return element; },
                    span(str) { var element = document.createElement("span"); element.innerHTML = str; return element; },
                    anchor(label, href) { var element = document.createElement("a"); element.href = href; element.innerHTML = label; return element; },
                    button(label, onclick) { var element = document.createElement("button"); element.innerHTML = label; element.onclick = onclick; return element;  }
                }, entry));
                tr.appendChild(td);
            }
            let tdControls = document.createElement("td");
            for(const control of this.controls)
            {
                var button = document.createElement("button");
                if(control.predicate && !control.predicate(entry))
                    continue;
                button.onclick = function() { control.callback(entry) };
                button.innerHTML = control.label;
                tdControls.appendChild(button);
            }
            tr.appendChild(tdControls);
            tbody.appendChild(tr);
        }

        table.appendChild(thead);
        table.appendChild(tbody);

        dataTable.appendChild(table);
        return dataTable;
    }
}

window.TlfDataTable = TlfDataTable;
