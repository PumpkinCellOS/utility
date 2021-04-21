/*
    HW Planner Main.js
    Sppmacd (c) 2020 - 2021
*/

const I18n = require("./lang.js");
const EXEParser = require("./exe-parser.js");
const EXEStringify = require("./exe-stringify.js");
const LANG = require("./languages.js");
const api = require("./api.js");
const filters = require("./filters.js");

I18n.LANG = LANG.pl_PL;
I18n.FALLBACK_LANG = LANG.en_US;
I18n.debugFallback = true;
I18n.translatePage();

const API_COMMANDS = {
    "add-hw": {"method": "POST"},
    "get-data": {"method": "GET"},
    "get-labels": {"method": "GET"},
    "modify-hw": {"method": "POST"},
    "modify-details": {"method": "POST"},
    "modify-turn-in-time": {"method": "POST"},
    "modify-status": {"method": "POST"},
    "remove-hw": {"method": "POST"},
    "get-request-log": {"method": "GET"},
    "version": {"method": "GET"}
};

function errorLoading(msg)
{
    var divData = document.getElementById("data");
    var divLoading = document.getElementById("loading");
    divData.innerHTML = "<span class='error-code'>" + msg + "</span>";
    divLoading.style.display = "none";
}

api.setup( { commands: API_COMMANDS, onError: errorLoading } );

// TODO: Make it configurable
var LABELS = 
{
    "":          {imp: "none", display: L("label.none.display")},
    "Optional":  {imp: "none", allowSelect: false},
    "Another":   {imp: "none"}
};

function escapeHTML(str)
{
    return new Option(str).innerHTML;
}

function loadLabels(data)
{
    for(var label of data.data)
    {
        LABELS[label.name] = label;
    }

    // Add topic labels to combo boxes
    var task_cbbs = [document.forms["topic-editor"]["topicLabel"]];
    for(var cbb of task_cbbs)
    {
        for(var optionIx in LABELS)
        {
            var option = LABELS[optionIx];
            if(option.allowSelect === false)
                continue;
            var html = "";
            html += "<option value='" + optionIx + "' objId='" + optionIx + "'>";
            if(option.display)
                html += option.display;
            else
                html += optionIx + " (" + option.imp + ")";
            html += "</option>";
            cbb.innerHTML += html;
        }
    }
    
    requestLoading(false);
}

var g_hws = null;
var g_serverVersion = "Unknown";
var g_showDones = false;
var g_sortBy = "date"; // "sub", "date", "status"
var g_sortMode = 1;  // 1, -1
var g_filters = {}; // TODO: Make some default filters
var g_requestLog = null;
var g_userCache = {};

window.toggleSortMode = function(field)
{
    console.log("toggleSortMode " + field);
    if(g_sortBy == field)
    {
        console.log("toggle from " + g_sortMode);
        g_sortMode = -g_sortMode;
    }
    else
        g_sortBy = field;

    generateDataTable();
}

function getUserData(uid, callback)
{
    // try find in cache
    var user = g_userCache[uid];
    if(!user)
    {
        api.pculogin_apiCall("query-user", `id=${uid}`, "GET", data => callback(data.data)); 
    }
    else
        callback(user);
}

var loadSteps = 0;

window.generateLabel = function(tl, customImp)
{
    if(tl.length == 0)
        return L(label.noLabel);
    
    var topicLabelHTML = "";
    var label = LABELS[tl];
    if(label == undefined)
    {
        if(customImp != undefined)
            return `<span class='topic-label imp-${customImp}'>` + tl + "</span>";
        return "<span class='topic-label imp-none'>" + tl + "</span>";
    }
    
    var imp = label.imp;
    
    console.log("hwPlanner.generateLabel(): ", tl, customImp);
    if(customImp != undefined)
    {
        imp = customImp;
    }
    
    switch(imp)
    {
        case "verybig": topicLabelHTML += "<span class='topic-label imp-verybig'>" + tl + "</span>"; break;
        case "big":     topicLabelHTML += "<span class='topic-label imp-big'>" + tl + "</span>"; break;
        case "medium":  topicLabelHTML += "<span class='topic-label imp-medium'>" + tl + "</span>"; break;
        case "small":   topicLabelHTML += "<span class='topic-label imp-small'>" + tl + "</span>"; break;
        case "none":    topicLabelHTML += "<span class='topic-label imp-none'>" + tl + "</span>"; break;
        default:        topicLabelHTML += "<span class='topic-label'>" + tl + "</span>"; break;
    }
    if(label.fullFlow == '1')
        topicLabelHTML += "&#128068; ";
    return topicLabelHTML;
}

