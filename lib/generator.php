<?php
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
    }

    public function start_pre_content()
    {
        $this->state = 1;
        ?>
            <html>
                <head>
                    <meta charset="utf-8">
                    <title><?php if(strlen($this->title) == 0) echo "PumpkinCell.net"; else echo $this->title . " | PumpkinCell.net" ?></title>
                    <link rel="stylesheet" href="/style.css"/>
                    <?php 
                        foreach($this->stylesheets as $stylesheet)
                            echo "<link rel='stylesheet' href=$stylesheet>";
                        echo $this->head_suffix;
                    ?>
                </head>
                <body>
        <?php
    }
    
    public function start_content()
    {
        if($this->state == 0)
            $this->start_pre_content();
          
        $this->state = 2;
        ?>
            <!-- TODO: Use custom elements -->
            <h1><a href="/" class="title-link"><img src="/res/pumpkin2.png" style="height: 50px"/></a><iframe width=395 height=50 style="overflow: hidden; border: none; float: right" src="/u/timer.html?embed=1&mode=3"></iframe></h1>
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
                                Copyright&nbsp;©&nbsp;<a href="https://github.com/sppmacd">PumpkinCell</a>&nbsp;2020-2021&nbsp;&#8226;&nbsp;<a href="/terms.php#use">Terms of Use</a>&nbsp;&#8226;&nbsp;<a href="/terms.php#privacy">Privacy Policy</a>&nbsp;&#8226;&nbsp;This site uses cookies, but ONLY for keeping you logged-in. Otherwise, not. Please check in developer tools.
                            </div>
                        </div>
                    </div>
                    <script src="/tilify.js"></script>
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
