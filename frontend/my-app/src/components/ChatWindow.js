import React, { useEffect, useState, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const ChatWindow = ({ sessionId }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isStreaming, setIsStreaming] = useState(false);
    const [streamedMessage, setStreamedMessage] = useState('');
    const fileInputRef = useRef(null);  // Use ref to reference the hidden file input
    const messagesEndRef = useRef(null); // Use ref to auto-scroll

    // Scroll to bottom when new message arrives
    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isStreaming]); // Scroll when messages or streaming state changes

    useEffect(() => {
        if (sessionId) {
            fetch(`http://localhost:8000/chat/conversations/${sessionId}`)
                .then((response) => response.json())
                .then((data) => setMessages(data.messages))
                .catch((error) => console.error('Error fetching conversation:', error));
        }
    }, [sessionId]);

    const handleStream = async (response) => {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantContent = '';
    
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
    
                const chunk = decoder.decode(value, { stream: true });
                assistantContent += chunk;
                setStreamedMessage(assistantContent);
            }
    
            setMessages((prevMessages) => [
                ...prevMessages,
                { role: 'assistant', content: assistantContent },
            ]);
        } catch (error) {
            console.error('Error during streaming:', error);
        } finally {
            setIsStreaming(false);
            setStreamedMessage('');
        }
    };
    
    const sendMessage = async () => {
        if (input.trim()) {
            setMessages([...messages, { role: 'user', content: input }]);
            setInput('');
    
            setIsStreaming(true);
    
            try {
                const response = await fetch('http://localhost:8000/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'text/plain',
                    },
                    body: JSON.stringify({ session_id: sessionId, message: input }),
                });
    
                if (!response.ok) {
                    throw new Error(`Error sending message: ${response.statusText}`);
                }
    
                handleStream(response);
            } catch (error) {
                console.error('Error sending message:', error);
                setIsStreaming(false);
            }
        }
    };

    // Trigger file selection when the button is clicked
    const handleUploadButtonClick = () => {
        fileInputRef.current.click();
    };

    const handleFileChange = async (event) => {
        const file = event.target.files[0];
        if (!file) return;
    
        const formData = new FormData();
        formData.append('file', file);
        formData.append('session_id', sessionId);
    
        try {
            const response = await fetch('http://localhost:8000/ocr/upload-image/', {
                method: 'POST',
                body: formData,
            });
    
            if (response.ok) {
                const data = await response.json();
                setMessages((prevMessages) => [
                    ...prevMessages,
                    { role: 'assistant', content: `Extracted text: ${data.extracted_text}` },
                ]);
            } else {
                throw new Error('Error uploading image');
            }
        } catch (error) {
            console.error('Error uploading image:', error);
        }
    };
    
    return (
        <div className="chat-window">
            <div className="messages">
                {messages
                    .filter(msg => msg.role !== 'system')  // Filter out system messages
                    .map((msg, index) => (
                        <div key={index} className={`message ${msg.role}`}>
                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                {msg.content}
                            </ReactMarkdown>
                        </div>
                    ))
                }
    
                {isStreaming && (
                    <div className="message assistant">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {streamedMessage}
                        </ReactMarkdown>
                    </div>
                )}
                {/* This is the dummy div to auto-scroll to */}
                <div ref={messagesEndRef} />
            </div>
    
            <div className="input-area">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !isStreaming && sendMessage()}
                    disabled={isStreaming}
                />
                <button onClick={sendMessage} disabled={isStreaming}>Send</button>
    
                {/* Hidden file input */}
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileChange}
                />
                <button onClick={handleUploadButtonClick}>Upload</button>
            </div>
        </div>
    );
};

export default ChatWindow;
