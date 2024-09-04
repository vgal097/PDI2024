import React, { useState } from 'react';
import Sidebar from './components/Sidebar';  // Adjusted the path
import ChatWindow from './components/ChatWindow';  // Adjusted the path
import './App.css';

const App = () => {
    const [selectedSessionId, setSelectedSessionId] = useState(null);

    const handleSelectSession = (sessionId) => {
        setSelectedSessionId(sessionId);
    };

    return (
        <div className="app">
            <Sidebar onSelectSession={handleSelectSession} />
            <ChatWindow sessionId={selectedSessionId} />
        </div>
    );
};

export default App;
