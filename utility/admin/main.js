var g_dataTable;

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

function findUser(uid)
{
    
}

//callback: function(responseText)
function apiCall(command, args, callback)
{
    var xhr = new XMLHttpRequest();
    var method = API_COMMANDS[command].method;
    
    var url = "/api/admin.php?command=" + command;
    if(method != "POST")
        url += "&" + args;
    
    xhr.open(method, url);
        
    xhr.onreadystatechange = function() {
        if(this.readyState == 4)
        {
            if(this.status == 200 && callback)
                callback(JSON.parse(this.responseText)); 
            else
            {
                var response = JSON.parse(this.responseText);
                var serverMessage = response.message;
                if(serverMessage === undefined)
                    serverMessage = "Unknown error";
                var msg = serverMessage + " (" + this.status + ")";
                console.log(msg);
                errorLoading(msg);
            }
        }
    };
    
    if(method == "POST")
        xhr.send(args); // args in JSON
    else
        xhr.send(); // args in URL
}

function errorLoading(msg)
{
    var divData = document.getElementById("data");
    var divLoading = document.getElementById("loading");
    divData.innerHTML = "<span class='error-code'>" + msg + "</span>";
    divLoading.style.display = "none";
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

var UserManagement = 
{
    remove: function(uid) {
        console.log("remove", uid);
    },
    expire: function(uid) {
        console.log("expire", uid);
        //apiCall("change-password-user", JSON.stringify({uid: uid, state = !g_dataTable[uid]}), null);
    },
    changePassword: function(uid) {
        console.log("changePassword", uid);
        apiCall("change-password-user", JSON.stringify({uid: uid}), null);
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
        apiCall("search-users", "q=" + value, function(data) {
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
    apiCall("version", "", function(data) {
        var divVersionData = document.getElementById("version-data");
        divVersionData.innerHTML += data.version;
    });
}

load();
