import React from 'react';

const UserDetail = ({ user, onBack, onCall }) => {
    if (!user) return null;

    return (
        <div className="user-detail-page fade-in">
            <div className="profile-container glass">
                <header className="profile-header">
                    <button className="icon-btn back-btn" onClick={onBack} title="Go back">
                        ←
                    </button>
                    <h1>User Details</h1>
                </header>

                <div className="avatar-section">
                    <div className="avatar-large">
                        {user.profilePic ? (
                            <img src={user.profilePic} alt={user.name} />
                        ) : (
                            <div className="avatar-placeholder">
                                {user.avatar || user.name?.substring(0, 1).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <h2>{user.name}</h2>
                    <p className="username-tag">@{user.username || user.name.toLowerCase().replace(' ', '')}</p>
                </div>

                <div className="stats-row">
                    <div className="stat-item">
                        <span className="stat-value">Active</span>
                        <span className="stat-label">Status</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-value">{user.phone || 'N/A'}</span>
                        <span className="stat-label">Phone</span>
                    </div>
                </div>

                <div className="bio-section">
                    <h3>Bio</h3>
                    <p>{user.bio || "No bio available."}</p>
                </div>

                <div className="action-buttons">
                    <button className="action-btn call-btn" onClick={() => onCall(user, 'voice')}>
                        Phone Call
                    </button>
                    <button className="action-btn video-btn" onClick={() => onCall(user, 'video')}>
                        Video Call
                    </button>
                </div>
            </div>
        </div>
    );
};

export default UserDetail;
