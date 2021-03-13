<?php

require("../lib/pcu-admin.php");

$action = $_REQUEST["command"];
$json = new stdClass();

$conn = pcu_cmd_connect_db($json, "pcutil");

switch($action)
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
    case "change-password-user":
    case "expire-password-user":
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
