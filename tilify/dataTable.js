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

window.TlfDataTable = TlfDataTable;
