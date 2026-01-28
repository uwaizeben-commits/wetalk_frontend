import React from 'react';

const NavRail = ({ activeTab, onTabChange, currentUser, onLogout }) => {
    const tabs = [
        { id: 'chats', icon: '💬', label: 'Chats' },
        { id: 'calls', icon: '📞', label: 'Calls' },
        { id: 'status', icon: '⭕', label: 'Status' },
    ];

    const bottomTabs = [
        { id: 'starred', icon: '⭐', label: 'Starred' },
        { id: 'archived', icon: '📥', label: 'Archived' },
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

                <button className="nav-item" onClick={() => onTabChange('settings')} title="Settings">
                    <span className="nav-icon">⚙️</span>
                </button>

                <button className="nav-item logout-nav-btn" onClick={onLogout} title="Logout">
                    <span className="nav-icon">⏻</span>
                </button>

                <div className="nav-user-avatar" onClick={() => onTabChange('settings')} title="My Profile">
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
