<?php

require_once("../../lib/generator.php");
require_once("../../lib/pcu.php");

$generator = new PCUGenerator("Lesson Table Generator");
$generator->scripts = ["../hw-planner/app.js", "app.js"];
$generator->stylesheets = ["style.css", "../hw-planner/style.css"];

if(!pcu_allow_insecure_operations())
    $userData = pcu_require_role("member");

$generator->start_content();
?>
<h2>Lesson Table Generator</h2>
<div class="app-list" style="height: 50px;">
    <a is="tlf-button-tile" style="width: 16.666%; height: 100%" href="/pcu/u/hw-planner">
        HW Planner
    </a><a is="tlf-button-tile" style="width: 50px; height: 100%" onclick="changeWeekOffset(g_weekOffset - 1); return false;">
        &lt;
    </a><div id="current-date-wrapper">
        <span id="current-date" onclick="changeWeekOffset(0)">Current date: Loading...</span>
    </div><a is="tlf-button-tile" style="width: 50px; height: 100%" onclick="changeWeekOffset(g_weekOffset + 1); return false;">
        &gt;
    </a>
</div>
<div id="date-container-wrapper">
    <div id="date-container">
    </div>
</div>
<div id="container-wrapper">
    <div id="container">
    </div>
</div>
<?php
$generator->finish();
