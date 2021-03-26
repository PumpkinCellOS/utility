<?php

require("../../lib/pcu.php");
$userData = pcu_require_login();
$uid = $userData["id"];

require("api-commands.inc.php");

$json = new stdClass();
$json->version = "PCU HWPlanner 1.0";

$c = $_REQUEST["c"];
$command = isset($c) ? $c : "???";

$json->command = $command;

if($_SERVER['REQUEST_METHOD'] == "POST")
    $request = json_decode(file_get_contents("php://input"));

switch($command)
{
    case "add-hw": cmd_add_hw($json, $uid, $request->data); break;
    case "get-data": cmd_get_data($json, $uid, $_REQUEST["q"], $_REQUEST["sort"]); break;
    // TODO: Separate turn-in time and status modification
    case "modify-hw": cmd_modify_hw($json, $uid, $request->data); break;

    case "modify-details": cmd_modify_details($json, $uid, $request->data); break;
    case "modify-turn-in-time": cmd_modify_turn_in_time($json, $uid, $request->data); break;
    case "modify-status": cmd_modify_status($json, $uid, $request); break;
    
    case "remove-hw": cmd_remove_hw($json, $uid, $request->tid); break;
    case "get-labels": cmd_get_labels($json, $uid); break;
    case "get-request-log": cmd_get_request_log($json, $uid); break;
    case "version": break;
    default: cmd_error($json, "{error.noCmd}"); break;
}

echo json_encode($json);
?>
