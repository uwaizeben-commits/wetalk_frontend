import React from 'react';
import StoriesBar from './StoriesBar';

const Sidebar = ({
    contacts,
    activeContact,
    onSelectContact,
    currentUser,
    onLogout,
    onShowProfile,
    onNewChat,
    onSelectStory,
    onUploadStory,
    mutedContacts = [],
    blockedContacts = []
}) => {
    return (
        <aside className="sidebar glass">
            <header className="sidebar-header">
                <h2>Wetalk</h2>
                <button className="new-chat-btn" onClick={onNewChat} title="New Chat">+</button>
            </header>
            <div className="search-bar">
                <input type="text" placeholder="Search conversations..." />
            </div>

            <StoriesBar
                currentUser={currentUser}
                onStorySelect={onSelectStory}
                onUploadClick={onUploadStory}
            />

            <nav className="contact-list">
                {contacts.map((contact) => (
                    <div
                        key={contact.id}
                        className={`contact-item ${activeContact?.id === contact.id ? 'active' : ''} ${blockedContacts.includes(contact.id) ? 'blocked' : ''}`}
                        onClick={() => onSelectContact(contact)}
                    >
                        <div className="avatar">
                            {contact.avatar}
                            {mutedContacts.includes(contact.id) && <span className="mute-indicator">🔕</span>}
                        </div>
                        <div className="contact-info">
                            <span className="contact-name">
                                {contact.name}
                                {blockedContacts.includes(contact.id) && <span className="blocked-tag">Blocked</span>}
                            </span>
                            <span className="last-message">
                                {blockedContacts.includes(contact.id) ? "Contact blocked" : contact.lastMessage}
                            </span>
                        </div>
                        <span className="time">{contact.time}</span>
                    </div>
                ))}
            </nav>

            <div className="sidebar-footer glass">
                <div className="user-profile" onClick={onShowProfile} style={{ cursor: 'pointer' }}>
                    <div className="avatar">
                        {currentUser?.profilePic ? (
                            <img src={currentUser.profilePic} alt="Profile" style={{ width: '100%', height: '100%', borderRadius: 'inherit', objectFit: 'cover' }} />
                        ) : (
                            currentUser?.firstName?.substring(0, 2).toUpperCase() || currentUser?.username?.substring(0, 2).toUpperCase()
                        )}
                    </div>
                    <div className="user-info">
                        <span className="user-name">{currentUser?.firstName || currentUser?.username}</span>
                        <span className="user-status">Settings</span>
                    </div>
                </div>
                <button className="icon-btn logout-btn" onClick={onLogout} title="Logout">
                    ⏻
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
