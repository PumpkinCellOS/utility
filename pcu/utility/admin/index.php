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
<div id="controls" class="app-list small">
    <a is="tlf-button-tile" style="width: 20%" href="/phpmyadmin">phpMyAdmin</a>
</div>
<tlf-background-tile>
    <tlf-tab-view>
        <div name="Users">
            <input id="username-box" type="text" oninput="updateUserList(this.value)" placeholder="Type to search users..."></input>
            <button onclick="createUserForm()">Create user</button>
            <div id="user-data" class="data">
            </div>
        </div>
        <div name="Domains">
            <input id="domainname-box" type="text" oninput="updateDomainList(this.value)" placeholder="Type to search domains..."></input>
            <button onclick="createDomainForm()">Create domain</button>
            <div id="domain-data" class="data">
            </div>
        </div>
    </tlf-tab-view>
</tlf-background-tile>
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
