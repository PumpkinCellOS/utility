<?php

require_once("generator.php");

function pcu_cmd_fatal($msg, int $responseCode = 400)
{
    $json = new stdClass();
    pcu_cmd_error($json, $msg, $responseCode);
    echo json_encode($json);
    error_log("\nFATAL: HTTP $responseCode: $msg\n");
    exit;
}

function pcu_cmd_error($json, $msg, int $responseCode = 400)
{
    http_response_code($responseCode);
    $json->message = $msg;
    error_log("\nERROR: HTTP $responseCode: $msg\n");
}

function pcu_page_error(string $message = "Unknown error", int $responseCode = 400)
{
    http_response_code($responseCode);
    $generator = new PCUGenerator($message);
    $generator->start_content();

    ?>
    <h2>ERROR :(</h2>
    <div class="background-tile" style="background-color: var(--tlf-bg-red)">
        <div class="background-tile-padding">
            <p>Sorry, but we couldn't handle your request.</p>
            <p>Error code: <b>PCU: <?php echo $message; ?></b>.</p>
        </div>
    </div>
    <?php

    $generator->finish();
    exit;
}

function pcu_allow_insecure_operations()
{
    return substr($_SERVER['REMOTE_ADDR'],0,7) == "172.27." || substr($_SERVER['REMOTE_ADDR'],0,8) == "192.168." || $_SERVER['REMOTE_ADDR'] == "127.0.0.1";
}

$PCU_PATH = realpath(__DIR__ . "/..");
$PCU_MYSQL_PASSWORD = file_get_contents($GLOBALS["PCU_PATH"] . "/lib/mysql-password.txt");
if(!$PCU_MYSQL_PASSWORD)
    pcu_cmd_fatal("Failed to open database connection. Ensure that /lib/mysql_password.txt file was created.", 500);
$PCU_MYSQL_PASSWORD = substr($PCU_MYSQL_PASSWORD, 0, strlen($PCU_MYSQL_PASSWORD) - 1);

function pcu_path()
{
    return $GLOBALS["PCU_PATH"];
}
function pcu_mysql_password()
{
    return $GLOBALS["PCU_MYSQL_PASSWORD"];
}

function pcu_cmd_info($json, $msg)
{
    $json->message = $msg;
}

function pcu_cmd_connect_db($json, $db)
{
    if(!pcu_allow_insecure_operations())
    {
        pcu_page_error("You are using a non-private IP. Denying database operations");
    }

    $conn = new mysqli("localhost", "sppmacd", pcu_mysql_password(), $db);
    if($conn->connect_error) {
        $passwd = pcu_mysql_password();
        pcu_cmd_error($json, "Couldn't connect to database $passwd");
        return null;
    }
    return $conn;
}

function pcu_load_user_data($conn, $userName)
{
    $result = $conn->query("SELECT * FROM users WHERE userName='$userName'");

    if($result && $result->num_rows == 1)
    {
        return $result->fetch_assoc();
    }
    return null;
}

function pcu_is_logged_in()
{
    session_start();
    return isset($_SESSION["userData"]);
}

function pcu_is_logged_in_as($userName)
{
    session_start();
    $sess = $_SESSION["userData"];
    return isset($sess) && $sess->userName = $userName;
}

function pcu_mksession($json, $data)
{
    session_start();
    if($data["passwordExpired"])
    {
        pcu_page_error("Password expired. Ask admin for assistance", 400);
        return;
    }
    if(pcu_is_logged_in_as($data["userName"]))
    {
        pcu_cmd_info($json, "Already logged in");
        return;
    }
    $_SESSION["userData"] = $data;
}

function pcu_require_login()
{
    if(!pcu_is_logged_in())
    {
        pcu_page_error("A login is required to access this resource", 400);
    }
    return $_SESSION["userData"];
}

function pcu_role_less($_1, $_2)
{
    $roles = array("default", "member", "admin", "owner");
    $s1 = array_search($_1, $roles);
    $s2 = array_search($_2, $roles);
    if($s1 < $s2)
        return true;
    return false;
}

function pcu_require_role($roleName)
{
    $login = pcu_require_login();
    if(pcu_role_less($_SESSION["userData"]["role"], $roleName))
        pcu_page_error("You must be a(n) $roleName to access this resource");
    return $login;
}

function pcu_rmsession()
{
    session_start();
    $_SESSION = array();
    if (ini_get("session.use_cookies"))
    {
        $params = session_get_cookie_params();
        setcookie(session_name(), '', time() - 42000,
            $params["path"], $params["domain"],
            $params["secure"], $params["httponly"]
        );
    }
}

function pcu_mkuser($json, $conn, $userName, $password)
{
    session_start();
    
    if(strlen($password) < 1)
        pcu_cmd_fatal("Your password must not be empty");
        
    $hash = sha1($password);
    
    if(pcu_load_user_data($conn, $userName))
        pcu_cmd_fatal("The user already exists");
    
    // TODO: Actually make user!
    if(!$conn->query("INSERT INTO users (userName, password) VALUES ('$userName', '$hash')"))
        pcu_cmd_fatal("Failed to add user");
    
    pcu_authuser($json, $conn, $userName, $password);
}

function pcu_authuser($json, $conn, $userName, $password)
{
    $userName = $conn->real_escape_string($userName);
    $hash = sha1($password);
    
    $result = $conn->query("SELECT * FROM users WHERE userName='$userName' AND password='$hash'");

    if($result && $result->num_rows == 1)
        pcu_mksession($json, $result->fetch_assoc());
    else
        pcu_cmd_error($json, "Authentication failed");
}

?>
