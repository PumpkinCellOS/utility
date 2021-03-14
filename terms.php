<?php
require_once("lib/generator.php");
$generator = new PCUGenerator("Terms of use");
$generator->start_content();
?>
<h2 id="terms">Terms</h2>
<div class="background-tile">
    <div class="background-tile-padding">
        <h3>Go to:</h3>
        <ul>
            <li>Terms of use</li>
            <li>Privacy policy</li>
        </ul>
    </div>
</div>
<div class="background-tile">
    <div class="background-tile-big-padding">
        <h3 id="privacy">Terms of use</h3>
        <p>TODO</p>
        <h3 id="privacy">Privacy Policy</h3>
        <h4>Summary</h4>
        <p>We <b>really</b> value your privacy, not like another sites. So, we don't store any data about you <i>except</i> when you are logged in.</p>
        <p>When you log in, we store only data you give yourself:</p>
        <ul>
            <li>Username (required)</li>
            <li>SHA1 hashed password (required)</li>
            <li>All data you give in services (optional)</li>
        </ul>
        <h4>Cookies</h4>
        <p>We use cookies only for keeping you logged in. They are not saved when you do not use a PumpkinCell.net account.</p>
        <p><b>NOTE:</b> An exception is Twitch Overlay, which uses cookies to store Twitch authentication data. See <a href="https://www.twitch.tv/p/en/legal/privacy-notice/">Twitch privacy notice</a> for more details.</p>
    </div>
</div>
<?php
$generator->finish();
?>
