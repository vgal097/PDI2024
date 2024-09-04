// ChatWindow.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const ChatWindow = ({ sessionId }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');

    useEffect(() => {
        if (sessionId) {
            axios.get(`http://localhost:8000/chat/conversations/${sessionId}`)
                .then(response => {
                    setMessages(response.data.messages);
                })
                .catch(error => {
                    console.error('There was an error fetching the conversation!', error);
                });
        }
    }, [sessionId]);

    const sendMessage = () => {
        if (input.trim()) {
            axios.post('http://localhost:8000/chat/', {
                session_id: sessionId,
                message: input
            })
            .then(response => {
                setMessages([...messages, { role: 'user', content: input }, { role: 'assistant', content: response.data.response }]);
                setInput('');
            })
            .catch(error => {
                console.error('There was an error sending the message!', error);
            });
        }
    };

    return (
        <div className="chat-window">
            <div className="messages">
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.role}`}>
                        <span>{msg.content}</span>
                    </div>
                ))}
            </div>
            <div className="input-area">
                <input 
                    type="text" 
                    value={input} 
                    onChange={(e) => setInput(e.target.value)} 
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button onClick={sendMessage}>Send</button>
            </div>
        </div>
    );
};

export default ChatWindow;
