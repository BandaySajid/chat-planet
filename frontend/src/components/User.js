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
        if (username_input.length > 4 && username_input.length < 20 && !username_input.includes(' ')) {
            localStorage.setItem('username', username_input);
            window.location.href = '/chat';
        };
        set_username_input('');
    };
    
    const handle_username_key = (event) => {
        if(event.code === 'Enter'){
            handle_create_button_click();
        }
    }

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
                    width: '70%'
                }} size="sm" id="username-input" value={username_input} type="text" className='text-white' onChange={handle_username_input} onKeyUp={handle_username_key} placeholder="your anonymous username" />
                <Form.Text style={{ color: '#ee8e8ecf', display: username_input.length < 5 || username_input.length > 20 || username_input.includes(' ') ? 'block' : 'none' }}>
                    {username_input.includes(' ') ? 'username should not include spaces' : 'username length should be greater than 4 and less than 20'}
                </Form.Text>
                <Button className='btn btn-sm btn-dark' disabled={username_input.length < 4 || username_input.includes(' ') || username_input.length > 20} onClick={handle_create_button_click}>
                    Create
                </Button>

            </div>
        </div>
    );
};

export default User;
