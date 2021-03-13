<html>
    <head>
        <meta charset="utf-8">
        <title>Lesson Table Generator | PumpkinCell.net</title>
        <link rel="stylesheet" href="/style.css"/>
        <link rel="stylesheet" href="style.css"/>
        <link rel="stylesheet" href="../hw-planner/style.css"/>
    </head>
    <body>
        <h1><a href="/" class="title-link"><img src="/res/pumpkin2.png" style="height: 50px"/></a><iframe width=395 height=50 style="overflow: hidden; border: none; float: right" src="/u/timer.html?embed=1&mode=3"></iframe></h1>
        <div id="content">
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
        </div>
        <script src="../hw-planner/exe-parser.js"></script>
        <script src="../hw-planner/exe-stringify.js"></script>
        <script src="../hw-planner/main.js"></script>
        <script src="main.js"></script>
        <script src="/tilify.js"></script>
    </body>
</html>
