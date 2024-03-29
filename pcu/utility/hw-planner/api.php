<?php

require("../../lib/pcu.php");
require("../../lib/api.php");
$userData = pcu_require_login();
$uid = $userData["id"];

require("api-commands.inc.php");

$json = new stdClass();
$json->version = "PCU HWPlanner 1.0";

$api = new PCUAPI();

$api->register_command("add-hw", function($api) use($json, $uid) {
    $api->require_method("POST");
    cmd_add_hw($json, $uid, $api->required_arg("data"));
    return $json;
});
$api->register_command("get-data", function($api) use($json, $uid) {
    $api->require_method("GET");
    cmd_get_data($json, $uid, $api->required_arg("q"));
    return $json;
});
$api->register_command("modify-hw", function($api) use($json, $uid) {
    $api->require_method("POST");
    cmd_modify_hw($json, $uid, $api->required_arg("data"));
    return $json;
});
$api->register_command("modify-details", function($api) use($json, $uid) {
    $api->require_method("POST");
    cmd_modify_details($json, $uid, $api->required_arg("data"));
    return $json;
});
$api->register_command("modify-turn-in-time", function($api) use($json, $uid) {
    $api->require_method("POST");
    cmd_modify_turn_in_time($json, $uid, $api->required_arg("data"));
    return $json;
});
$api->register_command("modify-status", function($api) use($json, $uid) {
    $api->require_method("POST");
    cmd_modify_status($json, $uid, $api->args());
    return $json;
});
$api->register_command("remove-hw", function($api) use($json, $uid) {
    $api->require_method("POST");
    cmd_remove_hw($json, $uid, $api->required_arg("tid"));
    return $json;
});
$api->register_command("get-labels", function($api) use($json, $uid) {
    $api->require_method("GET");
    cmd_get_labels($json, $uid);
    return $json;
});
$api->register_command("get-request-log", function($api) use($json, $uid) {
    $api->require_method("GET");
    cmd_get_request_log($json, $uid);
    return $json;
});
$api->register_command("add-label", function($api) use($uid) {
    $api->require_method("POST");
    return cmd_add_label($uid);
});
$api->register_command("modify-label", function($api) use($uid) {
    $api->require_method("POST");
    cmd_modify_label($api->required_arg("id"), $uid, $api->args());
});
$api->register_command("remove-label", function($api) use($uid) {
    $api->require_method("POST");
    cmd_remove_label($api->required_arg("id"), $uid);
});
$api->register_command("list-links", function($api) use($json, $uid) {
    $api->require_method("GET");
    cmd_list_links($json, $api->required_arg("tid"), $uid);
    return $json;
});
$api->register_command("add-link", function($api) use($json, $uid) {
    $api->require_method("POST");
    cmd_add_link($json, $api->required_arg("tid"), $api->required_arg("link"), $uid);
    return $json;
});
$api->register_command("version", function($api) use($json, $uid) {
    $api->require_method("GET");
    return $json;
});
$api->run();
?>
