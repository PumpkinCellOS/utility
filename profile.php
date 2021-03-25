<?php
require("lib/pcu.php");
require_once("lib/generator.php");
$login = pcu_is_logged_in();
$userData = $_SESSION["userData"];

$generator = new PCUGenerator("User profile");
$generator->start_content();
?>

<h2>User Profile</h2>

<div class="app-list small">
    <a is="tlf-button-tile" style="width: 25%" onclick="pcu_changePassword(); return false;">Change password</a>
</div>

<div class="background-tile">
    <div class="background-tile-padding">
        <?php
        echo "<h3>" . $userData["userName"];
        $roles = [
            "default" => "User",
            "trusted" => "Trusted user",
            "moderator" => "Moderator",
            "member" => "Staff member",
            "owner" => "Owner",
            "admin" => "Administration",
        ];
        echo "</h3><p class='pcu-user-role'>" . $roles[$userData["role"]] . "</p>";
        echo "</h3><p>Joined " . $userData["createTime"] . "</p>";
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
