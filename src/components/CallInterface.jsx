import React, { useState, useEffect } from 'react';

const CallInterface = ({ user, callType, onEndCall }) => {
    const [callDuration, setCallDuration] = useState(0);

    useEffect(() => {
        const timer = setInterval(() => {
            setCallDuration((prev) => prev + 1);
        }, 1000);
        return () => clearInterval(timer);
    }, []);

    const formatDuration = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div className="call-page fade-in">
            <div className="call-container glass blur">
                <div className="call-user-info">
                    <div className="avatar-xl">
                        {user.profilePic ? (
                            <img src={user.profilePic} alt={user.name} />
                        ) : (
                            <div className="avatar-placeholder">
                                {user.avatar || user.name?.substring(0, 1).toUpperCase()}
                            </div>
                        )}
                    </div>
                    <h2>{user.name}</h2>
                    <p className="call-status">
                        {callType === 'video' ? 'Video Calling...' : 'Voice Calling...'}
                    </p>
                    <span className="call-timer">{formatDuration(callDuration)}</span>
                </div>

                <div className="call-actions">
                    <button className="icon-btn mute-btn" title="Mute">🎤</button>
                    {callType === 'video' && <button className="icon-btn cam-btn" title="Toggle Camera">📹</button>}
                    <button className="icon-btn end-call-btn" onClick={onEndCall} title="End Call">
                        📞
                    </button>
                    <button className="icon-btn volume-btn" title="Speaker">🔊</button>
                </div>
            </div>
        </div>
    );
};

export default CallInterface;
