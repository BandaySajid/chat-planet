import { WebSocketServer } from 'ws';
import config from '../../config.js';
import crypto from 'node:crypto';

const SOCKET_CODES = ['USERNAME_REQUIRED', 'USER_DELETED'];

const gateway = (server) => {
    const WSS = new WebSocketServer({
        server: server,
        path: '/chat'
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
                    console.log('got a socket connection with username', msg.payload.username);
                    if (!msg.payload.username) {
                        return socket.close(1003, SOCKET_CODES[0]);
                    }
                    socket.user = msg.payload.username;
                    if (!clients[socket.user]) {
                        clients[socket.user] = {
                            uuid: crypto.randomUUID(),
                            connected: true,
                        };
                        WSS.clients.forEach((client) => {
                            client.send(JSON.stringify({
                                type: 'join',
                                username: msg.payload.username
                            }));
                        });
                    }
                    clients[socket.user].connected = true;
                    //sending user join message to each client if the client connection was off for minimum 5 seconds.
                    if (clients[socket.user].left) {
                        WSS.clients.forEach((client) => {
                            client.send(JSON.stringify({
                                type: 'join',
                                username: msg.payload.username
                            }));
                        });
                        clients[socket.user].left = false;
                    };


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

                if (msg.type && msg.type === 'delete_user') {
                    if (clients[socket.user].connected) {
                        return socket.close(1000, SOCKET_CODES[1])
                    };
                };

                if (msg.type && msg.type === 'clients_length') {
                    return socket.send(JSON.stringify({
                        type : 'clients_length',
                        length : WSS.clients.size
                    }))
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
                console.error('An error occured while receving socket message:', err);
                //invalid json message
            }
        });

        socket.on('close', (code, reason) => {
            try {
                if (code === 1003) {
                    //closed by the server because username was not provided
                    return;
                };
                if (code === 1000 && reason.toString() === SOCKET_CODES[1]) {
                    delete clients[socket.user];
                    return WSS.clients.forEach((client) => {
                        client.send(JSON.stringify({
                            type: 'left',
                            username: socket.user
                        }));
                    });
                }
                if (clients[socket.user].connected) {
                    clients[socket.user].connected = false
                }

                //sending user left message to each client.
                setTimeout(() => {
                    if (!clients[socket.user].connected) {
                        clients[socket.user].left = true;
                        WSS.clients.forEach((client) => {
                            client.send(JSON.stringify({
                                type: 'left',
                                username: socket.user
                            }));
                        });
                    }
                }, 5000);
            } catch (err) {
                console.error('an error occured when a socket connection closed:', err);
            }
        })

    });
};

export default gateway;