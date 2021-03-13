<?php
require_once("lib/generator.php");
$generator = new PCUGenerator("Login");
$generator->start_content();
?>
    <h2>PumpkinCell.net Account</h2>
    <div class="background-tile">
        <div class="background-tile-padding text-align-center">
            <h3>Log In</h3>
            <form method="POST" action="/api/login.php">
                <input type="hidden" name="command" value="auth-user"></input>
                <input type="text" name="userName" placeholder="Username"></input><br>
                <input type="password" name="password" placeholder="Password"></input><br>
                <input type="submit" value="Login"></input><br>
            </form>
            <p>Don't have an account? <a href="/signup.php">Sign up</a> now</p>
        </div>
    </div>
<?php
$generator->finish();
    
