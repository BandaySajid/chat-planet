import { toast } from 'react-toastify';

class Gateway {
    constructor() {
        this.connected = false;
        this.restart_auto = true;
        this.callbacks = [];
        this.timer_id = 0;
    }

    start() {
        this.connection = new WebSocket(`${window.location.protocol.split(':')[0] === 'http' ? 'ws' : 'wss'}://${window.location.hostname}:9090/chat`);
        // this.connection = new WebSocket(process.env.REACT_APP_WS_URL);

        this.connection.onopen = this.on_open.bind(this);
        this.connection.onmessage = this.on_message.bind(this);
        this.connection.onclose = this.on_close.bind(this);
        this.connection.onerror = this.on_error.bind(this);
    }

    stop() {
        this.restart_auto = false;
        this.connection.close();
    }

    on_open() {
        this.connected = true;

        this.send({
            type: 'clients_length'
        })

        if (this.timer_id) {
            clearInterval(this.timer_id);
            this.timer_id = 0;
        }

        this.send({
            type: 'connection',
            payload: {
                username: localStorage.getItem('username')
            }
        });

        console.log('gateway ready');
        toast('Connected: The chat will disappear after 12:00');
    }

    on_message(message) {
        for (const cb of this.callbacks) {
            cb(message.data);
        }
    }

    on_close(event) {
        console.log('connection closed', event);
        this.connected = false;

        console.log('gateway closed');
        if (event.code === 1003 && event.reason === 'USERNAME_REQUIRED') {
            window.location.href = '/';
            return toast('Connection Closed! username is required!');
        };

        if (!this.restart_auto) {
            this.restart_auto = true;
            return;
        }

        if (!this.timer_id) { /* Avoid firing a new setInterval, after one has been done */
            this.timer_id = setInterval(() => {
                console.log('gateway reconnecting');
                this.start();
            }, 3000);
        }
    }

    on_error(error) {
        if (!this.connected) {
            console.log(error);
            return toast('error : server is probably down');
            // return console.log('error with gateway: failed to establish websocket connection');
        }
        console.log('error with gateway', error);
    }

    send(data) {
        if (!this.connected) {
            return;
        }

        this.connection.send(JSON.stringify(data));
    }

    feed(callback) {
        this.callbacks.push(callback);
    }

};

export default Gateway;