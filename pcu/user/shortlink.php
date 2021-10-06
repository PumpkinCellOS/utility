<?php

// Short link profile handler.

// Arguments:
//  name -> The user name
//  page -> The page to redirect to. Can be:
//   - profile => user/profile.php?uid=$UID
//   - cloud => u/cloud/?u=$UID

require_once("../lib/pcu.php");

pcu_page_type(PCUPageType::Display);

$name = $_REQUEST["name"];
$page = $_REQUEST["page"];

if(strlen($page) == 0)
{
    if(strlen($name) == 0)
        pcu_cmd_fatal("TODO: Make this redirect to user profile", 404);
    $page = "profile";
}

$json = new stdClass();
$conn = pcu_cmd_connect_db($json, "pcutil");
$data = pcu_load_user_data($conn, $name);
if(!$data)
    pcu_cmd_fatal("Invalid user", 404);

$uid = $data["id"];

if($page == "profile")
    $url = "user/profile.php?uid=$uid";
else if($page == "cloud")
    $url = "u/cloud/?u=$uid";
else
    pcu_cmd_fatal("Invalid page", 404);

$http = isset($_SERVER["HTTPS"]) ? "https" : "http";
$host = $_SERVER["HTTP_HOST"];
echo file_get_contents("$http://$host/pcu/$url");

?>