window.generateTopicDisplay = function(data, fancy = true)
{
    var html = "";
    
    // Topic + topic label
    var topic = escapeHTML(data.topic);
    var topicLabel = escapeHTML(data.topicLabel);
    
    if(data.topicFormat == 'N')
    {
        topic = EXEStringify.exe_stringify_hr(EXEParser.parse(topic));
    }
    
    if(data.optional == "1")
    {
        topic = "*" + topic;
        topicLabel += `,${L("label.optional.display")}`;
    }
    
    if(data.description && data.description.length > 0)
    {
        topic += "&nbsp;<a class='description' title='" + escapeHTML(data.description) + "'>(...)</a>"
    }
    
    if(data.topicFormat == 'N' && fancy)
    {
        topic += "<br><span class='description code'>" + data.topic + "</span>";
    }
    
    // Type
    switch(data.type)
    {
        case "z": topic = "<span class='hwt-sz'>" + topic + "</span>"; break;
        case "Z": topic = "<span class='hwt-bz'>" + topic + "</span>"; break;
        case "s": topic = "<span class='hwt-ss'>" + topic + "</span>"; break;
        case "S": topic = "<span class='hwt-bs'>" + topic + "</span>"; break;
        case "I": topic = "<span class='hwt-i'>" + topic + "</span>"; break;
        default: topic = "<span class='hwt-sz'>" + topic + "</span>"; break;
    }
    
    if(topicLabel.length == 0)
    {
        if(fancy)
            html += "<td>" + topic + "</td>";
        else
            return topic;
    }
    else
    {
        var topicLabelHTML = "";
        var tlArray = topicLabel.split(",");
        for(var tl of tlArray)
            topicLabelHTML += generateLabel(tl);
        
        if(fancy)
            html += "<td>" + topicLabelHTML + topic + "</td>";
        else
            html += topicLabelHTML + topic;
    }
    
    return html;
}

function generateStatusNonRich(data_status)
{
    // Status
    var status = `<span class='status-u'>${L("status.u")}</span>`;
    if(data_status.startsWith("ip"))
        status = `<span class='status-i'>${L("status.i", data_status.substring(2))}</span>`;
    else if(data_status == "N")
        status = `<span class='status-n'>${L("status.n")}</span>`;
    else if(data_status == "X")
        status = `<span class='status-x'>${L("status.x")}</span>`;
    else if(data_status == "P")
        status = `<span class='status-p'>${L("status.p")}</span>`;
    else if(data_status == "E")
        status = `<span class='status-e'>${L("status.e")}</span>`;
    else if(data_status == "V")
        status = `<span class='status-v'>${L("status.d")}</span>`;
    else if(data_status == "?")
        status = `<span class='status-f'>${L("status.f")}</span`;
    return status;
}

window.generateStatus = function(data_status, useRichFormat = true)
{
    if(!data_status)
        return "<span class='status-u'>Unknown</span>";
    
    if(!useRichFormat)
        return generateStatusNonRich(data_status);
    
    // Status
    var status = `<span class='status-u'>${L("status.u")}</span>`;
    if(data_status.startsWith("ip"))
        status = `<span class='status-i'>&#9851;&nbsp;${L("status.i", data_status.substring(2))}</span>`;
    else if(data_status == "N")
        status = `<span class='status-n'>&#9889;&nbsp;${L("status.n")}</span>`;
    else if(data_status == "X")
        status = `<span class='status-x'>&#128683;&nbsp;${L("status.x")}</span>`;
    else if(data_status == "P")
        status = `<span class='status-p'>&#128994;&nbsp;${L("status.p")}</span>`;
    else if(data_status == "E")
        status = `<span class='status-e'>&#128394;&nbsp;${L("status.e")}</span>`;
    else if(data_status == "V")
        status = `<span class='status-v'>&#10004;&nbsp;${L("status.v")}</span>`;
    else if(data_status == "?")
        status = `<span class='status-f'>&#10068;&nbsp;${L("status.f")}</span>`;
    return status;
}

