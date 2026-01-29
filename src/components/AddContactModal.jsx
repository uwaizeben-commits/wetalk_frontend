import React, { useState } from 'react';
import API_URL from '../config';

const AddContactModal = ({ onClose, onAddContact }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [results, setResults] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsLoading(true);
        setError('');
        try {
            const response = await fetch(`${API_URL}/users/search?query=${encodeURIComponent(searchQuery)}`);
            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Server error: ${response.status}`);
            }
            const data = await response.json();
            setResults(data);
            if (data.length === 0) setError('No users found');
        } catch (err) {
            console.error('Search error:', err);
            setError(err.message === 'Failed to fetch'
                ? 'Cannot connect to server. Please ensure the backend is running.'
                : err.message || 'Search failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-overlay glass fade-in" onClick={onClose}>
            <div className="modal-content glass chat-card" onClick={e => e.stopPropagation()}>
                <header className="modal-header">
                    <h3>Add New Contact</h3>
                    <button className="icon-btn" onClick={onClose}>✕</button>
                </header>

                <form onSubmit={handleSearch} className="search-form">
                    <div className="search-bar">
                        <input
                            type="text"
                            placeholder="Search by username or phone..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            autoFocus
                        />
                        <button type="submit" className="search-pill-btn" disabled={isLoading}>
                            {isLoading ? '...' : 'Search'}
                        </button>
                    </div>
                </form>

                <div className="search-results custom-scrollbar">
                    {error && <p className="error-text">{error}</p>}
                    {results.map(user => (
                        <div key={user.id} className="search-item">
                            <div className="avatar">{user.avatar}</div>
                            <div className="user-info">
                                <span className="user-name">{user.firstName} {user.lastname}</span>
                                <span className="user-tag">@{user.username}</span>
                            </div>
                            <button
                                className="add-btn"
                                onClick={() => {
                                    onAddContact(user);
                                    onClose();
                                }}
                            >
                                Add
                            </button>
                        </div>
                    ))}
                    {!isLoading && results.length === 0 && !error && (
                        <p className="empty-hint">Search for friends on Wetalk</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AddContactModal;
