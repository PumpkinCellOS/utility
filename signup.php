<?php
require_once("lib/generator.php");
$generator = new PCUGenerator("Sign up");
$generator->start_content();
?>
    <h2>PumpkinCell.net Account</h2>
    <div class="background-tile">
        <!-- TODO: Use custom elements! -->
        <div class="background-tile-padding text-align-center">
            <h3>Sign Up</h3>
            <form method="POST" action="/api/login.php" onsubmit="return validate(this)">
                <input type="hidden" name="command" value="create-user"></input>
                <input type="email" name="userName" placeholder="E-mail address"></input><br>
                <input type="text" name="userName" placeholder="Username (will be used to log in)"></input><br>
                <input type="password" name="password" placeholder="Password"></input><br>
                <input type="password" name="password2" placeholder="Retype password"></input><br>
                <input type="submit" value="Create Account"></input>
            </form>
            <p>Already have an account? <a href="/login.php">Log in</a> here.</p>
            <p>By creating an account, you agree to <a href="/terms.php#use">terms of use</a> and <a href="/terms.php#privacy">privacy policy</a>.</p>
            <p><b>Note that email address is not really required for now :)</b></p>
        </div>
    </div>
    
    <script>
        function validate(form)
        {
            var passwd = form["password"].value;
            if(form["password2"].value != passwd)
            {
                console.log(form["password2"].value);
                console.log(passwd);
                alert("Passwords must be identical!");
                return false;
            }
            if(passwd.length < 2)
            {
                alert("Password must be at least 3 characters long");
                return false;
            }
            return true;
        }
    </script>
<?php
$generator->finish();
