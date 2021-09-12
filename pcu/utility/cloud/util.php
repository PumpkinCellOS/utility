<?php
require_once("../../lib/pcu.php");

$PCU_CLOUD = "/var/pcu-cloud";

function cloud_path($uid, $name)
{
    global $PCU_CLOUD;
    return "$PCU_CLOUD/files/$uid/$name";
}

function account_quota($role)
{
    if(pcu_role_less($role, "member"))
        return 536870912; // 512 MiB
    else
        return 1099511627776; // 1 TiB for members+
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

function calculate_space_usage_dir($name = ".")
{
    $value = 0;
    $files = glob($name . "/*");
    foreach($files as $file)
    {
        $filename = "$name/" . basename($file);
        if(is_dir($filename))
            $value += calculate_space_usage_dir($filename);
        else
            $value += filesize($filename);
    }
    return $value;
}

?>
