<?php
// TODO: Merge this and 'download.php' and rename to 'cloud.php'
require_once("../../lib/pcu.php");
require_once("util.php");

$userData = pcu_user_session();
if(!pcu_is_logged_in())
{
    $userData["id"] = 0;
    $userData["userName"] = "[[public]]";
}

$json = new stdClass();
$requestUserData = pcu_user_by_id(pcu_cmd_connect_db($json, "pcutil"), isset($_REQUEST["u"]) ? $_REQUEST["u"] : $userData["id"]);

if($requestUserData == 0)
{
    pcu_page_type(PCUPageType::Display);
    pcu_require_login();
}

require_once("../../lib/generator.php");
$generator = new PCUGenerator("Cloud");

$generator->scripts = ["app.js"];
$generator->stylesheets = ["style.css"];
$generator->header_title = "Cloud Storage";
$generator->start_content();
?>
    <tlf-background-tile>
        <div id="files">
        </div>
        <div id="breadcrumb"></div>
        <div class="app-list small" id="actions-container">
            <button id="file-submit">Upload (2 GiB limit)</a>
            <button id="file-mkdir">Create directory</a>
        </div>
        <div class="data-table">
            <table id="file-listing">
            </table>
        </div>
        <div id="quota">Used space: <span id="quota-string">Loading...</span></div>
    </tlf-background-tile>

    <script>
        var lastProcessed = 0;
        var lastProcessedTimestamp = 0;
        var uid = <?php echo $userData["id"]; ?>;
        window.PHP_requestUserData = <?php echo json_encode($requestUserData); ?>;
    </script>

<?php
$generator->finish();
?>
