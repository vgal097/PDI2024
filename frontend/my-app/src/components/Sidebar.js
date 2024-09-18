import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaTrash } from 'react-icons/fa'; // Import a trash icon from react-icons

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

    const handleDeleteSession = (session) => {
        if (window.confirm("Are you sure you want to delete this conversation?")) {
            axios.delete(`http://localhost:8000/chat/conversations/${session}`)
                .then(response => {
                    fetchSessions(); // Refresh the session list after deletion
                })
                .catch(error => {
                    console.error('There was an error deleting the conversation!', error);
                });
        }
    };

    return (
        <div className="sidebar">
            <h3>Conversations</h3>
            <button onClick={handleNewChat}>New Chat</button>
            <ul>
                {sessions.map(session => (
                    <li key={session}>
                        <span onClick={() => onSelectSession(session)} style={{ cursor: 'pointer' }}>
                            {session}
                        </span>
                        <FaTrash 
                            style={{ cursor: 'pointer', marginLeft: '10px', color: 'red' }} 
                            onClick={() => handleDeleteSession(session)} 
                        />
                    </li>
                ))}
            </ul>
        </div>
    );
};

export default Sidebar;
