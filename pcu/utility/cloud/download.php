<?php
require_once("../../lib/generator.php");
require_once("../../lib/pcu.php");
require_once("util.php");

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
$name = $_GET["f"];
validate_path($name);

if($name == "" || $uid == "")
    pcu_cmd_fatal("Invalid argument");

// check if it's maybe on shared list...
$json = new stdClass();
$conn = pcu_cmd_connect_db($json, "pcu-cloud");
if(!$conn)
    pcu_cmd_fatal("Failed to connect to db", 500);
    
$result = $conn->query("SELECT targetUid FROM shares WHERE uid='$uid' AND file='$name'");
$shared = false;
if($result && $result->num_rows > 0)
{
    $row = $result->fetch_assoc();
    $targetUid = $row["targetUid"];
    if($targetUid == 0 || $targetUid == $userData["id"])
        $shared = true;
}

if($userData["id"] != $uid && !isset($shared))
    pcu_cmd_fatal("Access denied for user " . $userData["userName"] . ". Ask file owner for sharing it." . json_encode($result), 403);

$fileName = "$PCU_CLOUD/files/$uid/$name";

$exists = stat($fileName);
if(!$exists)
    pcu_cmd_fatal("File doesn't exist: $name", 404);
    
$fileSize = filesize($fileName);
$basename = basename($name);
    
header("Content-Disposition: inline; filename=\"${basename}\"");
header("Content-Length: ${fileSize}");
pcu_page_type("application/octet-stream");

$fd = @fopen($fileName, "r");
while(!@feof($fd))
{
    $buff = @fread($fd, 16384);
    echo $buff;
}

?>
