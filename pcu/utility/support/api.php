<?php

require_once("../../lib/api.php");
require_once("../../lib/pcu.php");

$api = new PCUAPI();

$api->register_command("list-categories", function($api) {
    $conn = $api->require_database("pcu-support");
    $json = array();
    $result = $conn->query("SELECT * FROM categories");
    while($row = $result->fetch_assoc())
    {
        array_push($json, $row);
    }
    return $json;
});
$api->run();

?>
