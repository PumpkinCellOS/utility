<?php
require_once("../../lib/generator.php");
$generator = new PCUGenerator("HW Planner", "", "<script>hwplanner_main()</script>");
$generator->scripts = ["app.js"];
$generator->stylesheets = ["style.css"];

$generator->start_pre_content();
?>
    <div id="form-topic-editor" class="fullscreen-form" style="display: none">
    
        <form action="#" onsubmit="submitTopicEditor(this); return false" name="topic-editor">
            <h3 style="text-align: center">{form.editor.name}</h3>
            <div style="height: calc(100% - 200px)">
                <div class="column">
                    <input type="hidden" name="tid"></input>
                    <input type="hidden" name="mode"></input>
                    <label for="sub">{field.subject.name}</label><br>
                    <input type="text" name="sub" placeholder="{field.subject.placeholder}" oninput="updateTopicDisplay()"></input><br>
                    <label for="topic">{field.topic.name}</label><br>
                    <input type="text" name="topic" placeholder="{field.topic.placeholder}" oninput="updateTopicDisplay()"></input><br>
                    <input type="checkbox" name="optional" oninput="updateTopicDisplay()"></input><label for="optional">{field.optional}</label><br>
                    <label for="topicLabel">{field.topicLabel}</label><br>
                    <select name="topicLabel" onchange="updateTopicDisplay()">
                    </select><br>
                    <input type="checkbox" name="topicFormat" oninput="updateTopicDisplay()"><label for="topicFormat">{field.isExerciseList}</label><br>
                    <input type="checkbox" name="shareToDomain"></input><label for="shareToDomain">{field.shareToDomain}</label><br>
                    <label for="untilTime">{field.turnInTime}</label><br>
                    <input type="date" name="untilDate" oninput="updateTopicDisplay()"><br>
                    <input type="time" step="60" name="untilTime" oninput="updateTopicDisplay()"><br>
                    <label for="untilTime">Select lesson:</label><br>
                    <select name="selectLesson">
                    </select><br>
                    <select name="status" onchange="submitModifyStatus(document.forms['topic-editor']['tid'].value, this.value); submitTopicEditor(document.forms['topic-editor']); closeTopicEditor()">
                        <option value="?">{status.f}</option>
                        <option value="N">{status.n}</option>
                        <option value="ip50%">{status.i}</option>
                        <option value="E">{status.e}</option>
                        <option value="P">{status.p}</option>
                        <option value="V">{status.v}</option>
                        <option value="X">{status.x}</option>
                    </select><br>
                    <div id="topic-display" class="topic"></div><br>
                </div><div class="column">
                    <textarea name="description" placeholder="{field.description.placeholder}" style="display: block;"></textarea><br>
                    <div style="text-align: left">
                        <input type="button" id="topic-editor-file-submit" value="Upload file (2 GiB limit)">
                        <input type="button" id="topic-editor-attach-link" value="Attach link">
                        <div id="topic-editor-upload-container"></div>
                        <div id="topic-editor-file-list"></div>
                    </div>
                </div>
            </div>
            <div style="text-align: center">
                <input type="submit" style="background-color: var(--tlf-bg-green)" value="{form.ok}"></input>
                <input type="button" style="background-color: var(--tlf-bg-yellow)" value="{form.cancel}" onclick="closeTopicEditor()"></input>
                <input type="button" style="background-color: var(--tlf-bg-red)" name="delete" value="{form.delete}" onclick="deleteEntry(document.forms['topic-editor']['tid'].value); closeTopicEditor()"></input><br>
                <span id="topic-editor-error"></span>
            </div>
        </form>
        
    </div>
    <div id="form-filters" class="fullscreen-form" style="display: none; text-align: left">
        <form action="#" style="padding: 15px;" onsubmit="submitFilters(this); return false" name="filters">            
            <h3 style="text-align: center">{form.filters.name}</h3>
            <h4>{field.status}</h4>
            <input type="checkbox" name="status-f" checked/><label>{status.f}</label><br>
            <input type="checkbox" name="status-ip" checked/><label>{status.i}</label><br>
            <input type="checkbox" name="status-e" checked/><label>{status.e}</label><br>
            <input type="checkbox" name="status-p" checked/><label>{status.p}</label><br>
            <input type="checkbox" name="status-v"/><label>{status.v}</label><br>
            <input type="checkbox" name="status-x"/><label>{status.x}</label><br>
            <input type="checkbox" name="status-n" checked/><label>{status.n}</label><br>
            <h4>{field.turnInTime}</h4>
            <select name="turn-in-mode">
                <option value=">">{cmp.least}</option>
                <option value="<">{cmp.most}</option>
                <option value="=">{cmp.exact}</option>
            </select><input type="number" name="turn-in"/><select name="turn-in-unit">
                <option value="h">{time.hours}</option>
                <option value="d">{time.days}</option>
            </select><select name="turn-in-sign">
                <option value="h">{time.left}()</option>
                <option value="d">{time.ago}()</option>
            </select><br>
            <h4>{field.addTime}</h4>
            <select name="added-mode">
                <option value=">">{cmp.least}</option>
                <option value="<">{cmp.most}</option>
                <option value="=">{cmp.exact}</option>
            </select><input type="number" name="added"/>
            <select name="added-unit">
                <option value="h">{time.hours}</option>
                <option value="d">{time.days}</option>
            </select>ago<br>
            <h4>{field.topic.name}</h4>
            <input type="checkbox" name="exercise-list"/><label>{field.isExerciseList}</label><br>
            <input type="checkbox" name="optional"/><label>{field.optional}</label><br>
            <input type="checkbox" name="share-to-domain"/><label>{field.shareToDomain} (TODO)</label><br>
            <input type="checkbox" name="description"/><label>{field.description.has}</label><br>
            <h4>{field.topicLabel}</h4>
            <input type="checkbox" name="label-"/><label>{todo}</label><br>
            <h4>{field.subject.name}</h4>
            <input type="checkbox" name="sub-"/><label>{todo}</label><br>
            <input type="submit" value="{form.save}" onclick="document.getElementById('form-filters').style.display = 'none'" style="background-color: var(--tlf-bg-green)">
            <input type="button" style="background-color: var(--tlf-bg-yellow)" value="{form.cancel}" onclick="document.getElementById('form-filters').style.display = 'none'"></input>
        </form>
    </div>
    <div id="statistics" class="fullscreen-form" style="display: none">
        <h3>{form.statistics.name}</h3>
        <div id="statistics-container">
        </div>
        <input type="button" value="{form.ok}" onclick="document.getElementById('statistics').style.display = 'none'" style="background-color:  var(--tlf-bg-green)">
    </div>
    <div id="request-log" class="fullscreen-form" style="display: none">
        <h3>{form.requestLog.name}</h3>
        <div id="request-log-container" class="background-tile">
        </div>
        <input type="button" value="{form.ok}" onclick="document.getElementById('request-log').style.display = 'none'" style="background-color: var(--tlf-bg-green)">
    </div>
    <div id="label-editor-list" class="fullscreen-form" style="display: none">
        <h3>{form.labelEditor.name}</h3>
        <tlf-background-tile id="label-editor-list-container">
        </tlf-background-tile>
        <input type="button" value="{form.ok}" onclick="document.getElementById('label-editor-list').style.display = 'none'" style="background-color: var(--tlf-bg-green)">
    </div>
