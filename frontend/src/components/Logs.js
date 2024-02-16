import React, { useContext, useState } from 'react';
import logsContext from '../context/logs/logsContext.js';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBars, faEye } from '@fortawesome/free-solid-svg-icons';

const Logs = (props) => {
    const logState = useContext(logsContext);
    const [sidebarState, setSidebarState] = useState(false);
    const handle_sidebar = () => {
        const sidebarElem = document.querySelector('#logs_sidebar');
        if (sidebarState) {
            sidebarElem.style.transform = 'translateX(-1000px)';
            setSidebarState(false);
        }
        else {
            sidebarElem.style.transform = 'translateX(0px)';
            setSidebarState(true);
        }
    }
    return (
        <div style={{ position: 'absolute', width: '50%' }}>
            <FontAwesomeIcon role='button' icon={faBars} className='
                    text-white ' id='sidebar_icon' onClick={handle_sidebar} style={{ position: 'absolute', fontSize: '1.5rem', top: '10px', left: '10px', zIndex: '10', cursor: 'pointer' }} />
            <div className='bg-dark pt-5' id='logs_sidebar' style={{ width: '100%', padding: '1rem', maxHeight: '30rem', overflow: 'auto' }}>
                <h1 className='text-warning' style={{ fontWeight: 'bold' }}>Logs</h1>
                <span style={{ position: 'absolute', top: '10px', right: '10px', zIndex: '10', }} className='text-white'>
                    <FontAwesomeIcon role='button' icon={faEye} className='text-warning' /> : {props.clientsLength}
                </span>
                {logState.state.map((log, i) => {
                    return <p key={i} className={`text-${log.type === 'join' ? 'primary' : 'danger'}`} >{log.content}</p>
                })}
            </div>
        </div>
    )
}

export default Logs;
