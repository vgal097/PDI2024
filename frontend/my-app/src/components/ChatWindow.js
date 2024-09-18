import React, { useEffect, useState } from 'react';
import ReactMarkdown from 'react-markdown'; // Import the markdown renderer
import remarkGfm from 'remark-gfm'; // Import GitHub-flavored markdown (optional but recommended)

const ChatWindow = ({ sessionId }) => {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isStreaming, setIsStreaming] = useState(false); // To handle streaming state
    const [streamedMessage, setStreamedMessage] = useState(''); // For the message being streamed

    useEffect(() => {
        // Fetch previous conversations by sessionId
        if (sessionId) {
            fetch(`http://localhost:8000/chat/conversations/${sessionId}`)
                .then((response) => response.json())
                .then((data) => setMessages(data.messages))
                .catch((error) => console.error('Error fetching conversation:', error));
        }
    }, [sessionId]);

    // Function to handle streaming responses
    const handleStream = async (response) => {
        const reader = response.body.getReader();
        const decoder = new TextDecoder();
        let assistantContent = '';
    
        try {
            while (true) {
                const { done, value } = await reader.read();
                if (done) break;
    
                const chunk = decoder.decode(value, { stream: true });
                console.log('Chunk received on front-end:', chunk);  // Log each chunk
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
            // Add user message to the conversation
            setMessages([...messages, { role: 'user', content: input }]);
            setInput('');
    
            setIsStreaming(true); // Indicate streaming is in progress
    
            try {
                // Make the POST request to stream the assistant's response
                const response = await fetch('http://localhost:8000/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'Accept': 'text/plain',  // Ensure streaming text is supported
                    },
                    body: JSON.stringify({ session_id: sessionId, message: input }),
                });
    
                if (!response.ok) {
                    throw new Error(`Error sending message: ${response.statusText}`);
                }
    
                // Stream the response
                handleStream(response);
            } catch (error) {
                console.error('Error sending message:', error);
                setIsStreaming(false); // Reset the streaming state if there’s an error
            }
        }
    };
    
    return (
        <div className="chat-window">
            <div className="messages">
                {/* Render the conversation messages */}
                {messages.map((msg, index) => (
                    <div key={index} className={`message ${msg.role}`}>
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {msg.content}
                        </ReactMarkdown>
                    </div>
                ))}

                {/* Render the assistant's streamed message */}
                {isStreaming && (
                    <div className="message assistant">
                        <ReactMarkdown remarkPlugins={[remarkGfm]}>
                            {streamedMessage}
                        </ReactMarkdown>
                    </div>
                )}
            </div>

            {/* Input field for user messages */}
            <div className="input-area">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && !isStreaming && sendMessage()}
                    disabled={isStreaming} // Disable input while streaming
                />
                <button onClick={sendMessage} disabled={isStreaming}>Send</button>
            </div>
        </div>
    );
};

export default ChatWindow;
