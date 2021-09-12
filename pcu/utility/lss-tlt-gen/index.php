<?php

require_once("../../lib/generator.php");
require_once("../../lib/pcu.php");

if($_REQUEST["print"] == "1")
{
    pcu_page_type(PCUPageType::Display);
    ?>
    <html>
        <head>
            <title>LSS TLT Gen (print mode) | PumpkinCell.net</title>
            <meta charset="utf-8">
            <link rel="stylesheet" href="/style.css"/>
            <link rel="stylesheet" href="style-print.css"/>
            <link rel="stylesheet" href="../hw-planner/style.css"/>
        </head>
        <body>
            <div id="date-container-wrapper">
                <div id="date-container">
                </div>
            </div>
            <div id="container-wrapper">
                <div id="container">
                </div>
            </div>
            <footer>Generated with LSS TLT Gen (PumpkinCell.net)</footer>
            <script src="/tilify/tilify.js"></script>
            <script src="../hw-planner/app.js"></script>
            <script src="app.js"></script>
        </body>
    </html>
    <?php
    exit;
}

$generator = new PCUGenerator("Lesson Table Generator");
$generator->scripts = ["../hw-planner/app.js", "app.js"];
$generator->stylesheets = ["style.css", "../hw-planner/style.css"];

$generator->start_content();
?>
<div class="small app-list">
    <a is="tlf-button-tile" style="width: 16.666%;" href="/pcu/u/hw-planner">
        HW Planner
    </a>
    <a is="tlf-button-tile" style="width: 16.666%;" onclick="requestPrint()">
        Print <span class="app-spec app-tile-beta">ALPHA</span>
    </a><a is="tlf-button-tile" style="width: 50px;" onclick="changeWeekOffset(g_weekOffset - 1); return false;">
        &lt;
    </a><div id="current-date-wrapper">
        <span id="current-date" onclick="changeWeekOffset(0)">Current date: Loading...</span>
    </div><a is="tlf-button-tile" style="width: 50px;" onclick="changeWeekOffset(g_weekOffset + 1); return false;">
        &gt;
    </a>
    <a is="tlf-button-tile" style="width: 16.666%;" onclick="openFilterGroupsForm()">
        Filter groups
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
