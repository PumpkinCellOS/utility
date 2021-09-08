<?php
require_once("../../lib/generator.php");
$generator = new PCUGenerator("Twitch Overlay");
$generator->stylesheets = ["twitch-style.css"];
$generator->scripts = ["twitch-overlay.js"];
$generator->start_content();
?>
<div id="link" style="display: none">
    <div class="background-tile">
        <div class="background-tile-padding text-align-center">
            <form id="userdata">
                <input type="text" name="username" placeholder="Twitch username"></input>
                <input type="button" onclick="generateLink(document.forms[0].username.value)" value="Generate"></input>
            </form>
                <p>Paste that link into OBS:
                <button href="#" id="obs-link" target="_blank">(Wait for link to be generated...)</button>
            </p>
        </div>
    </div>
</div>
<div id="render">
    <div id="last-follower-box">
        Last follow: <span id="last-follower-name"></span><br>(<span id="last-follower-time"></span>)
    </div>

    <div id="x-followed-box" style="opacity: 0">
        <span id="x-followed-name">Nobody (&#128553;)</span> followed!
    </div>
</div>
        
<!-- For clipboard copy -->
<input id="hidden-input" style="visibility: hidden; position: fixed"></input>
<?php
$generator->finish();
