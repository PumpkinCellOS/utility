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

function do_share_file($conn, $name, $targetUid, $remove, $inherit)
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
        $conn->query("INSERT INTO shares (uid, targetUid, file, inherit) VALUES ('$uid', '$targetUid', '$name', '$inherit')");
    }
    return true;
}

function share_file($conn, $name, $targetUid, $remove, $inherit = true)
{
    global $uid;
    error_log("Sharing file '$name':$remove uid=$uid, target=$targetUid");
    
    if(is_dir(cloud_path($uid, $name)) && $inherit)
    {
        if(!share_all_in_dir($conn, $name, $targetUid, $remove, $inherit))
            return false;
    }
    return do_share_file($conn, $name, $targetUid, $remove, $inherit);
}

function share_all_in_dir($conn, $name, $targetUid, $remove, $inherit)
{
    global $uid;
    $files = glob(cloud_path($uid, $name) . "/*");
    error_log("Sharing directory '$name':$remove uid=$uid, target=$targetUid");
    foreach($files as $file)
    {
        if(!share_file($conn, "$name/" . basename($file), $targetUid, $remove, $inherit))
            return false;
    }
    return true;
}

function remove_file($conn, $uid, $name)
{
    $path = cloud_path($uid, $name);
    
    $out = new stdClass();
    $out->exists = file_exists($path);
    
    if(is_dir($path))
    {
        if(!remove_all_in_dir($conn, $uid, $name))
            return false;
    
        if(rmdir($path) < 0)
            return false;
    }
    else if(unlink($path) < 0)
        return false;
    
    // Unshare deleted files
    return share_file($conn, $name, -1, true);
}

function remove_all_in_dir($conn, $uid, $name)
{
    $files = glob(cloud_path($uid, $name) . "/*");
    error_log("Deleting directory '$name' uid=$uid");
    foreach($files as $file)
    {
        if(!remove_file($conn, $uid, "$name/" . basename($file)))
            return false;
    }
    return true;
}

$userData = pcu_user_session();
if(!pcu_is_logged_in())
{
    $userData["id"] = "0";
    $userData["userName"] = "[[public]]";
}
$uid = $userData["id"];

$api = new PCUAPI();

// args: none
$api->register_command("list-files", function($api) use($uid, $PCU_CLOUD) {
    $currentDir = $api->optional_arg("currentDir", ".");
    $targetUid = $api->optional_arg("uid", $uid);
    if($currentDir == "")
        $currentDir = ".";
    validate_path($currentDir);
    
    // split path to check if it has 'bad' folders (..)
    
    // actually glob the files
    $out = array();
    $path = cloud_path($targetUid, $currentDir);
    if(!file_exists($path))
        pcu_cmd_fatal("Invalid user ID", 404);
    $listing = glob($path . "/*");
    
    $conn = $api->require_database("pcu-cloud");
    
    foreach($listing as $file)
    {
        $file_bn = basename($file);
        
        $object = new stdClass();
        $object->name = $file_bn;
        $object->isDir = is_dir($file);
        
        if($object->isDir)
        {
            $link = "/u/cloud/?u=$targetUid&cd=$currentDir/$file_bn";
        }
        else
        {
            $link = "/u/cloud/download.php?u=$targetUid&f=$currentDir/$file_bn";
        }
        $object->link = $link;
        
        $object->sharedFor = array();
        
        $result = $conn->query("SELECT targetUid FROM shares WHERE uid='$targetUid' AND file='$currentDir/$file_bn'");
        if($result && $result->num_rows > 0)
        {
            $row = $result->fetch_assoc();
            $object->sharedFor[$row["targetUid"]] = true;
        }
        
        if(isset($object->sharedFor[$uid]) || isset($object->sharedFor[0]) || $targetUid == $uid)
            array_push($out, $object);
    }
    
    return $out;
});

// args: string file
$api->register_command("remove-file", function($api) use($uid, $PCU_CLOUD) {
    pcu_require_login();
    $api->require_method("POST");
    $file = $api->required_arg("file");
    validate_path($file);
    
    $conn = $api->require_database("pcu-cloud");
    if(!remove_file($conn, $uid, $file))
        pcu_cmd_fatal("Failed to remove $file", 500);
    
    // TODO: Implement recycle bin.
    return null;
});

// args: string file, int uid (0 for public file, -1 for all shares), bool remove
$api->register_command("file-share", function($api) use($uid, $PCU_CLOUD) {
    pcu_require_login();
    $api->require_method("POST");
    $conn = $api->require_database("pcu-cloud");
    
    $file = $api->required_arg("file");
    validate_path($file);
    $targetUid = $conn->real_escape_string($api->optional_arg("uid", 0));
    $remove = $conn->real_escape_string($api->optional_arg("remove", false));
    
    $result = share_file($conn, $file, $targetUid, $remove, true);
    if(!$result)
        pcu_cmd_fatal("Failed to share file");
    
    $out = new stdClass();
    $out->isDir = is_dir($file);
    $out->remove = $remove;
    return $out;
});

$api->register_command("make-directory", function($api) use($uid, $PCU_CLOUD) {
    pcu_require_login();
    $api->require_method("POST");
    $file = $api->required_arg("name");
    validate_path($file);
    $target = cloud_path($uid, $file);

    mkdir("$PCU_CLOUD/files");
    mkdir("$PCU_CLOUD/files/$uid");

    if(!mkdir($target))
        pcu_cmd_fatal("Failed to create directory!", 500);
        
    $conn = $api->require_database("pcu-cloud");
    $containPath = dirname($file);
    $shared = $conn->query("SELECT inherit,targetUid FROM shares WHERE uid='$uid' AND file='$containPath'");
    if($shared && $shared->num_rows > 0)
    {
        while($row = $shared->fetch_assoc())
        {
            $inherit = $row["inherit"];
            if($inherit == '1')
            {
                share_file($conn, $file, $row["targetUid"], false, true);
            }
        }
    }
        
    return null;
});

$api->run();

?>
