<?php

require_once("../../lib/generator.php");
require_once("../../lib/pcu.php");

$generator = new PCUGenerator("PCU WebSocket Client");
$generator->scripts = ["app.js"];

$generator->start_content();
?>
<h2>PCU WebSocket Client</h2>
<tlf-background-tile>
(beta)
</tlf-background-tile>
<?php
$generator->finish();

?>
