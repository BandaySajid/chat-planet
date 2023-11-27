import express from 'express';
import user_controller from './controllers/user.js';
import { ensureAuth } from './middleware/auth.js';

const user_router = new express.Router();
//base api url : /api/auth/..

user_router.post('/signup', user_controller.create_user);
user_router.post('/login', user_controller.login_user);
user_router.get('/logout', ensureAuth, user_controller.logout_user);

export { user_router };