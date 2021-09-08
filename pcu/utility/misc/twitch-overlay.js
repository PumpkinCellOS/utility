var authData;
var userId;
var channelName;
var lastFollower;
var elast_follower_name = document.getElementById("last-follower-name");
var elast_follower_time = document.getElementById("last-follower-time");
var ex_followed_name = document.getElementById("x-followed-name");
var ex_followed_box = document.getElementById("x-followed-box");
var eobs_link = document.getElementById("obs-link");
var loadTime = new Date();

eobs_link.onclick = function () {
    window.open(this.getAttribute("href"));
}

function setCookie(cname, cvalue, exdays) {
    var d = new Date();
    d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
    var expires = "expires=" + d.toUTCString();
    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
}

function networkFailed(message) {
    tlfNotification("API request failed: <i>" + message + "</i>", TlfNotificationType.Error);
}

function softError(message) {
    elast_follower_name.innerHTML = "&lt;Error&gt;";
    elast_follower_time.innerHTML = message;
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');

    for (var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

// path - Path (without GET arguments)
// data - Data appended to URL (for GET) or sent in content (for POST)
// method - Request method ("GET", "POST")
// callback - Function called when everything succeeded. [ function(success, data) {} ]
function twitchAPICall(path, data, method, callback) {
    const clientID = "0zg483cmx5e5tctu24zovgt6yy0y5d";
    var oauth = authData.access_token;
    if (oauth === undefined) {
        callback(false, undefined);
        networkFailed("Invalid access token");
        return;
    }
    var url = "https://api.twitch.tv/helix/" + path;
    var object;

    if (method == "POST")
        object = data;
    else
        url += "?" + data;

    var xhr = new XMLHttpRequest();
    xhr.onreadystatechange = function (event) {
        if (this.readyState == XMLHttpRequest.DONE) {
            if (this.status == 200) {
                //console.log("API Request succeeded");
                //console.log(JSON.parse(this.responseText));
                try {
                    callback(true, JSON.parse(this.responseText));
                }
                catch (exc) {
                    softError("Invalid response");
                }
            }
            else {
                console.log("API Request failed: " + this.status);
                try {
                    callback(false, JSON.parse(this.responseText));
                    networkFailed(this.status);
                }
                catch (exc) {
                    callback(false, "Couldn't connect to server");
                    networkFailed("No connection");
                }
            }
        }
    };
    xhr.onerror = function () {
        console.log("API Request to " + path + " failed: " + xhr.status);
        callback(false, this.responseText);
    };

    xhr.open(method, url);
    xhr.setRequestHeader("Authorization", "Bearer " + oauth);
    xhr.setRequestHeader("Client-Id", clientID);
    xhr.setRequestHeader("Content-Type", "application/json");

    if (method == "POST")
        xhr.send(object);
    else
        xhr.send();
}

// callback: [ function(success, data) {} ]
function findChannel(channelName, callback) {
    twitchAPICall("search/channels", "query=" + channelName, "GET", function (success, data) {
        if (success)
            callback(success, data.data[0]);
        else
            callback(success, undefined);
    });
}

function sync() {
    twitchAPICall("users/follows", "to_id=" + userId, "GET", function (success, data) {
        if (data.data.length == 0) {
            elast_follower_name.innerHTML = "&lt;Nobody&gt;";
            elast_follower_time.innerHTML = "You can be first!";
            return;
        }

        var currentFollower = data.data[0].from_id;
        if (currentFollower != lastFollower) {
            lastFollower = currentFollower;

            // do something
            var name = data.data[0].from_name;
            var time = new Date(data.data[0].followed_at);
            console.log(name + " followed! (time=" + time + ")");
            elast_follower_name.innerHTML = name;
            elast_follower_time.innerHTML =
                + time.getFullYear().toString().padStart(2, "0")
                + "-" + (time.getMonth() + 1).toString().padStart(2, "0")
                + "-" + (time.getDate()).toString().padStart(2, "0")
                + " " + time.getHours().toString().padStart(2, "0")
                + ":" + time.getMinutes().toString().padStart(2, "0");

            if (time >= loadTime) {
                // Someone followed when overlay is running
                ex_followed_name.innerHTML = name;
                ex_followed_box.style.opacity = "1";
                setTimeout(function () {
                    ex_followed_box.style.opacity = "0";
                }, 2000);
            }
        }
    })
}

// Get query parameter from current URL.
function getParam(name) {
    var url = new URL(window.location);
    var v = url.searchParams.get(name);
    return (v === undefined || v === null) ? "" : v;
}

function generateLink(userName) {
    var link = window.location.href + "?c=" + userName + "&at=" + btoa(JSON.stringify(authData));
    eobs_link.innerHTML = "Click to copy";
    eobs_link.setAttribute("href", link);
}

function loadToken() {
    var cookie = decodeURIComponent(getCookie("auth-data"));
    if (cookie == "") {
        eobs_link.innerHTML = "Enable cookies to get it working";
        eobs_link.classList.add("error");
        return;
    }
    console.log(cookie);
    authData = JSON.parse(cookie);
}

function linkBox() {
    // Display link box
    document.getElementById("link").style.display = "block";

    // Hide render box
    document.getElementById("render").style.display = "none";

    // Get access token and another twitch data
    loadToken();
}

function loadFromURL() {
    var noAuth = true;
    try {
        var at = getParam("at");
        if (at != "") {
            console.log(at);
            authData = JSON.parse(atob(at));
            noAuth = false;
        }
    }
    catch (exc) {
        console.log(exc);
        networkFailed("Invalid authentication data");
    }

    channelName = getParam("c");
    if (channelName == "") {
        linkBox();
        return;
    }
    else {
        if (noAuth) {
            linkBox();
            generateLink();
            document.getElementById("userdata").style.display = "none";
            return;
        }
    }

    if (!noAuth) {
        // Start syncing.
        findChannel(channelName, function (success, data) {
            if (success) {
                if (data == undefined) {
                    softError("User doesn't exist");
                    return;
                }
                userId = data.id;
                setInterval(sync, 2500);
                sync();
            }
        });
    }
}

function isURLQuery() {
    return getParam("at") != "" || getParam("c") != "";
}

//////////////////////
//       MAIN       //
//////////////////////

function main() {
    if (isURLQuery()) {
        loadFromURL();
    }
    else {
        linkBox();
    }
}
main();