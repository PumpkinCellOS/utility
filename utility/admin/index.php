<?php

require("../../lib/pcu.php");
$userData = pcu_require_role("admin");
$uid = $userData["id"];

?>
<html>
    <head>
        <title>Admin Panel | PumpkinCell.net</title>
        <link rel="stylesheet" href="/style.css"/>
        <meta charset="utf-8"/>
    </head>
    <body>
        <h1><a href="/" class="title-link"><img src="/res/pumpkin2.png" style="height: 50px"/></a><iframe width=395 height=50 style="overflow: hidden; border: none; float: right" src="/u/timer.html?embed=1&mode=3"></iframe></h1>
        
        <div id="content">
            <h2>Admin panel</h2>
            <div id="controls" class="app-list">
                <a class="tile" style="width: 20%" href="/phpmyadmin" target="_blank">
                    <div class='resizable-tile' style="font-size: 15pt">
                        phpMyAdmin
                    </div>
                </a>
            </div>
            <input type="text" oninput="updateUserList(this.value)" placeholder="Type to search users..."></input>
            <div id="data">
                <div id="user-data" class="background-tile" style="width: calc(100% - 30px); margin: 15px;">
                </div>
            </div>
            <div id="footer">
                <div id="version-data">
                </div>
            </div>
            <div id="loading">
            </div>
        
            <div id="footer-wrapper">
                <div id="footer">
                    <a href="https://github.com/sppmacd">PumpkinCell</a>&nbsp;(c) 2020-2021&nbsp;&#8226;&nbsp;<a href="/terms.php#use">Terms of Use</a>&nbsp;&#8226;&nbsp;<a href="/terms.php#privacy">Privacy Policy</a>
                </div>
            </div>
        </div>
        
        <script src="main.js"></script>
    </body>
</html>
