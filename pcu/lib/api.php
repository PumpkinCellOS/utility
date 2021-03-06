<?php

require_once("pcu.php");

class PCUAPI
{
    private $commands = [];
    private $args;
    private string $data;
    private bool $requireMethod;

    // handler is function(PCUAPI $api), returns array
    // that will be encoded to JSON.
    function register_command($name, $handler)
    {
        $this->commands[$name] = $handler;
    }
    function register_unimplemented_command($name)
    {
        $this->commands[$name] = function($api) { pcu_cmd_fatal("Unimplemented command: '$name'", 501); };
    }
    
    function run_command($command, $args, $requireMethod = true)
    {
        $oldArgs = $this->args;
        $this->args = $args;
        $this->requireMethod = $requireMethod;
        $handler = $this->commands[$command];
        
        if(!isset($handler))
        {
            error_log("Invalid API command: $command");
            return false;
        }
            
        $out = $handler($this);
        $this->args = $args;
        return $out;
    }

    function args()
    {
        return $this->args;
    }

    function data()
    {
        return $this->data;
    }
    
    function run()
    {
        // use JSON for POST, URL for GET/PUT
        if($_SERVER["REQUEST_METHOD"] == "GET" || $_SERVER["REQUEST_METHOD"] == "PUT")
            $args = $_REQUEST;
        else if($_SERVER["REQUEST_METHOD"] == "POST")
            $args = json_decode(file_get_contents("php://input"), true);
        
        if($_SERVER["REQUEST_METHOD"] == "PUT")
        {
            // FIXME: Enforce only small files that fit into one cloud chunk (<8MB)
            $this->data = file_get_contents("php://input");
        }
        
        $command = $args["command"];
        $out = $this->run_command($command, $args);
        if($out === false)
            pcu_cmd_fatal("Invalid command: '$command'");
        echo json_encode($out);
    }
    
    function required_arg($arg)
    {
        $val = $this->args[$arg];
        if(!isset($val))
            pcu_cmd_fatal("Missing required argument for command: '$arg'", 400);
        return $val;
    }
    
    function optional_arg($arg, $default)
    {
        $val = $this->args[$arg];
        if(!isset($val))
            return $default;
        return $val;
    }
    
    function require_method($method)
    {
        if($this->requireMethod && $_SERVER["REQUEST_METHOD"] != $method)
            pcu_cmd_fatal("Method not allowed: '" . $_SERVER["REQUEST_METHOD"] . "', required: '$method'", 405);
    }
    
    function require_database($name)
    {
        // TODO: Cache database connections
        $json = new stdClass();
        $conn = pcu_cmd_connect_db($json, $name);
        if($conn == null)
            pcu_cmd_fatal("Failed to connect to database '$name', which is required by command");
        return $conn;
    }

    function require_auth()
    {
        return pcu_require_auth();
    }

    function require_login()
    {
        return pcu_require_login();
    }

    function require_domain()
    {
        $userData = pcu_require_login();
        if(strlen($userData["domain"]) == 0)
            pcu_cmd_fatal("User is not in any domain");
        return $userData["domain"];
    }

    function require_domain_owner()
    {
        $userData = pcu_require_login();
        $did = $this->require_domain();
        $uid = $userData["id"];
        $conn = $this->require_database("pcutil");
        $ownerId = pcu_get_current_domain_data($conn)["ownerId"];
        if($ownerId != $uid)
            pcu_cmd_fatal("User needs to be a domain owner ($ownerId), is $uid");
        return $userData["domain"];
    }

    function require_role(string $role)
    {
        return pcu_require_role($role);
    }
}

?>
