let webSocket = new WebSocket("ws://" + window.location.hostname + ":8081?u=wstest&p=1234");
webSocket.onopen = console.log;
webSocket.onmessage = console.log;

