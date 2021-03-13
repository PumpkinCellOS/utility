<?php
require("lib/pcu.php");
$login = pcu_is_logged_in();
$userData = $_SESSION["userData"];
?>
<html>
    <head>
        <meta charset="utf-8">
        <title>User Profile | PumpkinCell.net</title>
        <link rel="stylesheet" href="/style.css"/>
    </head>
    <body>
        <h1><a href="/" class="title-link"><img src="/res/pumpkin2.png" style="height: 50px"/></a><iframe width=395 height=50 style="overflow: hidden; border: none; float: right" src="/u/timer.html?embed=1&mode=3"></iframe></h1>
        <div id="content">
            <h2>User Profile</h2>
            
            <div class="background-tile">
                <div class="background-tile-padding">
                    <?php
                    echo "<h3>" . $userData["userName"];
                    $roles = [
                        "default" => "User",
                        "trusted" => "Trusted user",
                        "moderator" => "Moderator",
                        "member" => "Staff member",
                        "owner" => "Owner",
                        "admin" => "Administration",
                    ];
                    echo "</h3><span class='pcu-user-role'>" . $roles[$userData["role"]] . "</span>";
                    ?>
                </div>
            </div>
            
            <div id="footer-wrapper">
                <div id="footer">
                    <a href="https://github.com/sppmacd">PumpkinCell</a>&nbsp;(c) 2020-2021&nbsp;&#8226;&nbsp;<a href="/terms.php#use">Terms of Use</a>&nbsp;&#8226;&nbsp;<a href="/terms.php#privacy">Privacy Policy</a>
                </div>
            </div>
        </div>
        <script src="tilify.js"></script>
    </body>
</html>
