<?php
require_once("../../lib/generator.php");
require_once("../../lib/pcu.php");

if($_SERVER["REQUEST_METHOD"] != "GET")
    pcu_cmd_fatal("Invalid method", 400);

pcu_page_type(PCUPageType::Display);
$userData = pcu_user_session();
if(!pcu_is_logged_in())
{
    $userData["id"] = "0";
    $userData["userName"] = "[[public]]";
}
    
$uid = $_GET["u"];
$name = basename($_GET["f"]);

if($name == "" || $uid == "")
    pcu_cmd_fatal("Invalid argument");

// check if it's maybe on shared list...
$json = new stdClass();
$conn = pcu_cmd_connect_db($json, "pcu-cloud");
if(!$conn)
    pcu_cmd_fatal("Failed to connect to db", 500);
    
$result = $conn->query("SELECT targetUid FROM shares WHERE uid='$uid' AND file='$name'");
if($result && $result->num_rows > 0)
{
    $row = $result->fetch_assoc();
    $targetUid = $row["targetUid"];
    if($targetUid == 0 || $targetUid == $userData["id"])
        $shared = true;
}

if($userData["id"] != $uid && !isset($shared))
    pcu_cmd_fatal("Access denied for user " . $userData["userName"] . ". Ask file owner for sharing it", 403);

$fileName = "files/$uid/$name";

$exists = stat($fileName);
if(!$exists)
    pcu_cmd_fatal("File doesn't exist: $name", 404);
    
header("Content-Disposition: inline; filename=\"${name}\"");
pcu_page_type(mime_content_type($fileName));
echo file_get_contents($fileName);

?>
