<?php
require_once("../../lib/generator.php");
$generator = new PCUGenerator("Domain Specific Data Editor");
$generator->scripts = ["app.js"];
$generator->start_content();
?>
<div class="small app-list">
    <a is="tlf-button-tile" style="width: 16.666%" onclick="selectFile()">Open</a>
    <a is="tlf-button-tile" style="width: 16.666%" onclick="save()">Save</a>
</div>
<tlf-background-tile>
    <div id="filename-box"></div>
    <tlf-tab-view>
        <!-- TODO: Turn it into a tab view -->
        <div name="Editor / tabs beta">
            <textarea id="editor" style="width: calc(100% - 15px)"></textarea>
        </div>
    </tlf-tab-view>
</tlf-background-tile>
<?php
$generator->finish();
?>
