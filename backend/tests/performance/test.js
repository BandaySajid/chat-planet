import config from '../../../config.js';
import redisClient from '../../src/db/redis.js';

const request = {
    post: async (url, body) => {
        const resp = await fetch(url, {
            headers: {
                'Content-Type': 'application/json'
            },
            method: 'POST',
            body: JSON.stringify(body)
        });

        const json_resp = await resp.json();
        return {
            resp, data: json_resp
        };
    },

    get: async (url) => {
        const resp = await fetch(url, {
            method: 'GET',
        });

        const json_resp = await resp.json();
        return {
            resp, data: json_resp
        };
    }
};

const create_dummy_user = async () => {
    const body = { username: 'dummy', password: 'dummypass' };

    const signup_req = await request.post('http://127.0.0.1:9090/api/auth/signup', body);

    if (signup_req.resp.status === 201) {
        console.log('new dummy user was created');
        return body;
    } else if (signup_req.resp.status === 400 && signup_req.data.status === 'existing user error') {
        console.log('user already exists so trying to login');
        const login_req = await request.post('http://127.0.0.:9090/api/auth/login', body);
        if (login_req.resp.status === 200) {
            console.log('dummy user logged in successfully!');
            return body;
        };
        console.error('cannot signup user due to an error: ', login_req);
    } else {
        console.error('cannot signup user due to an error: ', signup_req);
    };
};

const test_user_creation = async () => {
console.log('- Flushing redis store before creating users');
// await redisClient.FLUSHALL();
    // await redisClient.disconnect();
    const users_to_create = process.argv[2];
    if (!users_to_create) {
        console.log('please provide no. of users to create');
        process.exit(1);
    };
    console.log('[NUMBER OF USERS TO CREATE] : ' + users_to_create);
    let created_users = 0;
    console.time('USER_SIGNUP_TEST');
    for (let i = 0; i < users_to_create; i++) {
        const user = await request.post('http://127.0.0.1:9090/api/auth/signup', { username: 'dummy' + i, password: 'dummy' });
        if (user.resp.status === 201) {
            created_users++;
        };
    };

    console.log('[NO OF USERS CREATED] : ' + created_users);
    console.timeEnd('USER_SIGNUP_TEST');
};


test_user_creation();