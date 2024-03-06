import redis from '../db/redis.js';
import crypto from 'node:crypto';
import { hash_it, compare_hash } from '../utils/cryptography.js';
import jwt from 'jsonwebtoken';
import config from '../../../config.js';

const create_user = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                status: 'invalid body',
                message: 'username and password are required'
            });
        };

        if (username.length < 5 || username.length > 20 || password.length < 5 || password.length > 20) {
            return res.status(400).json({
                status: 'username or password error',
                message: 'username and password length should be greater than 4 and less than 20'
            });
        };

        const user_exists = await redis.EXISTS(username); //checking if the client is a new user or old.

        if (user_exists === 1) {
            return res.status(400).json({
                status: 'existing user error',
                message: 'a client with this username already exists!'
            });
        };

        const uuid = crypto.randomUUID();

        const user = await redis.sendCommand(['HSET', username, 'uuid', uuid, 'username', username, 'password', hash_it(password)]);

        if (user <= 0) {
            return res.status(400).json({
                status: 'cannot register user',
                message: 'user cannot be registered'
            });
        };

        const access_token = jwt.sign({
            username,
            uuid,
        }, config.jwt.secret); 4

        res.cookie('access_token', access_token, {
            httpOnly: true
        });

        res.status(201).json({
            status: 'registration successful',
            message: 'user has been successfully registered',
            access_token
        });

    } catch (err) {
        console.error('an error occured with api', err);
        res.status(500).json({
            status: 'internal server error',
            message: 'an error occured with the server'
        });
    };
};

const login_user = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                status: 'invalid body',
                message: 'username and password are required'
            });
        };

        const user_exists = await redis.EXISTS(username); //checking if the client is a new user or old.

        if (user_exists <= 0) {
            return res.status(404).json({
                status: 'user not found',
                message: 'no user found with this data!'
            });
        };

        const user_data = await redis.HGETALL(username);

        if (!compare_hash(password, user_data.password)) { //password hash doesn't match
            return res.status(401).json({
                status: 'wrong password',
                message: 'password is wrong!'
            });
        };

        const access_token = jwt.sign({
            username,
            uuid: user_data.uuid,
        }, config.jwt.secret, {
            algorithm: 'HS256'
        });

        res.cookie('access_token', access_token, {
            httpOnly: true
        });

        res.status(200).json({
            status: 'authentication succesful',
            message: 'user has been authenticated successfully!',
            access_token
        });

    } catch (err) {
        console.error('an error occured with api', err);
        res.status(500).json({
            status: 'internal server error',
            message: 'an error occured with the server'
        });
    };
};

const logout_user = async (req, res) => {
    try {
        const user_exists = await redis.EXISTS(req.user.username); //checking if the client is a new user or old.
        if (user_exists <= 0) {
            return res.status(404).json({
                status: 'user not found',
                message: 'user with this data does not exist!'
            });
        };

        const deleted_user = await redis.DEL(req.user.username);
        if (deleted_user <= 0) {
            return res.status(400).json({
                status: 'cannot delete user',
                message: 'user cannot be deleted due to an error!'
            });
        };
        
        res.clearCookie('access_token');

        return res.status(200).json({
            status: 'success',
            message: 'user has been deleted successfully!'
        });

    } catch (err) {
        console.error('an error occured with api', err);
        res.status(500).json({
            status: 'internal server error',
            message: 'an error occured with the server'
        });
    };
};

export default { create_user, login_user, logout_user };
