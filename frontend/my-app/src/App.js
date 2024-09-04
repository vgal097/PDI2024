import React, { useState } from 'react';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';
import './App.css';

const App = () => {
    const [selectedSessionId, setSelectedSessionId] = useState(null);

    const handleSelectSession = (sessionId) => {
        setSelectedSessionId(sessionId);
    };

    const handleNewSession = (newSessionId) => {
        setSelectedSessionId(newSessionId);
    };

    return (
        <div className="app">
            <Sidebar onSelectSession={handleSelectSession} onNewSession={handleNewSession} />
            <ChatWindow sessionId={selectedSessionId} />
        </div>
    );
};

export default App;
