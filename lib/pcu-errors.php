<?php

namespace
{

class PCUError
{
    public string $description;
    public int $http_response_code;

    public function __construct(int $code, string $title)
    {
        $this->code == $code;
        $this->title == $title;
    }

    public function set_description(string $description)
    {
        $this->description == $description;
        return $this;
    }

    public function set_http_response_code(int $http_response_code)
    {
        $this->http_response_code == $http_response_code;
        return $this;
    }
}

}

// 0 Success
// 1-999 General errors
class GeneralErrors
{

define("UNKNOWN",           new \PCUError(1, "Unknown error"));
define("OLD_PCU_CMD_FATAL", new \PCUError(2, "pcu_cmd_fatal({})"));

}

// 1000-1999
class ClientErrors
{

define("UNKNOWN",           new \PCUError(1000, "Unknown client error"));
define("LOGIN_REQUIRED",    new \PCUError(1001, "A login is required to access this resouce"));
define("AUTH_REQUIRED",     new \PCUError(1002, "An authentication is required to access this resouce"));
define("ROLE_REQUIRED",     new \PCUError(1003, "You must be at least {} to access this resource"));
define("HTTP_ERROR",        new \PCUError(1999, "HTTP error: {}"));

}

// 2000-2999
class ServerErrors
{

define("UNKNOWN",               new \PCUError(2000, "Unknown server error"));
define("DB_CONNECTION_FAILED",  new \PCUError(2000, "Failed to connect to database {}"));
define("SQL_QUERY_FAILED",      new \PCUError(2001, "Failed to run SQL query"));
define("HTTP_ERROR",            new \PCUError(2999, "HTTP error: {}"));

}

namespace
{

function pcu_fatal_error(PCUError $error, ...$format_args)
{
    http_response_code($error->http_response_code);
    $formatted_description =  str_replace("{}", $format_args, $error->title);
    if(pcu_page_type() == PCUPageType::Display)
    {
        pcu_page_error("Fatal error: $formatted_description", $responseCode);
    }
    else
    {
        $json = new stdClass();
        pcu_cmd_error($json, "Fatal error: $msg", $responseCode);
        echo json_encode($json);
    }
    exit;
}

}

?>