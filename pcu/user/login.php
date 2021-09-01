<?php
require_once("../lib/generator.php");
$generator = new PCUGenerator("Login");
$generator->scripts = ["login.js"];
$generator->header_title = "PumpkinCell.net Account";
$generator->start_content();
?>
    <div class="background-tile">
        <div class="background-tile-padding text-align-center">
            <h3>Welcome back! Please log in.</h3>
            <form method="POST" onsubmit="login(this['userName'].value, this['password'].value); return false;">
                <input type="hidden" name="command" value="auth-user"></input>
                <input type="text" name="userName" placeholder="Username"></input><br>
                <input type="password" name="password" placeholder="Password"></input><br>
                <input type="submit" value="Login"></input><br>
            </form>
            <p>Don't have an account? <a href="/pcu/user/signup.php">Sign up</a> now</p>
        </div>
    </div>
<?php
$generator->finish();
    
