const api = new TlfAPI({
    endpoint: "api.php",
    calls: {
        "list-categories": { "method": "GET" }
    },
    onerror: function(data, msg) { tlfNotification(msg, TlfNotificationType.Error); }
});

function generateCategoryEntry(data)
{
    var tr = document.createElement("tr");
    
    var tdIcon = document.createElement("td");
    // TODO: Use /res/icons.png
    tdIcon.innerHTML = "📁";
    tr.appendChild(tdIcon);
    
    var tdName = document.createElement("td");
    tdName.innerHTML = data.name;
    tr.appendChild(tdName);
    return tr;
}

function generateDataTable(data)
{
    var divData = document.getElementById("threads");
    divData.innerHTML = "";

    var table = document.createElement("table");
    table.className = "data-table";
    
    if(data.length == 0)
    {
        table.innerHTML = "Nothing to display!";
        divData.appendChild(table);
        return;
    }

    var tbody = document.createElement("tbody");

    {
        for(var thread of data)
        {
            tbody.appendChild(generateCategoryEntry(thread));
        }
    }

    table.appendChild(tbody);
    divData.appendChild(table);
}

function reload()
{
    api.call("list-categories", {}, function(data) {
        generateDataTable(data);
    })
}

reload();
