import React from 'react';

const NavRail = ({ activeTab, onTabChange, currentUser }) => {
    const tabs = [
        { id: 'chats', icon: '💬', label: 'Chats', notification: 61 },
        { id: 'calls', icon: '📞', label: 'Calls', notification: 10 },
        { id: 'status', icon: '⭕', label: 'Status' },
        { id: 'communities', icon: '👥', label: 'Communities' },
    ];

    const bottomTabs = [
        { id: 'starred', icon: '⭐', label: 'Starred' },
        { id: 'archived', icon: '📥', label: 'Archived' },
        { id: 'settings', icon: '⚙️', label: 'Settings' },
    ];

    return (
        <div className="nav-rail">
            <div className="nav-top">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => onTabChange(tab.id)}
                        title={tab.label}
                    >
                        <span className="nav-icon">{tab.icon}</span>
                        {tab.notification > 0 && (
                            <span className="nav-badge">{tab.notification}</span>
                        )}
                    </button>
                ))}
            </div>

            <div className="nav-bottom">
                {bottomTabs.map(tab => (
                    <button
                        key={tab.id}
                        className={`nav-item ${activeTab === tab.id ? 'active' : ''}`}
                        onClick={() => onTabChange(tab.id)}
                        title={tab.label}
                    >
                        <span className="nav-icon">{tab.icon}</span>
                    </button>
                ))}
                <div className="nav-user-avatar">
                    {currentUser?.profilePic ? (
                        <img src={currentUser.profilePic} alt="Me" />
                    ) : (
                        currentUser?.firstName?.[0] || '?'
                    )}
                </div>
            </div>
        </div>
    );
};

export default NavRail;
