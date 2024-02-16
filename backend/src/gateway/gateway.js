const SOCKET_CODES = ['USERNAME_REQUIRED'];

const gateway = (WSS, redis) => {

    const get_current_time = () => {
        const now = new Date(Date.now())
        const minutes = now.getMinutes();
        const time = (now.getHours() % 12 || 12) + ':' + (minutes < 10 ? '0' + minutes : minutes);
        return time;
    };

    const send_message = (type, msg, user = null, socket) => {
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
                    username: user.username
                };
            }
        } else {
            message_to_send = msg;
        };

		message_to_send = JSON.stringify(message_to_send);

        if (!socket) {
            if (!user) {
                return WSS.clients.forEach((client) => {
                    client.send(message_to_send);
                });
            }
            return WSS.clients.forEach((client) => {
                if (client.user.uuid !== user.uuid) {
                    client.send(message_to_send);
                };
            });
        } else {
            return socket.send(message_to_send);
        };
    };

    WSS.on('connection', (socket) => {
        let current_client;

        socket.on('message', async (message) => {
            try {
                const msg = JSON.parse(message.toString());
                msg.username = socket.user.username;

                if (msg.type && msg.type === 'connection') {
                    console.log('got a socket connection with user', socket.user);
                    if (!socket.user.username) {
                        return socket.close(1003, SOCKET_CODES[0]);
                    };

                    // send_message('join', msg, socket.user);

                    current_client = await redis.HGETALL(socket.user.username);

                    await redis.HSET(socket.user.username, 'connected', 'true');
                    current_client.connected = 'true'

                    //sending user join message to each client if the client connection was off for minimum 5 seconds.

                    if (!current_client.left) {
                        send_message('join', msg, socket.user);
                        await redis.HSET(socket.user.username, 'left', 'false');
                    };

                    const messages = await redis.LRANGE('messages', 0, -1);

                    messages.forEach(async (msg) => {
                        msg = JSON.parse(msg);
                        if (current_client.uuid === msg.uid) {
                            msg.isOpponent = false
                        } else {
                            msg.isOpponent = true;
                        };
                        send_message('transport', msg, null, socket);
                    });

                    return;
                };

                if (msg.type && msg.type === 'typing') {
                    send_message('default', msg, socket.user);
                    return;
                };

                if (msg.type && msg.type === 'clients_length') {
                    send_message('clients_length', null, null, socket);
                    return;
                };

                msg.uid = current_client.uuid;
                msg.sentAt = get_current_time();

                await redis.RPUSH('messages', JSON.stringify(msg));

                WSS.clients.forEach(async (client) => {
                    if (client.user.username === socket.user.username) {
                        msg.isOpponent = false;
                    }
                    else {
                        msg.isOpponent = true;
                    }
                    send_message('default', msg, null, client);
                });
            }
            catch (err) {
                console.error('An error occured while receving socket message:', err);
                //invalid json message
            }
        });

        socket.on('close', async (code, reason) => {
            try {
                console.log(`closing connection for the client with code ${code} and reason ${reason}`);
                if (code === 1003) {
                    //closed by the server because username was not provided
                    return;
                };

                if (code === 1006) {
                    console.log('socket was destroyed by server because the client is not authenticated or because of an abnormal response!');
                    //closed by the server because the user is not authenticated or because of an abnormal data.
                    return;
                };
   
                if (current_client.connected === 'true') {
                    await redis.HSET(socket.user.username, 'connected', 'false');
                    current_client.connected = 'false';
                }

                //sending user left message to each client.
                setTimeout(async () => {
                    const connected = await redis.HGET(socket.user.username, 'connected');
                    if (connected === 'false' || connected <= 0) {
                        current_client.left = 'true';
                        await redis.HSET(socket.user.username, 'left', 'true');
                        send_message('left', null, socket.user.username);
                    }
                }, 5000);
            } catch (err) {
                console.error('an error occured when a socket connection closed:', err);
            }
        });

        socket.on('error', (err) => {
            console.error('an error occured with socket', err);
        })

    });
};

export default gateway;
