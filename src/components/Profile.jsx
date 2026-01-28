import React, { useState, useRef } from 'react';

const Profile = ({ currentUser, onUpdateProfile, onDeleteAccount, onBack }) => {
    const [firstName, setFirstName] = useState(currentUser?.firstName || '');
    const [lastname, setLastname] = useState(currentUser?.lastname || '');
    const [bio, setBio] = useState(currentUser?.bio || '');
    const [profilePic, setProfilePic] = useState(currentUser?.profilePic || null);
    const fileInputRef = useRef(null);

    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setProfilePic(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        onUpdateProfile({
            ...currentUser,
            firstName,
            lastname,
            bio,
            profilePic
        });
    };

    return (
        <div className="profile-page fade-in">
            <div className="profile-container glass">
                <header className="profile-header">
                    <button className="icon-btn back-btn" onClick={onBack} title="Go back">
                        ←
                    </button>
                    <h1>Profile Settings</h1>
                </header>

                <form onSubmit={handleSubmit} className="profile-form">
                    <div className="avatar-upload-section">
                        <div className="avatar-large">
                            {profilePic ? (
                                <img src={profilePic} alt="Profile" />
                            ) : (
                                <div className="avatar-placeholder">
                                    {firstName?.substring(0, 1).toUpperCase()}
                                </div>
                            )}
                            <button
                                type="button"
                                className="edit-avatar-btn"
                                onClick={() => fileInputRef.current?.click()}
                            >
                                📷
                            </button>
                        </div>
                        <input
                            type="file"
                            ref={fileInputRef}
                            style={{ display: 'none' }}
                            accept="image/*"
                            onChange={handleImageChange}
                        />
                        <p>Click to change profile picture</p>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="firstName">First Name</label>
                            <input
                                type="text"
                                id="firstName"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="lastname">Last Name</label>
                            <input
                                type="text"
                                id="lastname"
                                value={lastname}
                                onChange={(e) => setLastname(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="bio">Bio</label>
                        <textarea
                            id="bio"
                            placeholder="Tell us about yourself..."
                            value={bio}
                            rows="4"
                            onChange={(e) => setBio(e.target.value)}
                        ></textarea>
                    </div>

                    <button type="submit" className="save-profile-btn">
                        Save Changes
                    </button>

                    <div className="danger-zone">
                        <h3>Danger Zone</h3>
                        <p>Once you delete your account, there is no going back. Please be certain.</p>
                        <button
                            type="button"
                            className="delete-account-btn"
                            onClick={() => {
                                if (window.confirm('Are you absolutely sure you want to delete your account? This action cannot be undone.')) {
                                    onDeleteAccount();
                                }
                            }}
                        >
                            Delete Account
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default Profile;
