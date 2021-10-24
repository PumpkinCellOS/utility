const api = require("./api.js");

module.exports = {

generateRolesOptions(data)
{
    g_rolesOptions = [];
    for(let i in data)
    {
        g_rolesOptions.push({value: i, displayName: data[i].displayName});
    }
    g_roles = data;
}

}

window.createUserForm = function() {
    tlfOpenForm([
        {type: "text", name: "userName", placeholder: "Name"},
        {type: "password", name: "password", placeholder: "Password"},
        {type: "select", name: "role", options: g_rolesOptions, placeholder: "Role"},
    ], function(data) {
        api.call("add-user", data, function() {
            console.log("add-user succeeded!");
            updateUserList(data.userName);
        });
    }, {title: "Create user"});
};

window.createDomainForm = function() {
    tlfOpenForm([
        {type: "text", name: "name", placeholder: "Name"},
        {type: "text", name: "fullName", placeholder: "Full name"},
    ], function(data) {
        console.log("TODO: add-domain", data);
    }, {title: "Create domain"});
}
