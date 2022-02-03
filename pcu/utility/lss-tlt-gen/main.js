var g_data;

const PRINT_MODE = tlfGetURLParam("print") == "1";

let g_loadedFromURL = false;
let g_groups = (()=> {
    const data = decodeURIComponent(tlfGetURLParam("groups"));
    if(data.length > 0)
    {
        g_loadedFromURL = true;
        console.log(data);
        return new Set(JSON.parse(data));
    }
    return new Set();
})();

let g_groupSelection = [];

if(PRINT_MODE)
{
    document.body.style.overflow = "auto";
    document.body.style.backgroundColor = "white";
}

function addSlashes(str)
{
    return (str + '').replace(/[\\']/g, '\\$&').replace(/\u0000/g, '\\0');
}

function dateNoTime(date)
{
    var time = date.getTime();
    return new Date(time - (time % 86400000));
}

function dateNoTimeString(date)
{
    return date.getFullYear().toString().padStart(2, "0") + "-"
        + (date.getMonth() + 1).toString().padStart(2, "0") + "-"
        + date.getDate().toString().padStart(2, "0");
}

function dateString(date)
{
    return dateNoTimeString(date) + " " + date.getHours().toString().padStart(2, "0") + ":"
        + date.getMinutes().toString().padStart(2, "0");
}

function currentDateNoTime()
{
    return dateNoTime(new Date);
}

function constructMinutes(h, m)
{
    if(m === undefined)
        return h[0]*60+h[1];
    return h*60+m;
}

function findFreeDay(date)
{
    var freeDays = g_data.freeDays;
    for(var fdd of freeDays)
    {
        var dates = fdd.date;
        if((dates instanceof Array && dateNoTime(date) >= new Date(dates[0]) && dateNoTime(date) <= new Date(dates[1] + " 23:59:59")) ||
           (dateNoTime(date) >= new Date(dates) && dateNoTime(date) <= new Date(dates + " 23:59:59"))
        )
            return fdd;
    }
    return null;
}

function getUnitDB(data)
{
    return data.range ?? g_data.tunit;
}

function getLessonTimeRange(data)
{
    return Array.isArray(data.tunit) ? data.tunit : getUnitDB(data)[data.tunit ?? 0];
}

function generateBlockTextHWTitle(hw)
{
    var inner = "";
    
    inner += generateTopicDisplay(hw, false);
    inner += "\n";
    inner += generateStatus(hw.status);
    
    return inner;
}

function statusToImp(status)
{
    if(statusIsDone(status))
        return "small";
    else if(status.search("ip") == 0 || statusIsEvaluating(status))
        return "medium";
    else
        return undefined;
}

function generateBlockText(data, hwPlannerData)
{
    const subjectTitle = g_data.subjects[data.sub];
    // TODO: This should have its class
    const time = getLessonTimeRange(data);
    function title() {
        // TODO: Some kind of stringifyTimeRange()
        return `${subjectTitle} (${time[0].toString().padStart(2, "0")}:${time[1].toString().padStart(2, "0")} - ${time[2].toString().padStart(2, "0")}:${time[3].toString().padStart(2, "0")})
${data.group !== undefined ? "\nGroup: " + g_data.groups[data.group] : ""}
${data.teacher !== undefined ? "\nTeacher: " + (g_data?.teachers?.[data.teacher] ?? data.teacher) : ""}`;
    }

    var inner = `<b title="${title()}" style="cursor: help">` + data.sub + "</b>";
    if(data.type != "hourDisplay")
        inner += "&nbsp;" + data.class;

    var title = "";
    if(!PRINT_MODE)
    {
        if(hwPlannerData.length == 1)
        {
            var hw = hwPlannerData[0];
            if(hw.sub == data.sub)
            {
                title = generateBlockTextHWTitle(hw);
                inner += `&nbsp;<a class="tlt-topic-label" tid=${hw.tid}>` + generateLabel(hw.topicLabel, statusToImp(hw.status)) + "</a>";
            }
        }
        else if(hwPlannerData.length > 1)
        {
            for(var hw of hwPlannerData)
            {
                if(hw.sub == data.sub)
                    title += "* " + generateBlockTextHWTitle(hw) + "<br>";
            }
            inner += `<a class="tlt-topic-label" tid=${hwPlannerData[0].tid}>&nbsp;` + generateLabel("...") + `</a>`;
        }
        if(hwPlannerData[0] !== undefined)
            inner += `<div class="tlt-hw-dscr" id="tlt-hw-dscr-${hwPlannerData[0].tid}">${title}</div>`;
    }
    return inner;
}

const SCALE = PRINT_MODE ? 1 : 1.2;
const SPACING = 20;

var g_currentLesson = null;
window.g_weekOffset = 0;
var g_startDay = null;
var g_endDay = null;

function generateCurrentLabelText()
{
    const current = new Date();
    let inner = "";
    inner += dateString(current) + "<br>";
    const freeDay = findFreeDay(current);
    if(!g_currentLesson)
        return inner + "No lesson";
    
    if(freeDay)
        return inner + "Day off" + (freeDay.reason ? ": " + freeDay.reason : "");

    const time = getLessonTimeRange(g_currentLesson);
    
    const leftMinutes = (constructMinutes(time[2], time[3])
                    - constructMinutes(current.getHours(), current.getMinutes()));
    const totalMinutes = (constructMinutes(time.slice(2)) - constructMinutes(time));
    const elapsedMinutes = totalMinutes - leftMinutes;
    
    inner += elapsedMinutes + " min elapsed (" + Math.round((elapsedMinutes * 100 / totalMinutes), 1) + "%)<br>";
    inner += leftMinutes + " min left (" + Math.round((leftMinutes * 100 / totalMinutes), 1) + "%)<br>";
    return inner;
}

function topPositionFromMinutes(hours, minutes)
{
    const firstLessonStart = constructMinutes(g_data.tunit[0].slice(0, 2));
    const lastLessonEnd = constructMinutes(g_data.tunit.slice(-1)[0].slice(2));
    const offsetMins = constructMinutes(hours, minutes);
    if(offsetMins > lastLessonEnd || offsetMins < firstLessonStart)
    {
        console.log(offsetMins, ">", lastLessonEnd, "-", firstLessonStart);
        return null;
    }
    const val = (offsetMins - firstLessonStart) * SCALE;
    return val;
}

function generateCurrent()
{
    if(PRINT_MODE)
        return "";

    var current = new Date();

    if(g_weekOffset != 0 || current.getDay() < g_data.dayrange[0] || current.getDay() > g_data.dayrange[1])
        return "";

    const top = topPositionFromMinutes(current.getHours(), current.getMinutes());
    if(top === null)
        return "";
    var left_pc = 100 * ((current.getDay() - g_data.dayrange[0] + 0.5) / (g_data.dayrange[1] - g_data.dayrange[0] + 1.5));
    var left_spacing = 0;
    var width_pc = 1 / (g_data.dayrange[1] - g_data.dayrange[0] + 1.5) * 100;
    var width_spacing = 0;
    
    var inner = "";
    
    var label_html = 
    `<div id="tlt-current">
    </div>`;
    label_html += "<div id='tlt-current-label'>" + generateCurrentLabelText() + "</div>";
    
    inner += 
    `<div id="tlt-current-box" style="left: calc(${left_pc}% + ${left_spacing}px); top: ${top}px; width: calc(${width_pc}% - ${width_spacing}px);">
    ${label_html}</div>`;
    
    return inner;
}

function findHWPlannerHWsForRange(unit, tday, hwPlannerData)
{
    var hws = [];
    
    // start and end of the week
    for(var tid in hwPlannerData)
    {
        var hw = hwPlannerData[tid];
        var untilTime = new Date(hw.untilTime + " " + hw.untilTimeT);
        var untilMinutes = constructMinutes(untilTime.getHours(), untilTime.getMinutes());
        var untilDay = untilTime.getDate();
        var lsnMinutesStart = constructMinutes(unit);
        var lsnMinutesEnd = constructMinutes(unit.slice(2));
        
        if(untilMinutes >= lsnMinutesStart && untilMinutes < lsnMinutesEnd
           && untilTime >= g_startDay && untilTime <= g_endDay
            && tday == untilTime.getDay()
        )
        {
            hws.push(hw);
        }
    }
    return hws;
}

function generateBlock(data, hwPlannerData)
{
    if(data.group && !g_groups.has(data.group))
        return "";

    var realDayDate = new Date(g_startDay.getTime() + data.tday * 86400000);
    var freeDay = !PRINT_MODE ? (data.type != "hourDisplay" ? findFreeDay(realDayDate) : null) : null;
    
    var inner = "";
    var tunitdb = getUnitDB(data);
    
    var unit = getLessonTimeRange(data);
    
    var hws = findHWPlannerHWsForRange(unit, data.tday, hwPlannerData);
    
    var startdate = new Date();
    startdate.setHours(unit[0]);
    startdate.setMinutes(unit[1]);
    var enddate = new Date(startdate.getTime());
    enddate.setHours(unit[2]);
    enddate.setMinutes(unit[3]);
    
    var left_pc = 100 * ((data.tday - g_data.dayrange[0] + 0.5) / (g_data.dayrange[1] - g_data.dayrange[0] + 1.5));
    var left_spacing = SPACING / 2;
    const current = new Date();
    const top = topPositionFromMinutes(startdate.getHours(), startdate.getMinutes());
    if(top === null)
        return "";
    var width_pc = 1 / (g_data.dayrange[1] - g_data.dayrange[0] + 1.5) * 100;
    var width_spacing = SPACING;
    
    if(data.type == "hourDisplay")
    {
        left_pc += width_pc / 2;
        width_pc = 100;
        width_spacing -= 20;
    }

    var height = (enddate - startdate) * SCALE / 60000;
    
    var text;
    if(freeDay)
        text = freeDay.reason ?? "Day off";
    else
        text = generateBlockText(data, hws);

    var type = "tt-" + (freeDay ? "free" : (data.type ?? "lesson"));
    
    var currentDate = new Date();
    var currentMinutes = constructMinutes(currentDate.getHours(), currentDate.getMinutes());
    var startMinutes = constructMinutes(startdate.getHours(), startdate.getMinutes());
    var endMinutes = constructMinutes(enddate.getHours(), enddate.getMinutes());
    
    var b1 = currentDate.getDay() == data.tday;
    var b2 = currentMinutes >= startMinutes;
    var b3 = currentMinutes <= endMinutes;

    if(!PRINT_MODE && b1 && b2 && b3 && g_weekOffset == 0 && data.type != "hourDisplay")
    {
        type += " tt-current";
        g_currentLesson = data;
    }
    
    inner += 
    `<div class="tlt-block ${type}" style="left: calc(${left_pc}% + ${left_spacing}px); top: ${top}px; width: calc(${width_pc}% - ${width_spacing}px); height: ${height}px">
        <div class="tlt-inner">
            ${text}
        </div>
    </div>`;
    
    return inner;
}

function generateDates()
{
    var inner = "";
    for(var i = g_data.dayrange[0]; i <= g_data.dayrange[1]; i++)
    {
        var left_pc = 100 * ((i - g_data.dayrange[0] + 0.5) / (g_data.dayrange[1] - g_data.dayrange[0] + 1.5));
        var left_spacing = SPACING / 2;
        var width_pc = 1 / (g_data.dayrange[1] - g_data.dayrange[0] + 1.5) * 100;
        var width_spacing = SPACING;
    
        var realDayDate = new Date(g_startDay.getTime() + (i - g_data.dayrange[0]) * 86400000);
        
        inner += 
            `<div class="date-block" style="left: calc(${left_pc}% + ${left_spacing}px); width: calc(${width_pc}% - ${width_spacing}px);">
                ${PRINT_MODE ? realDayDate.toLocaleString("default", { weekday: "long" }) : dateNoTimeString(realDayDate)}
            </div>`;
    }
    
    return inner;
}

function generateTlt(data)
{
    // configure
    var current = new Date();
    g_startDay = new Date(current.getTime() - (current.getDay() - g_data.dayrange[0] - g_weekOffset * 7) * 86400000);
    g_startDay.setHours(0);
    g_startDay.setMinutes(0);
    g_startDay.setSeconds(0);
    g_endDay = new Date(current.getTime() - (current.getDay() - g_data.dayrange[1] - g_weekOffset * 7) * 86400000);
    g_endDay.setHours(23);
    g_endDay.setMinutes(59);
    g_endDay.setSeconds(59);
    
    var inner = "";
    g_currentLesson = null;
    for(var lsn of g_data.lessons)
    {
        inner += generateBlock(lsn, data);
    }
    for(var unit in g_data.tunit)
    {
        var unit_inst = g_data.tunit[unit];
        var lsn = {sub: unit_inst[0].toString().padStart(2, "0") + ":" + unit_inst[1].toString().padStart(2, "0")
            + (PRINT_MODE ? " - " : "<br>") + unit_inst[2].toString().padStart(2, "0") + ":" + unit_inst[3].toString().padStart(2, "0"), tunit: unit, tday: 0,
            type: "hourDisplay"};
        inner += generateBlock(lsn, data);
    }
    
    inner += generateCurrent();
    document.getElementById("container").innerHTML = inner;
    
    document.getElementById("date-container").innerHTML = generateDates();
    
    var diffMinutes = constructMinutes(g_data.tunit[g_data.tunit.length - 1].slice(2)) - constructMinutes(g_data.tunit[0]);
    document.getElementById("container-wrapper").style.height = ((diffMinutes * SCALE) + 10) + "px";
    
    if(!PRINT_MODE)
    {
        var currentBox = document.getElementById("tlt-current-box");
        if(currentBox)
        {
            currentBox.addEventListener("mouseenter", function() {
                document.getElementById("tlt-current-label").style.opacity = "90%";
            });
            currentBox.addEventListener("mouseleave", function() {
                document.getElementById("tlt-current-label").style.opacity = "0%";
            });
        }
    
        var dateBox = document.getElementById("current-date");
        dateBox.innerHTML = dateNoTimeString(g_startDay) + "<br>" + dateNoTimeString(g_endDay);
    
        for(var element of document.getElementsByClassName("tlt-topic-label"))
        {
            element.addEventListener("mouseenter", function() {
                var el2 = document.getElementById(`tlt-hw-dscr-${this.getAttribute("tid")}`);
                el2.style.display = "block";
            });
            element.addEventListener("mouseleave", function() {
                var el2 = document.getElementById(`tlt-hw-dscr-${this.getAttribute("tid")}`);
                el2.style.display = "none";
            });
        }
    }
}

const hwPlanner = require("../hw-planner/main.js");

function loadHWPlannerData()
{
    function setupPrintMode()
    {
        if(PRINT_MODE && window.location != window.parent.location)
        {
            console.log("We are in iframe, printing document!");
            window.print();
        }
    }

    // TODO: Download labels (The best thing would probably be using HW Planner APIs here)
    hwPlanner.API.call("get-data", {q: "hws+done"}, function(data) {
        generateTlt(data.data);
        setupPrintMode();
    }, function() {
        generateTlt(null);
        setupPrintMode();
    });
}

function generate()
{
    console.log("Generating...");
    loadHWPlannerData();
}

window.changeWeekOffset = function(value)
{
    g_weekOffset = value;
    generate();
}

function updateGroupsFromSelection()
{
    g_groups.clear();
    for(const field in g_groupSelection)
    {
        if(g_groupSelection[field] != "null")
            g_groups.add(g_groupSelection[field]);
    }
}

function main(response)
{
    try
    {
        g_data = response;

        // Initial groups
        const loadDefaultGroups = ()=> {
            for(const [groupsetName, groupset] of Object.entries(g_data.groupSets))
            {
                if(groupset.groups.length > 0)
                {
                    if(groupset.groups[0] != null)
                        g_groups.add(groupset.groups[0]);
                    g_groupSelection[groupsetName] = groupset.groups[0] ?? "";
                }
            }
        };

        if(!g_loadedFromURL)
        {
            tlfApiCall("GET", "/api/login.php", "get-attribute", {name: "lss_groupPref", uid: window.PCU_USER_DATA.id}, function(data) {
                if(data.data == "")
                {
                    loadDefaultGroups();
                    generate();
                    return;
                }
                console.log("g-groupSelection", data.data);
                g_groupSelection = JSON.parse(data.data);
                updateGroupsFromSelection();
                generate();
            }, function() {
                tlfNotification("Couldn't load group preference - using defaults", TlfNotificationType.Error);
                loadDefaultGroups();
                generate();
            });
        }
        else
            generate();

        if(!PRINT_MODE)
            setInterval(generate, 30000);
    }
    catch(e)
    {
        console.error(e);
    }
}

window.requestPrint = function()
{
    var printModeContainer = document.createElement("iframe");
    printModeContainer.src = "?print=1&groups=" + encodeURIComponent(JSON.stringify([...g_groups]));
    printModeContainer.addEventListener("load", function() {
        console.log("Printing print mode container", this.contentWindow);
        // TODO: Remove the container after printing
    });
    document.body.appendChild(printModeContainer);
}

window.openFilterGroupsForm = function()
{
    // TODO: Consider saving it in db
    let fields = [];

    for(const [groupsetName, groupset] of Object.entries(g_data.groupSets))
    {
        let field = {};
        field.type = "radiogroup";
        field.name = groupsetName;
        field.displayName = groupset.displayName;
        field.value = g_groupSelection ? g_groupSelection[groupsetName] : "";
        field.options = [];
        for(const group of groupset.groups)
        {
            const option = {
                displayName: group ? g_data.groups[group] : "None",
                value: group ?? ""
            }
            field.options.push(option);
        }
        fields.push(field);
    }

    tlfOpenForm(fields, function(data) {
        g_groupSelection = data;
        tlfApiCall("POST", "/api/login.php", "set-attribute", {name: "lss_groupPref", value: JSON.stringify(g_groupSelection), uid: window.PCU_USER_DATA.id});
        updateGroupsFromSelection();
        generate();
    }, {title: "Configure groups"});
}

// NOTE: We can use tlfApiCall here because the lesson-data.json file
// is in JSON format. We couldn't do that for files in another format.
tlfApiCall("GET", "/api/domain.php", "download-file", {name: "lesson-data.json"}, main, function(message) {
    tlfNotification(message.message, TlfNotificationType.Error);
});
