<?php
require_once("lib/generator.php");
$generator = new PCUGenerator("Terms of use");
$generator->start_content();
?>
<h2 id="terms">PumpkinCell.net Legal Information</h2>
<div class="background-tile">
    <div class="background-tile-padding">
        <h3>Go to:</h3>
        <ul>
            <li><a href="#terms">Terms of use</a></li>
            <li><a href="#privacy">Privacy policy</a></li>
        </ul>
    </div>
</div>
<div class="background-tile">
    <div class="background-tile-big-padding">
        <h3 id="terms">Terms of use</h3>
        <p>All of our services are <b>free</b> and <a href="https://github.com/PumpkinCellOS/utility">open source</a>, licensed under MIT License. So, no secrets, you can just check the code :)</p>
        <h4>License</h4>
        <p><b>MIT License</b></p>
        <p>Copyright © 2020-2021 PumpkinCell</p>

        <p>Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the “Software”), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:</p>

        <p>The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.</p>

        <p>THE SOFTWARE IS PROVIDED “AS IS”, WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.</p>
        <h4>Account</h4>
        <p><a href="/signup.php">Creating an account</a> is also <b>free</b>. When you create a PumpkinCell.net account, you must give your username and password. The username is used for logging in. Note that e-mail address is not supported, so we don't have any way to authorize sign-ups. If you forgot a password, <a href="mailto:sppmacd@pm.me">get in touch</a> with me.</p>
        <p><b>TODO:</b> It's not uploaded to gh for now, since I'm not sure if there are no passwords hardcoded.</p>
        <h3 id="privacy">Privacy Policy</h3>
        <h4>Summary</h4>
        <p>We <b>really</b> value your privacy, not like another sites. So, we don't store any data about you <i>except</i> when you are logged in.</p>
        <p>When you log in, we store only data you give yourself:</p>
        <ul>
            <li><b>Username</b> (required)</li>
            <li><b>SHA1 hashed password</b> (required)</li>
            <li><b>All data you give in services</b> (optional)</li>
        </ul>
        <h4>Cookies</h4>
        <p>We use cookies only for keeping you logged in. They are not saved when you do not use a PumpkinCell.net account.</p>
        <p><b>NOTE:</b> An exception is Twitch Overlay, which uses cookies to store Twitch authentication data. See <a href="https://www.twitch.tv/p/en/legal/privacy-notice/">Twitch privacy notice</a> for more details.</p>
        <p><b>Last update: </b><?php echo date("F d Y H:i:s.", getlastmod()); ?></p>
    </div>
</div>
<?php
$generator->finish();
?>
