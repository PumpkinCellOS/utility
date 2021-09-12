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
$queryingSelf = (pcu_is_logged_in() && $userData["id"] == $qUid);

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

<?php 
if($queryingSelf)
{
    $currentPublicString = $qUserData["public"] ? "<b>public</b> - anyone who knows your username can see it" : "<b>private</b> - only you can see it";
    $oppositePublicString = $qUserData["public"] ? "private" : "public";
    ?>
    <div class="app-list small">
        <a is="tlf-button-tile" style="width: 25%" onclick="changePassword(); return false;">Change password</a>
        <a is="tlf-button-tile" style="width: 25%" onclick="changeEmail(); return false;">Change e-mail address</a>
    </div>
    <tlf-background-tile style="--tlf-color-widget-bg: var(<?php echo $qUserData["public"] ? "--tlf-bg-dark-green" : "--tlf-bg-dark-red"; ?>)">
    Your profile is <?php echo $currentPublicString; ?>. <a onclick="switchPublicState()">Make <?php echo $oppositePublicString ?></a>
    </tlf-background-tile>
    <?php
    if(pcu_user_needs_to_verify_email())
    {
        ?>
        <tlf-background-tile style="--tlf-color-widget-bg: var(--tlf-bg-dark-yellow)">
            You need to verify your e-mail address. We have sent you a notification. If you don't see it, try to check in spam or <a onclick="resendVerificationToken()">resend</a>
        </tlf-background-tile>
        <?php
    }
}
?>
<tlf-background-tile padding="big">
    <?php
    $role = pcu_role_by_name($qUserData["role"]);
    echo "<h3><div id='property-displayName' style='color: " . $role["color"] . "'></div><div id='username'>" . $qUserData["userName"];
    echo "</div></h3><p><span class='pcu-user-role' style='color: " . $role["color"] . "'>" . $role["displayName"] . "</span> • Joined " . $qUserData["createTime"] . "<span id='property-status'></span></p>";
    if($queryingSelf && strlen($qUserData["email"]) > 0)
        echo "<p>E-mail: " . $qUserData["email"] . "</p>";
    ?>
    <div id="domain-info"></div>
    <div id="property-description">
    </div>
</tlf-background-tile>
<?php
$generator->finish();
