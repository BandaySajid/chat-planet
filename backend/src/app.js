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

if (config.environment === 'production') {
   const build_path = path.join(__dirname, '..', '..', 'frontend', 'build');
   app.use('/static', express.static(path.join(build_path, 'static')));
   app.use('/static', express.static(build_path));
   app.get('*', (_, res) => {
      res.sendFile('index.html', { root: build_path });
   });
}

const server = http.createServer(app);

app.use('*', (_, res) => {
   res.status(403).send('ACCESS DENIED');
});

const WSS = new WebSocketServer({
   noServer: true,
});

server.on('upgrade', async (request, socket, head) => {
   try {
      console.log('got connection-----');
      const authenticated_user = isAuthenticated(request);
      if (!authenticated_user) {
         return socket.destroy();
      }

      WSS.handleUpgrade(request, socket, head, function done(ws) {
         ws.user = authenticated_user;
         WSS.emit('connection', ws, request);
      });
   } catch (e) {
      console.error('an error occured', e);
   }
});

gateway(WSS, redis);

server.listen(config.server.port, () => {
   console.log('server is up on port:', config.server.port);
});
