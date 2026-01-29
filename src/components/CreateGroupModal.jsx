import React, { useState } from 'react';

const CreateGroupModal = ({ currentUser, onClose, onCreateGroup }) => {
    const [groupName, setGroupName] = useState('');
    const [description, setDescription] = useState('');
    const [icon, setIcon] = useState('👥');
    const [error, setError] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!groupName.trim()) {
            setError('Group name is required');
            return;
        }

        try {
            const response = await fetch('http://127.0.0.1:3001/groups', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: groupName,
                    description,
                    icon,
                    userId: currentUser.id
                })
            });

            if (response.ok) {
                const newGroup = await response.json();
                onCreateGroup(newGroup);
                onClose();
            } else {
                const data = await response.json();
                setError(data.message || 'Failed to create group');
            }
        } catch (err) {
            setError('Connection error');
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal glass">
                <div className="modal-header">
                    <h3>Create New Group</h3>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>
                <form onSubmit={handleSubmit} className="auth-form">
                    {error && <div className="error-message">{error}</div>}

                    <div className="form-group">
                        <label>Group Icon</label>
                        <div className="icon-selector">
                            {['👥', '📣', '💼', '🎮', '⚽', '🏠'].map(emoji => (
                                <span
                                    key={emoji}
                                    className={`emoji-option ${icon === emoji ? 'selected' : ''}`}
                                    onClick={() => setIcon(emoji)}
                                >
                                    {emoji}
                                </span>
                            ))}
                        </div>
                    </div>

                    <div className="form-group">
                        <label>Group Name</label>
                        <input
                            type="text"
                            placeholder="e.g. Friends & Family"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                        />
                    </div>

                    <div className="form-group">
                        <label>Description</label>
                        <input
                            type="text"
                            placeholder="Optional description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </div>

                    <div className="modal-actions">
                        <button type="button" className="wa-btn secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="wa-btn primary">Create</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateGroupModal;
