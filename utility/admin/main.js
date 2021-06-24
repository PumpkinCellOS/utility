window.g_dataTable = {};

const API_COMMANDS = {
    "search-users": {"method": "GET"},
    "user-info": {"method": "GET"},
    "add-user": {"method": "POST"},
    "remove-user": {"method": "POST"},
    "change-password-user": {"method": "POST"},
    "expire-password-user": {"method": "POST"},
    "change-role-user": {"method": "POST"},
    "version": {"method": "GET"}
};

const api = new TlfAPI({ endpoint: "/api/admin.php", calls: API_COMMANDS, onerror: function(data, msg) {
    tlfNotification(msg, TlfNotificationType.Error);
}});

function findUser(uid)
{
    for(var user of window.g_dataTable)
    {
        if(user.id == uid)
            return user;
    }
    return null;
}

function getStatus(data)
{
    var arr = [];
    if(data.passwordExpired == "1")
        arr.push("Password expired");
    
    if(arr.length == 0)
        arr.push("Default");
    return arr;
}

window.UserManagement = 
{
    remove: function(uid) {
        console.log("remove", uid);
    },
    expire: function(uid) {
        console.log("expire", uid);
        api.call("expire-password-user", {uid: uid, state: findUser(uid).passwordExpired == "0"}, function() {
            updateUserList(document.getElementById("username-box").value);
        });
    },
    changePassword: function(uid) {
        tlfOpenForm([{type:"password", name:"password", placeholder:"Enter new password"}], function(args) {
            api.call("change-password-user", {uid: uid, password: args.password}, null);
        }, {title: "Change password"});
    }
};

function generateUserData(data)
{
    function buttonTD(label, callback)
    {
        return "<td><button onclick='(" + callback + ")(this)'>" + label + "</button></td>"
    }
    
    var inner = "";
    inner += "<td>" + data.id + "</td>";
    inner += "<td>" + data.userName + "</td>";
    inner += "<td>" + data.role + "</td>";
    inner += "<td>" + getStatus(data).join(", ") + "</td>";
    inner += buttonTD("Remove", function(button) { console.log("remove", button); UserManagement.remove(button.parentNode.parentNode.firstChild.innerHTML); });
    inner += buttonTD("Make expired", function(button) { console.log("expire", button); UserManagement.expire(button.parentNode.parentNode.firstChild.innerHTML); });
    inner += buttonTD("Change password", function(button) { console.log("chpwd", button); UserManagement.changePassword(button.parentNode.parentNode.firstChild.innerHTML); });
    return inner;
}

function generateUserDataTable(data)
{
    var divData = document.getElementById("user-data");
    var inner = "<table class='data-table'>";
    inner += "<thead><tr>";
    inner += "<td>ID</td><td>User name</td><td>Role</td><td>Status</td>";
    inner += "</tr></thead><tbody>";
    g_dataTable = data.data;
    
    for(var user of data.data)
    {
        inner += "<tr>";
        inner += generateUserData(user);
        inner += "</tr>";
    }
    
    inner += "</tbody></table>";
    divData.innerHTML = inner;
}

window.updateUserList = function(value)
{
    if(value.length >= 3)
    {
        api.call("search-users", {q: value}, function(data) {
            generateUserDataTable(data);
        });
    }
    else
    {
        var divUserData = document.getElementById("user-data");
        divUserData.innerHTML = "<div class='data-table'>...</div>";
    }
}

function load()
{
    api.call("version", {}, function(data) {
        var divVersionData = document.getElementById("version-data");
        divVersionData.innerHTML += data.version;
    });
}

load();
