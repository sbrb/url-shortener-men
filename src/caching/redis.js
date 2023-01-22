import redis from 'redis';
import { promisify } from 'util';

const redisClient = redis.createClient(
    15216,
    'redis-15216.c273.us-east-1-2.ec2.cloud.redislabs.com',
    { no_ready_check: true }
);
redisClient.auth('bS18rMQR1r4pmZJeVfJYsvVC2a3yJ3Sn', (err) => {
    if (err) throw err;
});
redisClient.on('connect', async () => {
    console.log('Redis is connected.')
});

export const SET_ASYNC = promisify(redisClient.SET).bind(redisClient)
export const GET_ASYNC = promisify(redisClient.GET).bind(redisClient)

