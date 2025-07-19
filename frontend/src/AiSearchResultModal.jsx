// frontend/src/AiSearchResultModal.jsx
import React, { useState, useEffect, useRef } from 'react';
import { X, Send, Loader2, User, Bot } from 'lucide-react'; // Import necessary icons

const AiSearchResultModal = ({
  query, // The initial query from the search bar (if any)
  conversation, // Array of { type: 'user' | 'ai', text: '...' }
  isLoading,
  error, // Not currently used, but good to have for future error display
  onClose,
  onNewQuery, // Function to send a new query to the AI
  showCloseButton // Prop to control if the close button is visible
}) => {
  const [currentMessage, setCurrentMessage] = useState('');
  const messagesEndRef = useRef(null); // Ref for auto-scrolling to the latest message

  // Scroll to the bottom of the chat when new messages arrive or loading state changes
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation, isLoading]);

  // If there's an initial query from the search bar, set it to the input field
  useEffect(() => {
    if (query && conversation.length === 0 && !isLoading) {
      setCurrentMessage(query);
    }
  }, [query, conversation.length, isLoading]);


  const handleSend = (e) => {
    e.preventDefault();
    if (currentMessage.trim()) {
      onNewQuery(currentMessage); // Use onNewQuery to send the message
      setCurrentMessage(''); // Clear input after sending
    }
  };

  return (
    <div className="ai-result-modal-overlay">
      <div className="ai-result-modal-content">
        {showCloseButton && (
          <button className="ai-result-modal-close" onClick={onClose}>
            <X size={24} />
          </button>
        )}
        {/* Updated AI Name */}
        <h2 className="ai-result-modal-title">Michael AI Assistant</h2>

        <div className="ai-conversation-history">
          {conversation.length === 0 && !isLoading && (
            // Updated placeholder message for Michael AI
            <p className="ai-placeholder-message">
              Hello! I'm Michael AI. How can I assist you with your threat intelligence dashboard today?
            </p>
          )}
          {conversation.map((msg, index) => (
            <div key={index} className={`ai-message-bubble ai-message-${msg.type}`}>
              {msg.type === 'user' ? (
                <User size={20} className="ai-message-icon icon-mr" />
              ) : (
                <Bot size={20} className="ai-message-icon icon-mr" />
              )}
              <p>{msg.text}</p>
            </div>
          ))}
          {isLoading && (
            <div className="ai-message-bubble ai-message-ai ai-loading-message">
              <Bot size={20} className="ai-message-icon icon-mr" />
              <div className="ai-loading-indicator">
                <Loader2 size={20} className="spinner" />
                <span>Michael AI is typing...</span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} /> {/* Dummy div to scroll into view */}
        </div>

        <form onSubmit={handleSend} className="ai-input-form">
          <input
            type="text"
            value={currentMessage}
            onChange={(e) => setCurrentMessage(e.target.value)}
            placeholder={isLoading ? "Michael AI is typing..." : "Type your message..."}
            className="ai-chat-input"
            disabled={isLoading} // Disable input while AI is thinking
          />
          <button type="submit" className="ai-send-button" disabled={isLoading || !currentMessage.trim()}>
            <Send size={20} />
          </button>
        </form>

        <button className="ai-result-modal-button" onClick={onClose}>
          Close Chat
        </button>
      </div>
    </div>
  );
};

export default AiSearchResultModal;