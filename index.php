<?php

require_once("pcu/lib/generator.php");

$generator = new PCUGeneratorStatic();
$generator->start_content();
?>
<div is="tlf-background-tile">
    <ul>
        <li><span style="color: red">YouTube</span>
            <ul>
                <li><a href="https://youtube.com/sppmacd">PumpkinCell</a></li>
                <li><a href="https://www.youtube.com/channel/UClwskzwn2nXvoW_hJ1iGScg">PumpkinCellOS</a></li>
            </ul>
        </li>
        <li><span style="color: #7682f6">Discord</span>
            <ul>
                <li><a href="https://discord.gg/K7Q34gjHSx">Discord [PL]</a></li>
                <li><a href="https://discord.gg/Amp7f99DWA">Discord [EN]</a></li>
            </ul>
        </li>
        <li><span>GitHub</span>
            <ul>
                <li><a href="https://github.com/PumpkinCellOS">GitHub (PumpkinCellOS)</a></li>
                <li><span>Raw Hacking</span>
                    <ul>
                        <li><a href="https://github.com/hexagon-engine/ege">EGE</a></li>
                        <li><a href="https://github.com/PumpkinCellOS/evogen">EvoGen</a></li>
                        <li><a href="https://github.com/sppmacd/logicbox">LogicBox</a></li>
                    </ul>
                </li>
                <li><a href="https://github.com/sppmacd">GitHub (sppmacd)</a></li>
            </ul>
        </li>
        <li><a href="/pcu">PumpkinCell Utility</a></li>
        <li><a href="/about">About</a></li>
    </ul>
</div>
<?php
$generator->finish();

?>
