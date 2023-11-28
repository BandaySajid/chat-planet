import redis from 'redis';
import config from '../../../config.js';

const redisClient = redis.createClient({
    url: config.redis.url
});

redisClient.on('error', (err) => {
    console.error('Redis client error', err.message);
});

(async function () {
    await redisClient.connect();
    console.log('[REDIS]: CONNECTION on PORT 6379 successful!');
})();

export default redisClient;