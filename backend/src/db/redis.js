import redis from 'redis';
import config from '../../../config.js';

const redisClient = redis.createClient({
    url: config.redis.url
});

redisClient.on('error', (err) => {
    console.error('Redis client error', err.message);
});

(async function () {
	try{
    	await redisClient.connect();
		await redisClient.PING();
    	console.log('[REDIS]: CONNECTION on PORT 6379 successful!');
	}catch(err){
		console.log('[REDIS-ERROR]: Cannot connect to redis due to an ERROR:', err);
	}
})();

export default redisClient;
