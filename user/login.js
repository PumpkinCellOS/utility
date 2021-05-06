
var api = new TlfAPI({
    endpoint: "/api/login.php",
    calls: {
        "auth-user": { method: "POST" },
        "create-user": { method: "POST" }
    }
});

function login(userName, password) {
    api.call("auth-user", {userName: userName, password: password}, function(data) {
        window.location.href = "/";
    }, function(data) {
        if(data.message !== undefined)
        {
            tlfOpenForm([], null, { title:"Invalid credentials", noCancel: true });
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
            tlfOpenForm([], null, { title:"Error: " + data.message, noCancel: true });
        }
    });
}
