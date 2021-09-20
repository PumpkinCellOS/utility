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
    <!-- TODO: Turn it into a tab view -->
    <div id="filename-box"></div>
    <textarea id="editor"></textarea>
</tlf-background-tile>
<?php
$generator->finish();
?>
