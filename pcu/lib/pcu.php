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
    $generator->header_title = "Error :(";
    $generator->start_content();

    ?>
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
$PCU_MYSQL_PASSWORD = file_get_contents(__DIR__ . "/mysql-password.txt");
if(!$PCU_MYSQL_PASSWORD)
    pcu_cmd_fatal("Failed to open database connection. Ensure that /lib/mysql_password.txt file was created.", 500);

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

function pcu_current_uid()
{
    $session = pcu_user_session();
    return $session ? $session["id"] : 0;
}

function pcu_user_by_id($conn, $id)
{
    $result = $conn->query("SELECT * FROM users WHERE id='$id'");

    if($result && $result->num_rows == 1)
    {
        $row = $result->fetch_assoc();
        if($row["public"] != "1" && $row["id"] != pcu_current_uid())
            return null;
        return $row;
    }
    return null;
}

function pcu_load_user_data($conn, $userName)
{
    $result = $conn->query("SELECT * FROM users WHERE userName='$userName'");

    if($result && $result->num_rows == 1)
    {
        $row = $result->fetch_assoc();
        if($row["public"] != "1" && $row["id"] != pcu_current_uid())
            return null;
        return $row;
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
    $data["emailVerificationToken"] = "****";
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
    
    if(strlen($userName) > 16)
        pcu_cmd_fatal("Your username must be not longer than 16 characters, got '$userName'");
    if(preg_match("/[^a-zA-Z0-9_-]+/", $userName))
        pcu_cmd_fatal("Your username must contain only letters, digits, '_' or '-', got '$userName'");
    if($email != "" && !preg_match("/[a-zA-Z0-9-.]*@[a-zA-Z0-9-.]*/", $email))
        pcu_cmd_fatal("Invalid e-mail given, got '$email'");
    if(strlen($password) < 3)
        pcu_cmd_fatal("Your password's length must be greater than 3");
        
    $hash = hash('sha256', $password);
    
    $existingUser = $conn->query("SELECT id FROM users WHERE userName='$userName'");
    if($existingUser && $existingUser->num_rows >= 1)
        pcu_cmd_fatal("The user already exists");
    
    $token = strlen($email) == 0 ? "" : pcu_random_token();

    if(!$conn->query("INSERT INTO users (userName, password, email, properties, emailVerificationToken) VALUES ('$userName', '$hash', '$email', '{}', '$token')"))
        pcu_cmd_fatal("Failed to add user: " . $conn->error);

    pcu_authuser($json, $conn, $userName, $password);
    if($token != "")
    {
        $json->verifyEmail = true;
        pcu_send_verification_token();
    }
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
    if($email == pcu_user_session()["email"])
        pcu_cmd_fatal("Email did not change");
    $token = $email == "" ? "" : pcu_random_token();

    $uid = pcu_user_session()["id"];
    // TODO: Consider token expiring after logout
    if(!$conn->query("UPDATE users SET email='$email',emailVerificationToken='$token' WHERE id='$uid'"))
        pcu_cmd_fatal("Failed to change email");
    $_SESSION["userData"]["emailVerificationToken"] = $token;
    $_SESSION["userData"]["email"] = $email;
    if($token != "")
        $json->verifyEmail = true;
}

function pcu_user_needs_to_verify_email()
{
    pcu_require_auth();
    return pcu_user_session()["emailVerificationToken"] != "";
}

function pcu_send_verification_token()
{
    if(!pcu_user_needs_to_verify_email())
        pcu_cmd_fatal("No need to send any token", 400);

    $token = urlencode(pcu_user_session()["emailVerificationToken"]);
    $userName = pcu_user_session()["userName"];
    # It will redirect to HTTPS if possible anyway.
    $link = "http://" . $_SERVER['HTTP_HOST'] . "/pcu/api/login.php?command=verify-token&token=$token";

    error_log("sending verification token to " . pcu_user_session()["email"]);
    return mail(pcu_user_session()["email"], "PumpkinCell Utility - Verification link",
        "Someone have just used your e-mail address on PumpkinCell.net. You
        need to verify your identity with going to verification link: <a href='$link'>$link</a>.
        If it was not you, you can safely ignore this email.<br>(User name: $userName)", ["From" => "noreply@pumpkincell.duckdns.org", "Content-Type" => "text/html"]);
}

function pcu_verify_token($givenToken)
{
    pcu_page_type(PCUPageType::Display);
    if(!pcu_user_needs_to_verify_email())
        pcu_cmd_fatal("No need to verify any token", 400);
    
    $token = pcu_user_session()["emailVerificationToken"];
    if($token == $givenToken)
    {
        // TODO: Make this json a non-required arg
        $json = new stdClass();
        $conn = pcu_cmd_connect_db($json, "pcutil");
        if(!$conn)
            exit;

        $uid = pcu_user_session()["id"];
        if(!$conn->query("UPDATE users SET emailVerificationToken='' WHERE id='$uid'"))
            pcu_cmd_fatal("Query failed", 500);
        
        $_SESSION["userData"]["emailVerificationToken"] = "";
        header("Location: /pcu/user/verify-email.php?success=1");
        return;
    }
    pcu_cmd_fatal("Invalid token", 400);
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

function pcu_get_current_domain_data($conn)
{
    $userData = pcu_require_login();
    if($userData["domain"] == "")
        pcu_cmd_fatal("User is not in any domain");

    $did = $conn->real_escape_string($userData["domain"]);
    $result = $conn->query("SELECT * FROM domains WHERE id='$did'");
    
    if($result && $result->num_rows == 1)
        return $result->fetch_assoc();
    else
        pcu_cmd_error($json, "User's domain doesn't exist");
}

function pcu_random_token()
{
    $out = "";
    for($x = 0; $x < 64; $x++)
    {
        $i = random_int(0, 65536);
        $out .= chr($i & 0xFF);
        $out .= chr($i >> 8);
    }
    return base64_encode($out);
}

function pcu_validate_relative_path($path)
{
    $output = explode('/', $path);
    foreach($output as $dir)
    {
        if($dir == ".." || $dir == "")
            pcu_cmd_fatal("Invalid path: $path", 400);
    }
}

function pcu_download_file($fileName)
{
    $fileSize = filesize($fileName);
    $basename = basename($fileName);
        
    $exists = stat($fileName);
    if(!$exists)
        pcu_cmd_fatal("File doesn't exist: $basename", 404);

    header("Content-Disposition: inline; filename=\"${basename}\"");
    header("Content-Length: ${fileSize}");
    pcu_page_type("application/octet-stream");

    $fd = @fopen($fileName, "r");
    while(!@feof($fd))
    {
        $buff = @fread($fd, 16384);
        echo $buff;
    }
}

function pcu_user_define_attribute($conn, $name, $public)
{
    $name = $conn->real_escape_string($name);
    $public = $conn->real_escape_string($public);
    // FIXME: Handle errors
    $conn->query("INSERT INTO `userAttributesDefs` (`name`, `public`) VALUES ('$name', '$public')");
}

function pcu_user_find_attribute_def($conn, $name)
{
    $result = $conn->query("SELECT * FROM `userAttributesDefs` WHERE `name` = '$name'");
    if(!$result || $result->num_rows == 0)
        return null;
    return $result->fetch_assoc();
}

function pcu_user_set_attribute($conn, $uid, $name, $value)
{
    $uid = $conn->real_escape_string($uid);
    $name = $conn->real_escape_string($name);
    $value = $conn->real_escape_string($value);
    $currentUID = pcu_current_uid();
    if($currentUID != $uid)
        pcu_cmd_fatal("Access denied to set attribute $name", 403);
    
    $attr_def = pcu_user_find_attribute_def($conn, $name);
    if(!$attr_def)
    {
        // TODO: Specify attribute publicness somehow???
        pcu_user_define_attribute($conn, $name, 1);
        // FIXME: Double SQL query??
        $attr_def = pcu_user_find_attribute_def($conn, $name);
    }
    $attr_def_id = $attr_def["id"];

    $result = $conn->query("INSERT INTO `userAttributes` (userId, def, value) VALUES ('$currentUID', '$attr_def_id', '$value')
        ON DUPLICATE KEY UPDATE value = VALUES(value)");
    if(!$result)
        pcu_cmd_fatal("Failed to set attribute: " . $conn->error, 500);
}

function pcu_user_get_attribute($conn, $uid, $name)
{
    $name = $conn->real_escape_string($name);
    $uid = $conn->real_escape_string($uid);
    
    $attr_def = pcu_user_find_attribute_def($conn, $name);
    if(!$attr_def)
        return "";
    $attr_def_id = $attr_def["id"];

    $currentUID = pcu_current_uid();
    if($attr_def["public"] != '1' && $uid != $currentUID)
        pcu_cmd_fatal("Access denied to get attribute $name", 403);

    $result = $conn->query("SELECT `value`
        FROM `userAttributes`
        WHERE `def`=$attr_def_id AND `userId`=$uid");
    if($result->num_rows == 0)
        return "";
    $row = $result->fetch_assoc();
    return $row["value"];
}

?>
