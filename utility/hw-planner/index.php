<?php
require_once("../../lib/generator.php");
$generator = new PCUGenerator("HW Planner", "", "<script>hwplanner_main()</script>");
$generator->scripts = ["exe-parser.js", "exe-stringify.js", "main.js"];
$generator->stylesheets = ["style.css"];

$generator->start_pre_content();
?>
    <div id="loading"><span id="loading-text">Loading...</span></div>
    <div id="form-topic-editor" class="fullscreen-form" style="display: none">
    
        <form action="#" onsubmit="submitTopicEditor(this); return false" name="topic-editor">
            <h3 style="text-align: center">Add Object</h3>
            <div style="height: calc(100% - 200px)">
                <div class="column">
                    <input type="hidden" name="tid"></input>
                    <input type="hidden" name="mode"></input>
                    <label for="sub">Subject</label><br>
                    <input type="text" name="sub" placeholder="3-Character Subject Identifier" oninput="updateTopicDisplay()"></input><br>
                    <label for="topic">Topic</label><br>
                    <input type="text" name="topic" placeholder="Topic" oninput="updateTopicDisplay()"></input><br>
                    <input type="checkbox" name="optional" oninput="updateTopicDisplay()"></input><label for="optional">Optional</label><br>
                    <label for="topicLabel">Topic label</label><br>
                    <select name="topicLabel" onchange="updateTopicDisplay()">
                    </select><br>
                    <input type="checkbox" name="topicFormat" oninput="updateTopicDisplay()"><label for="topicFormat">Exercise list</label><br>
                    <label for="untilTime">Until time</label><br>
                    </select><input type="date" name="untilDate" oninput="updateTopicDisplay()"><br>
                    </select><input type="time" step="60" name="untilTime" oninput="updateTopicDisplay()"><br>
                    <select name="status" onchange="submitModifyStatus(document.forms['topic-editor']['tid'].value, this.value); closeTopicEditor()">
                        <option value="?">Further information needed</option>
                        <option value="N">Not started</option>
                        <option value="ip50%">In progress</option>
                        <option value="E">Evaluation pending</option>
                        <option value="P">Preparation done</option>
                        <option value="V">Done</option>
                        <option value="X">Canceled</option>
                    </select><br>
                    <div id="topic-display" class="topic"></div><br>
                </div><div class="column">
                    <textarea name="description" placeholder="Enter detailed description..." style="display: block;"></textarea><br>
                </div>
            </div>
            <div style="text-align: center">
                <input type="submit" style="background-color: #448844" value="OK"></input>
                <input type="button" style="background-color: #888844" value="Cancel" onclick="closeTopicEditor()"></input>
                <input type="button" style="background-color: #884444" name="delete" value="Delete" onclick="deleteEntry(document.forms['topic-editor']['tid'].value); closeTopicEditor()"></input><br>
                <span id="topic-editor-error"></span>
            </div>
        </form>
        
    </div>
    <div id="form-filters" class="fullscreen-form" style="display: none; text-align: left">
        <form action="#" style="padding: 15px;" onsubmit="submitFilters(this); return false" name="filters">
            <h3 style="text-align: center">Filters</h3>
            <h4>Status</h4>
            <input type="checkbox" name="status-f"/><label>Further information needed</label><br>
            <input type="checkbox" name="status-ip"/><label>In progress</label><br>
            <input type="checkbox" name="status-e"/><label>Evaluation pending</label><br>
            <input type="checkbox" name="status-p"/><label>Preparation done</label><br>
            <input type="checkbox" name="status-v"/><label>Done</label><br>
            <input type="checkbox" name="status-x"/><label>Canceled</label><br>
            <input type="checkbox" name="status-n"/><label>Not started</label><br>
            <h4>Turn in</h4>
            <select name="turn-in-mode">
                <option value=">">at least</option>
                <option value="<">at most</option>
                <option value="=">exactly</option>
            </select><input type="number" name="turn-in"/><select name="turn-in-unit">
                <option value="h">hours</option>
                <option value="d">days</option>
            </select><select name="turn-in-sign">
                <option value="+">left</option>
                <option value="-">ago</option>
            </select><br>
            <h4>Added</h4>
            <select name="added-mode">
                <option value=">">at least</option>
                <option value="<">at most</option>
                <option value="=">exactly</option>
            </select><input type="number" name="added"/>
            <select name="added-unit">
                <option value="h">hours</option>
                <option value="d">days</option>
            </select>ago<br>
            <h4>Topic</h4>
            <input type="checkbox" name="exercise-list"/><label>Exercise list</label><br>
            <input type="checkbox" name="optional"/><label>Optional</label><br>
            <input type="checkbox" name="description"/><label>Has description</label><br>
            <h4>Label</h4>
            <input type="checkbox" name="label-"/><label>TODO</label><br>
            <h4>Subject</h4>
            <input type="checkbox" name="sub-"/><label>TODO</label><br>
            <input type="submit" value="Save" onclick="document.getElementById('form-filters').style.display = 'none'" style="background-color: #779977">
        </form>
    </div>
    <div id="statistics" class="fullscreen-form" style="display: none">
        <h3>Statistics</h3>
        <div id="statistics-container">
        </div>
        <input type="button" value="OK" onclick="document.getElementById('statistics').style.display = 'none'" style="background-color: #779977">
    </div>
    <div id="request-log" class="fullscreen-form" style="display: none">
        <h3>Request log</h3>
        <div id="request-log-container" class="background-tile">
        </div>
        <input type="button" value="OK" onclick="document.getElementById('request-log').style.display = 'none'" style="background-color: #779977">
    </div>
<?php
$generator->start_content();
?>
    <h2>HW Planner</h2>
    <div id="controls" class="small app-list">
        <a is="tlf-button-tile" style="width: 16.666%" onclick="openTopicEditor('add'); return false;">
            Add object
        </a><a is="tlf-button-tile" style="width: 16.666%" onclick="document.getElementById('form-filters').style.display='block'; updateTopicDisplay(); return false;">
            Filters
        </a><a is="tlf-button-tile" style="width: 16.666%" onclick="document.getElementById('statistics').style.display='block'; calcStatistics(); return false;">
            Statistics
        </a><a is="tlf-button-tile" style="width: 16.666%" onclick="document.getElementById('request-log').style.display='block'; generateRequestLog(); return false;">
            Request log
        </a><a is="tlf-button-tile" style="width: 16.666%">
            <input type="checkbox" name="showDones" onclick="g_showDones = this.checked; requestLoading()" onload="onclick()"></input><span class="label">Show all</span>
        </a><a is="tlf-button-tile" style="width: 16.666%" href="/u/lss-tlt-gen">
            LSS TLT Gen
        </a>
        <!-- TODO: filters -->
    </div>

    <div id="data" class="data background-tile" style="width: calc(100% - 30px); margin: 15px;">
        Loading...
    </div>
<?php
$generator->finish();
