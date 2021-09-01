<?php

require_once("../../lib/generator.php");
require_once("../../lib/pcu.php");

$generator = new PCUGenerator("Support");
$generator->scripts = ["app.js"];
$generator->header_title = "Community Support";

$generator->start_content();
?>
<tlf-background-tile>
<div id="threads" class="data">
</div>
</tlf-background-tile>
<?php
$generator->finish();

?>
