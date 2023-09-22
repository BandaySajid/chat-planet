import React, { useEffect, useState, useContext } from 'react';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import MessageItem from './MessageItem.js';
import Gateway from '../gateway/gateway.js';
import Logs from './Logs.js';
import logsContext from '../context/logs/logsContext.js';
import { Badge } from 'react-bootstrap';
let gateway;

const Chat = () => {
    const [msg_input, setMsgInput] = useState('');
    const [messages, setMessages] = useState([]);
    const [shiftKey, setShiftKey] = useState(false);
    const [typingState, setTypingState] = useState('');
    const [tms, setTms] = useState(false); //was typing message sent.

    const logState = useContext(logsContext);

    const handleChange = (event) => {
        if (!tms && msg_input.trim().length > 0) {
            gateway.send({
                type: 'typing',
                username: localStorage.getItem('username'),
                type_code: 'open'
            });
            setTms(true);
        };
        const target = event.target;
        target.style.height = '1px';
        setMsgInput(target.value);
        if (target.scrollHeight <= parseInt(getComputedStyle(target).maxHeight)) {
            target.style.overflowY = 'hidden'
            target.style.height = target.scrollHeight + 'px';
        } else {
            target.style.overflowY = 'auto'
            target.style.height = getComputedStyle(target).maxHeight;
        };
    };

    const send_message = (event) => {
        setTms(false);
        gateway.send({
            type: 'typing',
            username: localStorage.getItem('username'),
            type_code: 'close'
        });
        if (msg_input.trim().length > 0) {
            const messageData = {
                username: localStorage.getItem('username'),
                message: msg_input
            };

            gateway.send(messageData);
            document.getElementById('message_input').style.height = '1px';
            setMsgInput('');
        }
    };

    useEffect(() => {
        const chat_container = document.querySelector('.chat_container');
        chat_container.scrollTo({
            top: chat_container.scrollHeight,
            behavior: 'smooth'
        });
    }, [messages]);

    const handleKeyDown = (event) => {
        if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
            return setShiftKey(true);
        }

        if (event.code === 'Enter' && !shiftKey) {
            send_message();
            return;
        }
    };

    const handleKeyUp = (event) => {
        if (event.code === 'ShiftLeft' || event.code === 'ShiftRight') {
            return setShiftKey(false);
        }
        if (event.code === 'Enter' && !shiftKey) {
            document.getElementById('message_input').style.height = '1px';
            setMsgInput('');
            console.log(msg_input.trim().length)
            setTms(false);
        }
    };

    //creating gateway
    useEffect(() => {
        gateway = new Gateway();
        gateway.feed((wsMsg) => {
            try {
                const msg = JSON.parse(wsMsg);
                if (msg.type === 'join' || msg.type === 'left') {
                    return logState.setLogs({
                        type: msg.type,
                        content: `${msg.username} has ${msg.type === 'join' ? 'joined' : 'left'} the chat`
                    });
                }
                if (msg.type === 'typing') {
                    if (msg.type_code === 'close') {
                        return setTypingState('');
                    }
                    else if (msg.type_code === 'open') {
                        return setTypingState(msg.username);
                    }
                }
                setMessages((prev) => {
                    return [...prev, msg];
                });
            }
            catch (err) {
                console.log('err', err);
            }
        });
        gateway.start();
    }, []);

    return (
        <div style={{
            background: 'linear-gradient(90deg, rgba(28,27,43,1) 0%, rgba(44,45,63,1) 35%, rgba(69,77,100,1) 100%)'
            , height: '100vh',
            width: '100vw'
        }}>
            <div className=" h-100 d-flex flex-column" style={{ gap: '1%' }}>
                {typingState.trim().length > 0 && <Badge bg='none' className='my-1'>
                    <span className='bg-primary p-1 typing-animation' style={{ borderRadius: '0.5rem' }}>{typingState} is typing...</span>
                </Badge>}

                <div className="container chat_container text-white py-3 my-5" style={{
                    height: '80%',
                    // border: '1px solid red',
                    borderRadius: '1rem',
                    overflow: 'auto'
                }}>

                    {messages.map((message, i) => {
                        return <MessageItem key={i} message={message} />
                    })}
                </div>
                <Logs />

                <div className="message_form_container" style={{ position: 'fixed', bottom: '10px', width: '100%' }}>

                    <Form.Group className="message_input_container">
                        <Form.Control as="textarea" rows={1} id='message_input' onChange={handleChange} value={msg_input}
                            className='text-white' onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} placeholder="Enter your message" />
                        <div>
                            <Button className='btn btn-sm btn-dark' id='send_message_button' onClick={send_message} disabled={msg_input.trim().length === 0} >
                                <i className="fa-solid fa-paper-plane"></i>
                            </Button>
                        </div>
                    </Form.Group>
                </div>
            </div>
        </div>

    );
};

export default Chat;
