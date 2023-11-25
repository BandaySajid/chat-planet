import React, { useEffect, useState, useContext } from 'react';
// import { useNavigate } from 'react-router-dom';
import { Link } from 'react-router-dom';
import Form from 'react-bootstrap/Form';
import Button from 'react-bootstrap/Button';
import MessageItem from './MessageItem.js';
import Gateway from '../gateway/gateway.js';
import Logs from './Logs.js';
import logsContext from '../context/logs/logsContext.js';
import { Badge } from 'react-bootstrap';
import Modal from 'react-bootstrap/Modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faRightFromBracket, faPaperPlane } from '@fortawesome/free-solid-svg-icons';
let gateway;

const Chat = () => {
    // const navigate = useNavigate();
    if (!localStorage.getItem('username')) {
        <Link to='/path' > some stuff </Link>
    };

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

    const [logout_confirm_state, setLogoutConfirmState] = useState(false);

    const handleLogoutKey = () => {
        console.log('before confirm state', logout_confirm_state);
        if (!logout_confirm_state) {
            setLogoutConfirmState(true);
        } else {
            setLogoutConfirmState(false);
        }

        console.log('confirm state', logout_confirm_state);
    };

    const handleLogout = () => {
        gateway.send({
            type: 'delete_user',
            username: localStorage.getItem('username'),
        });
        localStorage.clear();
        window.location.href = '/';
    };

    const [clientsLength, setClientslength] = useState(0);

    //creating gateway
    useEffect(() => {
        gateway = new Gateway();
        gateway.feed((wsMsg) => {
            try {
                const msg = JSON.parse(wsMsg);
                if (msg.type === 'join' || msg.type === 'left') {
                    gateway.send({
                        type: 'clients_length'
                    });
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
                if (msg.type === 'clients_length') {
                    return setClientslength(msg.length);
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

    return (<div style={{ background: 'linear-gradient(90deg, rgba(28,27,43,1) 0%, rgba(44,45,63,1) 35%, rgba(69,77,100,1) 100%)', height: '100vh' }}>

        {
            logout_confirm_state ? <div
                className="modal show"
                style={{ display: 'block', position: 'initial', background: 'linear-gradient(90deg, rgba(28,27,43,1) 0%, rgba(44,45,63,1) 35%, rgba(69,77,100,1) 100%)' }}
            >
                <Modal.Dialog>
                    <Modal.Header closeButton>
                        <Modal.Title>Logout Confirm Dialog</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <p>Logout and delete current user.</p>
                    </Modal.Body>

                    <Modal.Footer>
                        <Button variant="secondary" onClick={handleLogoutKey}>Dismiss</Button>
                        <Button variant="primary" onClick={handleLogout}>Confirm</Button>
                    </Modal.Footer>
                </Modal.Dialog>
            </div> : <div style={{
                background: 'linear-gradient(90deg, rgba(28,27,43,1) 0%, rgba(44,45,63,1) 35%, rgba(69,77,100,1) 100%)'
                , height: '100vh',
                width: '100vw'
            }}>
                <div className=" h-100 d-flex flex-column" style={{ gap: '1%' }}>

                    {typingState.trim().length > 0 && <Badge bg='none' className='my-1'>
                        <span className='bg-primary p-1 typing-animation' style={{ borderRadius: '0.5rem', position: 'absolute', fontSize: '0.5rem', top: '10px' }}>{typingState} is typing...</span>
                    </Badge>}


                    <FontAwesomeIcon role='button' icon={faRightFromBracket} id='logout-btn' className='
                    icon text-warning' style={{ position: 'absolute', top: '10px', right: '10px', zIndex: '10', cursor: 'pointer', fontSize: '2rem' }} onClick={handleLogoutKey} />

                    <div className="container chat_container text-white py-1 my-5" style={{
                        height: '80%',
                        // border: '1px solid red',
                        borderRadius: '1rem',
                        overflow: 'auto'
                    }}>

                        {messages.map((message, i) => {
                            return <MessageItem key={i} message={message} />
                        })}
                    </div>
                    <Logs clientsLength={clientsLength} />

                    <div className="message_form_container" style={{ position: 'fixed', bottom: '10px', width: '100%' }}>

                        <Form.Group className="message_input_container">
                            <Form.Control as="textarea" rows={1} id='message_input' onChange={handleChange} value={msg_input}
                                className='text-white' onKeyDown={handleKeyDown} onKeyUp={handleKeyUp} placeholder="Enter your message" />
                            <div>
                                <Button className='btn btn-sm btn-dark' style={{cursor : 'pointer'}} id='send_message_button' onClick={send_message} disabled={msg_input.trim().length === 0} >
                                    <FontAwesomeIcon role='button' icon={faPaperPlane}/>
                                </Button>
                            </div>
                        </Form.Group>
                    </div>
                </div>
            </div>
        }
    </div>

    );
};

export default Chat;
