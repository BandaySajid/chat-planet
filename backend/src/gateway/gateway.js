import { WebSocketServer } from 'ws';
import config from '../../config.js';
import crypto from 'node:crypto';

const gateway = (server) => {
    const WSS = new WebSocketServer({
        server : server,
        path : '/chat'
    }, () => {
        console.log('websocket server is listening on port:', config.gateway.port);
    });

    const get_current_time = () => {
        const now = new Date(Date.now())
        const minutes = now.getMinutes();
        const time = (now.getHours() % 12 || 12) + ':' + (minutes < 10 ? '0' + minutes : minutes);
        return time;
    };

    //messages will vanish after 2 minutes
    let messages = [];
    // setInterval(()=>{
    //     messages = [];
    // }, 20000);

    const clients = {};

    WSS.on('connection', (socket) => {

        socket.on('message', (message) => {
            try {
                const msg = JSON.parse(message.toString());
                if (msg.type && msg.type === 'connection') {
                    socket.user = msg.payload.username;
                    if (!clients[msg.payload.username]) {
                        clients[msg.payload.username] = {
                            uuid: crypto.randomUUID(),
                            connected: true
                        };
                    }
                    //sending user join message to each client.
                    WSS.clients.forEach((client) => {
                        client.send(JSON.stringify({
                            type: 'join',
                            username: msg.payload.username
                        }));
                    });
                    clients[msg.payload.username].connected = true;
                    messages.forEach((msg) => {
                        if (clients[socket.user].uuid === msg.uid) {
                            msg.isOpponent = false
                        } else {
                            msg.isOpponent = true;
                        };
                        socket.send(JSON.stringify(msg));
                    });
                    return;
                };

                if (msg.type && msg.type === 'typing') {
                    return WSS.clients.forEach((client) => {
                        if (client.user !== socket.user) {
                            client.send(JSON.stringify(msg));
                        };
                    });
                };

                msg.uid = clients[msg.username].uuid;
                msg.sentAt = get_current_time();

                messages.push(msg);

                WSS.clients.forEach((client) => {
                    if (client.user === socket.user) {
                        msg.isOpponent = false;
                    }
                    else {
                        msg.isOpponent = true;
                    }
                    client.send(JSON.stringify(msg));
                });
            }
            catch (err) {
                console.log(err);
                //invalid json message
            }
        });

        socket.on('close', () => {
            if (clients[socket.user]) {
                clients[socket.user].connected = false
            }

            //sending user left message to each client.s
            WSS.clients.forEach((client) => {
                client.send(JSON.stringify({
                    type: 'left',
                    username: socket.user
                }));
            });
        })

    });
};

export default gateway;