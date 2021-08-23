var g_data;

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
    return getUnitDB(data)[data.tunit ?? 0];
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
    var inner = "<b>" + data.sub + "</b>";
    if(data.type != "hourDisplay")
        inner += "&nbsp;" + data.class;

    var title = "";
    if(hwPlannerData.length == 1)
    {
        var hw = hwPlannerData[0];
        title = generateBlockTextHWTitle(hw);
        inner += `&nbsp;<a class="tlt-topic-label" tid=${hw.tid}>` + generateLabel(hw.topicLabel, statusToImp(hw.status)) + "</a>";
    }
    else if(hwPlannerData.length > 1)
    {
        for(var hw of hwPlannerData)
        {
            title += "* " + generateBlockTextHWTitle(hw) + "<br>";
        }
        inner += `<a class="tlt-topic-label" tid=${hwPlannerData[0].tid}>&nbsp;` + generateLabel("...") + `</a>`;
    }
    if(hwPlannerData[0] !== undefined)
        inner += `<div class="tlt-hw-dscr" id="tlt-hw-dscr-${hwPlannerData[0].tid}">${title}</div>`;
    return inner;
}

const SCALE = 1.2;
const SPACING = 20;

var g_currentLesson = null;
window.g_weekOffset = 0;
var g_startDay = null;
var g_endDay = null;

function generateCurrentLabelText()
{
    console.log("Generating current label text");
    if(!g_currentLesson)
        return "No lesson!";
    var time = getLessonTimeRange(g_currentLesson);
    var inner = "";
    
    var current = new Date();
    var leftMinutes = (constructMinutes(time[2], time[3])
                    - constructMinutes(current.getHours(), current.getMinutes()));
    var totalMinutes = (constructMinutes(time.slice(2)) - constructMinutes(time));
    var elapsedMinutes = totalMinutes - leftMinutes;
    
    inner += dateString(current) + "<br>";
    inner += elapsedMinutes + " min elapsed (" + Math.round((elapsedMinutes * 100 / totalMinutes), 1) + "%)<br>";
    inner += leftMinutes + " min left (" + Math.round((leftMinutes * 100 / totalMinutes), 1) + "%)<br>";
    return inner;
}

function generateCurrent()
{
    var current = new Date();

    if(g_weekOffset != 0 || current.getDay() < g_data.dayrange[0] || current.getDay() > g_data.dayrange[1])
        return "";
    
    var top = ((current.getHours() - g_data.tunit[0][0]) * 60 + current.getMinutes()) * SCALE;
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
        
        if(untilMinutes >= lsnMinutesStart && untilMinutes <= lsnMinutesEnd
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
    var realDayDate = new Date(g_startDay.getTime() + data.tday * 86400000);
    var freeDay = data.type != "hourDisplay" ? findFreeDay(realDayDate) : null;
    
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
    var top = ((startdate.getHours() - g_data.tunit[0][0]) * 60 + startdate.getMinutes()) * SCALE;
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
        text = freeDay.reason;
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

    if(b1 && b2 && b3 && g_weekOffset == 0 && data.type != "hourDisplay")
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
                ${dateNoTimeString(realDayDate)}
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
            + "<br>" + unit_inst[2].toString().padStart(2, "0") + ":" + unit_inst[3].toString().padStart(2, "0"), tunit: unit, tday: 0,
            type: "hourDisplay"};
        inner += generateBlock(lsn, data);
    }
    
    inner += generateCurrent();
    document.getElementById("container").innerHTML = inner;
    
    document.getElementById("date-container").innerHTML = generateDates();
    
    var diffMinutes = constructMinutes(g_data.tunit[g_data.tunit.length - 1].slice(2)) - constructMinutes(g_data.tunit[0]);
    document.getElementById("container-wrapper").style.height = ((diffMinutes * SCALE) + 10) + "px";
    
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

function loadHWPlannerData()
{
    var xhr = new XMLHttpRequest();
    xhr.open("GET", "/pcu/u/hw-planner/api.php?command=get-data&q=hws+done");
    xhr.onreadystatechange = function() {
        if(this.readyState == XMLHttpRequest.DONE)
        {
            if(this.status == 200)
                generateTlt(JSON.parse(this.responseText).data);
            else
                generateTlt(null);
        }
    }
    xhr.send();
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

async function main(response)
{
    try
    {
        var data = await response.body.getReader().read();
        g_data = JSON.parse(new TextDecoder().decode(data.value));
        generate();
        setInterval(generate, 30000);
    }
    catch(e)
    {
        console.log(e);
    }
}

fetch("data.json").then(main).catch(console.log);
