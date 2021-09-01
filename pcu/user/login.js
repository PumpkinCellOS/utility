// HACK: Clients of these should use require() instead of including this directly
const api = new TlfAPI({
    endpoint: "/api/login.php",
    calls: {
        "auth-user": { method: "POST" },
        "change-email": { method: "POST" },
        "change-password": { method: "POST" },
        "create-user": { method: "POST" },
        "set-property": { method: "POST" },
        "get-properties": { method: "GET" },
        "get-roles": { method: "GET" },
        "set-public-state": { method: "POST" }
    },
    onerror: function(response, msg) {
        if(msg !== undefined)
        {
            tlfNotification(msg, TlfNotificationType.Error);
        }
    }
})
try
{
    module.exports = {
        api: api
    }
}
catch(e)
{
    ;
}

function login(userName, password) {
    api.call("auth-user", {userName: userName, password: password}, function(data) {
        if(data.passwordExpired)
        {
            changePassword("Password expired. You need to create a new one", function(password) {
                login(userName, password);
            });
        }
        else
            window.location.href = "/pcu";
    });
}

function signup(form)
{
    var email = form["email"].value;
    var userName = form["userName"].value;
    var password = form["password"].value;
    api.call("create-user", { email: email, userName: userName, password: password }, function() {
        window.location.href = "/pcu";
    }, function(data) {
        if(data.message !== undefined)
        {
            tlfNotification(data.message, TlfNotificationType.Error);
            //tlfOpenForm([], null, { title: data.message, noCancel: true });
        }
    });
}

function changePassword(message = "", callback = function() {})
{
    tlfOpenForm([{type: "password", name: "password", placeholder: "Password"}, {type: "password", name: "password2", placeholder: "Repeat password"}], function(args) {
        if(args.password != args.password2)
        {
            tlfNotification("Passwords do not match", TlfNotificationType.Error);
            return false;
        }
        
        api.call("change-password", {"password": args.password}, (data)=>{
            callback(args.password);
            this.close();
        });
        return false;
    }, {title: "Change password", description: message});
}
