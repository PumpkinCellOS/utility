<?php

require("../../lib/generator.php");
$generator = new PCUGenerator("Admin panel");

$userData = pcu_require_role("admin");
$uid = $userData["id"];

if(!pcu_allow_insecure_operations())
{
    pcu_page_error("Admin Panel disabled for non-local IPs due to security reasons", 403);
}

$generator->scripts = ["app.js"];
$generator->start_content();

?>
<h2>Admin panel</h2>
<div id="controls" class="app-list small">
    <a is="tlf-button-tile" style="width: 20%" href="/phpmyadmin">phpMyAdmin</a>
</div>
<div class="background-tile">
    <div class="background-tile-padding">
        <input id="username-box" type="text" oninput="updateUserList(this.value)" placeholder="Type to search users..."></input>
        <div id="user-data" class="data background-tile">
        </div>
    </div>
</div>
<div class="background-tile">
    <div class="background-tile-padding">
        <div id="version-data">
        </div>
    </div>
</div>
<div id="loading">
</div>
<?php
$generator->finish();
