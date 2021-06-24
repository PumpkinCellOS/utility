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
    remove: function(data) {
        console.log("remove", data.id);
    },
    expire: function(data) {
        api.call("expire-password-user", {uid: data.id, state: findUser(data.id).passwordExpired == "0"}, function() {
            updateUserList(document.getElementById("username-box").value);
        });
    },
    changePassword: function(data) {
        tlfOpenForm([{type: "password", name: "password", placeholder: "Enter new password"}], function(args) {
            api.call("change-password-user", {uid: data.id, password: args.password}, null);
        }, {title: "Change password"});
    },
    changeRole: function(data) {
        tlfOpenForm([{type: "select", name: "role", value: data.role, options: [
            { value: "owner", displayName: "Owner" },
            { value: "admin", displayName: "Admin" },
            { value: "member", displayName: "Staff member" },
            { value: "default", displayName: "User" },
        ]}], function(args) {
            api.call("change-role-user", {uid: data.id, role: args.role}, function() {
                updateUserList(document.getElementById("username-box").value);
            });
        }, {title: "Change user role"});
    }
};

function generateUserData(data)
{
    function buttonTD(label, callback)
    {
        var td = document.createElement("td");
        var button = document.createElement("button");
        button.onclick = function() { callback(data); };
        button.innerHTML = label;
        td.appendChild(button);
        return td;
    }
    
    var tr = document.createElement("tr");
    tr.userData = data;

    var tdId = document.createElement("td");
    tdId.innerHTML = data.id;
    tr.appendChild(tdId);

    var tdUserName = document.createElement("td");
    tdUserName.innerHTML = data.userName;
    tr.appendChild(tdUserName);

    var tdRole = document.createElement("td");
    tdRole.innerHTML = data.role;
    tr.appendChild(tdRole);

    var tdStatus = document.createElement("td");
    tdStatus.innerHTML = getStatus(data).join(", ");
    tr.appendChild(tdStatus);

    tr.appendChild(buttonTD("Remove", function(data) { UserManagement.remove(data); }));
    tr.appendChild(buttonTD("Make expired", function(data) { UserManagement.expire(data); }));
    tr.appendChild(buttonTD("Change password", function(data) { UserManagement.changePassword(data); }));
    tr.appendChild(buttonTD("Change role", function(data) { UserManagement.changeRole(data); }));
    return tr;
}

function generateUserDataTable(data)
{
    g_dataTable = data.data;

    var divData = document.getElementById("user-data");
    divData.innerHTML = "";

    var dataTable = document.createElement("table");
    dataTable.className = "data-table";

    var thead = document.createElement("thead");
    var tr = document.createElement("tr");

    tr.innerHTML += "<td>ID</td><td>User name</td><td>Role</td><td>Status</td>";

    thead.appendChild(tr);
    dataTable.appendChild(thead);
    
    var tbody = document.createElement("tbody");

    for(var user of data.data)
    {
        tbody.appendChild(generateUserData(user));
    }
    
    dataTable.appendChild(tbody);
    divData.appendChild(dataTable);
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
