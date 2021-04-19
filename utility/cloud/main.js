// PCU Cloud
// Sppmacd (c) 2021

// TODO: Move it finally into some file instead of copying!!!!!!!

const API_COMMANDS = {
    "list-files": {"method": "GET"},
    "remove-file": {"method": "POST"},
    "file-share": {"method": "POST"},
};

function api_doXHR(xhr, args, method, callback)
{
    xhr.onreadystatechange = function() {
        if(this.readyState == 4)
        {
            if(this.status == 200 && callback instanceof Function)
                callback(JSON.parse(this.responseText)); 
            else
            {
                var response = JSON.parse(this.responseText);
                var serverMessage = response.message;
                if(serverMessage === undefined)
                    serverMessage = "Server error :("
                var msg = serverMessage + " (" + this.status + ")";
                console.log(msg);
            }
        }
    };
    
    if(method == "POST")
        xhr.send(args); // args in JSON
    else
        xhr.send(); // args in URL
}

function pculogin_apiCall(command, args, method, callback)
{
    console.log(command, args, method, callback);
    var xhr = new XMLHttpRequest();
    var url = "/api/login.php?command=" + command;
    if(method != "POST")
        url += "&" + args;

    xhr.open(method, url);
    api_doXHR(xhr, args, method, callback);
}

//callback: function(responseText)
function apiCall(command, args, callback, urlprefix)
{
    var xhr = new XMLHttpRequest();
    var method = API_COMMANDS[command].method;
    
    var url = "api.php";
    if(method != "POST")
        url += `?command=${command}&${args}`;
    else
    {
        args.command = command;
        args = JSON.stringify(args);
    }
    
    xhr.open(method, url);
    api_doXHR(xhr, args, method, callback);
}

function fileListing(callback)
{
    apiCall("list-files", "", callback);
}

function deleteFile(name)
{
    apiCall("remove-file", {file: name}, reload);
}

function shareFile(file, targetUid)
{
    // TODO: Use something better than alert()
    apiCall("file-share", {file: file.name, uid: targetUid, remove: false}, function() {
        reload(); alert("Anyone can download this file using that link:\nhttp://" + document.location.hostname + file.link);
    });
}

function unshareFile(file, targetUid)
{
    apiCall("file-share", {file: file.name, uid: targetUid, remove: true}, reload);
}

function downloadFile(name, path)
{
    var link = document.createElement('a');
    link.href = path;
    link.download = name;
    link.click();
}

function generateFileEntry(file)
{
    var tr = document.createElement("tr");
    
    var name = document.createElement("td");
    
    var link = document.createElement('a');
    link.href = file.link;
    link.download = file.name;
    link.innerHTML = file.name;
    
    name.appendChild(link);
    
    function mkButton(name, callback)
    {
        var button = document.createElement("button");
        button.innerHTML = name;
        button.addEventListener("click", callback);
        return button;
    }
    
    var shareButton = document.createElement("td");
    
    var shareButtonCallback = (file.sharedFor["0"] ?
        function() { unshareFile(file, 0); } :
        function() { shareFile(file, 0); }
    );
    
    shareButton.appendChild(mkButton(file.sharedFor["0"] ? "Unshare" : "Share", shareButtonCallback));
    
    var deleteButton = document.createElement("td");
    deleteButton.appendChild(mkButton("Delete", function() { deleteFile(file.name); }));
    
    tr.appendChild(name);
    tr.appendChild(shareButton);
    tr.appendChild(deleteButton);
    
    return tr;
}

function generateFileTable(data)
{
    console.log("Regenerating file table", data);
    var element = document.getElementById("file-listing");
    if(data.length == 0)
    {
        element.innerHTML = "Nothing here! Use <b>Upload</b> button to add new files.";
    }
    else
    {
        element.innerHTML = "";
        for(var file of data)
        {
            element.appendChild(generateFileEntry(file));
        }
    }
}

window.reload = function()
{
    fileListing(generateFileTable);
}

window.reload();
