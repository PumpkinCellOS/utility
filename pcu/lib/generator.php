<?php

require_once("pcu.php");

class PCUGenerator
{
    public array $stylesheets = [];
    public array $scripts = [];
    public string $main_stylesheet = "/style.css";
    public string $main_title = "PumpkinCell.net";
    public string $index_link = "/pcu";
    public bool $login_controls = true;

    private int $state = 0; // States: 0-Before HTML, 1-After HEAD, BODY opened, 2-After header, content opened, 3-Finished

    public function __construct(string $title = "", string $head_suffix = "", string $body_suffix = "")
    {
        $this->title = $title;
        $this->header_title = $title;
        $this->head_suffix = $head_suffix;
        $this->body_suffix = $body_suffix;
        pcu_page_type(PCUPageType::Display);
    }

    public function start_pre_content()
    {
        $this->state = 1;
        ?>
            <!DOCTYPE html>
            <html>
                <head>
                    <!-- Generated with <?php echo static::class; ?> -->
                    <meta charset="utf-8">
                    <title><?php if(strlen($this->title) == 0) echo $this->main_title; else echo $this->title . " | $this->main_title" ?></title>
                    <link rel="stylesheet" href="<?php echo $this->main_stylesheet; ?>"/>
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
            <header>
                <a href="<?php echo $this->index_link; ?>" class="title-link header-element">
                    <img id="logo-mobile" src="/res/pumpkin.png" style="height: 50px;"/>
                    <img id="logo" src="/res/pumpkin2-beta.png" style="height: 50px; margin-left: 30px;"/>
                </a>
                <h1 class="header-element">
                    <?php echo $this->header_title; ?>
                </h1>
                <div id="header-controls-box">
                    <?php
                        if($this->login_controls)
                        {
                            if(pcu_is_authenticated())
                            {
                                if($this->userData["emailVerificationToken"] != "")
                                    echo "<a class='email-verification' title='You need to verify your e-mail address. Click for more info' href='/pcu/user/profile.php'>⚠</a>";
                                echo "<div class='title-link-right'><a href='/pcu/user/profile.php?uid={$this->userData["id"]}'>{$this->userData["userName"]}</a></div>";
                                echo "<div class='title-link-right' style='font-size: 100%'><a onclick='tlfApiCall(`GET`,`/api/login.php`,`remove-session`, {}, function() { window.location.href = `/pcu`; })'>(Log out)</a></div>";
                            }
                            else
                            {
                                echo "<div class='title-link-right'><a href='/pcu/user/login.php'>Log in</a></div>";
                                echo "<div class='title-link-right'><a href='/pcu/user/signup.php'>Sign up</a></div>";
                            }
                        }
                    ?>
                    <!--<iframe width=395 height=50 style="overflow: hidden; border: none;" src="/u/timer.html?embed=1&mode=3"></iframe>-->
                </div>
            </header>
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
                                ©&nbsp;<a href="https://github.com/sppmacd">PumpkinCell</a>&nbsp;<span class="hide-on-mobile"
                                >2020-2022&nbsp;</span>&#8226;&nbsp;
                                <a href="/terms.php#use">Terms</a>&nbsp;&#8226;&nbsp;
                                <a href="/terms.php#privacy">Privacy</a>&nbsp;&#8226;&nbsp;
                                <a href="https://github.com/PumpkinCellOS/utility">GitHub</a>
                                <span class="hide-on-mobile">&nbsp;&#8226;&nbsp;
                                    <b>Last update:&nbsp;</b>
                                    <?php echo date("F d Y H:i:s.", getlastmod()); ?>
                                </span>
                            </div>
                        </div>
                    </div>
                    <div id="tlf-notification-box">
                    </div>
                    <script src="/tilify/tilify.js"></script>
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

class PCUGeneratorStatic extends PCUGenerator
{
    public function __construct(string $title = "", string $head_suffix = "", string $body_suffix = "")
    {
        parent::__construct($title, $head_suffix, $body_suffix);
        $this->main_stylesheet = "/style.css";
        $this->main_title = "PumpkinCell";
        $this->login_controls = false;
        $this->index_link = "/";
    }
}

/*
-- PCU Generator --
It's used to generate PCU pages.

## Usage

// Simple
$generator = new PCUGenerator();
$generator->start_content();
?>
... content ...
<?php
$generator->finish();

// With fullscreen forms
$generator = new PCUGenerator("Example");
$generator->start_pre_content();
?>
... fullscreen forms etc. ...
<?php
$generator->start_content();
?>
... other content ..
<?php
$generator->finish();

## Properties
* body_suffix - A HTML appended to end of <body>
* head_suffix - A HTML appended to end of <head>
* header_title - A title used on header, $this->title by default
* index_link - A href of header image link, "/pcu" by default
* login_controls - Whether to display login controls, true by default
* main_stylesheet - A single stylesheet that is linked first, "style.css" by default
* main_title - A value used after "|" character in <title>, "PumpkinCell.net" by default
* scripts - A list of JS scripts to link, empty by default (Tilify is linked always)
* stylesheets - A list of additional stylesheets to link, empty by default
* title - A title used before "|" character in <title>

*/
?>
