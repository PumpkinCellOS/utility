
var api = new TlfAPI({
    endpoint: "/api/login.php",
    calls: {
        "auth-user": { method: "POST" },
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
