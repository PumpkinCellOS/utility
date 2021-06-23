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
$generator->scripts = ["login.js", "profile.js"];
$generator->stylesheets = ["profile-style.css"];

if(!isset($qUserData))
    pcu_cmd_fatal("Invalid user");
    
$generator->start_content();
?>
<script>
window.queriedUID = <?php echo $qUid; ?>;
window.queriedData = <?php echo json_encode(pcu_safe_user_data($qUserData)); ?>;
</script>

<h2>User Profile</h2>

<?php if(pcu_is_logged_in() && $userData["id"] == $qUid) { ?>
    <div class="app-list small">
        <a is="tlf-button-tile" style="width: 25%" onclick="changePassword(); return false;">Change password</a>
    </div>
<?php } ?>

<tlf-background-tile padding="big">
    <?php
    
    echo "<h3><div id='property-displayName'></div><div id='username'>" . $qUserData["userName"];
    $roles = [
        "default" => ["User", "inherit"],
        "trusted" => ["Trusted user", "#ffaaaa"],
        "moderator" => ["Moderator", "#aaffff"],
        "member" => ["Staff member", "#aaaaff"],
        "owner" => ["Owner", "orange"],
        "admin" => ["Admin", "red"],
    ];
    $role = $roles[$qUserData["role"]];
    echo "</div></h3><p><span class='pcu-user-role' style='color: " . $role[1] . "'>" . $role[0] . "</span> • Joined " . $qUserData["createTime"] . "</p>";
    ?>
    <div id="property-description">
    </div>
</tlf-background-tile>
<?php
$generator->finish();