function sortLabel(label)
{
    if(label === undefined)
        return 0;
    switch(label.imp)
    {
        case "none": return 0;
        case "small": return 1;
        case "medium": return 2;
        case "big": return 3;
        case "verybig": return 4;
        default: return -1;
    }
}

window.statusIsDone = function(status)
{
    return status == "P" || status == "V" || status == "X";
}

window.statusIsEvaluating = function(status)
{
    return status == "E";
}

window.shouldDisplayAsterisk = function(data, daysLeft)
{
    var notDone = !statusIsDone(data.status) && !statusIsEvaluating(data.status);
    return notDone && daysLeft < LABELS[data.topicLabel].preparationTime / 2;
}

function generateTurnInTime(data)
{
    // Until time
    var utime = new Date(data.untilTime + " " + data.untilTimeT);
    var udays = new Date(data.untilTime);
    var hoursLeft = Math.floor((new Date(utime) - new Date()) / 3600000);
    var daysLeft = Math.floor((new Date(udays) - new Date()) / 86400000) + 1;
    
    var timeStr = data.untilTimeT == "00:00:00" ? "" : ",&nbsp;" + hoursLeft + "&nbsp;h";
    var nday = L("time.nday", Math.abs(daysLeft));
    var nhours = L("time.nhour", Math.abs(hoursLeft));
    var daysLeftStr = "";
    
    var asterisk = shouldDisplayAsterisk(data, daysLeft);
    
    if(daysLeft < 0)
    {
        daysLeftStr += L("time.ago", -daysLeft, nday);
        daysLeftStr = "<span class='time-imp-verybig'>" + daysLeftStr + "</span>";
    }
    else if(daysLeft == 0)
    {
        daysLeftStr += L("time.today");
        if(hoursLeft < 24 && hoursLeft > 0)
            daysLeftStr += ", " + L("time.left", hoursLeft, nhours);

        if(hoursLeft < 0)
            daysLeftStr = "<span class='time-imp-verybig'>" + daysLeftStr + "</span>";
        else
            daysLeftStr = "<span class='time-imp-big'>" + daysLeftStr + "</span>";
    }
    else if(daysLeft == 1)
    {
        daysLeftStr += L("time.tommorow");
        if(hoursLeft < 24)
            daysLeftStr += ", " + L("time.left", hoursLeft, nhours);
        daysLeftStr = "<span class='time-imp-medium'>" + daysLeftStr + "</span>";
    }
    else
    {
        daysLeftStr += L("time.left", daysLeft, nday);
        // TODO: Do it only for imp >= medium!
        if(asterisk)
            daysLeftStr = "<span class='time-imp-medium'>" + daysLeftStr + "</span>";
        else
            daysLeftStr = "<span class='time-imp-small'>" + daysLeftStr + "</span>";
    }
    
    // TODO: 2 days only for imp >= medium, 1 day otherwise
    if(asterisk)
    {
        daysLeftStr = "&#9888;&nbsp;" + daysLeftStr;
        if(hoursLeft < 0)
            daysLeftStr += " <span class='time-imp-verybig'>" + L("time.expired") + "</span>";
    }
    
    return daysLeftStr;
}

