<?php
require("../lib/pcu.php");
require_once("../lib/generator.php");
        
// TODO: Use API for this!
$json = new stdClass();
$qUid = $_REQUEST["uid"];
$userData = pcu_user_session();

if(!isset($qUid))
    $qUid = $userData["id"];
    
$conn = pcu_cmd_connect_db($json, "pcutil");
$qUserData = pcu_user_by_id($conn, $qUid);

$generator = new PCUGenerator("User profile");

if(!isset($qUserData))
    pcu_cmd_fatal("Invalid user");
    
$generator->start_content();
?>

<h2>User Profile</h2>

<?php if(pcu_is_logged_in() && $userData["id"] == $qUid) { ?>
    <div class="app-list small">
        <a is="tlf-button-tile" style="width: 25%" onclick="pcu_changePassword(); return false;">Change password</a>
    </div>
<?php } ?>

<tlf-background-tile padding="big">
    <?php
    
    echo "<h3>" . $qUserData["userName"];
    $roles = [
        "default" => "User",
        "trusted" => "Trusted user",
        "moderator" => "Moderator",
        "member" => "Staff member",
        "owner" => "Owner",
        "admin" => "Administration",
    ];
    echo "</h3><p class='pcu-user-role'>" . $roles[$qUserData["role"]] . "</p>";
    echo "</h3><p>Joined " . $qUserData["createTime"] . "</p>";
    ?>
</tlf-background-tile>

<script>
// FIXME: Stop copying it everywhere!!!
function api_doXHR(xhr, args, method, callback)
{
    xhr.onreadystatechange = function() {
        if(this.readyState == 4)
        {
            try
            {
                if(this.status == 200 && callback instanceof Function)
                    callback(JSON.parse(this.responseText)); 
                else
                {
                    var response = JSON.parse(this.responseText);
                    var serverMessage = response.message;
                    if(serverMessage === undefined)
                        serverMessage = "Server error :("
                    var msg = serverMessage + " (" + this.status + ")";
                    console.log(msg);
                }
            }
            catch(e)
            {
                console.log(e);
            }
        }
    };
    
    if(method == "POST")
        xhr.send(args); // args in JSON
    else
        xhr.send(); // args in URL
}

function apiCall(command, args, callback, method)
{
    var xhr = new XMLHttpRequest();
    
    var url = "/api/login.php";
    if(method != "POST")
        url += `?command=${command}&${args}`;
    else
    {
        args.command = command;
        args = JSON.stringify(args);
    }
    
    xhr.open(method, url);
    api_doXHR(xhr, args, method, callback);
}

function pcu_changePassword()
{
    tlfOpenForm([{type: "password", name: "password", placeholder: "Password"}, {type: "password", name: "password2", placeholder: "Repeat password"}], function(args) {
        if(args.password != args.password2)
            return false;
            
        apiCall("change-password", {"password": args.password}, null, "POST");
    }, {title: "Change password"});
}
</script>
<?php
$generator->finish();
