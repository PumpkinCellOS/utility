const API_COMMANDS = {
    "search-users": {"method": "GET"},
    "search-domains": {"method": "GET"},
    "user-info": {"method": "GET"},
    "add-user": {"method": "POST"},
    "add-domain": {"method": "POST"},
    "remove-user": {"method": "POST"},
    "change-password-user": {"method": "POST"},
    "expire-password-user": {"method": "POST"},
    "change-role-user": {"method": "POST"},
    "set-domain-user": {"method": "POST"},
    "version": {"method": "GET"}
};

module.exports = new TlfAPI({ endpoint: "/api/admin.php", calls: API_COMMANDS, onerror: function(data, msg) {
    tlfNotification(msg, TlfNotificationType.Error);
}});
