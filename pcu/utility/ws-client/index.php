<?php

require_once("../../lib/generator.php");
require_once("../../lib/pcu.php");

$generator = new PCUGenerator("PCU WebSocket Client");
$generator->scripts = ["app.js"];

$generator->start_content();
?>
<tlf-background-tile>
(beta)
</tlf-background-tile>
<?php
$generator->finish();

?>
