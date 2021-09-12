<?php

require_once("../lib/api.php");
require_once("../lib/pcu.php");

$api = new PCUAPI();

$api->register_command("download-file", function($api) {
    $api->require_method("GET");
    $name = $api->required_arg("name");
    pcu_validate_relative_path($name);
    $did = $api->require_domain();
    $path = "/var/pcu-cloud/internal/domains/$did/$name";
    pcu_download_file($path);
    exit;
});

$api->register_command("upload-file", function($api) {
    $api->require_method("PUT");
    $name = $api->required_arg("name");
    pcu_validate_relative_path($name);
    $did = $api->require_domain_owner();
    $path = "/var/pcu-cloud/internal/domains/$did/$name";
    if(!mkdir("/var/pcu-cloud/internal/domains/$did"))
        pcu_cmd_fatal("Failed to create directory", 500);
    $out = fopen($path, "wb");
    if(!$out)
        pcu_cmd_fatal("Failed to open file", 500);
    if(!fwrite($out, $api->data()))
    {
        pcu_cmd_fatal("Failed to write file", 500);
        fclose($out);
    }
    fclose($out);
    exit;
});

$api->run();

?>
