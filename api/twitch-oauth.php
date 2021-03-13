<?php
  function redirect_page($data)
  {
    if(!setcookie("auth-data", $data, [
      'expires' => 2147483647,
      'samesite' => 'Lax',
      'path' => '/',
      'domain' => '192.168.1.36'
    ]))
    {
      http_response_code(405);
      echo "{\"status\":\"failed to set cookie\"}";
      exit;
    }
    ?>
    <html>
      <head>
        <meta http-equiv="refresh" content="0; url=/u/twitch-overlay.html"/>
        <title>Finally, redirecting to overlay...</title>
      </head>
      <body>
        <div>
          Finally, redirecting to overlay...
        </div>
      </body>
    </html>
    <?php
  }

  function parse_url_query($url)
  {
    $url = str_replace("#", "?", $url);
    $url_parts = parse_url($url);
    parse_str($url_parts['query'], $query_parts);
    return $query_parts;
  }
  
  function post($url, array $post = NULL, array $options = array())
  {
      $defaults = array(
          CURLOPT_POST => 1,
          CURLOPT_HEADER => 0,
          CURLOPT_URL => $url,
          CURLOPT_FRESH_CONNECT => 1,
          CURLOPT_RETURNTRANSFER => 1,
          CURLOPT_FORBID_REUSE => 1,
          CURLOPT_TIMEOUT => 4,
          CURLOPT_POSTFIELDS => http_build_query($post)
      );

      $ch = curl_init();
      curl_setopt_array($ch, ($options + $defaults));
      if(! $result = curl_exec($ch))
      {
          trigger_error(curl_error($ch));
      }
      curl_close($ch);
      return $result;
  } 

  if($_SERVER["REQUEST_METHOD"] != "GET")
  {
    http_response_code(405);
    echo "{\"status\":\"invalid method\"}";
    exit;
  }
  
  $query = parse_url_query($_SERVER["REQUEST_URI"]);
  $code = $query["code"];
  
  if(!isset($code))
  {
    http_response_code(405);
    echo "{\"status\":\"invalid request\"}";
    exit;
  }
  $secret = trim(file_get_contents("../lib/twitch-secret.txt"));
  
  $data = post("https://id.twitch.tv/oauth2/token", array(
    "client_id" => "0zg483cmx5e5tctu24zovgt6yy0y5d",
    "client_secret" => $secret,
    "code" => $code,
    "grant_type" => "authorization_code",
    "redirect_uri" => "http://192.168.1.36/api/twitch-oauth.php/"
  ));

  echo $data;
  redirect_page($data);
?>
