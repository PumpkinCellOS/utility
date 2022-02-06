function uploadChunk(offset, fileSize, pwd, name, buffer) {
    let xhr = new XMLHttpRequest();
    return new Promise(function (resolve, reject) {
        xhr.open("PUT", `/pcu/u/cloud/upload.php?pwd=${encodeURIComponent(pwd)}&name=${encodeURIComponent(name)}&start=${offset}&end=${offset + CHUNK_SIZE}&size=${fileSize}`, true);
        xhr.onreadystatechange = function () {
            if (this.readyState == XMLHttpRequest.DONE) {
                if (this.status != 200) {
                    try {
                        reject(JSON.parse(this.responseText).message);
                    }
                    catch (e) {
                        reject(e);
                    }
                }
                else
                    resolve({ offset: offset, size: fileSize });
            }
        }
        xhr.send(buffer);
    });
}

const CHUNK_SIZE = 8388608; // 8MiB

module.exports = {
    // Convert provided argument to a data unit format (e.g 4 KiB).
    byteDisplay: function (value) {
        if (value < 1024)
            return (value).toPrecision(3) + " B";
        else if (value < 1024 * 1024)
            return (value / 1024).toPrecision(3) + " KiB";
        else if (value < 1024 * 1024 * 1024)
            return (value / 1024 / 1024).toPrecision(3) + " MiB";
        else if (value < 1024 * 1024 * 1024 * 1024)
            return (value / 1024 / 1024 / 1024).toPrecision(3) + " GiB";
        else
            return (value / 1024 / 1024 / 1024 / 1024).toPrecision(3) + " TiB";
    },

    // args:
    // - file - a File object
    // - pwd - directory in which the file should be saved
    // - onProgress - function called when a chunk of data is sent
    // returns:
    // - a Promise resolved when upload finished, rejected if there was an error
    doUpload: async function (file, pwd, onProgress) {
        for (let off = 0; off < file.size; off += CHUNK_SIZE) {
            const startTime = new Date();
            const result = await uploadChunk(off, file.size, pwd, file.name, file.slice(off, off + CHUNK_SIZE));
            onProgress(result.offset, result.size, new Date() - startTime);
        }
    },

    // args:
    // - directory - target path
    // - eFiles - element in which status will be displayed
    // returns:
    // - a Promise resolved when upload of all files finished (or if no files were selected), rejected if there was an error
    uploadUserSpecifiedFile: function (directory, eFiles) {
        let fileInput = document.createElement("input");
        fileInput.type = "file";
        fileInput.multiple = true;
        let fileNames = [];
        return new Promise((resolve, reject) => {
            fileInput.addEventListener("change", async () => {
                console.log(fileInput);
                console.log(fileInput.files.length);
                for (let i = 0; i < fileInput.files.length; i++) {
                    const file = fileInput.files[i];
                    fileNames.push(file.name);

                    let eProgressContainer = document.createElement("div");
                    eProgressContainer.classList.add("progress-container");
                    let eProgressDisplay = document.createElement("div");
                    {
                        eProgressContainer.appendChild(eProgressDisplay);
                    }
                    let eProgressBarProgress = document.createElement("div");
                    {
                        let eProgressBar = document.createElement("div");
                        eProgressBar.classList.add("progress-bar");
                        {
                            eProgressBarProgress.classList.add("progress-bar-progress");
                            eProgressBar.appendChild(eProgressBarProgress);
                        }
                        eProgressContainer.appendChild(eProgressBar);
                    }
                    eFiles.appendChild(eProgressContainer);

                    const updateProgressDisplay = (offset, size, time) => {
                        const percent = offset * 100 / size;
                        const transferSpeed = 8_388_608_000 / time;
                        eProgressDisplay.innerText = file.name + ": " + Math.round(percent) + "% (" + this.byteDisplay(transferSpeed) + "/s)";
                        eProgressBarProgress.style.width = percent + "%";
                    };

                    try {
                        await this.doUpload(file, directory, function (offset_2, size_1, time_1) {
                            console.log("Upload progress: " + offset_2 + "/" + size_1 + " in " + time_1 + " ms");
                            updateProgressDisplay(offset_2, size_1, time_1);
                        });
                        tlfNotification("Upload finished: " + file.name);
                        eFiles.removeChild(eProgressContainer);
                    } catch (e) {
                        console.log(e);
                        tlfNotification("Failed to upload file: " + e, TlfNotificationType.Error);
                        eFiles.removeChild(eProgressContainer);
                        // TODO: reject
                    }
                }
                console.log(fileNames);
                resolve(fileNames);
            });
            fileInput.click();
        });
    }
}
