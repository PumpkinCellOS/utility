<?php

require_once("../../lib/generator.php");

$generator = new PCUGenerator("Timer");
$generator->start_content();
?>
    <!-- Timer -->
    <tlf-background-tile>
        <div id="timer-timer">
            <iframe id="timer-iframe" width=405 height=60 style="overflow: hidden; border: none;" src="/pcu/u/misc/timer.html?mode=3"></iframe>
        </div>
    </tlf-background-tile>

    <div class="background-tile">
        <div class="background-tile-padding">
            <a id="timer-url"></a><br>
            <button name="toggle" onclick="runEvent('toggleTimer')">
                Toggle Timer
            </button>
            <button name="toggle" onclick="runEvent('runCountDown')">
                Run Countdown
            </button>
            <button name="toggle" onclick="runEvent('pause')">
                Pause
            </button>
            <input class="timer-input" type="number" id="timer-input-hours" value="0">
            </input>
            <input class="timer-input" type="number" id="timer-input-minutes" value="0">
            </input>
            <input class="timer-input" type="number" id="timer-input-seconds" value="0">
            </input>
            <input class="timer-input" type="number" id="timer-input-precount" value="0">
            </input>
        </div>
    </div>
    <div class="background-tile">
        <div class="background-tile-padding">
            <form action="timer-gui.html" id="urlform">
                <h3>Open from URL</h3>
                <input name="h" type="number" value="0"></input> <label for="h">Hours</label><br>
                <input name="m" type="number" value="0"></input> <label for="m">Minutes</label><br>
                <input name="s" type="number" value="0"></input> <label for="s">Seconds</label><br>
                <input name="p" type="number" value="0"></input> <label for="p">Countdown (s)</label><br>
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
            <p>URL Syntax: <code>/pcu/u/misc/timer.html?</code></p>
            <ul>
                <li><code>mode</code> - MODE (0 - default, 1 - stopwatch, 2 - timer, 3 - clock)</li>
                <li><code>s</code> - amount of SECONDS (dla trybu czasomierz)</li>
                <li><code>m</code> - amount of MINUTES (dla trybu czasomierz)</li>
                <li><code>h</code> - amount of HOURS (dla trybu czasomierz)</li>
                <li><code>p</code> -  amount of COUNTDOWN in seconds, for timer mode</li>
            </ul>
        </div>
    </div>
    
    <!-- Script -->
    <script>
    function setURL(url)
    {
        let element = document.getElementById("timer-url")
        element.innerText = url;
        element.href = url;
    }
    function runEvent(name, data = null)
    {
        if(name != "timerValues")
            runEvent("timerValues", {
                hours: document.getElementById("timer-input-hours"),
                minutes: document.getElementById("timer-input-minutes"),
                seconds: document.getElementById("timer-input-seconds"),
                precount: document.getElementById("timer-input-precount")
            });
        var iframe = document.getElementById('timer-iframe');
        var ev = iframe.contentWindow.document.createEvent('UIEvents');
        ev.initUIEvent(name, true, true, window, 1);
        ev.data = data;
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
        setURL(ev2.newURL);
    }
    
    document.getElementById("urlform").onsubmit = function(evt) {
        submitopts(evt);
        evt.preventDefault();
    };
    setURL("timer.html");
    </script>
<?php
$generator->finish();
?>
