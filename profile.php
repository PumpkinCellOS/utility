<?php
require("lib/pcu.php");
require_once("lib/generator.php");
        
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

<div class="background-tile">
    <div class="background-tile-padding">
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
    </div>
</div>

<script>
function pcu_changePassword()
{
    alert("not implemented");
}
</script
<?php
$generator->finish();
