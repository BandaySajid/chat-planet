import React from 'react'

const MessageItem = (props) => {
    return (
        <div className={`message_item_container mb-3 d-flex justify-content-${props.message.isOpponent ? 'start' : 'end'}`}>
            <div className="card" style={{ maxWidth: '70%', background : 'linear-gradient(90deg, rgba(30,34,46,1) 0%, rgba(18,18,30,1) 35%, rgba(62,68,90,1) 100%)' }}>
                <div className="card-header" style={{color : '#979BB5', display : 'flex', justifyContent : 'space-between', alignItems : 'center'}}>
                <span>{props.message.isOpponent ? props.message.username : 'Me'}</span> 
                <span className="badge rounded-pill bg-dark">{props.message.sentAt}</span>
                </div>
                <div className="card-body">
                    <p className="card-text text-white">{props.message.message}</p>
                </div>
            </div>
        </div>
    );
}

export default MessageItem
