import express from 'express';
import cors from 'cors';
import gateway from './gateway/gateway.js';
import http from 'node:http';
import config from '../config.js';

const app = express();
app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(cors({origin : '*'}));

const server = http.createServer(app);
gateway(server);

server.listen(config.server.port, ()=>{
    console.log('server is up on port:', config.server.port);
});