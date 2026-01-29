import React, { useState, useEffect } from 'react';
import API_URL from '../config';

const Calls = ({ currentUser }) => {
    const [calls, setCalls] = useState([]);

    useEffect(() => {
        fetchCalls();
    }, []);

    const fetchCalls = async () => {
        try {
            const response = await fetch(`${API_URL}/calls/${currentUser.id}`);
            if (response.ok) {
                const data = await response.json();
                setCalls(data);
            }
        } catch (err) {
            console.error('Fetch calls error:', err);
        }
    };

    return (
        <div className="calls-container custom-scrollbar glass">
            <div className="calls-header">
                <h2>Calls</h2>
            </div>
            <div className="calls-list">
                {calls.length === 0 ? (
                    <div className="empty-state">
                        <p>No call history yet</p>
                    </div>
                ) : (
                    calls.map(call => (
                        <div key={call._id} className="call-item">
                            <div className="call-avatar">{call.contactName[0]}</div>
                            <div className="call-info">
                                <h4>{call.contactName}</h4>
                                <span className="call-type">
                                    {call.type === 'video' ? '🎥' : '📞'} {call.type} call
                                </span>
                            </div>
                            <div className="call-time">
                                {new Date(call.timestamp).toLocaleString()}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default Calls;
