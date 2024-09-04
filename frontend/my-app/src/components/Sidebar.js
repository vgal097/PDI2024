// Sidebar.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Sidebar = ({ onSelectSession }) => {
    const [sessions, setSessions] = useState([]);

    useEffect(() => {
        axios.get('http://localhost:8000/chat/sessions')
            .then(response => {
                setSessions(response.data.sessions);
            })
            .catch(error => {
                console.error('There was an error fetching the sessions!', error);
            });
    }, []);

    return (
        <div className="sidebar">
            <h3>Conversations</h3>
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
