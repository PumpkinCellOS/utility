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
$api->register_command("change-email", function($api) {
    $json = new stdClass();
    $conn = $api->require_database("pcutil");
    $email = $conn->real_escape_string($api->required_arg("email"));
    pcu_change_email($json, $conn, $email);
    return $json;
});
$api->register_command("change-password", function($api) {
    $json = new stdClass();
    $conn = $api->require_database("pcutil");
    // NOTE: We don't need to escape SQL because it will be SHA256-hashed in pcu_change_password.
    $password = $api->required_arg("password");
    pcu_change_password($json, $conn, $password);
    return $json;
});
$api->register_command("create-user", function($api) {
    $json = new stdClass();
    $conn = $api->require_database("pcutil");
    $userName = $conn->real_escape_string($api->required_arg("userName"));
    // NOTE: We don't need to escape SQL because it will be SHA256-hashed in pcu_mkuser.
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
        if($json->data["public"] != "1")
            return $json;
    }
    return $json;
});
$api->register_command("set-property", function($api) {
    $api->require_method("POST");
    $conn = $api->require_database("pcutil");
    $key = $conn->real_escape_string($api->required_arg("key"));
    $value = $api->required_arg("value");
    $userData = $api->require_login();
    $uid = $userData["id"];
    $data = get_properties($conn, $uid, true);
    $data[$key] = $value;
    $dataJson = $conn->real_escape_string(json_encode($data));
    $query = "UPDATE users SET properties='$dataJson' WHERE id='$uid'";
    $result = $conn->query($query);
    if(!$result)
        pcu_cmd_fatal("Query failed: " . $conn->error, 500);
});

function get_properties($conn, $uid, $array=false) 
{
    global $api;
    $result = $conn->query("SELECT public, properties FROM users WHERE id='$uid'");
    if(!$result)
        pcu_cmd_fatal("Query failed: " . $conn->error, 500);
    if($result->num_rows == 0)
        return [];
    $row = $result->fetch_assoc();
    if($row["public"] != "1" && $uid != pcu_current_uid())
        return [];
    return json_decode($row["properties"], $array);
}

$api->register_command("get-properties", function($api) {
    $json = new stdClass();
    $api->require_method("GET");
    $conn = $api->require_database("pcutil");
    $uid = $conn->real_escape_string($api->required_arg("uid"));
    $json->data = get_properties($conn, $uid);
    return $json;
});
$api->register_command("get-roles", function($api) {
    $api->require_method("GET");
    return pcu_roles();
});
$api->register_command("set-public-state", function($api) {
    $api->require_method("POST");
    $state = $api->required_arg("state") == "1" ? "1" : "0";
    $userData = $api->require_login();
    $conn = $api->require_database("pcutil");
    $uid = $userData["id"];
    $result = $conn->query("UPDATE users SET public='$state' WHERE id='$uid'");
    if(!$result)
        pcu_cmd_fatal("Query failed: " . $conn->error, 500);
    // Remember to update session!
    $_SESSION["userData"]["public"] = $state;
    return null;
});
$api->register_command("resend-verification-token", function($api) {
    $api->require_method("POST");
    $userData = $api->require_auth();
    if(!pcu_send_verification_token())
        pcu_cmd_fatal("Failed to send e-mail", 500);
});
$api->register_command("verify-token", function($api) {
    $api->require_method("GET");
    $api->require_auth();
    pcu_verify_token($api->required_arg("token"));
});
$api->run();
