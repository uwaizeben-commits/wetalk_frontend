import React, { useState } from 'react';
import API_URL from '../config';

const CreateGroupModal = ({ currentUser, onClose, onGroupCreated }) => {
    const [groupName, setGroupName] = useState('');
    const [groupDescription, setGroupDescription] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!groupName.trim()) return;

        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/groups`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: groupName,
                    description: groupDescription,
                    creatorId: currentUser.id,
                    members: [currentUser.id]
                })
            });

            if (response.ok) {
                const newGroup = await response.json();
                onGroupCreated(newGroup);
                onClose();
            }
        } catch (err) {
            console.error('Create group error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay">
            <div className="modal glass">
                <div className="modal-header">
                    <h3>Create New Group</h3>
                    <button className="close-btn" onClick={onClose}>✕</button>
                </div>
                <form onSubmit={handleSubmit} className="modal-body">
                    <div className="form-group">
                        <label>Group Name</label>
                        <input
                            type="text"
                            value={groupName}
                            onChange={(e) => setGroupName(e.target.value)}
                            placeholder="Enter group name"
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Description (Optional)</label>
                        <textarea
                            value={groupDescription}
                            onChange={(e) => setGroupDescription(e.target.value)}
                            placeholder="What's this group about?"
                            rows="3"
                        />
                    </div>
                    <div className="modal-actions">
                        <button type="button" className="wa-btn secondary" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="wa-btn primary" disabled={isLoading}>
                            {isLoading ? 'Creating...' : 'Create Group'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default CreateGroupModal;
