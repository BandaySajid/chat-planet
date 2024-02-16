import React, { useState, useEffect } from 'react';
import { Form, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const User = () => {

    const navigate = useNavigate();

    useEffect(() => {
        const local_access_token = localStorage.getItem('access_token');
        // Checking if user is loggedIn
        if (local_access_token) {
            navigate("/chat");
        }
    }, []);

    const [username_input, set_username_input] = useState('');
    const [password_input, set_password_input] = useState('');
    const [form_type, set_form_type] = useState('login');

    const change_form_type = () => {
        if (form_type === 'login') {
            set_form_type('signup');
        } else {
            set_form_type('login');
        };
    };

    const handle_username_input = (event) => {
        set_username_input(event.target.value);
    };

    const validate_input = () => {
        if (username_input.length < 4 || password_input.length < 4 || username_input.includes(' ') || password_input.includes(' ') || username_input.length > 20 || password_input.length > 20) {
            return false;
        };
        return true;
    };

    const handle_password_input = (event) => {
        set_password_input(event.target.value);
    };


    const handle_create_button_click = async () => {
        if (validate_input()) {
            try {
                const url = form_type === 'login' ? '/api/auth/login' : '/api/auth/signup';
                // const url = `${process.env.REACT_APP_API_URL}${form_type === 'login' ? '/api/auth/login' : '/api/auth/signup'}`;

                const resp = await fetch(url, {
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    method: 'POST',
                    body: JSON.stringify({
                        username: username_input,
                        password: password_input
                    })
                });

                const json_resp = await resp.json();
                if (resp.status === 201 || resp.status === 200) {
                    localStorage.setItem('access_token', json_resp.access_token || null);
                    navigate('/chat');
                    return;
                };
                toast(`Error: ${json_resp.status}, ${json_resp.message}`);
            } catch (err) {
                console.error('an error occured with request', err);
                toast('an error occured', err.message);
            };
        };
        set_username_input('');
        set_password_input('');
    };

    const handleKeys = (event) => {
        if (event.code === 'Enter') {
            handle_create_button_click();
        }
    }

    return (
        <div style={{
            background: 'linear-gradient(90deg, rgba(28,27,43,1) 0%, rgba(44,45,63,1) 35%, rgba(69,77,100,1) 100%)',
            height: '100vh',
            width: '100vw',
            overflow: 'hidden'
        }}>

            <div style={{
                display: 'flex',
                justifyContent: 'center',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '200px 0px',
                gap: '1rem'

            }} className='container text-center'>
                <h1 className='text-warning'>{form_type === 'login' ? 'Login with existing user' : 'Register a new user'}</h1>

                <Form.Control style={{
                    background: 'linear-gradient(90deg, rgba(30, 34, 46, 1) 0%, rgba(18, 18, 30, 1) 35%, rgba(62, 68, 90, 1) 100%)',
                    border: 'none',
                    width: '70%'
                }} size="sm" id="username-input" value={username_input} type="text" className='text-white' onChange={handle_username_input} onKeyUp={handleKeys} placeholder="your anonymous username" required minLength={5} maxLength={20} />
                <Form.Control style={{
                    background: 'linear-gradient(90deg, rgba(30, 34, 46, 1) 0%, rgba(18, 18, 30, 1) 35%, rgba(62, 68, 90, 1) 100%)',
                    border: 'none',
                    width: '70%',
                }} size="sm" id="password-input" value={password_input} type="text" className='text-white' onChange={handle_password_input} onKeyUp={handleKeys} placeholder="your anonymous password" required minLength={5} maxLength={20} />
                <Form.Text className="" style={{ color: '#ee8e8ecf', display: !validate_input() ? 'block' : 'none' }}>
                    {password_input.includes(' ') ? 'username and password should not include spaces' : 'username and password length should be greater than 4 and less than 20'}
                </Form.Text>
                <Button className='btn btn-sm btn-dark' disabled={!validate_input()} onClick={handle_create_button_click}>
                    {form_type === 'login' ? 'Login' : 'Register'}
                </Button>
                <span className='text-decoration-underline text-danger' >or</span>
                <p className='text-warning'>{form_type === 'login' ? 'create a new user ? ' : 'already a user ? '}<a onClick={change_form_type} className='text-success' style={{ cursor: 'pointer', fontWeight: 'bold' }}>{form_type === 'login' ? 'Register' : 'Login'}</a></p>

            </div>
        </div>
    );
};

export default User;
