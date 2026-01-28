import React, { useState, useEffect, useRef } from 'react';
import EmojiPicker from 'emoji-picker-react';

const MessageInput = ({ onSendMessage }) => {
    const [message, setMessage] = useState('');
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const fileInputRef = useRef(null);
    const emojiContainerRef = useRef(null);

    const handleSubmit = (e) => {
        e.preventDefault();
        if (message.trim()) {
            onSendMessage(message);
            setMessage('');
            setShowEmojiPicker(false);
        }
    };

    const onEmojiClick = (emojiObject) => {
        setMessage((prev) => prev + emojiObject.emoji);
    };

    // Close picker when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (emojiContainerRef.current && !emojiContainerRef.current.contains(event.target)) {
                setShowEmojiPicker(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <footer className="message-input-area glass">
            <div className="input-actions-left">
                <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={(e) => {
                        const file = e.target.files[0];
                        if (file) {
                            onSendMessage(`📎 Sent a file: ${file.name}`);
                            e.target.value = null;
                        }
                    }}
                />
                <button
                    className="icon-btn"
                    onClick={() => fileInputRef.current?.click()}
                    title="Attach file"
                >
                    📎
                </button>
            </div>

            <form onSubmit={handleSubmit} className="message-form-container">
                <div className="input-wrapper">
                    <input
                        type="text"
                        placeholder="Type a message..."
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        onFocus={() => {
                            // Don't auto-close picker immediately on focus if we just clicked the trigger
                        }}
                    />
                    <div className="emoji-container" ref={emojiContainerRef}>
                        <button
                            type="button"
                            className={`icon-btn emoji-trigger ${showEmojiPicker ? 'active' : ''}`}
                            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                            title="Add emoji"
                        >
                            😊
                        </button>
                        {showEmojiPicker && (
                            <div className="emoji-picker-wrapper glass fade-in">
                                <EmojiPicker
                                    onEmojiClick={onEmojiClick}
                                    autoFocusSearch={false}
                                    theme="dark"
                                    width="100%"
                                    height={350}
                                />
                            </div>
                        )}
                    </div>
                </div>
                <button type="submit" className="send-btn" disabled={!message.trim()}>
                    Send
                </button>
            </form>
        </footer>
    );
};

export default MessageInput;
