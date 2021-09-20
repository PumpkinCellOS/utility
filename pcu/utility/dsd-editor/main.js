const api = new TlfAPI({
    endpoint: "/api/domain.php",
    calls: {
        "download-file": { method: "GET", noJSONResponse: true },
        "upload-file": { method: "PUT", noJSONResponse: true }
    }
});

window.api = api;

let g_currentFile;

window.save = function() {
    api.put("upload-file", document.getElementById("editor").value, {name: g_currentFile}, function() {
        tlfNotification("Successfully saved " + g_currentFile);
    }, function(data) {
        tlfNotification(data.message, TlfNotificationType.Error);
    })
}

function reload(fileName)
{
    g_currentFile = fileName;
    document.getElementById("filename-box").innerText = g_currentFile;
    api.call("download-file", {name: g_currentFile}, function(data) {
        document.getElementById("editor").value = data;
    }, function(data) {
        tlfNotification(data.message, TlfNotificationType.Warning);
        document.getElementById("editor").value = "";
    });
}

window.selectFile = function() {
    tlfOpenForm([{type: "select", value: g_currentFile, name: "file", options: [
        {displayName: "Lesson data", value: "lesson-data.json"},
        {displayName: "Notes", value: "notes.txt"},
    ]}], function(data) {
        reload(data.file);
    }, {title: "Select file to display"});
}

reload("lesson-data.json");
