<?php

require_once("pcu.php");

if(!pcu_allow_insecure_operations())
{
    pcu_cmd_fatal("You are using a non-private IP. Denying admin operations", 403);
}

$userData = pcu_require_role("admin");
$uid = $userData["id"];

?>
