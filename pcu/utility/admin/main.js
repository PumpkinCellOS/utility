window.g_dataTable = {};

const loginApi = require("../../user/login").api;
const createForms = require("./forms.js");
const api = require("./api.js");

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

window.g_rolesOptions = null;
window.g_roles = null;

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
        if(g_roles == null)
            tlfNotification("Wait for roles to be loaded", TlfNotificationType.Warning)
        tlfOpenForm([{type: "select", name: "role", value: data.role, options: g_rolesOptions}], function(args) {
            api.call("change-role-user", {uid: data.id, role: args.role}, function() {
                updateUserList(document.getElementById("username-box").value);
            });
        }, {title: "Change user role"});
    },
    // TODO: Use domain name
    setDomain: function(data) {
        tlfOpenForm([{type: "number", name: "id", value: data.domain}], function(args) {
            api.call("set-domain-user", {uid: data.id, domain: args.id}, function() {
                updateUserList(document.getElementById("username-box").value);
            })
        }, {title: "Change domain ID"});
    }
};

function generateUserDataTable(data)
{
    g_dataTable = data.data;

    var divData = document.getElementById("user-data");
    divData.innerHTML = "";

    let dataTable = new TlfDataTable();
    dataTable.addField("ID", function(data) { return this.text(data.id); });
    dataTable.addField("User name", function(data) {
        var aUserName = this.anchor(data.userName, `/pcu/user/profile.php?uid=${data.id}`);
        aUserName.style.color = g_roles[data.role].color;
        return aUserName;
    });
    dataTable.addField("Role", function(data) { return this.text(g_roles[data.role].displayName); });
    dataTable.addField("Domain", function(data) {
        // TODO: Open domain on click
        let elDomain = this.span("Loading...");
        if(data.domain)
        {
            elDomain.innerText = "Loading...";
            // TODO: Cache it
            loginApi.call("get-domain-info", {id: data.domain}, function(domainData) {
                elDomain.innerText = `${domainData.name}${domainData.ownerId == data.id ? " (owner)" : ""}`;
            });
        }
        else
            elDomain.innerText = "None";
        return elDomain;
    });
    dataTable.addField("Status", function(data) {
        return this.text(getStatus(data).join(", "));
    });

    dataTable.addControl("Remove", function(data) { UserManagement.remove(data); });
    dataTable.addControl("Make expired", function(data) { UserManagement.expire(data); });
    dataTable.addControl("Change password", function(data) { UserManagement.changePassword(data); });
    dataTable.addControl("Change role", function(data) { UserManagement.changeRole(data); });
    dataTable.addControl("Set domain ID", function(data) {
        // TODO: Don't use IDs here...
        UserManagement.setDomain(data);
    });

    dataTable.entries = g_dataTable;

    divData.appendChild(dataTable.generate());
}

function generateDomainDataTable(data)
{
    var divData = document.getElementById("domain-data");
    divData.innerHTML = "";

    let dataTable = new TlfDataTable();
    dataTable.addField("ID", function(data) { return this.text(data.id); });
    dataTable.addField("Name", function(data) {
        return this.text(data.name);
    });
    dataTable.addField("Full name", function(data) {
        return this.text(data.fullName);
    });
    dataTable.addField("Owner name", function(data) {
        return this.anchor(data.ownerName, `/pcu/user/profile.php?uid=${data.ownerId}`);
    });

    dataTable.entries = data.data;

    divData.appendChild(dataTable.generate());
}

window.updateUserList = function(value)
{
    // TODO: Searchable tables in tilify??
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

window.updateDomainList = function(value)
{
    // TODO: Searchable tables in tilify??
    if(value.length >= 3)
    {
        api.call("search-domains", {q: value}, function(data) {
            generateDomainDataTable(data);
        });
    }
    else
    {
        var divDomainData = document.getElementById("domain-data");
        divDomainData.innerHTML = "<div class='data-table'>...</div>";
    }
}

function load()
{
    loginApi.call("get-roles", {}, function(data) {
        createForms.generateRolesOptions(data);
    });
    api.call("version", {}, function(data) {
        var divVersionData = document.getElementById("version-data");
        divVersionData.innerHTML += data.version;
    });
}

load();
