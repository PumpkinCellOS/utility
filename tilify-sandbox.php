<?php
require_once("lib/generator.php");
$generator = new PCUGenerator("Tilify Sandbox");
$generator->start_content();
?>
<h2>Tilify Sandbox</h2>
<a is="tlf-resizable-tile">test</a>
<a is="tlf-button-tile">test</a>
<tlf-background-tile>test</tlf-background-tile>
<?php
$generator->finish();
?>
