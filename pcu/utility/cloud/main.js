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
pcuLoginApi.call("get-properties", {uid: uid_url}, function(data) {
    userDisplayName = data.data.displayName;
    generateBreadcrumb();
});

if(window.g_currentDir[0] != ".")
    window.g_currentDir.unshift(".");

function byteDisplay(value)
{
    if(value < 512)
        return (value).toPrecision(3) + " B";
    else if(value < 512 * 1024)
        return (value / 1024).toPrecision(3) + " KiB";
    else if(value < 512 * 1024 * 1024)
        return (value / 1024 / 1024).toPrecision(3) + " MiB";
    else if(value < 512 * 1024 * 1024 * 1024)
        return (value / 1024 / 1024 / 1024).toPrecision(3) + " GiB";
    else
        return (value / 1024 / 1024 / 1024 / 1024).toPrecision(3) + " TiB";
}

function fileListing(callback)
{
    api.call("list-files", {currentDir: g_currentDir.join("/"), uid: uid_url}, callback);
    if(uid_url == uid)
    {
        api.call("get-account-quota", {}, function(data) {
            var percent = data.used * 100 / data.quota;
            var element = document.getElementById("quota-string");
            element.innerHTML = `${byteDisplay(data.used)} of ${byteDisplay(data.quota)} (${Math.round(percent, 2)}%)`;
            var r = (100 - percent) / 100 * 120;
            element.style.color = `hsl(${r}, 50%, 50%)`;
        });
    }
    else
    {
        document.getElementById("quota").style.display = "none";
    }
}

function deleteFile(name)
{
    tlfOpenForm([ {"value": `Do you really want to delete ${name}?`, "type": "label"} ], function() {
        api.call("remove-file", {file: `${g_currentDir.join("/")}/${name}`}, reload);
    }, { title: "Confirm deletion", submitName: "Yes", cancelName: "No" });
}

function shareFile(file, targetUid)
{
    api.call("file-share", {file: `${g_currentDir.join("/")}/${file.name}`, uid: targetUid, remove: false}, function() {
        reload();
        tlfOpenForm([{ type: "label", value: "Anyone can see this file using that link:"},
                   { type: "link", value: "http://" + document.location.hostname + file.link }], null,
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
    var inner = `<b>${userDisplayName}'s</b> home directory &gt; `;
    for(var dir in g_currentDir)
    {
        // TODO: Make it a link!
        if(g_currentDir[dir] != ".")
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
        cloud.uploadFile();
    });
    
    if(uid_url != uid)
        document.getElementById("uploader-box").style.display = "none";
}

window.reload = function()
{
    fileListing(generateFileTable);
}

let eFiles = document.getElementById("files");

window.cloud = {
    uploadFile: () => {
        let fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.multiple = true;
        fileInput.addEventListener("change", function() {
            console.log(this);
            console.log(this.files.length);
            for(let i = 0; i < this.files.length; i++)
            {
                const file = this.files[i];

                let eProgressContainer = document.createElement("div");
                eProgressContainer.classList.add("progress-container");
                let eProgressDisplay = document.createElement("div");
                {
                    eProgressContainer.appendChild(eProgressDisplay);
                }
                let eProgressBarProgress = document.createElement("div");
                {
                let eProgressBar = document.createElement("div");
                    eProgressBar.classList.add("progress-bar");
                    {
                        eProgressBarProgress.classList.add("progress-bar-progress");
                        eProgressBar.appendChild(eProgressBarProgress);
                    }
                    eProgressContainer.appendChild(eProgressBar);
                }
                eFiles.appendChild(eProgressContainer);

                const updateProgressDisplay = (offset, size) => {
                    const percent = offset * 100 / size;
                    eProgressDisplay.innerText = file.name + ": " + Math.round(percent) + "%";
                    eProgressBarProgress.style.width = percent + "%";
                };

                upload(file, g_currentDir.join("/"), function(offset, size) {
                    console.log("Upload progress: " + offset + "/" + size);
                    updateProgressDisplay(offset, size);
                }).then(() => {
                    tlfNotification("Upload finished: " + file.name);
                    eFiles.removeChild(eProgressContainer);
                    window.reload();
                }).catch((e) => {
                    tlfNotification("Failed to upload file: " + e, TlfNotificationType.Error);
                    eFiles.removeChild(eProgressContainer);
                });
            }
        });
        fileInput.click();
    }
}

setupEvents();
window.reload();
