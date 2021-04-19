<?php

require_once("../../lib/api.php");
require_once("../../lib/pcu.php");

$PCU_CLOUD = "/var/pcu-cloud";

$userData = pcu_require_login();
$uid = $userData["id"];

$api = new PCUAPI();

// args: none
$api->register_command("list-files", function($api) use($uid, $PCU_CLOUD) {
    $out = array();
    error_log("GLOBBING: $PCU_CLOUD/files/$uid/*");
    $listing = glob("$PCU_CLOUD/files/$uid/*");
    $conn = $api->require_database("pcu-cloud");
    foreach($listing as $file)
    {
        $file_bn = basename($file);
        $link = "/u/cloud/download.php?u=$uid&f=$file_bn";
        
        $object = new stdClass();
        $object->name = $file_bn;
        $object->link = $link;
        $object->sharedFor = array();
        
        $result = $conn->query("SELECT targetUid FROM shares WHERE uid='$uid' AND file='$file_bn'");
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
    $file_bn = basename($api->required_arg("file"));
    $path = "$PCU_CLOUD/files/$uid/$file_bn";
    
    // TODO: Implement recycle bin.
    
    $out = new stdClass();
    $out->exists = file_exists($path);
    if(unlink($path) < 0)
        pcu_cmd_fatal("Failed to rename file", 500);
    
    return $out;
});

// args: string file, int uid (0 for public file), bool remove
$api->register_command("file-share", function($api) use($uid, $PCU_CLOUD) {
    //$api->require_method("POST");
    $conn = $api->require_database("pcu-cloud");
    
    $file_bn = basename($api->required_arg("file"));
    $targetUid = $conn->real_escape_string($api->optional_arg("uid", 0));
    $remove = $conn->real_escape_string($api->optional_arg("remove", false));
    
    if($remove)
        $result = $conn->query("DELETE FROM shares WHERE uid='$uid' AND file='$file_bn' AND targetUid='$targetUid'");
    else
        $result = $conn->query("INSERT INTO shares (uid, targetUid, file) VALUES ('$uid', '$targetUid', '$file_bn')");
    
    if(!$result)
        pcu_cmd_fatal(mysqli_error($conn) . " .. " . $remove);
    
    $out = new stdClass();
    $out->remove = $remove;
    return $out;
});

$api->run();

?>
