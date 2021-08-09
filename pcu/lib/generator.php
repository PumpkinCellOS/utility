<?php

require_once("pcu.php");

class PCUGenerator
{
    public array $stylesheets = [];
    public array $scripts = [];
    private int $state = 0; // States: 0-Before HTML, 1-After HEAD, BODY opened, 2-After header, content opened, 3-Finished

    public function __construct(string $title = "", string $head_suffix = "", string $body_suffix = "")
    {
        $this->title = $title;
        $this->head_suffix = $head_suffix;
        $this->body_suffix = $body_suffix;
        pcu_page_type(PCUPageType::Display);
    }

    public function start_pre_content()
    {
        $this->state = 1;
        ?>
            <html>
                <head>
                    <!-- Generated with PCUGenerator -->
                    <meta charset="utf-8">
                    <title><?php if(strlen($this->title) == 0) echo "PumpkinCell.net"; else echo $this->title . " | PumpkinCell.net" ?></title>
                    <link rel="stylesheet" href="/pcu/style.css"/>
                    <meta name="viewport" content="width=device-width, initial-scale=1">
                    <?php 
                        foreach($this->stylesheets as $stylesheet)
                            echo "<link rel='stylesheet' href=$stylesheet>";
                        echo $this->head_suffix;
                    ?>
                    <script>
                    window.PCU_USER_DATA = <?php echo json_encode(pcu_safe_user_session()); ?>
                    </script>
                </head>
                <body>
        <?php
    }
    
    public function start_content()
    {
        if($this->state == 0)
            $this->start_pre_content();
          
        $this->state = 2;
        $this->userData = pcu_user_session();
        ?>
            <!-- TODO: Use custom elements -->
            <h1>
                <a href="/pcu" class="title-link">
                    <img id="logo" src="/res/pumpkin2-beta.png" style="height: 50px"/>
                </a>
                <div style="float: right; display: flex; align-items: center">
                    <?php
                        if(pcu_is_authenticated())
                        {
                            echo "<div class='title-link-right'><a href='/pcu/user/profile.php?uid={$this->userData["id"]}'>{$this->userData["userName"]}</a></div>";
                            echo "<div class='title-link-right'><a onclick='tlfApiCall(`GET`,`/api/login.php`,`remove-session`, {}, function() { window.location.href = `/`; })'>Log out</a></div>";
                        }
                        else
                        {
                            echo "<div class='title-link-right'><a href='/pcu/user/login.php'>Log in</a></div>";
                            echo "<div class='title-link-right'><a href='/pcu/user/signup.php'>Sign up</a></div>";
                        }
                    ?>
                    <!--<iframe width=395 height=50 style="overflow: hidden; border: none;" src="/u/timer.html?embed=1&mode=3"></iframe>-->
                </div>
            </h1>
            <div id="content">
        <?php
    }
    
    public function finish()
    {  
        $this->state = 3;
        ?>
                        <!-- TODO: Use custom elements -->
                        <div id="footer-wrapper">
                            <div id="footer">
                                ©&nbsp;<a href="https://github.com/sppmacd">PumpkinCell</a>&nbsp;2020-2021&nbsp;&#8226;&nbsp;<a href="/terms.php#use">Terms</a>&nbsp;&#8226;&nbsp;<a href="/terms.php#privacy">Privacy</a>&nbsp;&#8226;&nbsp;<a href="https://github.com/PumpkinCellOS/utility">GitHub</a>&nbsp;&#8226;&nbsp;<b>Last update:&nbsp;</b><?php echo date("F d Y H:i:s.", getlastmod()); ?>
                            </div>
                        </div>
                    </div>
                    <div id="tlf-notification-box">
                    </div>
                    <script src="/pcu/tilify.js"></script>
                    <?php
                        foreach($this->scripts as $script)
                            echo "<script src=$script></script>";
                        echo $this->body_suffix;
                    ?>
                </body>
            </html>
        <?php
    }
}

/*
-- PCU Generator --
It's used to generate PCU pages.

Usage:

// Simple
$generator = new PCUGenerator();
$generator->start_content();
?>
... content ...
<?php
$generator->finish();

// With fullscreen forms
$generator = new PCUGenerator();
$generator->start_pre_content();
?>
... fullscreen forms ...
<?php
$generator->start_content();
?>
<h2>test</h2>
... other content ..
<?php
$generator->finish();

*/
?>
