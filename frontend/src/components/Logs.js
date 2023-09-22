import React, { useContext, useState } from 'react';
import logsContext from '../context/logs/logsContext.js';

const Logs = () => {
    const logState = useContext(logsContext);
    const [sidebarState, setSidebarState] = useState(false);
    const handle_sidebar = () => {
        const sidebarElem = document.querySelector('#logs_sidebar');
        console.log(sidebarElem);
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
        <div style={{position : 'absolute', width : '50%'}}>
            <i className="fa-solid fa-bars text-white" id='sidebar_icon' onClick={handle_sidebar} style={{ position : 'absolute', fontSize: '1.5rem', top: '10px', left: '10px', zIndex: '10', cursor: 'pointer' }}></i>
            <div className='bg-dark pt-5' id='logs_sidebar' style={{ width: '100%', padding: '1rem', maxHeight: '30rem', overflow: 'auto'}}>
                {logState.state.map((log, i) => {
                    return <p key={i} className={`text-${log.type === 'join' ? 'primary' : 'danger'}`} >{log.content}</p>
                })}
            </div>
        </div>
    )
}

export default Logs;
