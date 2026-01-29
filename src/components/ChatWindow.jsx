import React from 'react';
import MessageInput from './MessageInput';

const ChatWindow = ({
    activeContact,
    messages,
    onSendMessage,
    onShowUserProfile,
    onCall,
    onBack,
    isMobile,
    wallpaper = 'default'
}) => {
    return (
        <div className="chat-window-wa">
            <header className="chat-header-wa">
                {isMobile && <button className="back-btn-wa" onClick={onBack}>←</button>}
                <div className="contact-info-wa" onClick={() => onShowUserProfile(activeContact)}>
                    <div className="avatar-wa sm">
                        {activeContact.avatar}
                    </div>
                    <div className="contact-meta-wa">
                        <span className="contact-name-wa">{activeContact.name}</span>
                        <span className="contact-status-wa">online</span>
                    </div>
                </div>
                <div className="header-actions-wa">
                    <button className="icon-btn-wa" onClick={() => onCall(activeContact, 'video')} title="Video Call">🎥</button>
                    <button className="icon-btn-wa" onClick={() => onCall(activeContact, 'voice')} title="Voice Call">📞</button>
                    <div className="wa-header-divider"></div>
                    <button className="icon-btn-wa" title="Search" onClick={() => alert('Search in conversation coming soon!')}>🔍</button>
                    <button className="icon-btn-wa" title="Menu" onClick={() => alert('Chat options coming soon!')}>⋮</button>
                </div>
            </header>

            <div className={`messages-container-wa custom-scrollbar wallpaper-${wallpaper}`}>
                {messages.map((msg, index) => (
                    <div key={index} className={`message-row-wa ${msg.sender === 'me' ? 'sent' : 'received'}`}>
                        <div className="message-bubble-wa">
                            <span className="message-text">{msg.text}</span>
                            <div className="message-footer-wa">
                                <span className="message-time">{msg.time}</span>
                                {msg.sender === 'me' && <span className="message-status">✓</span>}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <MessageInput onSendMessage={onSendMessage} />
        </div>
    );
};

export default ChatWindow;
