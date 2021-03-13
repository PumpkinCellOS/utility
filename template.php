<?php
require_once("lib/generator.php");
$generator = new PCUGenerator("***");
$generator->start();
?>
<h2>Template Page</h2>
<?php
$generator->finish();
?>
