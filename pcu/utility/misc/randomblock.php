<?php

require_once("../../lib/generator.php");

$generator = new PCUGenerator("Random Block");
$generator->start_content();
?>
<tlf-background-tile>
    <button onclick="randomize()">Randomize</button>
    <div id="mcblock"></div>
</tlf-background-tile>
<script>

let blocks = null;
let eBlock = document.getElementById("mcblock");
let speed;
let position = 0;
let interval;

(async () => {
    response = await fetch("blocks.json");
    json = await response.json();
    console.log(json);
    blocks = Object.keys(json);
})();

const loop = function() {
    position += speed;
    position %= blocks.length;
    const index = Math.round(position);
    const block = blocks[index];

    currentBlock = block;
    console.log(currentBlock, speed, index);
    eBlock.innerHTML = currentBlock;

    speed /= 1.025;
    if(speed < 0.02)
    {
        clearInterval(interval);
        console.log("SELECTED BLOCK: " + currentBlock);
        eBlock.style.color = "red";
        return;
    }
}

let currentBlock = null;

function randomize()
{
    speed = (Math.random() + 20) / 3;
    eBlock.style.color = "white";
    interval = setInterval(loop, 50);
    console.log("Interval started");
}

</script>

<?php
$generator->finish();
?>
