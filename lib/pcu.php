<?php

require_once("generator.php");
//require_once("pcu-errors.php");

$sessionStarted = false;
function pcu_session_start()
{
    global $sessionStarted;
    if(!$sessionStarted)
    {
        session_start();
        $sessionStarted = true;
    }
}

abstract class PCUPageType
{
    const Display = "text/html";
    const API = "application/json";
}

function pcu_page_type(...$page_type)
{
    if(isset($page_type[0]))
    {
        $GLOBALS["page_type"] = $page_type[0];
        header("Content-type: $page_type[0]");
    }
    else
        return $GLOBALS["page_type"];
}

pcu_page_type(PCUPageType::API);

function pcu_cmd_fatal($msg, int $responseCode = 400)
{
    if(pcu_page_type() == PCUPageType::Display)
    {
        pcu_page_error("Fatal error: $msg", $responseCode);
    }
    else
    {
        $json = new stdClass();
        pcu_cmd_error($json, "Fatal error: $msg", $responseCode);
        echo json_encode($json);
    }
    exit;
}

function pcu_cmd_error($json, $msg, int $responseCode = 400)
{
    $json->message = $msg;
    http_response_code($responseCode);
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
    $conn = new mysqli("localhost", "sppmacd", pcu_mysql_password(), $db);
    if($conn->connect_error) {
        pcu_cmd_error($json, "Couldn't connect to database");
        return null;
    }
    return $conn;
}

function pcu_user_by_id($conn, $id)
{
    $result = $conn->query("SELECT * FROM users WHERE id='$id'");

    if($result && $result->num_rows == 1)
    {
        return $result->fetch_assoc();
    }
    return null;
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

function pcu_is_authenticated()
{
    pcu_session_start();
    return isset($_SESSION["userData"]);
}

function pcu_is_logged_in()
{
    return pcu_is_authenticated() && !$_SESSION["userData"]["passwordExpired"];
}

function pcu_user_session()
{
    pcu_session_start();
    return isset($_SESSION["userData"]) ? $_SESSION["userData"] : [];
}

function pcu_safe_user_session()
{
    pcu_session_start();
    return pcu_safe_user_data(isset($_SESSION["userData"]) ? $_SESSION["userData"] : []);
}

function pcu_safe_user_data($data)
{
    $data["password"] = "****";
    $data["email"] = "i.wont.give.you.hacker@example.com";
    $data["properties"] = "<optimized out>";
    return $data;
}

function pcu_is_logged_in_as($userName)
{
    pcu_session_start();
    $sess = $_SESSION["userData"];
    return pcu_is_logged_in() && $sess->userName == $userName;
}

function pcu_mksession($json, $data)
{
    pcu_session_start();
    
    // NOTE: The account is considered *authenticated*, but not *logged in*
    // if password expired. Therefore, only basic account operations
    // (logging out and changing password) are allowed. This can be checked
    // with pcu_is_authenticated().
    if($data["passwordExpired"])
    {
        // The client checks for this flag set to display
        // "change password" form.
        $json->passwordExpired = true;
    }

    if(pcu_is_logged_in())
    {
        pcu_cmd_info($json, "Already logged in");
        return;
    }
    $_SESSION["userData"] = $data;
}

function pcu_require_auth()
{
    if(!pcu_is_authenticated())
    {
        pcu_cmd_fatal("An authentication is required to access this resource", 401);
    }
    return $_SESSION["userData"];
}

function pcu_require_login()
{
    if(!pcu_is_logged_in())
    {
        pcu_cmd_fatal("A login is required to access this resource", 401);
    }
    return $_SESSION["userData"];
}

function pcu_roles()
{
    return [
        "default" =>   ["level" => 0, "displayName" => "User",          "color" => "inherit"],
        "trusted" =>   ["level" => 1, "displayName" => "Trusted user",  "color" => "#ffaaaa"],
        "moderator" => ["level" => 2, "displayName" => "Moderator",     "color" => "#aaffff"],
        "member" =>    ["level" => 3, "displayName" => "Staff member",  "color" => "#aaaaff"],
        "admin" =>     ["level" => 4, "displayName" => "Admin",         "color" => "#ff5555"],
        "owner" =>     ["level" => 5, "displayName" => "Owner",         "color" => "orange" ],
    ];
}

function pcu_role_by_name($name)
{
    return pcu_roles()[$name];
}

function pcu_role_less($_1, $_2)
{
    $roles = pcu_roles();
    $s1 = $roles[$_1];
    $s2 = $roles[$_2];
    if($s1["level"] < $s2["level"])
        return true;
    return false;
}

function pcu_require_role($roleName)
{
    $login = pcu_require_login();
    if(pcu_role_less($_SESSION["userData"]["role"], $roleName))
        pcu_cmd_fatal("You must be a(n) $roleName to access this resource", 403);
    return $login;
}

function pcu_rmsession()
{
    pcu_session_start();
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

function pcu_mkuser($json, $conn, $userName, $password, $email)
{
    pcu_session_start();
    
    if(strlen($password) < 1)
        pcu_cmd_fatal("Your password must not be empty");
        
    $hash = hash('sha256', $password);
    
    if(pcu_load_user_data($conn, $userName))
        pcu_cmd_fatal("The user already exists");
    
    if(!$conn->query("INSERT INTO users (userName, password, email, properties) VALUES ('$userName', '$hash', '$email', '{}')"))
        pcu_cmd_fatal("Failed to add user: " . $conn->error);
    
    pcu_authuser($json, $conn, $userName, $password);
}

function pcu_change_password($json, $conn, $password)
{
    pcu_session_start();
    
    if(strlen($password) < 1)
        pcu_cmd_fatal("Your password must not be empty");
        
    $hash = hash('sha256', $password);
    
    $uid = pcu_user_session()["id"];
    // NOTE: This clears passwordExpired flag.
    if(!$conn->query("UPDATE users SET password='$hash', passwordExpired='0' WHERE id='$uid'"))
        pcu_cmd_fatal("Failed to change password");
}

function pcu_change_email($json, $conn, $email)
{
    pcu_require_login();
    
    if(strlen($email) < 1)
        pcu_cmd_fatal("Your email must not be empty");
    
    $uid = pcu_user_session()["id"];
    if(!$conn->query("UPDATE users SET email='$email' WHERE id='$uid'"))
        pcu_cmd_fatal("Failed to change email");
}

function pcu_authuser($json, $conn, $userName, $password)
{
    $userName = $conn->real_escape_string($userName);
    $hash = hash('sha256', $password);
    
    $result = $conn->query("SELECT * FROM users WHERE userName='$userName' AND password='$hash'");
    
    if($result && $result->num_rows == 1)
        pcu_mksession($json, $result->fetch_assoc());
    else
        pcu_cmd_error($json, "Authentication failed");
}

?>
