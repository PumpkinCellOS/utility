/*
    HW Planner Main.js
    Sppmacd (c) 2020 - 2021
*/

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

// TODO: Make it configurable
var LABELS = 
{
    "":                    {imp: "none", display: "(No label)"},
    "Dla chętnych":        {imp: "none", allowSelect: false},
    "Inne":                {imp: "none"}
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
var g_filters = {};
var g_requestLog = null;
var g_userCache = {};

function toggleSortMode(field)
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

function api_doXHR(xhr, args, method, callback)
{
    xhr.onreadystatechange = function() {
        if(this.readyState == 4)
        {
            if(this.status == 200 && callback instanceof Function)
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

function pculogin_apiCall(command, args, method, callback)
{
    console.log(command, args, method, callback);
    var xhr = new XMLHttpRequest();
    var url = "/api/login.php?command=" + command;
    if(method != "POST")
        url += "&" + args;

    xhr.open(method, url);
    api_doXHR(xhr, args, method, callback);
}

//callback: function(responseText)
function apiCall(command, args, callback, urlprefix)
{
    var xhr = new XMLHttpRequest();
    method = API_COMMANDS[command].method;
    
    var url = "api.php?c=" + command;
    if(method != "POST")
        url += "&" + args;
    
    xhr.open(method, url);
    api_doXHR(xhr, args, method, callback);
}

function getUserData(uid, callback)
{
    // try find in cache
    var user = g_userCache[uid];
    if(!user)
    {
        pculogin_apiCall("query-user", `id=${uid}`, "GET", data => callback(data.data)); 
    }
    else
        callback(user);
}

var loadSteps = 0;

function generateLabel(tl)
{
    if(tl.length == 0)
        return "No label";
    
    var topicLabelHTML = "";
    var label = LABELS[tl];
    if(label == undefined)
        return "<span class='topic-label imp-none'>" + tl + "</span>";
    
    switch(label.imp)
    {
        case "verybig": topicLabelHTML += "<span class='topic-label imp-verybig'>" + tl + "</span>"; break;
        case "big":     topicLabelHTML += "<span class='topic-label imp-big'>" + tl + "</span>"; break;
        case "medium":  topicLabelHTML += "<span class='topic-label imp-medium'>" + tl + "</span>"; break;
        case "small":   topicLabelHTML += "<span class='topic-label imp-small'>" + tl + "</span>"; break;
        case "none":    topicLabelHTML += "<span class='topic-label imp-none'>" + tl + "</span>"; break;
        default:        topicLabelHTML += "<span class='topic-label'>" + tl + "</span>"; break;
    }
    return topicLabelHTML;
}

function generateTopicDisplay(data, fancy = true)
{
    var html = "";
    
    // Topic + topic label
    var topic = escapeHTML(data.topic);
    var topicLabel = escapeHTML(data.topicLabel);
    
    if(data.topicFormat == 'N')
    {
        topic = exe_stringify_hr(exe_parse(topic));
    }
    
    if(data.optional == "1")
    {
        topic = "*" + topic;
        topicLabel += ",Dla chętnych";
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
        for(tl of tlArray)
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
    var status = "<span class='status-u'>Unknown</span>";
    if(data_status.startsWith("ip"))
        status = "<span class='status-i'>In&nbsp;progress&nbsp;(" + data_status.substring(2) + ")</span>";
    else if(data_status == "N")
        status = "<span class='status-n'>Not&nbsp;started</span>";
    else if(data_status == "X")
        status = "<span class='status-x'>Canceled</span>";
    else if(data_status == "P")
        status = "<span class='status-p'>Preparation&nbsp;done</span>";
    else if(data_status == "E")
        status = "<span class='status-e'>Evaluation&nbsp;pending</span>";
    else if(data_status == "V")
        status = "<span class='status-v'>Done</span>";
    else if(data_status == "?")
        status = "<span class='status-f'>Further&nbsp;information&nbsp;needed</span>";
    return status;
}

function generateStatus(data_status, useRichFormat = true)
{
    if(!data_status)
        return "<span class='status-u'>Unknown</span>";
    
    if(!useRichFormat)
        return generateStatusNonRich(data_status);
    
    // Status
    var status = "<span class='status-u'>Unknown</span>";
    if(data_status.startsWith("ip"))
        status = "<span class='status-i'>&#9851;&nbsp;In&nbsp;progress...&nbsp;(" + data_status.substring(2) + ")</span>";
    else if(data_status == "N")
        status = "<span class='status-n'>&#9889;&nbsp;Not&nbsp;started</span>";
    else if(data_status == "X")
        status = "<span class='status-x'>&#128683;&nbsp;Canceled</span>";
    else if(data_status == "P")
        status = "<span class='status-p'>&#128994;&nbsp;Preparation&nbsp;done</span>";
    else if(data_status == "E")
        status = "<span class='status-e'>&#128394;&nbsp;Evaluation&nbsp;pending...</span>";
    else if(data_status == "V")
        status = "<span class='status-v'>&#10004;&nbsp;Done</span>";
    else if(data_status == "?")
        status = "<span class='status-f'>&#10068;&nbsp;Further&nbsp;information&nbsp;needed</span>";
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

function statusIsDone(status)
{
    return status == "P" || status == "V" || status == "X";
}

function statusIsEvaluating(status)
{
    return status == "E";
}

function shouldDisplayAsterisk(data, daysLeft)
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
    var nday = (Math.abs(daysLeft) == 1) ? "day" : "days";
    var nhours = (Math.abs(hoursLeft) == 1) ? "hour" : "hours";
    var daysLeftStr = "";
    
    var asterisk = shouldDisplayAsterisk(data, daysLeft);
    
    if(daysLeft < 0)
    {
        daysLeftStr += -daysLeft + " " + nday + " ago";
        daysLeftStr = "<span class='time-imp-verybig'>" + daysLeftStr + "</span>";
    }
    else if(daysLeft == 0)
    {
        daysLeftStr += "Today";
        if(hoursLeft < 24 && hoursLeft > 0)
            daysLeftStr += ", " + hoursLeft + " " + nhours + " left";

        if(hoursLeft < 0)
            daysLeftStr = "<span class='time-imp-verybig'>" + daysLeftStr + "</span>";
        else
            daysLeftStr = "<span class='time-imp-big'>" + daysLeftStr + "</span>";
    }
    else if(daysLeft == 1)
    {
        daysLeftStr += "Tommorow";
        if(hoursLeft < 24)
            daysLeftStr += ", " + hoursLeft + " " + nhours + " left";
        daysLeftStr = "<span class='time-imp-medium'>" + daysLeftStr + "</span>";
    }
    else
    {
        daysLeftStr += daysLeft + " " + nday + " left";
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
            daysLeftStr += " <span class='time-imp-verybig'>(expired!)</span>";
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
    var daysBeforeStr = (daysBefore < preparationTime) ? (" <span class='time-imp-verybig'>(too late, need " + preparationTime + " days)</span>") : "";
    var daysAgoStr = (
        minutesAgo > 24*60 ?
            Math.ceil(minutesAgo / 24 / 60) + "&nbsp;day(s)&nbsp;ago" :
            (
                minutesAgo >= 60 ?
                    Math.ceil(minutesAgo / 60) + "&nbsp;hour(s)&nbsp;ago" :
                    (
                        minutesAgo >= 1 ?
                        minutesAgo + "&nbsp;minute(s)&nbsp;ago" :
                        "Recently"
                    )
            )
    );
    daysAgoStr += daysBeforeStr;
    
    html += "<td><b>" + daysAgoStr + "</b><br><span class='description'>" + data.addTime + "</span> </td>";
    html += "<td>" + generateTurnInTime(data) + "<br><span class='description'>" + data.untilTime + " <b>" + data.untilTimeT + "</b></span> </td>";
    
    var evalTime = LABELS[data.topicLabel].evaluationTime;
    var evalDays = Math.ceil((new Date() - new Date(data.untilTime)) / 86400000);
    var evalDaysStr = (evalDays > evalTime && statusIsEvaluating(data.status)) ? "<br><span class='description time-imp-verybig'>(expired after " + evalTime + " days)</span>" : "";
    html += "<td>" + generateStatus(data.status) + evalDaysStr + "</td>";
    
    html += "<td><button class='modify-button' onclick='modifyEntry(this.parentNode.parentNode.firstChild.innerText)'>Modify</button>";
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

function updateTopicDisplay()
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
        document.getElementById("topic-editor-error").innerText = "Subject must be 3 characters long";
        return null;
    }
    if(data.untilTime.length == 0)
    {
        document.getElementById("topic-editor-error").innerText = "Specify turn-in date";
        return null;
    }
    if(data.topic.length < 3)
    {
        document.getElementById("topic-editor-error").innerText = "Topic must be at least 3 characters long";
        return null;
    }
    return data;
}

function submitTopicEditor(form)
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
            apiCall("modify-hw", JSON.stringify(_data), function() { 
                requestLoading(g_showDones);
            });
            break;
        case "add":
            apiCall("add-hw", JSON.stringify(_data), function() { 
                requestLoading(g_showDones);
            });
            break;
        default:
            console.log("invalid mode");
            break;
    }
    closeTopicEditor();
}

function closeTopicEditor()
{
    var editor = document.getElementById("form-topic-editor");
    editor.style.display = "none";
}

function openTopicEditor(mode, tid)
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

function submitModifyStatus(tid, value)
{
    var _data = {};
    _data.tid = tid;
    _data.status = value;
    apiCall("modify-status", JSON.stringify(_data), function() { 
        requestLoading(g_showDones);
    });
}

function submitFilters(form)
{
    var data = {};
    
    data.status = [];
    if(form["status-f"]) data.status.push("f");
    if(form["status-ip"]) data.status.push("i");
    if(form["status-e"]) data.status.push("a");
    if(form["status-v"]) data.status.push("v");
    if(form["status-x"]) data.status.push("x");
    if(form["status-n"]) data.status.push("n");
    
    data.turn_in = {};
    data.turn_in.mode = form["turn-in-mode"];
    data.turn_in.unit = form["turn-in-mode"];
    data.turn_in.sign = form["turn-in-sign"];
    data.turn_in.value = form["turn-in"];
    
    data.added = {};
    data.added.mode = form["added-mode"];
    data.added.unit = form["added-unit"];
    data.added.value = form["added"];
    
    data.exercise_list = form["exercise-list"];
    data.optional = form["optional"];
    
    data.label = null;
    data.sub = null;
    
    g_filters = data;
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

function modifyEntry(tid)
{
    openTopicEditor("modify", tid);
}

function deleteEntry(tid)
{
    var data = {};
    data.tid = tid;
    apiCall("remove-hw", JSON.stringify(data), function() { 
        requestLoading(g_showDones);
    });
}

function requestLoading()
{
    apiCall("get-data", "q=hws" + (g_showDones ? "+done" : ""), loadData);
    apiCall("get-request-log", "", function(data) { g_requestLog = data.data; });
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
        inner += "<div class='data-table'>Nothing to display!</div>";
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
        
    inner += "<td onclick='toggleSortMode(\"sub\")'>" + subSort + "Sub.</td>";
    
    inner += "<td>Topic</td><td>Added</td>";
    
    var dateSort = "";
    if(g_sortBy == "date")
    {
        if(g_sortMode == 1)
            dateSort = " &#9650;&nbsp;";
        else
            dateSort = " &#9660;&nbsp;";
    }
        
    inner += "<td onclick='toggleSortMode(\"date\")'>" + dateSort + "Turn&nbsp;in</td>";
    
    var statusSort = "";
    if(g_sortBy == "status")
    {
        if(g_sortMode == 1)
            statusSort = "&#9650;&nbsp;";
        else
            statusSort = "&#9660;&nbsp;";
    }
    inner += "<td onclick='toggleSortMode(\"status\")'>" + statusSort + "Status</td>";
    
    inner += "</thead><tbody>";
    
    var arr = [];
    
    for(var t in g_hws)
    {
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
    wrapStat = (key, value) => ("<div class='stat-entry'><div class='stat-key'>" + key + "</div><div class='stat-value'>" + value + "</div></div>");
    header = str => ("<h4>" + str + "</h4>");
   
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
    inner += header("Turn-in time");
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
                return `modified ${g_hws[args.tid].sub}'s '${args.topic}'`;
            else
                return `modified '${args.topic}' (deleted)`;
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
        default: return "did unknown action: " + name;
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
    var inner = "<a class='user-link' title='Loading user data...'>" + user + "</a>";
    inner += " <b>" + log_Command(log.command, log.args) + "</b>";
    inner += " -- " + log_generateCommandData(log.command, log.args);
    return inner;
}

function generateRequestLog()
{
    var inner = "<table class='data-table'><thead><td>Time</td><td>Action</td></thead><tbody>";
    for(var log of g_requestLog)
    {
        inner += "<tr data-userId='" + log.userId + "'><td class='rqlog-time'>" + log.time + "</td><td class='rqlog-data'>" + generateRequestLogEntry(log) + "</td></tr>";
    }
    inner += "</tbody></table>";
    
    var table = document.getElementById("request-log-container");
    table.innerHTML = inner;
    
    // TODO: Load user name!.
}

function calcStatistics()
{
    var element = document.getElementById("statistics-container");
    element.innerHTML = "Generating...";
    
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
    
    sortTransform = (obj) => {
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
        errorLoading("Couldn't load data table");
    
    generateDataTable();
    
    loadSteps++;
}

function finishLoading()
{
    var divLoading = document.getElementById("loading");
    divLoading.style.display = "none";
}

function errorLoading(msg)
{
    var divData = document.getElementById("data");
    var divLoading = document.getElementById("loading");
    divData.innerHTML = "<span class='error-code'>" + msg + "</span>";
    divLoading.style.display = "none";
}

function load()
{
    // Load tasks
    apiCall("version", "", function(data) { g_serverVersion = data.version; } );
    apiCall("get-labels", "", loadLabels);
    
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

function hwplanner_main()
{
    load();
    
    setInterval(function() { requestLoading(); }, 60000);
}
