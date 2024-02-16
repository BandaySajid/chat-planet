const config = {
    environment: process.env.APPENV || 'development',
    gateway: {
        host: '127.0.0.1',
        port: 9091
    },
    server: {
        host: '127.0.0.1',
        port: 9090
    },
    crypto: {
        encryption_key: 'cb4a9eb935fb4474cafab0a1245a0d75',
        iv: '21cace522c548ff488512a11e08c0948'
    },
    redis: {
        url: `redis://${process.env.HOSTENV === 'DOCKER' ? 'redis' : 'localhost'}:6379/0` // 0 is the database number in redis
    },
    jwt: {
        secret: '11jsaeb935fb4474cafab0a2222a0d75'
    }
};

export default config;