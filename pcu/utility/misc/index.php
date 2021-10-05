<?php
require_once("../../lib/generator.php");
$generator = new PCUGenerator("Misc");
$generator->start_content();
?>
<tlf-background-tile>
    <ul>
        <li><a href="pclab.html">PCLab</a></li>
        <li><a href="randomblock.php">Random Block</a></li>
        <li><a href="timer-gui.php">Timer</a></li>
        <li><a href="timer.html">Timer (direct link)</a></li>
        <li><a href="twitch-redirect.php">Twitch Overlay</a></li>
    </ul>
</tlf-background-tile>
<?php
$generator->finish();
?>
