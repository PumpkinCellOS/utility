<html>
    <head>
        <meta charset="utf-8">
        <title>Login | PumpkinCell.net</title>
        <link rel="stylesheet" href="/style.css"/>
        <link rel="stylesheet" href="/tilify.css"/>
    </head>
    <body>
        <h1><a href="/" class="title-link"><img src="/res/pumpkin2.png" style="height: 50px;"/></a><iframe width=395 height=50 style="overflow: hidden; border: none; float: right" src="/u/timer.html?embed=1&mode=3"></iframe></h1>
        <div id="content">
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
            <div id="footer-wrapper">
                <div id="footer">
                    <a href="https://github.com/sppmacd">PumpkinCell</a>&nbsp;(c) 2020-2021&nbsp;&#8226;&nbsp;<a href="/terms.php#use">Terms of Use</a>&nbsp;&#8226;&nbsp;<a href="/terms.php#privacy">Privacy Policy</a>
                </div>
            </div>
        </div>
        <script src="/tilify.js"/>
    </body>
</html>
