<?php

switch($_SERVER["REQUEST_METHOD"])
{
    case "GET":
        require_once("../lib/generator.php");
        $generator = new PCUGenerator("Upload");

        $generator->scripts = ["/plupload.full.min.js"];
        $generator->start_content();
        ?>

            <h2>Upload File to Server</h2>
            <div class="background-tile">
                <div class="background-tile-padding">
                    <p>Select file to upload (4GB limit):</p>
                    <div id="files">
                    </div>
                    <input type="button" id="file-submit" value="Upload"></input>
                </div>
            </div>

            <script>
                window.addEventListener("load", function () {
                var uploader = new plupload.Uploader({
                    runtimes: 'html5,html4',
                    browse_button: 'file-submit',
                    url: 'upload.php',
                    chunk_size: '4mb',
                    /* OPTIONAL
                    filters: {
                    max_file_size: '150mb',
                    mime_types: [{title: "Image files", extensions: "jpg,gif,png"}]
                    },
                    */
                    init: {
                    PostInit: function () {
                        document.getElementById('files').innerHTML = '';
                    },
                    FilesAdded: function (up, files) {
                        plupload.each(files, function (file) {
                        document.getElementById('files').innerHTML += `<div id="${file.id}">${file.name} (${plupload.formatSize(file.size)}) <strong></strong></div>`;
                        });
                        uploader.start();
                    },
                    UploadProgress: function (up, file) {
                        document.querySelector(`#${file.id} strong`).innerHTML = `<span>${file.percent}%</span>`;
                    },
                    Error: function (up, err) {
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
        require_once("../lib/pcu.php");
        if(empty($_FILES) || $_FILES['file']['error'])
        {
            pcu_cmd_fatal("Failed to move uploaded file.");
        }

        $fileName = isset($_REQUEST["name"]) ? $_REQUEST["name"] : $_FILES["file"]["name"];
        $target = "upload/" . basename($fileName);
        
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
                while($buff = fread($in, 4096)) { fwrite($out, $buff); }
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
