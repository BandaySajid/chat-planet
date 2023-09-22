import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Form, Button } from 'react-bootstrap';

const User = () => {

    const navigate = useNavigate();

    useEffect(() => {
        // Checking if user is loggedIn
        if (localStorage.getItem('username')) {
            navigate("/chat");
        }
    }, []);

    const [username_input, set_username_input] = useState('');

    const handle_username_input = (event) => {
        set_username_input(event.target.value);
    };

    const handle_create_button_click = () => {
        if (username_input.length > 4 && !username_input.includes(' ')) {
            localStorage.setItem('username', username_input);
            window.location.href = '/chat';
        };
        set_username_input('');
    };

    return (
        <div style={{
            background: 'linear-gradient(90deg, rgba(28,27,43,1) 0%, rgba(44,45,63,1) 35%, rgba(69,77,100,1) 100%)',
            height: '100vh',
            width: '100vw'
        }}>

            <div style={{
                display: 'flex',
                justifyContent: 'center',
                flexDirection: 'column',
                alignItems: 'center',
                padding: '200px 0px',
                gap: '1rem'

            }} className='container'>

                <Form.Control style={{
                    background: 'linear-gradient(90deg, rgba(30, 34, 46, 1) 0%, rgba(18, 18, 30, 1) 35%, rgba(62, 68, 90, 1) 100%)',
                    border: 'none',
                    width: '50%'
                }} size="sm" id="username-input" value={username_input} type="text" className='text-white' onChange={handle_username_input} placeholder="your anonymous username" />
                <Form.Text style={{ color: '#ee8e8ecf', display: username_input.length < 5 || username_input.includes(' ') ? 'block' : 'none' }}>
                    {username_input.includes(' ') ? 'username should not include spaces' : 'Your username must be at least 5 characters'}
                </Form.Text>
                <Button className='btn btn-sm btn-dark' disabled={username_input.length < 4 || username_input.includes(' ')} onClick={handle_create_button_click}>
                    Create
                </Button>

            </div>
        </div>
    );
};

export default User;
