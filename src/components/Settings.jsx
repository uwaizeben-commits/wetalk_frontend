import React, { useState, useRef, useEffect } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage';
import API_URL from '../config';

const Settings = ({ currentUser, onUpdateProfile, onUpdateSettings, onLogout, onDeleteAccount, onClearChats, onBack }) => {
    const [activeSection, setActiveSection] = useState('profile');
    const [profileData, setProfileData] = useState({
        firstName: currentUser.firstName || '',
        lastname: currentUser.lastname || '',
        username: currentUser.username || '',
        bio: currentUser.bio || 'Available',
        email: currentUser.email || '',
        avatar: currentUser.avatar || ''
    });

    // Image Cropping State
    const [imageSrc, setImageSrc] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [showCropModal, setShowCropModal] = useState(false);

    const [settingsData, setSettingsData] = useState(currentUser.settings || {
        privacy: { lastSeen: true, readReceipts: true, twoFactor: false },
        chat: { theme: 'light', wallpaper: 'default', fontSize: 'medium', mediaAutoDownload: true },
        notifications: { pushEnabled: true, soundEnabled: true, previewEnabled: true }
    });

    const [passwordData, setPasswordData] = useState({ current: '', new: '', confirm: '' });
    const [blockedUsers, setBlockedUsers] = useState([]);
    const [showBlockedModal, setShowBlockedModal] = useState(false);

    const fileInputRef = useRef(null);

    const handleProfileSubmit = (e) => {
        e.preventDefault();
        onUpdateProfile(profileData);
    };

    const handleAvatarChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setImageSrc(reader.result);
                setShowCropModal(true);
            });
            reader.readAsDataURL(file);
            // Reset input so same file selection works if cancelled
            e.target.value = null;
        }
    };

    const onCropComplete = (croppedArea, croppedAreaPixels) => {
        setCroppedAreaPixels(croppedAreaPixels);
    };

    const showCroppedImage = async () => {
        try {
            const croppedImage = await getCroppedImg(
                imageSrc,
                croppedAreaPixels
            );
            setProfileData(prev => ({ ...prev, avatar: croppedImage }));
            // We can wait to save until they click "Save Changes" on the form
            // Or save immediately if desired. Current UX is form submit.
            // But let's auto-update the prop for immediate feedback?
            // Actually, best to just set local state and let them save the form.
            // However, the original code did onUpdateProfile immediately.
            // Let's stick to local state update, and they must click Save Changes.
            // Wait, original: onUpdateProfile({ ...profileData, avatar: newAvatar });
            // Let's replicate original behavior for "immediate" feel but valid:
            // The form has a "Save Changes" button. It's better to use that.
            // BUT, if the user expects immediate update like before, we might want to do it.
            // Let's just set the local state preview.

            setShowCropModal(false);
            setImageSrc(null);
        } catch (e) {
            console.error(e);
        }
    };

    const closeCropModal = () => {
        setShowCropModal(false);
        setImageSrc(null);
    };

    const handlePasswordChange = async () => {
        if (passwordData.new !== passwordData.confirm) {
            alert("New passwords don't match!");
            return;
        }
        try {
            const response = await fetch(`${API_URL}/users/${currentUser.id}/change-password`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ currentPassword: passwordData.current, newPassword: passwordData.new })
            });
            const data = await response.json();
            if (response.ok) {
                alert('Password updated successfully!');
                setPasswordData({ current: '', new: '', confirm: '' });
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert('Failed to update password');
        }
    };

    const fetchBlockedUsers = async () => {
        try {
            const response = await fetch(`${API_URL}/users/${currentUser.id}/blocked`);
            if (response.ok) {
                const data = await response.json();
                setBlockedUsers(data);
                setShowBlockedModal(true);
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleUnblock = async (contactId) => {
        try {
            const response = await fetch(`${API_URL}/users/${currentUser.id}/unblock`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ contactId })
            });
            if (response.ok) {
                setBlockedUsers(prev => prev.filter(u => u._id !== contactId));
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleSettingsChange = (category, setting, value) => {
        const newSettings = {
            ...settingsData,
            [category]: { ...settingsData[category], [setting]: value }
        };
        setSettingsData(newSettings);
        onUpdateSettings(newSettings);
    };

    const sections = [
        { id: 'profile', icon: '👤', label: 'Profile & Account' },
        { id: 'privacy', icon: '🔒', label: 'Privacy & Security' },
        { id: 'chat', icon: '💬', label: 'Chat Settings' },
        { id: 'notifications', icon: '🔔', label: 'Notifications' },
        { id: 'storage', icon: '💾', label: 'Storage & Data' }
    ];

    return (
        <div className="settings-container glass fadeIn">
            <header className="settings-header">
                <button className="icon-btn" onClick={onBack}>←</button>
                <h2>Settings</h2>
            </header>

            <div className="settings-layout">
                <aside className="settings-nav">
                    {sections.map(s => (
                        <button
                            key={s.id}
                            className={`nav-item ${activeSection === s.id ? 'active' : ''}`}
                            onClick={() => setActiveSection(s.id)}
                        >
                            <span className="icon">{s.icon}</span>
                            <span className="label">{s.label}</span>
                        </button>
                    ))}
                    <button className="nav-item logout" onClick={onLogout}>
                        <span className="icon">🚪</span>
                        <span className="label">Logout</span>
                    </button>
                </aside>

                <main className="settings-content custom-scrollbar">
                    {activeSection === 'profile' && (
                        <div className="settings-section">
                            <h3>Profile & Account</h3>
                            <form onSubmit={handleProfileSubmit} className="settings-form">
                                <div className="avatar-upload">
                                    <div className="avatar-preview">
                                        {profileData.avatar ? <img src={profileData.avatar} alt="Avatar" /> : (profileData.firstName[0] || '?')}
                                    </div>
                                    <input
                                        type="file"
                                        hidden
                                        ref={fileInputRef}
                                        accept="image/*"
                                        onChange={handleAvatarChange}
                                    />
                                    <button type="button" className="wa-btn secondary" onClick={() => fileInputRef.current.click()}>
                                        Change Picture
                                    </button>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label>First Name</label>
                                        <input
                                            type="text"
                                            value={profileData.firstName}
                                            onChange={(e) => setProfileData({ ...profileData, firstName: e.target.value })}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Last Name</label>
                                        <input
                                            type="text"
                                            value={profileData.lastname}
                                            onChange={(e) => setProfileData({ ...profileData, lastname: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Username</label>
                                    <input
                                        type="text"
                                        value={profileData.username}
                                        onChange={(e) => setProfileData({ ...profileData, username: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Email Address</label>
                                    <input
                                        type="email"
                                        placeholder="Add email for recovery"
                                        value={profileData.email}
                                        onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                    />
                                </div>
                                <div className="form-group">
                                    <label>About / Bio</label>
                                    <textarea
                                        value={profileData.bio}
                                        onChange={(e) => setProfileData({ ...profileData, bio: e.target.value })}
                                    />
                                </div>
                                <button type="submit" className="wa-btn primary">Save Changes</button>
                            </form>

                            <div className="account-actions">
                                <h4>Change Password</h4>
                                <div className="form-group">
                                    <input
                                        type="password"
                                        placeholder="Current Password"
                                        value={passwordData.current}
                                        onChange={(e) => setPasswordData({ ...passwordData, current: e.target.value })}
                                    />
                                    <input
                                        type="password"
                                        placeholder="New Password"
                                        value={passwordData.new}
                                        onChange={(e) => setPasswordData({ ...passwordData, new: e.target.value })}
                                    />
                                    <input
                                        type="password"
                                        placeholder="Confirm New Password"
                                        value={passwordData.confirm}
                                        onChange={(e) => setPasswordData({ ...passwordData, confirm: e.target.value })}
                                    />
                                    <button className="wa-btn secondary" onClick={handlePasswordChange}>Update Password</button>
                                </div>
                                <button className="wa-btn danger" onClick={onDeleteAccount}>Delete Account Permanently</button>
                            </div>
                        </div>
                    )}

                    {activeSection === 'privacy' && (
                        <div className="settings-section">
                            <h3>Privacy & Security</h3>
                            <div className="toggle-list">
                                <div className="toggle-item">
                                    <div className="info">
                                        <strong>Last Seen & Online</strong>
                                        <span>If turned off, you won't see other people's status.</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={settingsData.privacy.lastSeen}
                                        onChange={(e) => handleSettingsChange('privacy', 'lastSeen', e.target.checked)}
                                    />
                                </div>
                                <div className="toggle-item">
                                    <div className="info">
                                        <strong>Read Receipts</strong>
                                        <span>Show your activity in chats (Blue ticks).</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={settingsData.privacy.readReceipts}
                                        onChange={(e) => handleSettingsChange('privacy', 'readReceipts', e.target.checked)}
                                    />
                                </div>
                                <div className="toggle-item">
                                    <div className="info">
                                        <strong>Two-Step Verification</strong>
                                        <span>Add an extra layer of security.</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={settingsData.privacy.twoFactor}
                                        onChange={(e) => handleSettingsChange('privacy', 'twoFactor', e.target.checked)}
                                    />
                                </div>
                            </div>
                            <div className="list-group">
                                <h4>Blocked Contacts</h4>
                                <button className="wa-btn secondary" onClick={fetchBlockedUsers}>Manage Blocked List</button>
                            </div>
                        </div>
                    )}

                    {activeSection === 'chat' && (
                        <div className="settings-section">
                            <h3>Chat Settings</h3>
                            <div className="form-group">
                                <label>App Theme</label>
                                <select
                                    value={settingsData.chat.theme}
                                    onChange={(e) => handleSettingsChange('chat', 'theme', e.target.value)}
                                >
                                    <option value="light">☀️ Light Theme</option>
                                    <option value="dark">🌙 Dark Theme</option>
                                    <option value="system">🖥️ System Default</option>
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Font Size</label>
                                <select
                                    value={settingsData.chat.fontSize}
                                    onChange={(e) => handleSettingsChange('chat', 'fontSize', e.target.value)}
                                >
                                    <option value="small">Small</option>
                                    <option value="medium">Medium</option>
                                    <option value="large">Large</option>
                                </select>
                            </div>
                            <div className="list-group">
                                <h4>Chat Wallpaper</h4>
                                <div className="wallpaper-grid">
                                    {['default', 'dark', 'nature', 'abstract'].map(w => (
                                        <div
                                            key={w}
                                            className={`wallpaper-item ${settingsData.chat.wallpaper === w ? 'selected' : ''}`}
                                            onClick={() => handleSettingsChange('chat', 'wallpaper', w)}
                                        >
                                            {w}
                                        </div>
                                    ))}
                                </div>
                            </div>
                            <div className="toggle-item">
                                <div className="info">
                                    <strong>Media Auto-Download</strong>
                                    <span>Download images automatically on Wi-Fi.</span>
                                </div>
                                <input
                                    type="checkbox"
                                    checked={settingsData.chat.mediaAutoDownload}
                                    onChange={(e) => handleSettingsChange('chat', 'mediaAutoDownload', e.target.checked)}
                                />
                            </div>
                        </div>
                    )}

                    {activeSection === 'notifications' && (
                        <div className="settings-section">
                            <h3>Notifications</h3>
                            <div className="toggle-list">
                                <div className="toggle-item">
                                    <div className="info">
                                        <strong>Push Notifications</strong>
                                        <span>Receive alerts for new messages.</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={settingsData.notifications.pushEnabled}
                                        onChange={(e) => handleSettingsChange('notifications', 'pushEnabled', e.target.checked)}
                                    />
                                </div>
                                <div className="toggle-item">
                                    <div className="info">
                                        <strong>Sound & Vibration</strong>
                                        <span>Play toast sounds for alerts.</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={settingsData.notifications.soundEnabled}
                                        onChange={(e) => handleSettingsChange('notifications', 'soundEnabled', e.target.checked)}
                                    />
                                </div>
                                <div className="toggle-item">
                                    <div className="info">
                                        <strong>Message Preview</strong>
                                        <span>Show text in push notifications.</span>
                                    </div>
                                    <input
                                        type="checkbox"
                                        checked={settingsData.notifications.previewEnabled}
                                        onChange={(e) => handleSettingsChange('notifications', 'previewEnabled', e.target.checked)}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeSection === 'storage' && (
                        <div className="settings-section">
                            <h3>Storage & Data</h3>
                            <div className="stats-list">
                                <div className="stat-item">
                                    <span>Messages Used</span>
                                    <strong>{Math.floor(Math.random() * 50) + 1} MB</strong>
                                </div>
                                <div className="stat-item">
                                    <span>Media (Photos/Videos)</span>
                                    <strong>{Math.floor(Math.random() * 200) + 10} MB</strong>
                                </div>
                            </div>
                            <div className="list-group">
                                <button className="wa-btn secondary" onClick={() => alert('Backup in progress...')}>
                                    ☁️ Backup to Cloud
                                </button>
                                <button className="wa-btn danger" onClick={onClearChats}>
                                    🗑️ Clear All Chat History
                                </button>
                            </div>
                        </div>
                    )}
                </main>
            </div>

            {showBlockedModal && (
                <div className="modal-overlay">
                    <div className="modal glass">
                        <div className="modal-header">
                            <h3>Blocked Users</h3>
                            <button className="close-btn" onClick={() => setShowBlockedModal(false)}>✕</button>
                        </div>
                        <div className="blocked-list custom-scrollbar">
                            {blockedUsers.length === 0 ? (
                                <p className="empty-text">No blocked users.</p>
                            ) : (
                                blockedUsers.map(user => (
                                    <div key={user._id} className="contact-item">
                                        <div className="avatar">{user.firstName[0]}</div>
                                        <div className="contact-info">
                                            <h4>{user.firstName} {user.lastname}</h4>
                                            <span>@{user.username}</span>
                                        </div>
                                        <button className="wa-btn secondary small" onClick={() => handleUnblock(user._id)}>
                                            Unblock
                                        </button>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showCropModal && (
                <div className="modal-overlay">
                    <div className="modal glass crop-modal" style={{ width: '90%', maxWidth: '500px', height: 'auto' }}>
                        <div className="modal-header">
                            <h3>Adjust Profile Picture</h3>
                            <button className="close-btn" onClick={closeCropModal}>✕</button>
                        </div>
                        <div className="crop-container" style={{ position: 'relative', width: '100%', height: '300px', background: '#333' }}>
                            <Cropper
                                image={imageSrc}
                                crop={crop}
                                zoom={zoom}
                                aspect={1}
                                onCropChange={setCrop}
                                onCropComplete={onCropComplete}
                                onZoomChange={setZoom}
                                showGrid={false}
                                cropShape="round"
                            />
                        </div>
                        <div className="crop-controls" style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                            <div className="slider-container" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span>Zoom</span>
                                <input
                                    type="range"
                                    value={zoom}
                                    min={1}
                                    max={3}
                                    step={0.1}
                                    aria-labelledby="Zoom"
                                    onChange={(e) => setZoom(Number(e.target.value))}
                                    className="zoom-range"
                                    style={{ flex: 1 }}
                                />
                            </div>
                            <div className="modal-actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
                                <button className="wa-btn secondary" onClick={closeCropModal}>Cancel</button>
                                <button className="wa-btn primary" onClick={showCroppedImage}>Save Picture</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Settings;
