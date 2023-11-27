import jwt from 'jsonwebtoken';
import config from '../../config.js';
import cookie_parser from 'cookie';

const isAuthenticated = (req) => {
    try {
        let cookies = req.header.cookie;

        if (!cookies) {
            return null;
        };

        cookies = cookie_parser.parse(cookies);
        
        const auth_token = cookies.access_token;

        if (!auth_token) {
            return null;
        };

        const decoded = jwt.verify(auth_token, config.jwt.secret);

        return decoded;
    } catch (error) {
        console.error('an error occured with authentication', error);
        return null;
    }
};

const ensureAuth = async (req, res, next) => {
    try {
        const authenticated_user = isAuthenticated(req);

        if (!authenticated_user) {
            return res.status(401).json({
                status: 'unathenticated user',
                message: 'user is not authenticated'
            });
        };

        req.user = authenticated_user;
        next();

    } catch (error) {
        console.error('an error occured', error);
        res.status(500).json({
            status: 'internal server error',
            message: 'an error occured with the server'
        });
    };
};

export { isAuthenticated, ensureAuth };

