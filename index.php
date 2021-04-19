<?php
require_once("lib/generator.php");
$login = pcu_is_logged_in();
$userData = $_SESSION["userData"];
$generator = new PCUGenerator();
$generator->start_content();
?>
<h2>PumpkinCell.net</h2>
<div class="app-list" id="pcu-app-list">
</div>
<h2>Utilities (Log in for more!)</h2>
<div class="app-list" id="utility-app-list">
</div>
<h2>Links</h2>
<div class="app-list" id="link-app-list">
</div>
<script>
/*
-- Entry format --
```
    {
    "icon": "<Component icon (HTML special character notation, without starting '&')>",
    "displayName": "<Display name of component>",
    "path": "<Link path (e.g. timer.html)>",
    "settings": [
        {
        "keyName": "<Form name (in URL)>",
        "displayName": "<Option name displayed in form>",
        "type": "<Input type (same as in HTML forms)"
        },...
    ]
    }
```
*/
var e_drag = document.getElementById("drag");

function swapLocations(elementX, elementY)
{
    var parentY = elementY.parentNode;
    var nextY = elementY.nextSibling;
    if(nextY === elementX)
    {
        parentY.insertBefore(elementX, elementY);
    }
    else
    {
        elementX.parentNode.insertBefore(elementY, elementX);
        if(nextY)
        {
            parentY.insertBefore(elementX, nextY);
        }
        else
        {
            parentY.appendChild(elementX);
        }
    }
} 

function generateUtilityEntry(entry) {
    var icon = entry.icon;
    var displayName = entry.displayName;
    var path = entry.path;
    var settings = entry.settings;

    var list_name = displayName;
    if(icon != undefined && icon.length > 0)
        list_name = "&" + icon + "; " + list_name;
        
    if(entry.state != undefined)
    {
        list_name += "<span class='app-spec app-tile-" + entry.state +"'>" + entry.state + "</span>";
    }
    
    if(entry.disabled)
    {
        entry.color = "rgba(1, 1, 1, 0.2)";
    }
        
    var list_link = path;
    
    if(entry.noblank === undefined)
        entry.noblank = true;
        
    var html = `<a is="tlf-resizable-tile" style="${entry.disabled ? "" : ""}" noblank="${entry.noblank}" color="${entry.color}" href="`;
    html += list_link + '">' + list_name + '</a>';

    return html;
}

function assignEvents(objectId)
{
    // TODO: Drag
}

function generateEntries(objectId, array)
{
    var el_app_list = document.getElementById(objectId);
    el_app_list.innerHTML = "";
    array.forEach(function(entry) {
        el_app_list.innerHTML += generateUtilityEntry(entry);
        var units = entry.units;
        if(units == undefined)
        units = 1;
        el_app_list.lastChild.style.width = (units * 25) + "%";
    });
    assignEvents(objectId);
}

function swapEntries(arrId, list, ix1, ix2)
{
    var tmp = list[ix1];
    list[ix1] = list[ix2];
    list[ix2] = tmp;
    generateEntries(arrId, list);
}

const pcuEntries = [
    <?php if(!pcu_role_less($userData["role"], "member")) { ?>
    {"displayName": "Development", "units": 1, "icon": "#9881", "state": "alpha", "path": "/dev.php"},
    {"icon": "",        "units": 1, "state": "beta", "color": "#435082", "displayName": "Nexus", "path": "http://192.168.1.36:82/login.php"},
    <?php } ?>
    <?php if(!pcu_role_less($userData["role"], "admin")) { ?>
    {"displayName": "Admin Panel", "units": 2, "icon": "", "color": "#557777", "state": "beta", "path": "/u/admin"},
    <?php } ?>
];

const utilityEntries = [
    {"icon": "#9200",   "units": 1, "color": "#666644", "displayName": "Timer", "path": "/u/misc/timer.html"},
    {"icon": "#9200",   "units": 1, "state": "alpha", "color": "#666644", "displayName": "Timer GUI", "path": "/u/misc/timer-gui.php"},
    {"icon": "#128308", "units": 1, "color": "#555577", "displayName": "Twitch Overlay", "path": "/u/misc/twitch-redirect.html"},
    {"icon": "#127760", "units": 1, "color": "#555566", "displayName": "Network Builder", "path": "/u/network-builder"},
    {"icon": "#11123",  "units": 1, "color": "#776666", "displayName": "Files", "path": "/u/files"},
    <?php if($login) { ?>
        {"icon": "#8613",   "units": 1, "state": "alpha", "color": "#667766", "displayName": "Cloud Storage", "path": "/u/cloud"},
        {"icon": "",        "units": 1, "state": "beta", "color": "#704444", "displayName": "LSS Lesson Table", "path": "/u/lss-tlt-gen"},
        {"icon": "#128394", "units": 1, "color": "#653939", "displayName": "HW Planner", "path": "/u/hw-planner"},
    <?php } ?>
]; 

const linkEntries = [
    {"displayName": "GitHub", "color": "#825f4b", "units": 1, "path": "https://github.com/sppmacd"},
    {"displayName": "Twitch", "color": "#555577", "units": 1, "path": "https://twitch.tv/pumpkin_cell"},
    {"displayName": "YouTube", "color": "#aa4444", "units": 1, "path": "https://youtube.com/sppmacd"},
    {"icon": "",   "units": 1, "color": "#864e39", "displayName": "Microsoft Office", "path": "https://www.office.com/?auth=2"},
];

generateEntries("pcu-app-list", pcuEntries);
generateEntries("utility-app-list", utilityEntries);
generateEntries("link-app-list", linkEntries);
</script>
<?php
$generator->finish();
