import React, { useState, useEffect, useRef } from 'react';

const StoryViewer = ({ userStories, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [progress, setProgress] = useState(0);
    const storyCount = userStories.items.length;
    const currentStory = userStories.items[currentIndex];
    const duration = currentStory?.type === 'video' ? 30000 : 5000; // 30s for video, 5s for image
    const progressRef = useRef(null);

    useEffect(() => {
        setProgress(0);
        const startTime = Date.now();

        const interval = setInterval(() => {
            const elapsed = Date.now() - startTime;
            const newProgress = Math.min((elapsed / duration) * 100, 100);
            setProgress(newProgress);

            if (newProgress >= 100) {
                clearInterval(interval);
                handleNext();
            }
        }, 50);

        return () => clearInterval(interval);
    }, [currentIndex]);

    const handleNext = () => {
        if (currentIndex < storyCount - 1) {
            setCurrentIndex(prev => prev + 1);
        } else {
            onClose();
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => prev - 1);
        } else {
            // First story, just reset it
            setProgress(0);
        }
    };

    if (!currentStory) return null;

    return (
        <div className="story-viewer-overlay" onClick={onClose}>
            <div className="story-viewer-content" onClick={e => e.stopPropagation()}>
                {/* Progress Indicators */}
                <div className="story-progress-bars">
                    {userStories.items.map((_, idx) => (
                        <div key={idx} className="progress-bar-bg">
                            <div
                                className="progress-bar-fill"
                                style={{
                                    width: idx < currentIndex ? '100%' : (idx === currentIndex ? `${progress}%` : '0%')
                                }}
                            />
                        </div>
                    ))}
                </div>

                {/* Header */}
                <div className="story-viewer-header">
                    <div className="user-info">
                        <div className="avatar-xs">{userStories.avatar}</div>
                        <span>{userStories.username}</span>
                    </div>
                    <button className="icon-btn" onClick={onClose}>✕</button>
                </div>

                {/* Media Content */}
                <div className="story-media">
                    {currentStory.type === 'video' ? (
                        <video
                            src={currentStory.url}
                            autoPlay
                            muted={false}
                            playsInline
                        />
                    ) : (
                        <img src={currentStory.url} alt="Status" />
                    )}
                </div>

                {/* Navigation Zones */}
                <div className="nav-zone left" onClick={handlePrev} />
                <div className="nav-zone right" onClick={handleNext} />
            </div>
        </div>
    );
};

export default StoryViewer;
