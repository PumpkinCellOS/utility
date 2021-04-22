<?php

/*if($_SERVER["REQUEST_METHOD"] != "POST")
    cmd_error($json, "Invalid method");
*/

require_once("../lib/api.php");
require_once("../lib/pcu.php");

$action = $_REQUEST["command"];
$json = new stdClass();

$conn = pcu_cmd_connect_db($json, "pcutil");

switch($action)
{
    case "auth-user":
    {
        $userName = $conn->real_escape_string($_REQUEST["userName"]);
        $password = $_REQUEST["password"];
        pcu_authuser($json, $conn, $userName, $password);
    } break;
    case "remove-session":
    {
        pcu_rmsession();
    } break;
    case "create-user":
    {
        $userName = $conn->real_escape_string($_REQUEST["userName"]);
        $password = $_REQUEST["password"];
        pcu_mkuser($json, $conn, $userName, $password);
    } break;
    case "query-user":
    {
        $id = $_REQUEST["id"];
        $result = $conn->query("SELECT userName, role FROM users WHERE id='$id'");

        if($result && $result->num_rows > 0)
        {
            $json->data = $result->fetch_assoc();
        }
        echo json_encode($json);
    } return; // Don't output default html!
    default:
    {
        // TODO: Move everything to PCUAPI
        $api = new PCUAPI();
        $api->register_command("change-password", function($api) use($json, $conn) {
            $password = $api->required_arg("password");
            pcu_change_password($json, $conn, $password);
            return $json;
        });
        $api->run();
    } break;
}
pcu_page_type(PCUPageType::Display);
?>
<html>
    <head>
        <title>PCU</title>
        <?php

            if(http_response_code() == 200) { ?>
                <meta http-equiv="refresh" content="0; url=/"/>
            <?php }
        ?>
    </head>
    <body>
        <?php
        echo $json->message;
        ?>
        <a href="/login.php">(Go back)</a>
    </body>
</html>
