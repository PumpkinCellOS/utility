var api = new TlfAPI({
    endpoint: "/api/login.php",
    calls: {
        "auth-user": { method: "POST" },
        "create-user": { method: "POST" },
        "change-password": { method: "POST" }
    }
});

function login(userName, password) {
    api.call("auth-user", {userName: userName, password: password}, function(data) {
        window.location.href = "/";
    }, function(data) {
        if(data.message !== undefined)
        {
            tlfNotification(data.message, TlfNotificationType.Error);
            //tlfOpenForm([], null, { title: data.message, noCancel: true });
        }
    });
}

function signup(form)
{
    var email = form["email"].value;
    var userName = form["userName"].value;
    var password = form["password"].value;
    api.call("create-user", { email: email, userName: userName, password: password }, function() {
        window.location.href = "/";
    }, function(data) {
        if(data.message !== undefined)
        {
            tlfNotification(data.message, TlfNotificationType.Error);
            //tlfOpenForm([], null, { title: data.message, noCancel: true });
        }
    });
}

function changePassword()
{
    tlfOpenForm([{type: "password", name: "password", placeholder: "Password"}, {type: "password", name: "password2", placeholder: "Repeat password"}], function(args) {
        if(args.password != args.password2)
        {
            tlfNotification("Passwords do not match", TlfNotificationType.Error);
            return false;
        }
            
        api.call("change-password", {"password": args.password}, (data)=>{
            this.close();
        });
        return false;
    }, {title: "Change password"});
}
