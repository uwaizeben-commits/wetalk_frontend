import React, { useState, useRef } from 'react';
import Cropper from 'react-easy-crop';
import getCroppedImg from '../utils/cropImage';

const Profile = ({ currentUser, onUpdateProfile, onDeleteAccount, onBack }) => {
    const [firstName, setFirstName] = useState(currentUser?.firstName || '');
    const [lastname, setLastname] = useState(currentUser?.lastname || '');
    const [bio, setBio] = useState(currentUser?.bio || '');
    const [profilePic, setProfilePic] = useState(currentUser?.profilePic || null);

    // Image Cropping State
    const [imageSrc, setImageSrc] = useState(null);
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
    const [showCropModal, setShowCropModal] = useState(false);

    const fileInputRef = useRef(null);

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files.length > 0) {
            const file = e.target.files[0];
            const reader = new FileReader();
            reader.addEventListener('load', () => {
                setImageSrc(reader.result);
                setShowCropModal(true);
            });
            reader.readAsDataURL(file);
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
            setProfilePic(croppedImage);
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
        </div>
    );
};

export default Profile;
