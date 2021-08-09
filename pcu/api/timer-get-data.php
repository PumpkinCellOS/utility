<?php

http_response_code(410);
// TODO: Use WebSocket
echo "{\"status\":\"deprecated API\"}";
exit;

$AUTH_TOKEN = "ahv8-fhg7-abb7-a84n-hay8-abgh";

header('Content-Type: application/json');
$debug = "";
$admin_mode = 0;

// Check request type.
if($_SERVER["REQUEST_METHOD"] == "PUT")
{
  $admin_mode = 1;
}
else if($_SERVER["REQUEST_METHOD"] == "POST")
{
  $admin_mode = 0;
}
else
{
  http_response_code(405);
  echo "{\"status\":\"invalid method\"}";
  exit;
}

// Actually do operation.

switch($admin_mode)
{
case 0:
  $myfile = fopen("timer-data.json", "r") or die("Unable to open file!");
  $data = "{\"status\":\"success\",\"data\":";
  $data .= fread($myfile, filesize("timer-data.json"));
  $data .= "}";
  echo $data;
  fclose($myfile);
  break;
case 1:
  $myfile = fopen("timer-data.json", "w") or die("Unable to open file!");
  fwrite($myfile, file_get_contents("php://input"));
  echo "{\"status\":\"success\"}";
  fclose($myfile);
  break;
}

fclose($myfile);

echo $debug;

exit;
?>
500? sth is wrong with server, it should not be ever displayed
