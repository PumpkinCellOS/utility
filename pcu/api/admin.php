<?php

require_once("../lib/api.php");
require_once("../lib/pcu-admin.php");

$api = new PCUAPI();

$api->register_command("version", function($api) {
    return ["version" => "PumpkinCell Utility, Admin API, v1.0"];
});
$api->register_command("search-users", function($api) {
    $api->require_method("GET");
    $conn = $api->require_database("pcutil");
    $query = $conn->real_escape_string($api->required_arg("q"));
    $json = new stdClass();
    $json->data = array();
    
    // Don't lag db server with short queries
    if(strlen($query) < 3)
    {
        $json->message = "Aborted (short query)";
        return $json;
    }
    
    $result = $conn->query("SELECT id,userName,role,passwordExpired,domain FROM users WHERE userName LIKE '%$query%'");

    if($result && $result->num_rows > 0)
    {
        while($row = $result->fetch_assoc())
        {
            array_push($json->data, $row);
        }
    }
    return $json;
});
$api->register_command("search-domains", function($api) {
    $api->require_method("GET");
    $conn = $api->require_database("pcutil");
    $query = $conn->real_escape_string($api->required_arg("q"));
    $json = new stdClass();
    $json->data = array();
    
    // Don't lag db server with short queries
    if(strlen($query) < 3)
    {
        $json->message = "Aborted (short query)";
        return $json;
    }
    
    $result = $conn->query("SELECT name,ownerId,fullName,domains.id,users.userName AS ownerName FROM domains
        LEFT JOIN users ON domains.ownerId=users.id
        WHERE name LIKE '%$query%' OR fullName LIKE '%$query%';");

    if($result && $result->num_rows > 0)
    {
        while($row = $result->fetch_assoc())
        {
            array_push($json->data, $row);
        }
    }
    return $json;
});
$api->register_command("user-info", function($api) {
    $api->require_method("GET");
    $conn = $api->require_database("pcutil");
    $id = $conn->real_escape_string($api->required_arg("id"));
    $json = new stdClass();
    $json->data = array();
    $result = $conn->query("SELECT * FROM users WHERE id='$id'");

    if($result && $result->num_rows > 0)
    {
        while($row = $result->fetch_assoc())
        {
            array_push($json->data, $row);
        }
    }
    return $json;
});
$api->register_command("add-user", function($api) {
    $api->require_method("POST");
    $conn = $api->require_database("pcutil");
    $userName = $conn->real_escape_string($api->required_arg("userName"));
    $role = $conn->real_escape_string($api->required_arg("role"));
    $password = hash('sha256', $api->required_arg("password"));
    $result = $conn->query("INSERT INTO users (userName, role, password)
        VALUES('$userName', '$role', '$password')");
    if(!$result)
        pcu_cmd_fatal("Query failed: " . $conn->error);
});

$api->register_unimplemented_command("add-domain");
$api->register_unimplemented_command("remove-user");

$api->register_command("change-password-user", function($api) {
    $api->require_method("POST");
    $conn = $api->require_database("pcutil");
    $uid = $conn->real_escape_string($api->required_arg("uid"));
    $password = hash('sha256', $api->required_arg("password"));
    $result = $conn->query("UPDATE users SET password='$password' WHERE id='$uid'");
    if(!$result)
        pcu_cmd_fatal("Query failed");
});
$api->register_command("expire-password-user", function($api) {
    $api->require_method("POST");
    $conn = $api->require_database("pcutil");
    $uid = $conn->real_escape_string($api->required_arg("uid"));
    $state = $conn->real_escape_string($api->required_arg("state")) ? "1" : "0";
    $result = $conn->query("UPDATE users SET passwordExpired='$state' WHERE id='$uid'");
    if(!$result)
        pcu_cmd_fatal("Query failed");
});
$api->register_command("change-role-user", function($api) {
    $api->require_method("POST");
    $conn = $api->require_database("pcutil");
    $uid = $conn->real_escape_string($api->required_arg("uid"));
    $role = $conn->real_escape_string($api->required_arg("role"));
    $result = $conn->query("UPDATE users SET role='$role' WHERE id='$uid'");
    if(!$result)
        pcu_cmd_fatal("Query failed");
});
$api->register_command("set-domain-user", function($api) {
    $api->require_method("POST");
    $conn = $api->require_database("pcutil");
    $uid = $conn->real_escape_string($api->required_arg("uid"));
    $domain = $conn->real_escape_string($api->required_arg("domain"));
    $result = $conn->query("UPDATE users SET domain='$domain' WHERE id='$uid'");
    if(!$result)
        pcu_cmd_fatal("Query failed");
});
$api->run();
?>
