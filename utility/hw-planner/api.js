var API_COMMANDS = {};
var errorLoading = function() {};

module.exports = {

setup: function(config)
{
    API_COMMANDS = config.commands;
    errorLoading = config.onError;
},

api_doXHR: function(xhr, args, method, callback)
{
    xhr.onreadystatechange = function() {
        if(this.readyState == 4)
        {
            if(this.status == 200 && callback instanceof Function)
                callback(JSON.parse(this.responseText)); 
            else
            {
                var response = JSON.parse(this.responseText);
                var serverMessage = response.message;
                if(serverMessage === undefined)
                    serverMessage = "Server error";
                var msg = serverMessage + " (" + this.status + ")";
                console.log(msg);
                errorLoading(msg);
            }
        }
    };
    
    if(method == "POST")
        xhr.send(args); // args in JSON
    else
        xhr.send(); // args in URL
},

pculogin_apiCall: function(command, args, method, callback)
{
    console.log(command, args, method, callback);
    var xhr = new XMLHttpRequest();
    var url = "/api/login.php?command=" + command;
    if(method != "POST")
        url += "&" + args;

    xhr.open(method, url);
    this.api_doXHR(xhr, args, method, callback);
},

//callback: function(responseText)
apiCall: function(command, args, callback, urlprefix)
{
    var xhr = new XMLHttpRequest();
    var method = API_COMMANDS[command].method;
    
    var url = "api.php?c=" + command;
    if(method != "POST")
        url += "&" + args;
    
    xhr.open(method, url);
    this.api_doXHR(xhr, args, method, callback);
}

}
