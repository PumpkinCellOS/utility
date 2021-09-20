<?php

// TODO: Cleanup pending files (in cronjob)

require_once("../../lib/pcu.php");
require_once("util.php");

// Auth
$userData = pcu_require_login();
$uid = $userData["id"];

// Validate request
if($_SERVER["REQUEST_METHOD"] != "PUT")
    pcu_cmd_fatal("Invalid method, must be PUT");

if((int)$_SERVER['CONTENT_LENGTH'] > 8388608)
    pcu_cmd_fatal("Max chunk size is 8 MiB");

// Get args
$currentDir = $_REQUEST["pwd"];
$fileName = $_REQUEST["name"];
$start = (int)$_REQUEST["start"];
$end = (int)$_REQUEST["end"];
$fileSize = (int)$_REQUEST["size"];

// Validate args and prepare paths
// FIXME: What if uploading files with the same name from several places?
$target = "$PCU_CLOUD/files/$uid/$currentDir/" . basename($fileName);
$targetTmp = "$PCU_CLOUD/files_pending/$uid/" . basename($fileName);

// First chunk preparation
if($start == 0)
{
    // Create user folders
    // NOTE: We don't need to create $currentDir folders
    // because they are created by user :)
    mkdir("$PCU_CLOUD/files_pending");
    mkdir("$PCU_CLOUD/files_pending/$uid");

    // Remove file
    unlink($targetTmp);
}

function fatal_error($str)
{
    global $targetTmp;
    unlink($targetTmp);
    pcu_cmd_fatal($str);
}

// Check if file exists
if(file_exists($target))
    fatal_error("File exists: $fileName");

// Validate file size (to not allow growing files indefinitely)
if($fileSize > 2147483647)
    fatal_error("File size is greater than 2 GiB");
$realFileSize = filesize($targetTmp);
if($realFileSize > 2147483647)
    fatal_error("Real file size is greater than 2 GiB");
if($realFileSize > $fileSize)
    fatal_error("Declared file size $fileSize is < real file size $realFileSize");

// Open input stream
$in = fopen("php://input", "r+");
if(!$in)
    fatal_error("Failed to open input stream");

// Check quota
// TODO: Optimize it???
$usedSpace = calculate_space_usage_dir(cloud_path($uid, "."));
if($usedSpace + $fileSize > account_quota($userData["role"]))
    fatal_error("Quota exceeded");

// Open output stream
$out = fopen($targetTmp, "ab");
if(!$out)
    fatal_error("Failed to open output stream");

if(!stream_copy_to_stream($in, $out))
    fatal_error("Failed to copy data");

fclose($in);
fclose($out);

// TODO: Handle empty files properly
if($end >= $fileSize)
{
    mkdir("$PCU_CLOUD/files");
    mkdir("$PCU_CLOUD/files/$uid");
    rename($targetTmp, $target);
    error_log("UPLOAD FINISHED! $targetTmp --> $target");
    $file = "$currentDir/" . basename($fileName);
    
    // Update shares
    $json = new stdClass();
    $conn = pcu_cmd_connect_db($json, "pcu-cloud");
    $containPath = dirname($file);
    $shared = $conn->query("SELECT inherit,targetUid FROM shares WHERE uid='$uid' AND file='$containPath'");
    if($shared && $shared->num_rows > 0)
    {
        while($row = $shared->fetch_assoc())
        {
            $inherit = $row["inherit"];
            if($inherit == '1')
            {
                $targetUid = $row["targetUid"];
                $conn->query("INSERT INTO shares (uid, targetUid, file, inherit) VALUES ('$uid', '$targetUid', '$file', '1')");
            }
        }
    }
}

?>
