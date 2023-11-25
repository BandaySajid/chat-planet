import { WebSocketServer } from 'ws';
import config from '../../config.js';
import crypto from 'node:crypto';
import { encrypt_message, decrypt_message } from '../utils/cryptography.js';

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

    const send_enc_message = async (type, msg, user = null, socket) => {
        let message_to_send;
        if (['join', 'left', 'typing', 'clients_length'].includes(type)) {
            if (type === 'clients_length') {
                message_to_send = {
                    type,
                    length: WSS.clients.size
                };
            } else {
                message_to_send = {
                    type,
                    username: user
                };
            }
        } else {
            message_to_send = msg;
        };

        message_to_send = await encrypt_message(JSON.stringify(message_to_send));

        if (!socket) {
            if (!user) {
                return WSS.clients.forEach((client) => {
                    client.send(message_to_send);
                });
            }
            return WSS.clients.forEach((client) => {
                if (client.user !== user) {
                    client.send(message_to_send);
                };
            });
        } else {
            return socket.send(message_to_send);
        };
    };

    WSS.on('connection', (socket) => {
        // const send_encrypted_message = async (message) => {
        //     const encrypted_message = await encrypt_message(message);
        // };

        socket.on('message', async (message) => {
            try {
                const decrypted_message = await decrypt_message(message.toString());
                const msg = JSON.parse(decrypted_message);
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

                        await send_enc_message('join', msg, socket.user);
                    }

                    clients[socket.user].connected = true;
                    //sending user join message to each client if the client connection was off for minimum 5 seconds.

                    if (clients[socket.user].left) {
                        await send_enc_message('join', msg, socket.user);
                        clients[socket.user].left = false;
                    };

                    messages.forEach(async (msg) => {
                        if (clients[socket.user].uuid === msg.uid) {
                            msg.isOpponent = false
                        } else {
                            msg.isOpponent = true;
                        };
                        await send_enc_message('transport', msg, null, socket);
                    });

                    return;
                };

                if (msg.type && msg.type === 'typing') {
                    await send_enc_message('default', msg, socket.user);
                    return;
                };

                if (msg.type && msg.type === 'delete_user') {
                    if (clients[socket.user].connected) {
                        return socket.close(1000, SOCKET_CODES[1])
                    };
                };

                if (msg.type && msg.type === 'clients_length') {
                    await send_enc_message('clients_length', null, null, socket);
                    return;
                };

                msg.uid = clients[msg.username].uuid;
                msg.sentAt = get_current_time();

                messages.push(msg);

                WSS.clients.forEach(async (client) => {
                    if (client.user === socket.user) {
                        msg.isOpponent = false;
                    }
                    else {
                        msg.isOpponent = true;
                    }
                    await send_enc_message('default', msg, null, client);
                });
            }
            catch (err) {
                console.error('An error occured while receving socket message:', err);
                //invalid json message
            }
        });

        socket.on('close', async (code, reason) => {
            try {
                if (code === 1003) {
                    //closed by the server because username was not provided
                    return;
                };
                if (code === 1000 && reason.toString() === SOCKET_CODES[1]) {
                    delete clients[socket.user];
                    await send_enc_message('left', null, socket.user);
                    return;
                }
                if (clients[socket.user].connected) {
                    clients[socket.user].connected = false
                }

                //sending user left message to each client.
                setTimeout(async () => {
                    if (!clients[socket.user].connected) {
                        clients[socket.user].left = true;
                        await send_enc_message('left', null, socket.user);
                    }
                }, 5000);
            } catch (err) {
                console.error('an error occured when a socket connection closed:', err);
            }
        })

    });
};

export default gateway;