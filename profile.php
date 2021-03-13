<?php
require("lib/pcu.php");
require_once("lib/generator.php");
$login = pcu_is_logged_in();
$userData = $_SESSION["userData"];

$generator = new PCUGenerator("User profile");
$generator->start_content();
?>

<h2>User Profile</h2>

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
        echo "</h3><span class='pcu-user-role'>" . $roles[$userData["role"]] . "</span>";
        ?>
    </div>
</div>
<?php
$generator->finish();
