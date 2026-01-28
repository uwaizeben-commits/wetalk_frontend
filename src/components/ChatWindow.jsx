import React, { useState, useEffect, useRef } from 'react';
import MessageInput from './MessageInput';

const ChatWindow = ({
    activeContact,
    messages,
    onSendMessage,
    onShowUserProfile,
    onCall,
    onMute,
    onClearChat,
    onBlock,
    onBack,
    isMuted,
    isBlocked,
    isMobile
}) => {
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setShowDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    if (!activeContact) {
        return (
            <main className="chat-window empty">
                <div className="empty-state">
                    <h3>Welcome to Wetalk</h3>
                    <p>Select a conversation to start chatting.</p>
                </div>
            </main>
        );
    }

    return (
        <main className="chat-window">
            <header className="chat-header glass">
                {isMobile && (
                    <button className="icon-btn back-btn mobile-only" onClick={onBack} title="Back to list">
                        ←
                    </button>
                )}
                <div className="active-contact" onClick={() => onShowUserProfile(activeContact)} style={{ cursor: 'pointer' }}>
                    <div className="avatar">
                        {activeContact.profilePic ? (
                            <img src={activeContact.profilePic} alt={activeContact.name} style={{ width: '100%', height: '100%', borderRadius: 'inherit', objectFit: 'cover' }} />
                        ) : (
                            activeContact.avatar
                        )}
                    </div>
                    <div className="contact-status">
                        <h3>{activeContact.name} {isMuted && <span title="Muted">🔕</span>}</h3>
                        <span className="status online">Online</span>
                    </div>
                </div>
                <div className="header-actions">
                    <button className="icon-btn" title="Voice Call" onClick={() => onCall(activeContact, 'voice')} disabled={isBlocked}>📞</button>
                    <button className="icon-btn" title="Video Call" onClick={() => onCall(activeContact, 'video')} disabled={isBlocked}>📹</button>
                    <div className="dropdown-container" ref={dropdownRef}>
                        <button
                            className={`icon-btn ${showDropdown ? 'active' : ''}`}
                            onClick={() => setShowDropdown(!showDropdown)}
                            title="More options"
                        >
                            ⋮
                        </button>
                        {showDropdown && (
                            <div className="menu-dropdown glass fade-in">
                                <button className="menu-item" onClick={() => { onShowUserProfile(activeContact); setShowDropdown(false); }}>
                                    <span>👤</span> View Profile
                                </button>
                                <button className="menu-item" onClick={() => { onMute(); setShowDropdown(false); }}>
                                    <span>{isMuted ? '🔔' : '🔕'}</span> {isMuted ? 'Unmute' : 'Mute'} Notifications
                                </button>
                                <button className="menu-item" onClick={() => { onClearChat(); setShowDropdown(false); }}>
                                    <span>🧹</span> Clear Chat
                                </button>
                                <div className="menu-divider"></div>
                                <button className="menu-item danger" onClick={() => { onBlock(); setShowDropdown(false); }}>
                                    <span>{isBlocked ? '🔓' : '🚫'}</span> {isBlocked ? 'Unblock User' : 'Block User'}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <section className="messages-area">
                {isBlocked ? (
                    <div className="blocked-notice">
                        <p>You have blocked this contact. Unblock to send and receive messages.</p>
                        <button className="text-btn" onClick={onBlock}>Unblock</button>
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <div key={index} className={`message ${msg.sender === 'me' ? 'sent' : 'received'}`}>
                            <p>{msg.text}</p>
                            <span className="message-time">{msg.time}</span>
                        </div>
                    ))
                )}
            </section>

            {!isBlocked && <MessageInput onSendMessage={onSendMessage} />}
        </main>
    );
};

export default ChatWindow;
