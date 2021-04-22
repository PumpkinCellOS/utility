<?php

require_once("../../lib/api.php");
require_once("../../lib/pcu.php");

function validate_path($path)
{
    $output = explode('/', $path);
    foreach($output as $dir)
    {
        if($dir == ".." || $dir == "")
            pcu_cmd_fatal("Invalid path: $path", 400);
    }
}

$PCU_CLOUD = "/var/pcu-cloud";

$userData = pcu_require_login();
$uid = $userData["id"];

$api = new PCUAPI();

// args: none
$api->register_command("list-files", function($api) use($uid, $PCU_CLOUD) {
    $currentDir = $api->optional_arg("currentDir", ".");
    if($currentDir == "")
        $currentDir = ".";
    validate_path($currentDir);
    
    // split path to check if it has 'bad' folders (..)
    
    // actually glob the files
    $out = array();
    error_log("GLOBBING: $PCU_CLOUD/files/$uid/$currentDir/*");
    $listing = glob("$PCU_CLOUD/files/$uid/$currentDir/*");
    
    $conn = $api->require_database("pcu-cloud");
    
    foreach($listing as $file)
    {
        $file_bn = basename($file);
        $link = "/u/cloud/download.php?u=$uid&f=$currentDir/$file_bn";
        
        $object = new stdClass();
        $object->name = $file_bn;
        $object->link = $link;
        $object->isDir = is_dir($file);
        $object->sharedFor = array();
        
        $result = $conn->query("SELECT targetUid FROM shares WHERE uid='$uid' AND file='$currentDir/$file_bn'");
        if($result && $result->num_rows > 0)
        {
            $row = $result->fetch_assoc();
            $object->sharedFor[$row["targetUid"]] = true;
        }
        
        array_push($out, $object);
    }
    
    return $out;
});

// args: string file
$api->register_command("remove-file", function($api) use($uid, $PCU_CLOUD) {
    $api->require_method("POST");
    $file = $api->required_arg("file");
    validate_path($file);
    $path = "$PCU_CLOUD/files/$uid/$file";
    
    // TODO: Implement recycle bin.
    
    $out = new stdClass();
    $out->exists = file_exists($path);
    if(unlink($path) < 0)
        pcu_cmd_fatal("Failed to rename file", 500);
    
    // Unshare deleted files
    $fileShareData = array();
    $fileShareData["file"] = $file;
    $fileShareData["uid"] = -1;
    $fileShareData["remove"] = true;
    $api->run_command("file-share", $fileShareData);
    return $out;
});

// args: string file, int uid (0 for public file, -1 for all shares), bool remove
$api->register_command("file-share", function($api) use($uid, $PCU_CLOUD) {
    $api->require_method("POST");
    $conn = $api->require_database("pcu-cloud");
    
    $file = $api->required_arg("file");
    validate_path($file);
    $targetUid = $conn->real_escape_string($api->optional_arg("uid", 0));
    $remove = $conn->real_escape_string($api->optional_arg("remove", false));
    
    if($remove)
    {
        if($targetUid == -1)
            $result = $conn->query("DELETE FROM shares WHERE uid='$uid' AND file='$file'");
        else
            $result = $conn->query("DELETE FROM shares WHERE uid='$uid' AND file='$file' AND targetUid='$targetUid'");
    }
    else
        $result = $conn->query("INSERT INTO shares (uid, targetUid, file) VALUES ('$uid', '$targetUid', '$file')");
    
    if(!$result)
        pcu_cmd_fatal(mysqli_error($conn) . " .. " . $remove);
    
    $out = new stdClass();
    $out->remove = $remove;
    return $out;
});

$api->register_command("make-directory", function($api) use($uid, $PCU_CLOUD) {
    $api->require_method("POST");
    
    $file = $api->required_arg("name");
    validate_path($file);
    $target = "$PCU_CLOUD/files/$uid/$file";

    mkdir("$PCU_CLOUD/files");
    mkdir("$PCU_CLOUD/files/$uid");

    if(!mkdir($target))
        pcu_cmd_fatal("Failed to create directory!", 500);
    return null;
});

$api->run();

?>
