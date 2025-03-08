import React from 'react';
const MessageBubble = ({ sender, text }) => {
  const isUser = sender === "user";
  return (
    <div className={`message-bubble ${isUser ? 'user' : 'assistant'}`}>
      <div className="message-text">{text}</div>
    </div>
  );
};
export default MessageBubble;