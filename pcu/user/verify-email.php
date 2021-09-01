<?php
// FIXME: Add these notifications to signup.php (to avoid reloads)
require_once("../lib/generator.php");
$generator = new PCUGenerator("Email verification");
$generator->scripts = ["login.js"];
$generator->header_title = "PumpkinCell.net Account";
$generator->start_content();
if($_REQUEST["success"])
{
    ?>
    <tlf-background-tile style="--tlf-color-widget-bg: var(--tlf-bg-dark-green)">
        Verification succeeded! <a href="/pcu">Go to main page</a>
    </tlf-background-tile>
    <?php
}
else
{
    ?>
    <tlf-background-tile style="--tlf-color-widget-bg: var(--tlf-bg-dark-yellow)">
        You need to verify your e-mail address. We have sent you a notification. If you don't see it, try to check in spam or <a onclick="resendVerificationToken()">resend</a>
    </tlf-background-tile>
    <?php
}
$generator->finish();
    
