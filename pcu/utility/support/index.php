<?php

require_once("../../lib/generator.php");
require_once("../../lib/pcu.php");

$generator = new PCUGenerator("Support");
$generator->scripts = ["app.js"];

$generator->start_content();
?>
<h2>Community Support</h2>
<tlf-background-tile>
<div id="threads" class="data">
</div>
</tlf-background-tile>
<?php
$generator->finish();

?>