function generateEntry(data)
{
    var html = "";
    
    // TID (hidden)
    html += "<td style='display: none'>" + data.tid + "</td>";
    
    // Subject
    html += "<td class='col-sub'><span class='code'>" + data.sub + "</span></td>";
    
    html += generateTopicDisplay(data);
    
    // Add time
    var minutesAgo = Math.floor((new Date() - new Date(data.addTime)) / 60000);
    var daysBefore = Math.ceil((new Date(data.untilTime) - new Date(data.addTime)) / 86400000);
    var preparationTime = LABELS[data.topicLabel].preparationTime;
    var daysBeforeStr = (daysBefore < preparationTime) ? (" <span class='description time-imp-verybig'>(" + L("time.tooLate", preparationTime) + ")</span>") : "";
    
    var days = Math.ceil(minutesAgo / 24 / 60);
    var hours = Math.ceil(minutesAgo / 60);
    
    var daysAgoStr = (
        minutesAgo > 24*60 ?
            L("time.ago", days, L("time.nday", days))  :
            (
                minutesAgo >= 60 ?
                    L("time.ago", hours, L("time.nhour", hours)) :
                    (
                        minutesAgo >= 1 ?
                        L("time.ago", minutesAgo, L("time.nminute", minutesAgo)) :
                        L("time.recently")
                    )
            )
    );
    daysAgoStr += daysBeforeStr;
    
    html += "<td><b>" + daysAgoStr + "</b><br><span class='description'>" + data.addTime + "</span> </td>";
    html += "<td>" + generateTurnInTime(data) + "<br><span class='description'>" + data.untilTime + " <b>" + data.untilTimeT + "</b></span> </td>";
    
    var evalTime = LABELS[data.topicLabel].evaluationTime;
    var evalDays = Math.ceil((new Date() - new Date(data.untilTime)) / 86400000);
    var evalDaysStr = (evalDays > evalTime && statusIsEvaluating(data.status))
        ? "<span class='status-n'>&#128394;&nbsp;" + L("status.e") + "</span><br><span class='description'>(" + L("status.expiredAfter", evalTime) + ")</span>" 
        : generateStatus(data.status);

    html += "<td>" + evalDaysStr + "</td>";
    
    html += `<td><button class='modify-button' onclick='modifyEntry(this.parentNode.parentNode.firstChild.innerText)'>${L("controls.modify")}</button>`;
    html += "</td>";
    
    return html;
}

function loadFormData(form)
{
    var data = {};
    data.tid =         form["tid"].value;
    data.sub =         form["sub"].value;
    data.untilTime =   form["untilDate"].value
    data.untilTimeT =  form["untilTime"].value
    data.topicFormat = form["topicFormat"].checked ? "N" : "R";
    data.topic =       form["topic"].value;
    data.topicLabel =  form["topicLabel"].value;
    data.status =      form["status"].value;
    data.optional =    form["optional"].checked;
    data.description = form["description"].value;
    return data;
}

window.updateTopicDisplay = function()
{
    var obj = document.getElementById("topic-display");
    var data = loadFormData(document.forms["topic-editor"]);
    obj.innerHTML = generateTopicDisplay(data);
}

function validateAndLoadData(form)
{
    var data = loadFormData(form);
    
    if(data.sub.length != 3)
    {
        document.getElementById("topic-editor-error").innerText = L("error.client.subjectTooShort");
        return null;
    }
    if(data.untilTime.length == 0)
    {
        document.getElementById("topic-editor-error").innerText = L("error.client.noTurnInTime");
        return null;
    }
    if(data.topic.length < 3)
    {
        document.getElementById("topic-editor-error").innerText = L("error.client.topicTooShort");
        return null;
    }
    return data;
}

window.submitTopicEditor = function(form)
{
    console.log("submitTopicEditor")
    
    var _data = {};
    _data.data = validateAndLoadData(form);
    if(_data.data === null)
    {
        console.log("failed to validate data :(");
        return;
    }
    
    switch(form["mode"].value)
    {
        case "modify":
            api.apiCall("modify-hw", JSON.stringify(_data), function() { 
                requestLoading(g_showDones);
            });
            break;
        case "add":
            api.apiCall("add-hw", JSON.stringify(_data), function() { 
                requestLoading(g_showDones);
            });
            break;
        default:
            console.log("invalid mode");
            break;
    }
    closeTopicEditor();
}

window.closeTopicEditor = function()
{
    var editor = document.getElementById("form-topic-editor");
    editor.style.display = "none";
}

window.openTopicEditor = function(mode, tid)
{
    var editor = document.getElementById("form-topic-editor");
    editor.style.display = "";
    var form = editor.firstElementChild;
    form["mode"].value = mode;
    
    switch(mode)
    {
        case "add":
            form["status"].style.display = "none";
            form["delete"].style.display = "none";
            break;
        case "modify":
            form["status"].style.display = "";
            form["delete"].style.display = "";
            form["tid"].value = tid;
            loadEntryToForm(form, tid);
            break;
        default:
            console.log("invalid mode " + mode);
            break;
    }
    
    updateTopicDisplay();
}

