<?php
require_once("lib/generator.php");
$generator = new PCUGenerator("Terms of use");
$generator->start_content();
?>
<h2 id="terms">PumpkinCell.net Legal Information</h2>
<tlf-background-tile padding="big">
    <h3>Go to</h3>
    <ul>
        <li><a href="#terms">Terms of use</a></li>
        <li><a href="#privacy">Privacy policy</a></li>
    </ul>
</tlf-background-tile>
<tlf-background-tile padding="big">
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
    <h4>Changing of these terms</h4>
    <p>For now, these terms can change without notice. There is a date of last update in bottom of the page. The account notifications about terms change are planned.</p>
    <h3 id="privacy">Privacy Policy</h3>
    <h4>Summary</h4>
    <p>I <b>really</b> value your privacy, not like another sites. So, I don't store any data about you <i>except</i> when you are logged in.</p>
    <h4>When you are not logged in</h4>
    <p>As I said, we then don't store any personal data. Only if any error occurs, the anonymous log message (date, error message, site which caused an error) is saved on our server to allow me fix it.</p>
    <p>Example error log file extract:</p>
    <pre>
[Mon Mar 15 14:36:03 2021] [error] [pid 44839] mod_proxy_fcgi.c(859): AH01071: Got error 'PHP message: PHP Notice:  Undefined index: sort in /mnt/hdd_ext4/prog/Big/www/html/utility/hw-planner/api.php on line 23'
[Mon Mar 15 14:36:03 2021] [error] [pid 44839] mod_proxy_fcgi.c(859): AH01071: Got error 'PHP message: PHP Notice:  Undefined index: sort in /mnt/hdd_ext4/prog/Big/www/html/utility/hw-planner/api.php on line 23'
[Mon Mar 15 14:36:07 2021] [error] [pid 44839] mod_proxy_fcgi.c(859): AH01071: Got error 'PHP message: PHP Notice:  Undefined property: stdClass::$message in /mnt/hdd_ext4/prog/Big/www/html/api/login.php on line 60'
[Mon Mar 15 14:36:07 2021] [error] [pid 44839] mod_proxy_fcgi.c(859): AH01071: Got error 'PHP message: PHP Notice:  Undefined index: userData in /mnt/hdd_ext4/prog/Big/www/html/index.php on line 5PHP message: PHP Notice:  Trying to access array offset on value of type null in /mnt/hdd_ext4/prog/Big/www/html/index.php on line 123PHP message: PHP Notice:  Trying to access array offset on value of type null in /mnt/hdd_ext4/prog/Big/www/html/index.php on line 129'
[Mon Mar 15 14:36:12 2021] [error] [pid 44839] mod_proxy_fcgi.c(859): AH01071: Got error 'PHP message: PHP Notice:  session_start(): A session had already been started - ignoring in /mnt/hdd_ext4/prog/Big/www/html/lib/pcu.php on line 69PHP message: PHP Notice:  Undefined index: userData in /mnt/hdd_ext4/prog/Big/www/html/lib/pcu.php on line 70PHP message: PHP Notice:  Undefined property: stdClass::$message in /mnt/hdd_ext4/prog/Big/www/html/api/login.php on line 60'
[Mon Mar 15 14:36:13 2021] [error] [pid 44839] mod_proxy_fcgi.c(859): AH01071: Got error 'PHP message: PHP Notice:  Undefined property: stdClass::$message in /mnt/hdd_ext4/prog/Big/www/html/api/login.php on line 60'
[Mon Mar 15 14:36:13 2021] [error] [pid 44839] mod_proxy_fcgi.c(859): AH01071: Got error 'PHP message: PHP Notice:  Undefined index: userData in /mnt/hdd_ext4/prog/Big/www/html/index.php on line 5PHP message: PHP Notice:  Trying to access array offset on value of type null in /mnt/hdd_ext4/prog/Big/www/html/index.php on line 123PHP message: PHP Notice:  Trying to access array offset on value of type null in /mnt/hdd_ext4/prog/Big/www/html/index.php on line 129'
[Mon Mar 15 14:36:15 2021] [error] [pid 44839] mod_proxy_fcgi.c(859): AH01071: Got error 'PHP message: PHP Notice:  session_start(): A session had already been started - ignoring in /mnt/hdd_ext4/prog/Big/www/html/lib/pcu.php on line 69PHP message: PHP Notice:  Undefined index: userData in /mnt/hdd_ext4/prog/Big/www/html/lib/pcu.php on line 70PHP message: PHP Notice:  Undefined property: stdClass::$message in /mnt/hdd_ext4/prog/Big/www/html/api/login.php on line 60'
[Mon Mar 15 14:36:18 2021] [error] [pid 44839] mod_proxy_fcgi.c(859): AH01071: Got error 'PHP message: PHP Notice:  Undefined index: sort in /mnt/hdd_ext4/prog/Big/www/html/utility/hw-planner/api.php on line 23'
    </pre>
    <h4>When you are logged in</h4>
    <p>When you log in, we store only data you give yourself:</p>
    <ul>
        <li><b>Username</b> (required)</li>
        <li><b>SHA1 hashed password</b> (required)</li>
        <li><b>All data you give in services</b> (optional)</li>
    </ul>
    <h4>Cookies</h4>
    <p>The site use cookies only for keeping you logged in. They are not saved when you do not use a PumpkinCell.net account.</p>
    <p><b>NOTE:</b> An exception is Twitch Overlay, which uses cookies to store Twitch authentication data. See <a href="https://www.twitch.tv/p/en/legal/privacy-notice/">Twitch privacy notice</a> for more details.</p>
    <h4>All cookies that are used</h4>
    <table>
        <thead>
            <tr><td>Name</td><td>Expires</td><td>Purpose</td></tr>
        </thead>
        <tbody>
            <tr><td>PHPSESSID</td><td>Session</td><td>Keeps the session after logon</td></tr>
            <tr><td>auth_data</td><td>Session</td><td>In Twitch Overlay, stores Twitch authentication data</td></tr>
        </tbody>
    </table>
</tlf-background-tile>
<?php
$generator->finish();
?>
