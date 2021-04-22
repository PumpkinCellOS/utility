<?php

require_once("../../lib/api.php");
require_once("../../lib/pcu.php");

$PCU_CLOUD = "/var/pcu-cloud";

function cloud_path($uid, $name)
{
    global $PCU_CLOUD;
    return "$PCU_CLOUD/files/$uid/$name";
}

function validate_path($path)
{
    $output = explode('/', $path);
    foreach($output as $dir)
    {
        if($dir == ".." || $dir == "")
            pcu_cmd_fatal("Invalid path: $path", 400);
    }
}

function do_share_file($conn, $name, $targetUid, $remove)
{
    // TODO: Error handling
    global $uid;
    if($remove)
    {
        if($targetUid == -1)
            $conn->query("DELETE FROM shares WHERE uid='$uid' AND file='$name'");
        else
            $conn->query("DELETE FROM shares WHERE uid='$uid' AND file='$name' AND targetUid='$targetUid'");
    }
    else
    {
        $conn->query("INSERT INTO shares (uid, targetUid, file) VALUES ('$uid', '$targetUid', '$name')");
    }
    return true;
}

function share_file($conn, $name, $targetUid, $remove)
{
    global $uid;
    error_log("Sharing file '$name':$remove uid=$uid, target=$targetUid");
    
    if(is_dir(cloud_path($uid, $name)))
    {
        if(!share_all_in_dir($conn, $name, $targetUid, $remove))
            return false;
    }
    return do_share_file($conn, $name, $targetUid, $remove);
}

function share_all_in_dir($conn, $name, $targetUid, $remove)
{
    global $uid;
    $files = glob(cloud_path($uid, $name) . "/*");
    error_log("Sharing directory '$name':$remove uid=$uid, target=$targetUid");
    foreach($files as $file)
    {
        if(!share_file($conn, "$name/" . basename($file), $targetUid, $remove))
            return false;
    }
    return true;
}

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
    error_log("GLOBBING: " . cloud_path($uid, $currentDir) . "/*");
    $listing = glob(cloud_path($uid, $currentDir) . "/*");
    
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
    $path = cloud_path($uid, $file);
    
    // TODO: Implement recycle bin.
    // TODO: Implement directory removal.
    
    $out = new stdClass();
    $out->exists = file_exists($path);
    if(unlink($path) < 0)
        pcu_cmd_fatal("Failed to rename file", 500);
    
    // Unshare deleted files
    $conn = $api->require_database("pcu-cloud");
    share_file($conn, $file, -1, true);
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
    
    $result = share_file($conn, $file, $targetUid, $remove);
    if(!$result)
        pcu_cmd_fatal("Failed to share file");
    
    $out = new stdClass();
    $out->isDir = is_dir($file);
    $out->remove = $remove;
    return $out;
});

$api->register_command("make-directory", function($api) use($uid, $PCU_CLOUD) {
    $api->require_method("POST");
    
    $file = $api->required_arg("name");
    validate_path($file);
    $target = cloud_path($uid, $file);

    mkdir("$PCU_CLOUD/files");
    mkdir("$PCU_CLOUD/files/$uid");

    if(!mkdir($target))
        pcu_cmd_fatal("Failed to create directory!", 500);
    return null;
});

$api->run();

?>
