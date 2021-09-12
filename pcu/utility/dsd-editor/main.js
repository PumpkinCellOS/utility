const api = new TlfAPI({
    endpoint: "/api/domain.php",
    calls: {
        "download-file": { method: "GET", noJSONResponse: true },
        "upload-file": { method: "PUT", noJSONResponse: true }
    }
});

window.api = api;

// TODO: Do not hardcode file name
window.save = function() {
    api.put("upload-file", document.getElementById("editor").value, {name: "lesson-data.json"}, function() {
        tlfNotification("Successfully saved lesson-data.json");
    }, function(data) {
        tlfNotification(data.message, TlfNotificationType.Error);
    })
}

api.call("download-file", {name: "lesson-data.json"}, function(data) {
    document.getElementById("editor").value = data;
})
