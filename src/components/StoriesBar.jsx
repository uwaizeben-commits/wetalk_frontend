import React, { useState, useEffect, useRef } from 'react';

const StoriesBar = ({ currentUser, onStorySelect, onUploadClick }) => {
    const [stories, setStories] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStories();
        const interval = setInterval(fetchStories, 30000); // Refresh every 30s
        return () => clearInterval(interval);
    }, []);

    const fetchStories = async () => {
        try {
            const response = await fetch('http://127.0.0.1:3001/stories');
            if (response.ok) {
                const data = await response.json();
                setStories(data);
            }
        } catch (err) {
            console.error('Failed to fetch stories:', err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="stories-bar-container glass">
            <div className="stories-scroll custom-scrollbar-h">
                {/* My Status */}
                <div className="story-item placeholder" onClick={onUploadClick}>
                    <div className="story-avatar add-status">
                        <div className="avatar-small">{currentUser?.firstName?.[0] || '?'}</div>
                        <div className="add-icon">+</div>
                    </div>
                    <span>My Status</span>
                </div>

                {/* Friend Stories */}
                {stories.map((userStories) => (
                    <div
                        key={userStories.userId}
                        className="story-item"
                        onClick={() => onStorySelect(userStories)}
                    >
                        <div className="story-avatar active">
                            <div className="avatar-small">{userStories.avatar}</div>
                            {/* Circular segments based on count */}
                            <svg className="story-ring" viewBox="0 0 100 100">
                                <circle
                                    cx="50" cy="50" r="48"
                                    className="ring-base"
                                />
                                <circle
                                    cx="50" cy="50" r="48"
                                    className="ring-progress"
                                    style={{
                                        strokeDasharray: '301',
                                        strokeDashoffset: '0'
                                    }}
                                />
                            </svg>
                        </div>
                        <span>{userStories.username}</span>
                    </div>
                ))}

                {loading && stories.length === 0 && (
                    <div className="stories-skeleton">
                        {[1, 2, 3].map(i => <div key={i} className="skeleton-circle" />)}
                    </div>
                )}
            </div>
        </div>
    );
};

export default StoriesBar;
