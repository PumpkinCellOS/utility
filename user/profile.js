// config {
//   type: see tlfOpenForm() > config > type
//   generator: function
//   editOnTop: bool
// }
function insertProperty(key, config = { editOnTop: false })
{
    if(!config.generator)
        config.generator = generator = function(value) { return value; };
    if(!config.type)
        config.type = "text";

    var container = document.getElementById(`property-${key}`);
    if(!container)
    {
        console.error(`Profile: No container for property '${key}'!`);
        return;
    }
    container.innerHTML = "";

    var appendEdit = (container) => {
        if(this.isLoggedIn)
        {
            var edit = document.createElement("span");
            edit.classList.add("property-edit-icon");
            edit.innerText = " 🖊 Edit";
            edit.title = `Edit ${key}`;

            edit.onclick = function() {
                // TODO: Pretty print title
                console.log(`setProperty ${key}`);
                tlfOpenForm([{name: "value", type: "text", placeholder: "Value", value: value, type: config.type}], function(data) {
                    userSetProperty(key, data.value);
                }, { title: `Set property: ${key}` });
            };
            container.appendChild(edit);
        }
    }

    if(config.editOnTop)
        appendEdit(container);
    var dataContainer = document.createElement("span");
    var value = this.data[key] ?? "";
    dataContainer.innerHTML = config.generator(value);
    dataContainer.classList.add("property-value");
    container.appendChild(dataContainer);
    if(!config.editOnTop)
        appendEdit(container);
}

function userSetProperty(key, value)
{
    api.call("set-property", {key: key, value: value}, function() {
        tlfNotification(`Successfully changed ${key}`, TlfNotificationType.INFO);

        // TODO: Do not reload the whole page, update only changed property
        reload();
    });
}

function insertProperties(data, isLoggedIn)
{
    data = data ?? {};
    window.queriedUserProperties = data;
    var dataObject = {};
    dataObject.data = data;
    dataObject.insertProperty = insertProperty;
    dataObject.isLoggedIn = isLoggedIn;

    dataObject.insertProperty("displayName", {generator: function(value) { return value == "" ? window.queriedData.userName : value }});
    dataObject.insertProperty("description", {generator: function(value) {
        return value.replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll("\n", "<br>");
    }, type: "textarea", editOnTop: true});
}

function queriedUserGetProperty(key)
{
    return window.queriedUserProperties[key];
}

function changeEmail()
{
    tlfOpenForm([{type: "email", name: "email", placeholder: "New e-mail address"}], function(args) {
        api.call("change-email", {email: args.email});
    }, {title: "Change e-mail address"});
}

function reload()
{
    api.call("get-properties", {uid: window.queriedUID}, function(data) {
        insertProperties(data.data, window.queriedUID == window.PCU_USER_DATA.id);
    });
}

reload();
