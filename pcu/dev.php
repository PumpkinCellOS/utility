<?php
require_once("lib/generator.php");
$generator = new PCUGenerator("Development");
$generator->start_content();
?>
<div class="small app-list">
    <a is="tlf-button-tile" style="width: 16.666%" href="/template.php">Template
    </a><a is="tlf-button-tile" style="width: 16.666%" href="/tilify-sandbox.php">Tilify Sandbox
    </a><a is="tlf-button-tile" style="width: 16.666%" href="/serenity-crash.txt">Serenity Crash
    </a><a is="tlf-button-tile" style="width: 16.666%" href="/serenity-test.html">Serenity Test
    </a><a is="tlf-button-tile" style="width: 16.666%" href="/serenity-test2.html">Serenity Test2</a>
</div>
<?php
$generator->finish();
?>
