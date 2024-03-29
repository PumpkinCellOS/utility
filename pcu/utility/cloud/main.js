// PCU Cloud
// Sppmacd (c) 2021

const upload = require("./upload");

const API_COMMANDS = {
    "get-account-quota": {"method": "GET"},
    "list-files": {"method": "GET"},
    "remove-file": {"method": "POST"},
    "file-share": {"method": "POST"},
    "make-directory": {"method": "POST"},
};

// TODO: Actually use it everywhere
const api = new TlfAPI({endpoint: "/u/cloud/api.php", calls: API_COMMANDS});
const pcuLoginApi = require("../../user/login").api;

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

var userDisplayName = PHP_requestUserData.userName;
pcuLoginApi.call("get-attribute", {uid: uid_url, name: "pcu_displayName"}, function(data) {
    userDisplayName = data.data;
    generateBreadcrumb();
});

if(window.g_currentDir[0] != ".")
    window.g_currentDir.unshift(".");

function fileListing(callback)
{
    api.call("list-files", {currentDir: g_currentDir.join("/"), uid: uid_url}, callback);
    if(uid_url == uid)
    {
        api.call("get-account-quota", {}, function(data) {
            var percent = data.used * 100 / data.quota;
            var element = document.getElementById("quota-string");
            element.innerHTML = `${upload.byteDisplay(data.used)} of ${upload.byteDisplay(data.quota)} (${Math.round(percent, 2)}%)`;
            var r = (100 - percent) / 100 * 120;
            element.style.color = `hsl(${r}, 50%, 50%)`;
        });
    }
    else
    {
        document.getElementById("quota").style.display = "none";
    }
}

function deleteFiles(fileNames)
{
    if(fileNames.length == 0)
    {
        tlfNotification("You need to select files", TlfNotificationType.Warning);
        return;
    }
    const message = "Do you really want to delete <b>" + (fileNames.length == 1 ? fileNames[0] : fileNames.length + " files") + "</b>?";
    tlfOpenForm([ {"value": message, "type": "label"} ], function() {
        let deletedFiles = 0;
        for(const file of fileNames)
        {
            api.call("remove-file", {file: `${g_currentDir.join("/")}/${file}`}, function() {
                deletedFiles++;
                if(deletedFiles == fileNames.length)
                {
                    tlfNotification("Successfully removed file" + (deletedFiles > 1 ? "s" : ""));
                    window.reload();
                }
            }, function(message) {
                tlfNotification("Failed to remove file: " + message.message, TlfNotificationType.Error);
            });
        }
    }, { title: "Confirm deletion", submitName: "Yes", cancelName: "No" });
}

function shareFile(file, targetUid)
{
    api.call("file-share", {file: `${g_currentDir.join("/")}/${file.name}`, uid: targetUid, remove: false}, function() {
        reload();
        tlfOpenForm([{ type: "label", value: "Anyone can see this file using that link:"},
                   { type: "link", value: document.location.origin + file.link }], null,
                   { title: "Share", noCancel: true });
    }, (msg) => {tlfNotification(msg.message, TlfNotificationType.Error)});
}

function unshareFile(file, targetUid)
{
    api.call("file-share", {file: `${g_currentDir.join("/")}/${file.name}`, uid: targetUid, remove: true}, reload, (msg) => {tlfNotification(msg.message, TlfNotificationType.Error)});
}

function makeDirectory(name)
{
    api.call("make-directory", {name: `${g_currentDir.join("/")}/${name}`}, reload, (msg) => {tlfNotification(msg.message, TlfNotificationType.Error)});
}

function mkButton(name, callback)
{
    var button = document.createElement("button");
    button.innerHTML = name;
    button.addEventListener("click", callback);
    return button;
}

// TODO: Handle programatically selecting files properly
// TODO: Select all
let g_selectedFiles = new Set();

function selectedFiles()
{
    return Array.from(g_selectedFiles);
}

function generateFileEntry(file)
{
    var tr = document.createElement("tr");

    var name = document.createElement("td");

    var nameFlex = document.createElement("div");
    nameFlex.classList.add("name-flex");

    var select = document.createElement("input");
    select.type = "checkbox";
    select.classList.add("select-box");
    select.xFileName = file.name;
    select.onchange = function(event) {
        if(event.target.checked)
            g_selectedFiles.add(event.target.xFileName);
        else
            g_selectedFiles.delete(event.target.xFileName);
    }
    if(file.isDir && file.name == "..")
        select.disabled = true;

    nameFlex.appendChild(select);

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

    let size = document.createElement("td");
    if(file.isDir && file.name != "..")
        size.innerText = file.size + " items";
    else if(!file.isDir)
        size.innerText = upload.byteDisplay(file.size);
    tr.appendChild(size);

    if(uid_url == uid && file.name != "..")
    {
        var shareButton = document.createElement("td");

        var shareButtonCallback = (file.sharedFor["0"] ?
            function() { unshareFile(file, 0); } :
            function() { shareFile(file, 0); }
        );

        shareButton.appendChild(mkButton(file.sharedFor["0"] ? "Unshare" : "Share", shareButtonCallback));

        var deleteButton = document.createElement("td");
        deleteButton.appendChild(mkButton("Delete", function() { deleteFiles([file.name]); }));
        tr.appendChild(shareButton);
        tr.appendChild(deleteButton);
    }

    return tr;
}

function generateActionsContainer()
{
    let container = document.getElementById("actions-container");

    if(uid_url == uid)
    {
        container.appendChild(mkButton("Delete selected", function() {
            deleteFiles(selectedFiles());
        }));
    }
}

function generateBreadcrumb()
{
    var breadcrumb = document.getElementById("breadcrumb");
    var inner = `<b>${userDisplayName}'s</b> home directory &gt; `;
    for(var dir in g_currentDir)
    {
        // TODO: Make it a link!
        if(g_currentDir[dir] != ".")
            inner += `${g_currentDir[dir]} &gt; `;
    }
    breadcrumb.innerHTML = inner;
}

let g_data = null;

function generateFileTable(data)
{
    g_data = data;
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
    
    console.log("Regenerating file table", data);
    generateBreadcrumb();
    
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
        tlfOpenForm([{name: "dirname", placeholder: "Name"}], (args) => { makeDirectory(args.dirname) }, { title: "Create new directory" });
    });
    document.getElementById("file-submit").addEventListener("click", function() {
        // FIXME: Don't use window.reload, properly update file view. Maybe even implement models !!
        upload.uploadUserSpecifiedFile(g_currentDir.join("/"), eFiles).then(window.reload).catch(()=>{});
    });
    
    if(uid_url != uid)
        document.getElementById("actions-container").style.display = "none";
}

window.reload = function()
{
    g_selectedFiles.clear();
    fileListing(generateFileTable);
}

let eFiles = document.getElementById("files");

generateActionsContainer();
setupEvents();
window.reload();