window.submitModifyStatus = function(tid, value)
{
    var _data = {};
    _data.tid = tid;
    _data.status = value;
    api.apiCall("modify-status", JSON.stringify(_data), function() { 
        requestLoading(g_showDones);
    });
}

window.submitFilters = function(form)
{
    var data = {};
    
    data.status = [];
    if(form["status-f"].checked) data.status.push("f");
    if(form["status-ip"].checked) data.status.push("i");
    if(form["status-e"].checked) data.status.push("a");
    if(form["status-v"].checked) data.status.push("v");
    if(form["status-x"].checked) data.status.push("x");
    if(form["status-n"].checked) data.status.push("n");
    
    data.turn_in = {};
    data.turn_in.mode = form["turn-in-mode"].value;
    data.turn_in.unit = form["turn-in-unit"].value;
    data.turn_in.sign = form["turn-in-sign"].value;
    data.turn_in.value = form["turn-in"].value;
    
    data.added = {};
    data.added.mode = form["added-mode"].value;
    data.added.unit = form["added-unit"].value;
    data.added.value = form["added"].value;
    
    data.exercise_list = form["exercise-list"].checked;
    data.optional = form["optional"].checked;
    data.description = form["description"].checked;
    
    data.label = null;
    data.sub = null;
    
    g_filters = data;
    console.log("FILTERS applied: ", g_filters);
    generateDataTable();
}

function loadEntryToForm(form, tid)
{
    var entry = g_hws[tid];
    form["sub"].value =         entry.sub;
    form["untilTime"].value =   entry.untilTimeT;
    form["untilDate"].value =   entry.untilTime;
    form["topicFormat"].checked = (entry.topicFormat == "N");
    form["topic"].value =       entry.topic;
    form["topicLabel"].value =  entry.topicLabel;
    form["status"].value =      entry.status;
    form["optional"].checked =  (entry.optional == 1);
    form["description"].value = entry.description;
}

window.modifyEntry = function(tid)
{
    openTopicEditor("modify", tid);
}

window.deleteEntry = function(tid)
{
    var data = {};
    data.tid = tid;
    api.apiCall("remove-hw", JSON.stringify(data), function() { 
        requestLoading(g_showDones);
    });
}

window.requestLoading = function()
{
    api.apiCall("get-data", "q=hws" + (g_showDones ? "+done" : ""), loadData);
    api.apiCall("get-request-log", "", function(data) { g_requestLog = data.data; });
}

function sortStatus(status)
{
    var val = -2;
    if(status.startsWith("ip"))
        val = 50;
    else if(status == "N")
        val = 0;
    else if(status == "P")
        val = 101;
    else if(status == "E")
        val = 102;
    else if(status == "V")
        val = 103;
    else if(status == "X")
        val = 104;
    else if(status == "?")
        val = -1;
    return val;
}

