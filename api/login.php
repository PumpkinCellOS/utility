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
$api->run();
