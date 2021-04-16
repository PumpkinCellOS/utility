<?php
require_once("../../lib/generator.php");
require_once("../../lib/pcu.php");

if($_SERVER["REQUEST_METHOD"] != "GET")
    pcu_cmd_fatal("Invalid method", 400);

pcu_page_type(PCUPageType::Display);
$userData = pcu_require_login();
    
$uid = $_GET["u"];
$name = basename($_GET["f"]);

if($userData["id"] != $uid)
    pcu_cmd_fatal("Access denied (" . $userData["id"] . " != $uid)", 403);

if($name == "" || $uid == "")
    pcu_cmd_fatal("Invalid argument");

$fileName = realpath("files/$uid/$name");

$exists = stat($fileName);
if(!$exists)
    pcu_cmd_fatal("File doesn't exist: $fileName", 404);
    
pcu_page_type(mime_content_type("files/$uid/$name"));
echo file_get_contents("files/$uid/$name");

?>
