import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Sidebar = ({ onSelectSession, onNewSession }) => {
    const [sessions, setSessions] = useState([]);

    useEffect(() => {
        fetchSessions();
    }, []);

    const fetchSessions = () => {
        axios.get('http://localhost:8000/chat/sessions')
            .then(response => {
                setSessions(response.data.sessions);
            })
            .catch(error => {
                console.error('There was an error fetching the sessions!', error);
            });
    };

    const handleNewChat = () => {
        axios.post('http://localhost:8000/chat/start-session/')
            .then(response => {
                const newSessionId = response.data.session_id;
                fetchSessions(); // Refresh the session list
                onNewSession(newSessionId); // Switch to the new session
            })
            .catch(error => {
                console.error('There was an error starting a new session!', error);
            });
    };

    return (
        <div className="sidebar">
            <h3>Conversations</h3>
            <button onClick={handleNewChat}>New Chat</button>
            <ul>
                {sessions.map(session => (
                    <li key={session} onClick={() => onSelectSession(session)}>
                        {session}
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Sidebar;
