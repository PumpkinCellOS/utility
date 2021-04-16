<?php

require_once("../../lib/generator.php");
require_once("../../lib/pcu.php");

if(!pcu_allow_insecure_operations())
    $userData = pcu_require_role("member");

$generator = new PCUGenerator("Lesson Table Generator");
$generator->scripts = ["../hw-planner/lang.js", "../hw-planner/exe-parser.js", "../hw-planner/exe-stringify.js", "../hw-planner/main.js", "main.js"];
$generator->stylesheets = ["style.css", "../hw-planner/style.css"];

$generator->start_content();
?>
<h2>Lesson Table Generator</h2>
<div class="app-list" style="height: 50px;">
    <a is="tlf-button-tile" style="width: 16.666%; height: 100%" href="/u/hw-planner">
        HW Planner
    </a><a is="tlf-button-tile" style="width: 50px; height: 100%" onclick="changeWeekOffset(g_weekOffset - 1); return false;">
        &lt;
    </a><div id="current-date-wrapper">
        <span id="current-date" onclick="changeWeekOffset(0)">Current date: Loading...</span>
    </div><a is="tlf-button-tile" style="width: 50px; height: 100%" onclick="changeWeekOffset(g_weekOffset + 1); return false;">
        &gt;
    </a>
</div>
<div id="container-wrapper">
    <div id="container">
    </div>
</div>
<?php
$generator->finish();
