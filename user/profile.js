// config {
//   type: see tlfOpenForm() > config > type
//   generator: function
// }
function insertProperty(key, config = {})
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
    var dataContainer = document.createElement("span");
    var value = this.data[key] ?? "";
    dataContainer.innerHTML = config.generator(value);
    dataContainer.classList.add("property-value");
    container.appendChild(dataContainer);
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
    dataObject.insertProperty("description", {type: "textarea"});
}

function queriedUserGetProperty(key)
{
    return window.queriedUserProperties[key];
}

function reload()
{
    api.call("get-properties", {uid: window.queriedUID}, function(data) {
        insertProperties(data.data, window.queriedUID == window.PCU_USER_DATA.id);
    });
}

reload();
