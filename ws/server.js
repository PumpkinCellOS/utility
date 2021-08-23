import { WebSocketServer } from 'ws';
import { createServer } from 'http';
import * as mysql from 'mysql';
import { promises } from 'fs';
import * as crypto from 'crypto';

const httpServer = createServer();
const wss = new WebSocketServer({ noServer: true });
const mysqlPassword = await promises.readFile("../pcu/lib/mysql-password.txt");

function handleMessage(ws, msg)
{
    console.log("message from " + ws + ": " + msg);
    console.log(msg);
}

// https://codeburst.io/node-js-mysql-and-promises-4c3be599909b
class MySQLDatabase
{
    constructor(config)
    {
        this.connection = mysql.createConnection(config);
        this.connection.connect();
    }
    query(sql, args)
    {
        return new Promise((resolve, reject) => {
            this.connection.query(sql, args, (err, rows) => {
                if(err)
                    return reject(err);
                resolve(rows);
            });
        });
    }
    close()
    {
        return new Promise((resolve, reject) => {
            this.connection.end(err => {
                if(err)
                    return reject(err);
                resolve();
            });
        });
    }
}

async function authUserPcu(username, password)
{
    if(!username || !password)
        throw new Error("You must give username or password");

    let connection = new MySQLDatabase({
        host: "localhost",
        user: "sppmacd",
        password: mysqlPassword,
        database: "pcutil"
    });

    try
    {
        const _username = connection.connection.escape(username);
        const _password = crypto.createHash("sha256", "").update(password).digest("hex");

        const result = await connection.query(`SELECT userName FROM users WHERE username=${_username} AND password='${_password}'`);
        console.log(result.length);
        if(result.length != 1)
        {
            throw new Error("Failed to authenticate user!");
        }
    }
    catch(e)
    {
        throw e;
    }
    finally
    {
        await connection.close();
    }
}

wss.on('connection', function(ws) {
    console.log("new connection!");

    ws.isAlive = true;
    ws.on('pong', function() {
        this.isAlive = true;
    });

    ws.on('message', function(msg) {
        handleMessage(ws, msg);
    });

    
})

httpServer.on('upgrade', function(request, socket, head) {
    wss.handleUpgrade(request, socket, head, async function(ws) {
        try
        {
            const url = new URL("http://dummy" + request.url);
            await authUserPcu(url.searchParams.get("u"), url.searchParams.get("p"));
        }
        catch(e)
        {
            console.log("Authentication failed: ", e);
            socket.write("HTTP/1.1 401 Unauthorized\r\n\r\n");
            socket.destroy();
            return;
        }
        console.log("Authentication success!");
        wss.emit('connection', ws);
        ws.send("OK");
    });
});

// keep-alive
setInterval(function() {
    wss.clients.forEach(function(ws) {
        if(!ws.isAlive) {
            console.log("Timed out");
            return ws.terminate();
        }

        ws.isAlive = false;
        ws.ping(function() {});
    })
}, 10000);

console.log("PCU WS Server started");
httpServer.listen(8081);
