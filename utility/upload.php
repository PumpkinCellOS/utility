<?php
// TODO: Merge this and 'download.php' and rename to 'cloud.php'
require_once("../lib/pcu.php");

$userData = pcu_require_login();

switch($_SERVER["REQUEST_METHOD"])
{
    case "GET":
        require_once("../lib/generator.php");
            
        $generator = new PCUGenerator("Upload");

        $generator->scripts = ["/plupload.full.min.js"];
        $generator->stylesheets = ["style.css"];
        $generator->start_content();
        ?>

            <h2>Upload File to Server</h2>
            <div class="app-list small">
                <a is="tlf-button-tile" style="width: 33%" href="/u/download.php">Download</a>
            </div>
            <div class="background-tile">
                <div class="background-tile-padding">
                    <p>Select file to upload (4GB limit):</p>
                    <p>NOTE: The uploader is very bad, has poor error handling but should work :)</p>
                    <input type="button" id="file-submit" value="Upload"></input>
                    <div id="files">
                    </div>
                </div>
            </div>

            <script>
                var uploader;
                var lastProcessed = 0;
                var lastProcessedTimestamp = 0;
                var uid = <?php echo $userData["id"]; ?>
                
                function generateUploadProgress(file)
                {
                    var currentTS = new Date().getTime();
                    var ps = (file.processed - lastProcessed) / (currentTS - lastProcessedTimestamp) * 1000;
                    lastProcessed = file.processed;
                    lastProcessedTimestamp = currentTS;
                    return `
                        <div class='up-column'>${file.percent}%</div>
                        <div class='up-column'>${plupload.formatSize(file.processed)}</div>
                        <div class='up-column'>${plupload.formatSize(ps)}/s</div>
                    `;
                }
                
                window.addEventListener("load", function () {
                uploader = new plupload.Uploader({
                    runtimes: 'html5,html4',
                    browse_button: 'file-submit',
                    url: 'upload.php',
                    chunk_size: '8mb',
                    filters: {
                        prevent_duplicates: true
                    },
                    init: {
                        PostInit: function() {
                            document.getElementById('files').innerHTML = '';
                        },
                        FilesAdded: function(up, files) {
                            plupload.each(files, function (file) {
                                document.getElementById('files').innerHTML += `<div id="${file.id}" class="up-file"><a href="/u/download.php?u=${uid}&f=${file.name}">${file.name}</a> (${plupload.formatSize(file.size)})<br><strong></strong></div>`;
                                lastProcessedTimestamp = (new Date()).getTime();
                                lastProcessed = 0;
                            });
                            uploader.start();
                        },
                        UploadProgress: function(up, file) {
                            if(file.state != 1)
                                document.querySelector(`#${file.id} strong`).innerHTML = generateUploadProgress(file);
                        },
                        Error: function(up, err) {
                            try
                            {
                                console.log(err);
                                document.querySelector(`#${err.file.id} strong`).innerHTML = `<span>${JSON.parse(err.response).message}</span>`;
                            }
                            catch(e)
                            {
                                console.log(e);
                            }
                        }
                    }
                });
                uploader.init();
                });
            </script>
        
        <?php
        $generator->finish();
        break;
    case "POST":
        if(empty($_FILES) || $_FILES['file']['error'])
        {
            pcu_cmd_fatal("Failed to move uploaded file. " . json_encode($_FILES));
        }
        
        $uid = $userData["id"];

        $fileName = isset($_REQUEST["name"]) ? $_REQUEST["name"] : $_FILES["file"]["name"];
        $target = "cloud-files/$uid/" . basename($fileName);
        
        // create folders
        mkdir("cloud-files");
        mkdir("cloud-files/$uid");
        
        // check if exists
        if(file_exists($target))
        {
            pcu_cmd_fatal("File exists: $target");
        }
        
        $chunk = isset($_REQUEST["chunk"]) ? intval($_REQUEST["chunk"]) : 0;
        $chunks = isset($_REQUEST["chunks"]) ? intval($_REQUEST["chunks"]) : 0;
        $out = @fopen("{$target}.part", $chunk == 0 ? "wb" : "ab");
        
        echo json_encode($_FILES);
        echo "tmp_name: " . $_FILES['file']['tmp_name'] . " name: " . $target;
        
        if($out) 
        {
            $in = @fopen($_FILES['file']['tmp_name'], "rb");
            if($in) 
            {
                while($buff = fread($in, 16384)) { fwrite($out, $buff); }
            }
            else 
            {
                pcu_cmd_fatal("Failed to open input stream");
            }
            @fclose($in);
            @fclose($out);
            @unlink($_FILES['file']['tmp_name']);
        }
        else
        {
            pcu_cmd_fatal("Failed to open output stream");
        }
        
        if(!$chunks || $chunk == $chunks - 1) 
        {
            rename("{$target}.part", $target);
        }
        
        break;
}
?>
