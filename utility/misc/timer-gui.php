<?php

require_once("../../lib/generator.php");

$generator = new PCUGenerator("Timer");
$generator->start_content();
?>
    <h2>Timer</h2>
    <div class="background-tile">
        <div class="background-tile-padding">
        <h3 id="_1_timer-mode">Normal Mode (No Sync)</h3>
        <button name="toggle" onclick="runEvent('toggleTimer')">
            Toggle Timer
        </button>
        <button name="toggle" onclick="runEvent('runCountDown')">
            Run Countdown
        </button>
        <button name="toggle" onclick="runEvent('pause')">
            Pause
        </button>
        <input class="timer-input" type="number" id="_1_timer-input-hours" value="0">
        </input>
        <input class="timer-input" type="number" id="_1_timer-input-minutes" value="0">
        </input>
        <input class="timer-input" type="number" id="_1_timer-input-seconds" value="0">
        </input>
        <input class="timer-input" type="number" id="_1_timer-input-precount" value="0">
        </input>
        </div>
    </div>
    <div class="background-tile">
        <div class="background-tile-padding">
            <form action="timer-gui.html" id="urlform">
                <h3>Otwórz z URL</h3>
                <label for="h">Godziny</label><input name="h" type="number" value="0"></input><br>
                <label for="m">Minuty</label><input name="m" type="number" value="0"></input><br>
                <label for="s">Sekundy</label><input name="s" type="number" value="0"></input><br>
                <label for="p">Odliczanie (s)</label><input name="p" type="number" value="0"></input><br>
                <label for="admin">Admin Mode</label>
                <select name="admin" value="2">
                <option value="2">No Sync</option>
                <option value="0">Slave</option>
                <option value="1">Master</option>
                </select><br>
                <label for="mode">Timer Mode</label>
                <select name="mode" value="0">
                <option value="0">None</option>
                <option value="1">Timer</option>
                <option value="2">Countdown</option>
                <option value="3">Realtime Clock</option>
                </select><br>
                <input type="submit" value="Otwórz"></input>
            </form>
        </div>
    </div>
    <div id="timer-tip" class="background-tile">
        <div class="background-tile-padding">
            <p>Składnia URL: /u/timer.html?</p>
            <p>mode=TRYB (0-domyślny, 1-stoper, 2-czasomierz, 3-zegar)</p>
            <p>s=ilość SEKUND (dla trybu czasomierz)</p>
            <p>m=ilość MINUT (dla trybu czasomierz)</p>
            <p>h=ilość GODZIN (dla trybu czasomierz)</p>
            <p>p=ilość SEKUND ("odliczanie wstępne") (dla trybu czasomierz)</p>
            <p>admin=ADMIN MODE (0 - slave, 1 - master, </p>
            <p><b>ADMIN MODE</b>: pozwala na ustawianie danych na serwerze (nie-admin ściąga dane z serwera)</p>
            <ul>
                <li>Slave: co 2 sekundy pobiera dane z serwera, jest od niego zależny</li>
                <li>Master: ma prawo ustawiać dane na serwerze, wymaga autoryzacji (TODO)</li>
                <li>None: jest niezależny (ani nie ustawia danych ani ich nie ściąga)</li>
            </ul>
            <p id="debug">debug</p>
        </div>
    </div>
    <!--<div id="msgbox">
        <div id="msgbox-container">
            <div id="msgbox-message">
            JavaScript is disabled. It must be enabled for this page to&nbsp;work.
            </div>
            <div id="msgbox-buttons">
                <button class="msgbox" onclick="document.getElementById('msgbox').style.display='none'">Ok</button>
            </div>
        </div>
    </div>-->
        
        <div id="footer-wrapper">
            <div id="footer">
                <a href="https://github.com/sppmacd">PumpkinCell</a>&nbsp;(c) 2020-2021&nbsp;&#8226;&nbsp;<a href="/terms.php#use">Terms of Use</a>&nbsp;&#8226;&nbsp;<a href="/terms.php#privacy">Privacy Policy</a>
            </div>
        </div>
    </div>

    <!-- Timer -->
    <div id="timer-timer">
        <iframe id="timer-iframe" width=395 height=50 style="overflow: hidden; border: none; float: right" src="/u/timer.html?mode=3"></iframe>
    </div>
    
    <!-- Script -->
    <script>
    function runEvent(name)
    {
        var iframe = document.getElementById('timer-iframe');
        var ev = iframe.contentWindow.document.createEvent('UIEvents');
        ev.initUIEvent(name, true, true, window, 1);
        iframe.contentWindow.document.dispatchEvent(ev);
    }
    
    function submitopts(evt)
    {
        var iframe = document.getElementById('timer-iframe');
        var ev2 = iframe.contentWindow.document.createEvent('UIEvents');
        ev2.initUIEvent("submitopts", true, true, window, 1);
        console.log(evt);
        
        let formData = new FormData(evt.srcElement);
        let search = new URLSearchParams(formData);
        
        ev2.newURL = "timer.html?" + search.toString();
        iframe.contentWindow.document.dispatchEvent(ev2);
    }
    
    document.getElementById("urlform").onsubmit = function(evt) {
        submitopts(evt);
        evt.preventDefault();
    };
    </script>
<?php
$generator->finish();
?>