<?php
$generator->start_content();
?>
    <div id="controls" class="small app-list">
        <a is="tlf-button-tile" style="width: 16.666%" onclick="document.getElementById('form-filters').style.display='block'; updateTopicDisplay(); return false;">
            {controls.filters}
        </a><a is="tlf-button-tile" style="width: 16.666%" onclick="document.getElementById('statistics').style.display='block'; calcStatistics(); return false;">
            {controls.statistics}
        </a><a is="tlf-button-tile" style="width: 16.666%" onclick="document.getElementById('request-log').style.display='block'; generateRequestLog(); return false;">
            {controls.requestLog}
        </a><a is="tlf-button-tile" style="width: 16.666%" onclick="openLabelEditor(); return false;">
            {controls.labelEditor}
        </a><a is="tlf-button-tile" style="width: 16.666%" href="/pcu/u/lss-tlt-gen">
            {controls.lssTltGen}
        </a>
        <!-- TODO: filters -->
    </div>

    <div class="data background-tile" style="width: calc(100% - 30px);">
        <!-- FIXME: Too much hardcoded constants here, move it to Tilify somehow! -->
        <div class="small app-list" style="margin: 0; margin-top: 10px !important; justify-content: center">
            <a is="tlf-button-tile" style="width: 16.666%; outline: 1px solid #888888" onclick="openTopicEditor('add'); return false;">
                {controls.addObject}
            </a>
        </div>
        <div id="data">
            {progress.loading}
        </div>
    </div>
<?php
$generator->finish();
