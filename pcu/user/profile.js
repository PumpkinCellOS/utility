// Download a specified attribute and insert it on the page.
// config {
//   type: see tlfOpenForm() > config > type
//   generator: function
//   editOnTop: bool
//   editName: string
// }
function insertAttribute(name, config = { editOnTop: false, editName: "Edit" })
{
    api.call("get-attribute", {name: name, uid: window.queriedUID}, (data)=> {
        value = data.data ?? "";
        if(!config.generator)
            config.generator = generator = function(value) { return value; };
        if(!config.type)
            config.type = "text";

        var container = document.getElementById(`property-${name}`);
        if(!container)
        {
            console.error(`Profile: No container for property '${name}'!`);
            return;
        }
        container.innerHTML = "";

        var appendEdit = (container) => {
            if(this.isLoggedIn)
            {
                var edit = document.createElement("span");
                edit.classList.add("property-edit-icon");
                edit.innerText = ` 🖊 ${config.editName ?? "Edit"}`;
                edit.title = `Edit ${name}`;

                edit.onclick = function() {
                    // TODO: Pretty print title
                    console.log(`setAttribute ${name}`);
                    tlfOpenForm([{name: "value", type: "text", placeholder: "Value", value: value, type: config.type}], function(data) {
                        userSetAttribute(name, data.value);
                    }, { title: `Set attribute: ${name}` });
                };
                container.appendChild(edit);
            }
        }

        if(config.editOnTop)
        {
            appendEdit(container);
            container.appendChild(document.createElement("br"));
        }
        var dataContainer = document.createElement("span");
        dataContainer.innerHTML = config.generator(value);
        dataContainer.classList.add("property-value");
        container.appendChild(dataContainer);
        if(!config.editOnTop)
            appendEdit(container);
    });
}

function userSetAttribute(name, value)
{
    api.call("set-attribute", {uid: window.PCU_USER_DATA.id, name: name, value: value}, function() {
        tlfNotification(`Successfully changed ${name}`, TlfNotificationType.INFO);

        // TODO: Do not reload the whole page, update only the changed attribute
        reload();
    });
}

function insertAttributes(isLoggedIn)
{
    // TODO: Find a way to not query every attribute in a separate request.
    var dataObject = {};
    dataObject.insertAttribute = insertAttribute;
    dataObject.isLoggedIn = isLoggedIn;

    dataObject.insertAttribute("pcu_displayName", {generator: function(value) { return value == "" ? window.queriedData.userName : value }});
    dataObject.insertAttribute("pcu_description", {generator: function(value) {
        return value.replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\n", "<br>");
    }, type: "textarea", editOnTop: true, editName: "Edit description"});
    dataObject.insertAttribute("pcu_status", {generator: function(value) {
        return value == "" ? "" : " • <span class='status-value'>" + value + "</span>";
    }, editName: "Edit status"});
}

function queriedUserGetProperty(key)
{
    return window.queriedUserProperties[key];
}

function changeEmail()
{
    tlfOpenForm([{type: "email", name: "email", placeholder: "New e-mail address"}], function(args) {
        api.call("change-email", {email: args.email}, function(data) {
            if(data.verifyEmail)
                notifyEmailVerification();
        });
    }, {title: "Change e-mail address"});
}

function switchPublicState()
{
    const newState = window.PCU_USER_DATA.public == "1" ? "0" : "1";
    // TODO: Make it a yes/no message box
    tlfOpenForm([{type: "label", value: (newState == "1" ? "Everyone" : "Only you") + " will be able to see it"}], function(args) {
        api.call("set-public-state", {state: newState}, function() {
            // TODO: Make this working without reloading
            window.location.reload();
        });
    }, {title: `Are you sure to make your page ${newState == "1" ? "public" : "private"}?`});
}

function insertData(data)
{
    if(data.domain)
    {
        api.call("get-domain-info", {id: data.domain}, function(domainData) {
            let text = "Domain: " + domainData.fullName;
            if(domainData.ownerId == data.id)
                text += " (owner)";
            document.getElementById("domain-info").innerText = text;
        });
    }
}

function reload()
{
    insertAttributes(window.queriedUID == window.PCU_USER_DATA.id);
    insertData(window.queriedData);
}

reload();
