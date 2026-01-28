import React, { useState } from 'react';
import StoriesBar from './StoriesBar';

const Sidebar = ({
    contacts,
    activeContact,
    onSelectContact,
    currentUser,
    onNewChat,
    onSelectStory,
    onUploadStory,
    activeTab = 'chats',
    mutedContacts = [],
    blockedContacts = []
}) => {
    const [activeFilter, setActiveFilter] = useState('All');
    const [searchQuery, setSearchQuery] = useState('');
    const filters = ['All', 'Unread', 'Favourites', 'Groups'];

    const filteredContacts = contacts.filter(contact => {
        const matchesSearch = contact.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            contact.lastMessage.toLowerCase().includes(searchQuery.toLowerCase());

        let matchesFilter = true;
        if (activeFilter === 'Unread') matchesFilter = contact.unread > 0;
        if (activeFilter === 'Favourites') matchesFilter = contact.starred; // Mocked
        if (activeFilter === 'Groups') matchesFilter = contact.isGroup; // Mocked

        return matchesSearch && matchesFilter;
    });

    if (activeTab === 'status') {
        return (
            <aside className="sidebar-chat-list">
                <header className="sidebar-header-wa">
                    <div className="header-title-row">
                        <h2>Status</h2>
                        <div className="header-actions">
                            <button className="icon-btn-wa" onClick={onUploadStory} title="Add Status">
                                <span className="wa-icon">➕</span>
                            </button>
                        </div>
                    </div>
                </header>
                <div className="status-view-wa custom-scrollbar">
                    <StoriesBar
                        currentUser={currentUser}
                        onStorySelect={onSelectStory}
                        onUploadClick={onUploadStory}
                    />
                </div>
            </aside>
        );
    }

    return (
        <aside className="sidebar-chat-list">
            <header className="sidebar-header-wa">
                <div className="header-title-row">
                    <h2>Chats</h2>
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
                                {contact.unread > 0 && (
                                    <span className="unread-badge-wa">{contact.unread}</span>
                                )}
                            </div>
                        </div>
                    </div>
                )) : (
                    <div className="no-results-wa">No conversations found</div>
                )}
            </nav>
        </aside>
    );
};

export default Sidebar;
