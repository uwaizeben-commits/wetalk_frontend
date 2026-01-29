import React, { useState, useEffect } from 'react';

const Calls = ({ currentUser, onCall }) => {
    const [calls, setCalls] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (currentUser?.id) {
            fetchCalls();
        }
    }, [currentUser]);

    const fetchCalls = async () => {
        try {
            const response = await fetch(`http://127.0.0.1:3001/calls/${currentUser.id}`);
            if (response.ok) {
                const data = await response.json();
                setCalls(data);
            }
        } catch (err) {
            console.error('Failed to fetch calls', err);
        } finally {
            setLoading(false);
        }
    };

    const formatTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    const getIcon = (type, status, isCaller) => {
        if (status === 'missed') return '🚫'; // Missed
        if (type === 'video') return '📹';
        return '📞';
    };

    const getStatusIcon = (status, isCaller) => {
        if (status === 'missed') return <span className="call-icon missed">↙</span>;
        if (isCaller) return <span className="call-icon outgoing">↗</span>;
        return <span className="call-icon incoming">↙</span>;
    };

    return (
        <div className="calls-container">
            <header className="calls-header">
                <h2>Calls</h2>
                <div className="header-actions">
                    <button className="icon-btn">🔍</button>
                    <button className="icon-btn">⋮</button>
                </div>
            </header>

            <div className="calls-list custom-scrollbar">
                {loading ? (
                    <div className="loading">Loading call history...</div>
                ) : calls.length === 0 ? (
                    <div className="empty-state">
                        <div className="icon">📞</div>
                        <p>No recent calls</p>
                    </div>
                ) : (
                    calls.map(call => {
                        const isCaller = call.caller._id === currentUser.id;
                        const otherUser = isCaller ? call.receiver : call.caller;

                        return (
                            <div key={call._id} className="call-item">
                                <div className="avatar">
                                    {otherUser.avatar ? (
                                        <img src={otherUser.avatar} alt="avatar" />
                                    ) : (
                                        (otherUser.firstName?.[0] || '?')
                                    )}
                                </div>
                                <div className="call-info">
                                    <div className="call-name-row">
                                        <span className={`name ${call.status === 'missed' ? 'missed-text' : ''}`}>
                                            {otherUser.firstName} {otherUser.lastname}
                                        </span>
                                    </div>
                                    <div className="call-meta">
                                        {getStatusIcon(call.status, isCaller)}
                                        <span className="time">{formatTime(call.timestamp)}</span>
                                    </div>
                                </div>
                                <button className="call-action-btn" onClick={() => onCall(otherUser, call.type)}>
                                    {getIcon(call.type, call.status)}
                                </button>
                            </div>
                        );
                    })
                )}
            </div>
        </div>
    );
};

export default Calls;
