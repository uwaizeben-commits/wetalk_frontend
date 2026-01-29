import React, { useState } from 'react';

const Sidebar = ({
    contacts,
    activeContact,
    onSelectContact,
    currentUser,
    onNewChat,
    activeTab = 'chats',
    mutedContacts = [],
    blockedContacts = [],
    onArchiveChat,
    onStarChat
}) => {
    const [activeFilter, setActiveFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const filters = ['All', 'Unread', 'Favourites', 'Groups'];

    const filteredContacts = contacts.filter(contact => {
        const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contact.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

        // Tab Filtering
        if (activeTab === 'archived' && !contact.isArchived) return false;
        if (activeTab === 'starred' && !contact.isStarred) return false;
        if (activeTab === 'chats' && contact.isArchived) return false; // Hide archived in main list

        let matchesFilter = true;
        if (activeFilter === 'Unread') matchesFilter = contact.unread > 0;
        if (activeFilter === 'Favourites') matchesFilter = contact.isStarred;
        if (activeFilter === 'Groups') matchesFilter = contact.isGroup;

        return matchesSearch && matchesFilter;
    });

    return (
        <aside className="sidebar-chat-list">
            <header className="sidebar-header-wa">
                <div className="header-title-row">
                    <h2>{activeTab === 'archived' ? 'Archived' : activeTab === 'starred' ? 'Starred' : 'Chats'}</h2>
                    <div className="header-actions">
                        <button className="icon-btn-wa" onClick={onNewChat} title="New Chat">
                            <span className="wa-icon">📝</span>
                        </button>
                        <button className="icon-btn-wa" title="Menu" onClick={() => alert('Sidebar Menu coming soon!')}>
                            <span className="wa-icon">⋮</span>
                        </button>
                    </div>
                </div>

                <div className="search-container-wa">
                    <div className="search-bar-wa">
                        <span className="search-icon-wa">🔍</span>
                        <input
                            type="text"
                            placeholder="Search or start a new chat"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>

                <div className="filter-pills-wa">
                    {filters.map(filter => (
                        <button
                            key={filter}
                            className={`filter-pill ${activeFilter === filter ? 'active' : ''}`}
                            onClick={() => setActiveFilter(filter)}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </header>

            <nav className="contact-list-wa custom-scrollbar">
                {filteredContacts.length > 0 ? filteredContacts.map((contact) => (
                    <div
                        key={contact.id}
                        className={`contact-item-wa ${activeContact?.id === contact.id ? 'active' : ''} ${blockedContacts.includes(contact.id) ? 'blocked' : ''}`}
                        onClick={() => onSelectContact(contact)}
                    >
                        <div className="avatar-wa">
                            {contact.avatar}
                            {mutedContacts.includes(contact.id) && <span className="mute-indicator-wa">🔕</span>}
                        </div>
                        <div className="contact-content-wa">
                            <div className="contact-top-row">
                                <span className="contact-name-wa">{contact.name}</span>
                                <span className="contact-time-wa">{contact.time}</span>
                            </div>
                            <div className="contact-bottom-row">
                                <span className="contact-message-wa">
                                    {blockedContacts.includes(contact.id) ? "Contact blocked" : contact.lastMessage}
                                </span>
                                <div className="contact-meta-actions">
                                    {contact.isStarred && <span className="star-indicator">⭐</span>}
                                    {contact.unread > 0 && (
                                        <span className="unread-badge-wa">{contact.unread}</span>
                                    )}
                                </div>
                            </div>
                        </div>
                        {/* Quick Actions (Hover) - Simplified for now as right side buttons */}
                        <div className="item-actions">
                            <button
                                className={`action-btn ${contact.isStarred ? 'active' : ''}`}
                                onClick={(e) => { e.stopPropagation(); onStarChat(contact); }}
                                title={contact.isStarred ? "Unstar" : "Star"}
                            >
                                {contact.isStarred ? '★' : '☆'}
                            </button>
                            <button
                                className="action-btn"
                                onClick={(e) => { e.stopPropagation(); onArchiveChat(contact); }}
                                title={contact.isArchived ? "Unarchive" : "Archive"}
                            >
                                {contact.isArchived ? 'un-box' : '📥'}
                            </button>
                        </div>
                    </div>
                )) : (
                    <div className="no-results-wa">
                        {activeTab === 'archived' ? 'No archived chats' :
                            activeTab === 'starred' ? 'No starred messages' :
                                'No conversations found'}
                    </div>
                )}
            </nav>
        </aside>
    );
};

export default Sidebar;
