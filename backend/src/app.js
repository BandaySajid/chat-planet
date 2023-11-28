import express from 'express';
import cors from 'cors';
import gateway from './gateway/gateway.js';
import http from 'node:http';
import config from '../../config.js';
import { WebSocketServer } from 'ws';
import redis from './db/redis.js';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { isAuthenticated } from './middleware/auth.js';
import { user_router } from './routes.js';
const __dirname = path.dirname(fileURLToPath(import.meta.url));

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors({ origin: '*' }));
app.use('/api/auth', user_router);

if(process.env.APPENV === 'production'){
    app.get('/', (req, res)=>{
        res.sendFile(path.join(__dirname, '..', '..', 'frontend', 'build', 'index.html'));
    });
};

const server = http.createServer(app);

app.use('*', (req, res)=>{
    res.status(403).send('ACCESS DENIED');
});

const WSS = new WebSocketServer({
    noServer: true,
    path: '/chat'
}, () => {
    console.log('websocket server is listening on port:', config.gateway.port);
});

server.on('upgrade', async (request, socket, head) => {
    try {
        const authenticated_user = isAuthenticated(request);
        if (!authenticated_user) {
            return socket.destroy();
        };

        WSS.handleUpgrade(request, socket, head, function done(ws) {
            ws.user = authenticated_user;
            WSS.emit('connection', ws, request);
        });
    } catch (e) {
        console.error('an error occured', e);
    }
})


gateway(WSS, redis);


server.listen(config.server.port, () => {
    console.log('server is up on port:', config.server.port);
});