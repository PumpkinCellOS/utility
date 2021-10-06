class TlfAPI {
    // config: {
    //   endpoint: string
    //   calls: {
    //     <name>: {
    //       method: GET|POST|PUT
    //       noJSONResponse: bool // don't parse JSON in response
    //     }
    //   }
    //   onerror: function(response: object, msg: string)
    // }
    constructor(config)
    {
        if(config === undefined)
            throw Error("You must give a config!");
        this.config = config;
    }
    
    _doXHR(xhr, callConfig, data, method, callback, errorCallback)
    {
        // HACK
        var _this = this;
        xhr.onreadystatechange = function() {
            if(this.readyState == 4)
            {
                try
                {
                    if(this.status == 200 && callback instanceof Function)
                        callback(callConfig.noJSONResponse ? this.responseText : JSON.parse(this.responseText)); 
                    else
                    {
                        var response;
                        try
                        {
                            response = JSON.parse(this.responseText);
                        }
                        catch(e)
                        {
                            console.log(e);
                            response = {};
                        }
                        var serverMessage = response.message;
                        if(serverMessage === undefined)
                            serverMessage = "Server error :(";
                        var msg = serverMessage + " (" + this.status + ")";
                        console.log(msg);
                        errorCallback(response);
                        if(_this.config.onerror)
                            _this.config.onerror(response, msg);
                    }
                }
                catch(e)
                {
                    console.log(e);
                    const response = {type: "parse", message: "Exception: " + e.toString()};
                    errorCallback(response);
                    if(_this.config.onerror)
                        _this.config.onerror(response, e.toString());
                }
            }
        };
        
        if(method == "POST" || method == "PUT")
            xhr.send(data);
        else
            xhr.send();
    }
    
    json2uri(json)
    {
        return Object.keys(json).map(function(k)
        {
            return encodeURIComponent(k) + "=" + encodeURIComponent(json[k]);
        }).join('&');
    }
    
    call(command, args = {}, callback = function() {}, errorCallback = function() {})
    {
        console.info(`API call ${command} with args=${JSON.stringify(args)}`);
        var xhr = new XMLHttpRequest();
        const callConfig = this.config.calls[command];
        var method = callConfig.method;
        if(method == "PUT")
            throw new Error("PUT method not allowed, use api.put() for it.");
        
        var url = this.config.endpoint;
        if(url[0] == '/')
            url = "/pcu" + url;
        args.command = command;
        if(method == "GET")
            url += `?${this.json2uri(args)}`;
        else
        {
            args = JSON.stringify(args);
        }
        
        xhr.open(method, url);
        this._doXHR(xhr, callConfig, args, method, callback, errorCallback);
    }

    put(command, data, args = {}, callback = function() {}, errorCallback = function() {})
    {
        console.info(`API call (put) ${command} with data size ${data.length}`);
        var xhr = new XMLHttpRequest();
        const callConfig = this.config.calls[command];
        var method = callConfig.method;
        
        var url = this.config.endpoint;
        if(url[0] == '/')
            url = "/pcu" + url;
        args.command = command;
        if(method != "PUT")
            throw new Error("Unsupported method, must be PUT.");
        
        xhr.open(method, url + `?${this.json2uri(args)}`);
        this._doXHR(xhr, callConfig, data, method, callback, errorCallback);
    }
}

window.TlfAPI = TlfAPI;

function tlfApiCall(method, endpoint, command, args = {}, callback = function() {}, errorCallback = function() {})
{
    var config = {};
    config.endpoint = endpoint;
    config.calls = {};
    config.calls[command] = {
        method: method
    };
    var api = new TlfAPI(config);
    api.call(command, args, callback, errorCallback);
}

window.tlfApiCall = tlfApiCall;
