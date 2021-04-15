<?php
require_once("../lib/generator.php");
require_once("../lib/pcu.php");

pcu_page_type(PCUPageType::Display);
$userData = pcu_require_login();

if($_SERVER["REQUEST_METHOD"] != "GET")
    pcu_cmd_fatal("Invalid method", 400);
    
$uid = $_GET["u"];
$name = basename($_GET["f"]);

if($name == "")
{
    $uid = $userData["id"];
    $generator = new PCUGenerator("Cloud");
    $generator->start_content();
    ?>
        <h2>Cloud storage</h2>
        <div class="app-list small">
            <a is="tlf-button-tile" style="width: 33%" href="/u/download.php">Upload</a>
        </div>
        <div class="background-tile">
            <div class="background-tile-padding">
                <ul>
                <?php
                    // TODO: Use API calls for it
                    // TODO: Support directories
                    $listing = glob("cloud-files/$uid/*");
                    foreach($listing as $file)
                    {
                        $file_bn = basename($file);
                        $link = "/u/download.php?u=$uid&f=$file_bn";
                        echo "<li><a href=" . $link . ">$file_bn</a></li>";
                    }
                ?>
                </li>
            </div>
        </div>
    <?php
    $generator->finish();
    exit;
}

$fileName = realpath("cloud-files/$uid/$name");

$exists = stat($fileName);
if(!$exists)
    pcu_cmd_fatal("File doesn't exist: " . __DIR__ . " . $fileName", 404);

if($userData["id"] != $uid)
    pcu_cmd_fatal("Access denied (" . $userData["id"] . " != $uid)", 403);
    
pcu_page_type(mime_content_type("cloud-files/$uid/$name"));
echo file_get_contents("cloud-files/$uid/$name");

?>