function generateDataTable()
{
    // Generate layout.
    var divData = document.getElementById("data");
    var inner = "";
    
    if(g_hws.length == 0)
    {
        inner += `<div class='data-table'>${L("dataTable.nothing")}</div>`;
        divData.innerHTML = inner;
        return;
    }
    
    inner += "<table class='data-table'>";
    inner += "<thead>"
    
    var subSort = "";
    if(g_sortBy == "sub")
    {
        if(g_sortMode == 1)
            subSort = " &#9650;&nbsp;";
        else
            subSort = " &#9660;&nbsp;";
    }
        
    inner += "<td onclick='toggleSortMode(\"sub\")'>" + subSort + `${L("field.subject")}</td>`;
    
    inner += `<td>${L("field.topic")}</td><td>${L("field.addTime")}</td>`;
    
    var dateSort = "";
    if(g_sortBy == "date")
    {
        if(g_sortMode == 1)
            dateSort = " &#9650;&nbsp;";
        else
            dateSort = " &#9660;&nbsp;";
    }
        
    inner += "<td onclick='toggleSortMode(\"date\")'>" + dateSort + `${L("field.turnInTime")}</td>`;
    
    var statusSort = "";
    if(g_sortBy == "status")
    {
        if(g_sortMode == 1)
            statusSort = "&#9650;&nbsp;";
        else
            statusSort = "&#9660;&nbsp;";
    }
    inner += "<td onclick='toggleSortMode(\"status\")'>" + statusSort + `${L("field.status")}</td>`;
    
    inner += "</thead><tbody>";
    
    var arr = [];
    
    for(var t in g_hws)
    {
        var f = filters.filter(g_hws[t], g_filters);
        console.log(f);
        if(f)
            arr.push(g_hws[t]);
    }
    
    var DIR = g_sortMode;
    var SORT_FUNCTIONS = {
        sub :    function(a, b) { return DIR * a.sub.localeCompare(b.sub); },
        date :   function(a, b) { return DIR * (new Date(a.untilTime + " " + a.untilTimeT) - new Date(b.untilTime + "T" + b.untilTimeT + "Z")); },
        status : function(a, b) { return DIR * (sortStatus(a.status) - sortStatus(b.status)); }
    };
    
    arr.sort(SORT_FUNCTIONS[g_sortBy]);
    
    for(var t of arr)
    {
        inner += "<tr>";
        inner += generateEntry(t);
        inner += "</tr>";
    }
    
    inner += "</tbody></table>";
    divData.innerHTML = inner;
}

function generateStatistics(stats)
{
    var wrapStat = (key, value) => ("<div class='stat-entry'><div class='stat-key'>" + key + "</div><div class='stat-value'>" + value + "</div></div>");
    var header = str => ("<h4>" + str + "</h4>");
   
    function wrapStatList(headerStr, list, generator = (key => key))
    {
        inner += header("By " + headerStr);
        inner += "<div>"
        for(var stat of list)
            inner += wrapStat(generator(stat.key), stat.value);
        inner += "</div>"
    }
    
    var inner = "";
    wrapStatList("status", stats.hwsStatus, key => generateStatus(key, false));
    wrapStatList("label", stats.hwsLabel, key => generateLabel(key));
    wrapStatList("subject", stats.hwsSubject);
    
    // Time
    inner += header(L("field.turnInTime"));
    inner += "<div>"
    inner += wrapStat("Expired", stats.tiExpired)
    inner += wrapStat("Expire soon", stats.tiSoon);
    inner += wrapStat("Other", stats.tiOther);
    inner += "</div>"
    
    return inner;
}

function log_Command(name, args)
{
    switch(name)
    {
        case "add-hw": return "added new " + (args.topicLabel.length != 0 ? args.topicLabel : "homework");
        case "remove-hw": return `removed homework '${args.name}'`;
        case "modify-hw":
            var hw = g_hws[args.tid];
            if(hw)
                return L("request.modify.normal", g_hws[args.tid].sub, args.topic);
            else
                return L("request.modify.delete", args.topic);
        case "add-label": return "added label ...";
        case "remove-label": return "removed label ...";
        case "pcu-register": return "registered on PCU ...";
        case "clear-log": return "cleared log ...";
        case "remove-log": return "removed log ...";
        case "modify-status":
            var hw = g_hws[args.tid];
            if(hw)
                return `modified status of ${hw.sub}'s <i>'${args.name}'</i>:`;
            else
                return `modified status of <i>'${args.name}'</i> (deleted):`;
        case "modify-turn-in-time": return "modified turn-in-time of ...";
        case "modify-details": return "modified details of ...";
        default: return L("request.unknown", name);
    }
}

function log_Sentence(prefix, value)
{
    return prefix + " " + "<b>" + value + "</b>";
}

function log_generateCommandData(command, args)
{
    var FUNCTIONS = {
        "add-hw": function(args) {
            console.log(args);
            var hw = g_hws[args.tid];
            return log_Sentence("of subject", args.sub)
            + ": " + (hw ? generateTopicDisplay(hw, false) : ("<i>" + args.topic + "</i>")) + ", "
            + log_Sentence("turn in: ", (hw ? generateTurnInTime(hw) + " " : "") + "(" + args.turnInTime + ")")
        },
        "remove-hw": function(args) {
            return log_Sentence("because of", args.reason)
        },
        "modify-hw": function(args) {
            return "<a title='" + JSON.stringify(args) + "'>in the old way</a>";
        },
        "modify-status": function(args) {
            // TODO: Add unicode arrow!
            return generateStatus(args.old, false)
            + " &#8594; " + generateStatus(args.new, false);
        }
    };
    
    var func = FUNCTIONS[command];
    if(func instanceof Function)
        return func(args);
    return JSON.stringify(args);
}

