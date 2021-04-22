// PCU Cloud
// Sppmacd (c) 2021

// TODO: Move it finally into some file instead of copying!!!!!!!

const API_COMMANDS = {
    "list-files": {"method": "GET"},
    "remove-file": {"method": "POST"},
    "file-share": {"method": "POST"},
    "make-directory": {"method": "POST"},
};

function getParam(name)
{
    var url = new URL(window.location);
    var v = url.searchParams.get(name);
    return (v === undefined || v === null) ? "" : v;
}
var uid_url = getParam("u");
if(uid_url == "")
    uid_url = uid;
console.log("Request UID is " + uid_url);
var currentDir = getParam("cd");
window.g_currentDir = (currentDir != "" ? currentDir.split() : []);
if(window.g_currentDir[0] != ".")
    window.g_currentDir.unshift(".");

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
    var uid_arg = uid_url != "" ? `&uid=${uid_url}` : "";
    apiCall("list-files", `currentDir=${g_currentDir.join("/")}` + uid_arg, callback);
}

function deleteFile(name)
{
    tlfOpenForm([ {"value": `Do you really want to delete ${name}?`, "type": "label"} ], function() {
        apiCall("remove-file", {file: `${g_currentDir.join("/")}/${name}`}, reload);
    }, { title: "Confirm deletion", submitName: "Yes", cancelName: "No" });
}

function shareFile(file, targetUid)
{
    apiCall("file-share", {file: `${g_currentDir.join("/")}/${file.name}`, uid: targetUid, remove: false}, function() {
        reload();
        tlfOpenForm ([{ type: "label", value: "Anyone can see this file using that link:"},
                   { type: "link", value: "http://" + document.location.hostname + file.link }], null,
                   { title: "Share", noCancel: true });
    });
}

function unshareFile(file, targetUid)
{
    apiCall("file-share", {file: `${g_currentDir.join("/")}/${file.name}`, uid: targetUid, remove: true}, reload);
}

function makeDirectory(name)
{
    apiCall("make-directory", {name: `${g_currentDir.join("/")}/${name}`}, reload);
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
    
    var nameFlex = document.createElement("div");
    nameFlex.classList.add("name-flex");
    
    var icon = document.createElement("span");
    icon.classList.add("icon");
    
    if(file.isDir)
    {
        if(file.name == "..")
            icon.style.backgroundPosition = "-32px -32px";
        else
            icon.style.backgroundPosition = "-32px 0px";
    }
    else
        icon.style.backgroundPosition = "0px 0px";
    
    nameFlex.appendChild(icon);

    var link = document.createElement('a');
    if(file.isDir)
    {
        link.onclick = function() {
            if(file.name == "..")
            {
                g_currentDir.pop();
            }
            else
            {
                g_currentDir.push(file.name);
            }
            window.uploader._options.headers["X-Destination"] = g_currentDir.join("/");
            reload();
            return false;
        };
    }
    else
        link.href = file.link;
    
    link.download = file.name;
    link.innerHTML = file.name == ".." ? "(Go up)" : file.name;
    nameFlex.appendChild(link);
    
    if(file.isDir)
    {
        var link2 = document.createElement('a');
        if(file.name != "..")
            link2.href = file.link;
        nameFlex.appendChild(link2);
    }
    
    name.appendChild(nameFlex);
    tr.appendChild(name);
    
    function mkButton(name, callback)
    {
        var button = document.createElement("button");
        button.innerHTML = name;
        button.addEventListener("click", callback);
        return button;
    }
    
    if(uid_url == uid && file.name != "..")
    {
        var shareButton = document.createElement("td");
        
        var shareButtonCallback = (file.sharedFor["0"] ?
            function() { unshareFile(file, 0); } :
            function() { shareFile(file, 0); }
        );
        
        shareButton.appendChild(mkButton(file.sharedFor["0"] ? "Unshare" : "Share", shareButtonCallback));
        
        var deleteButton = document.createElement("td");
        deleteButton.appendChild(mkButton("Delete", function() { deleteFile(file.name); }));
        tr.appendChild(shareButton);
        tr.appendChild(deleteButton);
    }
    
    return tr;
}

function generateBreadcrumb()
{
    var breadcrumb = document.getElementById("breadcrumb");
    var inner = "";
    for(var dir in g_currentDir)
    {
        // TODO: Make it a link!
        inner += `${g_currentDir[dir]} &gt; `;
    }
    breadcrumb.innerHTML = inner;
}

function generateFileTable(data)
{
    var element = document.getElementById("file-listing");
    
    element.innerHTML = "";
    
    var oldLength = data.length;
    if(g_currentDir.length > 1)
    {
        data.unshift({
            isDir: true,
            name: "..",
            sharedFor: [],
        });
    }
    
    generateBreadcrumb();
    
    console.log("Regenerating file table", data);
    
    for(var file of data)
    {
        element.appendChild(generateFileEntry(file));
    }
    
    if(oldLength == 0)
    {
        var nothingHere = document.createElement("div");
        nothingHere.innerHTML = "Nothing here! Use <b>Upload</b> button to add new files.";
        element.appendChild(nothingHere);
    }
}

function setupEvents()
{
    document.getElementById("file-mkdir").addEventListener("click", function() {
        tlfOpenForm([{name: "dirname", placeholder: "Directory name"}], (args) => { makeDirectory(args.dirname) });
    });
    
    if(uid_url != uid)
        document.getElementById("uploader-box").style.display = "none";
}

window.reload = function()
{
    fileListing(generateFileTable);
}

setupEvents();
window.reload();
