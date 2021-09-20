function uploadChunk(offset, fileSize, pwd, name, buffer)
{
    let xhr = new XMLHttpRequest();
    return new Promise(function(resolve, reject) {
        xhr.open("PUT", `upload.php?pwd=${encodeURIComponent(pwd)}&name=${encodeURIComponent(name)}&start=${offset}&end=${offset + CHUNK_SIZE}&size=${fileSize}`, true);
        xhr.onreadystatechange = function() {
            if(this.readyState == XMLHttpRequest.DONE)
            {
                if(this.status != 200)
                {
                    try
                    {
                        reject(JSON.parse(this.responseText).message);
                    }
                    catch(e)
                    {
                        reject(e);
                    }
                }
                else
                    resolve({offset: offset, size: fileSize});
            }
        }
        xhr.send(buffer); 
    });
}

const CHUNK_SIZE = 8388608; // 8MiB

module.exports = async (file, pwd, onProgress) => {
    for(let off = 0; off < file.size; off += CHUNK_SIZE)
    {
        const result = await uploadChunk(off, file.size, pwd, file.name, file.slice(off, off + CHUNK_SIZE));
        onProgress(result.offset, result.size);
    }
}