function generateRequestLogEntry(log)
{
    var user = "...";
    var inner = `<a class='user-link' title='${L("progress.user")}'>` + user + "</a>";
    inner += " <b>" + log_Command(log.command, log.args) + "</b>";
    inner += " -- " + log_generateCommandData(log.command, log.args);
    return inner;
}

window.generateRequestLog = function()
{
    var inner = `<table class='data-table'><thead><td>${L("request.time")}</td><td>Action</td></thead><tbody>`;
    for(var log of g_requestLog)
    {
        inner += "<tr data-userId='" + log.userId + "'><td class='rqlog-time'>" + log.time + "</td><td class='rqlog-data'>" + generateRequestLogEntry(log) + "</td></tr>";
    }
    inner += "</tbody></table>";
    
    var table = document.getElementById("request-log-container");
    table.innerHTML = inner;
    
    // TODO: Load user name!.
}

window.calcStatistics = function()
{
    var element = document.getElementById("statistics-container");
    element.innerHTML = L("progress.generating");
    
    // calculate
    var stats = {}
    stats.hwsStatus = {};
    stats.hwsLabel = {};
    stats.hwsSubject = {};
    stats.tiExpired = 0;
    stats.tiSoon = 0;
    stats.tiOther = 0;

    for(var id in g_hws)
    {
        var hw = g_hws[id];
        
        // Status
        var hStatus = stats.hwsStatus[hw.status];
        if(hStatus === undefined)
            hStatus = 0;
        hStatus++;
        stats.hwsStatus[hw.status] = hStatus;
        
        // Label
        var hLabel = stats.hwsLabel[hw.topicLabel];
        if(hLabel === undefined)
            hLabel = 0;
        hLabel++;
        stats.hwsLabel[hw.topicLabel] = hLabel;
        
        // Subject
        var hSubject = stats.hwsSubject[hw.sub];
        if(hSubject === undefined)
            hSubject = 0;
        hSubject++;
        stats.hwsSubject[hw.sub] = hSubject;
        
        // Turn-in time
        var utime = new Date(hw.untilTime + " " + hw.untilTimeT);
        var diff = utime - new Date();
        if(diff < 0)
            stats.tiExpired++
        else if(diff < 2*24*60*60000)
            stats.tiSoon++;
        else
            stats.tiOther++;
    }
    
    var sortTransform = (obj) => {
        var arr = [];
        for(var i in obj)
            arr.push({key: i, value: obj[i]});
        arr.sort((a, b) => b.value - a.value);
        return arr;
    }
    
    // objects -> arrays, sort
    stats.hwsStatus = sortTransform(stats.hwsStatus);
    stats.hwsLabel = sortTransform(stats.hwsLabel);
    stats.hwsSubject = sortTransform(stats.hwsSubject);
    
    // generate
    var inner = generateStatistics(stats);
    element.innerHTML = inner;
}

function loadData(data)
{
    g_hws = data.data;
    if(g_hws === undefined)
        errorLoading(L("error.client.loadFailed"));
    
    generateDataTable();
    
    loadSteps++;
}

function finishLoading()
{
    var divLoading = document.getElementById("loading");
    divLoading.style.display = "none";
}

function load()
{
    // Load tasks
    api.apiCall("version", "", function(data) { g_serverVersion = data.version; } );
    api.apiCall("get-labels", "", loadLabels);
    
    var inv = setInterval(function()
    {
        if(loadSteps == 1)
        {
            console.info("Loading finished!");
            finishLoading();
            clearInterval(inv);
        }
        
    }, 1000);
}

window.hwplanner_main = function()
{
    load();
    
    setInterval(function() { requestLoading(); }, 60000);
}
