const TlfNotificationType = {
    Info: "info",
    Error: "error",
    Warning: "warning"
};

window.TlfNotificationType = TlfNotificationType;

window.tlfNotification = function(text, type = TlfNotificationType.Info, config = { displayTime: 3500 })
{
    var box = document.getElementById("tlf-notification-box");
    
    var notification = document.createElement("div");
    notification.classList.add("tlf-notification");
    notification.style.backgroundColor = `var(--tlf-notify-bg-${type})`;
    
    notification.innerHTML = text;
    
    const DISAPPEAR_TIME = 500; /* keep this in sync with tilify.css opacity transition */
    const DISPLAY_TIME = config.displayTime;
    
    setTimeout(function() {
        notification.style.opacity = "0%";
        setTimeout(function() {
            box.removeChild(notification);
        }, DISAPPEAR_TIME);
    }, DISPLAY_TIME);
    
    box.appendChild(notification);
}
