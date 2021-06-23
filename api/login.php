<?php

/*if($_SERVER["REQUEST_METHOD"] != "POST")
    cmd_error($json, "Invalid method");
*/

require_once("../lib/api.php");

// FIXME: Don't send plaintext password to server!

$api = new PCUAPI();
$api->register_command("auth-user", function($api) {
    $json = new stdClass();
    $conn = $api->require_database("pcutil");
    $userName = $conn->real_escape_string($api->required_arg("userName"));
    $password = $api->required_arg("password");
    pcu_authuser($json, $conn, $userName, $password);
    return $json;
});
$api->register_command("remove-session", function($api) {
    pcu_rmsession();
    return null;
});
$api->register_command("create-user", function($api) {
    $json = new stdClass();
    $conn = $api->require_database("pcutil");
    $userName = $conn->real_escape_string($api->required_arg("userName"));
    $password = $api->required_arg("password");
    $email = $conn->real_escape_string($api->optional_arg("email", "not-given"));
    pcu_mkuser($json, $conn, $userName, $password, $email);
    return $json;
});
$api->register_command("query-user", function($api) {
    $json = new stdClass();
    $conn = $api->require_database("pcutil");
    $id = $conn->real_escape_string($api->required_arg("id"));
    $result = $conn->query("SELECT userName, role FROM users WHERE id='$id'");

    if($result && $result->num_rows > 0)
    {
        $json->data = $result->fetch_assoc();
    }
    return $json;
});
$api->register_command("change-password", function($api) {
    $json = new stdClass();
    $conn = $api->require_database("pcutil");
    $password = $api->required_arg("password");
    pcu_change_password($json, $conn, $password);
    return $json;
});

function get_properties($conn, $uid, $array=false) 
{
    global $api;
    $result = $conn->query("SELECT properties FROM users WHERE id='$uid'");
    if(!$result)
        pcu_cmd_fatal("Query failed", 500);
    return json_decode($result->fetch_assoc()["properties"], $array);
}

$api->register_command("set-property", function($api) {
    $api->require_method("POST");
    $conn = $api->require_database("pcutil");
    $key = $conn->real_escape_string($api->required_arg("key"));
    $value = $conn->real_escape_string($api->required_arg("value"));
    $userData = $api->require_login();
    $uid = $userData["id"];
    $data = get_properties($conn, $uid, true);
    $data[$key] = $value;
    $dataJson = json_encode($data);
    $result = $conn->query("UPDATE users SET properties='$dataJson' WHERE id='$uid'");
});
$api->register_command("get-properties", function($api) {
    $json = new stdClass();
    $api->require_method("GET");
    $conn = $api->require_database("pcutil");
    $uid = $conn->real_escape_string($api->required_arg("uid"));
    $json->data = get_properties($conn, $uid);
    return $json;
});
$api->run();
