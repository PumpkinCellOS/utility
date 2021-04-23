<?php

require_once("../lib/pcu-admin.php");

$command = $_REQUEST["command"];
$json = new stdClass();
$data = json_decode(file_get_contents("php://input"));

$conn = pcu_cmd_connect_db($json, "pcutil");

switch($command)
{
    case "version":
    {
        $json->version = "PumpkinCell Utility, Admin API, v1.0";
    } break;
    case "search-users":
    {
        $query = $_REQUEST["q"];
        $json->data = array();
        
        // Don't lag db server with short queries
        if(strlen($query) < 3)
        {
            $json->message = "Aborted (short query)";
            break;
        }
        
        $result = $conn->query("SELECT id,userName,role,passwordExpired FROM users WHERE userName LIKE '%$query%'");

        if($result && $result->num_rows > 0)
        {
            while($row = $result->fetch_assoc())
            {
                array_push($json->data, $row);
            }
        }
    } break;
    case "user-info":
    {
        $id = $_REQUEST["id"];
        $json->data = array();
        $result = $conn->query("SELECT * FROM users WHERE id='$id'");

        if($result && $result->num_rows > 0)
        {
            while($row = $result->fetch_assoc())
            {
                array_push($json->data, $row);
            }
        }
    } break;
    case "add-user":
    case "remove-user":
    {
        pcu_cmd_error($json, "Not implemented");
    } break;
    case "change-password-user":
    {
        // args:
        // - uid
        // - password
        $uid = $conn->real_escape_string($data->uid);
        $password = hash('sha256', $conn->real_escape_string($data->password));
        $result = $conn->query("UPDATE users SET password='$password' WHERE id='$uid'");
    } break;
    case "expire-password-user":
    {
        // args:
        // - uid
        // - state (1/0)
        $uid = $conn->real_escape_string($data->uid);
        $state = $conn->real_escape_string($data->state) ? "1" : "0";
        $result = $conn->query("UPDATE users SET passwordExpired='$state' WHERE id='$uid'");
    } break;
    case "change-role-user":
    {
        pcu_cmd_error($json, "Not implemented");
    } break;
    default:
    {
        pcu_cmd_error($json, "Invalid command");
    } break;
}

echo json_encode($json);

?>
