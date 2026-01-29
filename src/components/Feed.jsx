import React, { useState, useEffect, useRef } from 'react';
import API_URL from '../config';

const Feed = ({ currentUser }) => {
    const [posts, setPosts] = useState([]);
    const [newPostContent, setNewPostContent] = useState('');
    const [mediaFile, setMediaFile] = useState(null);
    const [isLoading, setIsLoading] = useState(false);
    const mediaInputRef = useRef(null);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            const response = await fetch(`${API_URL}/posts`);
            if (response.ok) {
                const data = await response.json();
                setPosts(data);
            }
        } catch (err) {
            console.error('Fetch posts error:', err);
        }
    };

    const handleMediaChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setMediaFile({
                    url: reader.result,
                    type: file.type.startsWith('video/') ? 'video' : 'image'
                });
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!newPostContent.trim() && !mediaFile) return;

        setIsLoading(true);
        try {
            const response = await fetch(`${API_URL}/posts`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUser.id,
                    username: currentUser.firstName || currentUser.username,
                    content: newPostContent,
                    mediaUrl: mediaFile?.url,
                    mediaType: mediaFile?.type
                })
            });

            if (response.ok) {
                setNewPostContent('');
                setMediaFile(null);
                fetchPosts();
            }
        } catch (err) {
            console.error('Create post error:', err);
        } finally {
            setIsLoading(false);
        }
    };

    const handleLike = async (postId) => {
        try {
            const response = await fetch(`${API_URL}/posts/${postId}/like`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userId: currentUser.id })
            });
            if (response.ok) fetchPosts();
        } catch (err) {
            console.error('Like error:', err);
        }
    };

    const handleComment = async (postId, text) => {
        if (!text.trim()) return;
        try {
            const response = await fetch(`${API_URL}/posts/${postId}/comment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUser.id,
                    username: currentUser.firstName || currentUser.username,
                    text
                })
            });
            if (response.ok) fetchPosts();
        } catch (err) {
            console.error('Comment error:', err);
        }
    };

    const handleReply = async (postId, commentId, text) => {
        if (!text.trim()) return;
        try {
            const response = await fetch(`${API_URL}/posts/${postId}/comment/${commentId}/reply`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    userId: currentUser.id,
                    username: currentUser.firstName || currentUser.username,
                    text
                })
            });
            if (response.ok) fetchPosts();
        } catch (err) {
            console.error('Reply error:', err);
        }
    };

    return (
        <div className="feed-container custom-scrollbar glass">
            <div className="feed-header">
                <h2>News Feed</h2>
            </div>

            <div className="post-creator glass card">
                <form onSubmit={handleCreatePost}>
                    <textarea
                        placeholder={`What's on your mind, ${currentUser.firstName}?`}
                        value={newPostContent}
                        onChange={(e) => setNewPostContent(e.target.value)}
                    />
                    {mediaFile && (
                        <div className="media-preview">
                            <button className="remove-media" onClick={() => setMediaFile(null)}>✕</button>
                            {mediaFile.type === 'image' ? (
                                <img src={mediaFile.url} alt="Preview" />
                            ) : (
                                <video src={mediaFile.url} controls />
                            )}
                        </div>
                    )}
                    <div className="creator-actions">
                        <input
                            type="file"
                            hidden
                            ref={mediaInputRef}
                            accept="image/*,video/*"
                            onChange={handleMediaChange}
                        />
                        <button
                            type="button"
                            className="text-btn"
                            onClick={() => mediaInputRef.current.click()}
                        >
                            🖼️ Photo/Video
                        </button>
                        <button type="submit" className="wa-btn primary" disabled={isLoading}>
                            {isLoading ? 'Posting...' : 'Post'}
                        </button>
                    </div>
                </form>
            </div>

            <div className="posts-list">
                {posts.map(post => (
                    <PostItem
                        key={post._id}
                        post={post}
                        currentUser={currentUser}
                        onLike={() => handleLike(post._id)}
                        onComment={(text) => handleComment(post._id, text)}
                        onReply={(commentId, text) => handleReply(post._id, commentId, text)}
                    />
                ))}
            </div>
        </div>
    );
};

const PostItem = ({ post, currentUser, onLike, onComment, onReply }) => {
    const [commentText, setCommentText] = useState('');
    const [showComments, setShowComments] = useState(false);
    const [activeReplyId, setActiveReplyId] = useState(null);
    const [replyText, setReplyText] = useState('');
    const isLiked = post.likes.includes(currentUser.id);

    return (
        <div className="post-item card glass fadeIn">
            <div className="post-user-info">
                <div className="avatar-small">{post.username[0]}</div>
                <div className="user-details">
                    <span className="username">{post.username}</span>
                    <span className="timestamp">{new Date(post.createdAt).toLocaleString()}</span>
                </div>
            </div>

            {post.content && <div className="post-content">{post.content}</div>}

            {post.mediaUrl && (
                <div className="post-media">
                    {post.mediaType === 'image' ? (
                        <img src={post.mediaUrl} alt="Post" />
                    ) : (
                        <video src={post.mediaUrl} controls />
                    )}
                </div>
            )}

            <div className="post-stats">
                <span>👍 {post.likes.length} Likes</span>
                <span onClick={() => setShowComments(!showComments)} style={{ cursor: 'pointer' }}>
                    💬 {post.comments.length} Comments
                </span>
            </div>

            <div className="post-actions">
                <button
                    className={`action-btn ${isLiked ? 'active' : ''}`}
                    onClick={onLike}
                >
                    {isLiked ? '❤️ Liked' : '👍 Like'}
                </button>
                <button className="action-btn" onClick={() => setShowComments(!showComments)}>
                    💬 Comment
                </button>
            </div>

            {showComments && (
                <div className="comments-section">
                    <div className="comments-list">
                        {post.comments.length > 0 ? (
                            post.comments.map((comment) => (
                                <div key={comment._id} className="comment-thread">
                                    <div className="comment-item">
                                        <strong>{comment.username}: </strong>
                                        <span>{comment.text}</span>
                                        <button
                                            className="text-btn reply-btn"
                                            onClick={() => setActiveReplyId(activeReplyId === comment._id ? null : comment._id)}
                                        >
                                            Reply
                                        </button>
                                    </div>

                                    {/* Replies */}
                                    {comment.replies && comment.replies.length > 0 && (
                                        <div className="replies-list">
                                            {comment.replies.map((reply) => (
                                                <div key={reply._id} className="comment-item reply">
                                                    <strong>{reply.username}: </strong>
                                                    <span>{reply.text}</span>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    {/* Reply Input */}
                                    {activeReplyId === comment._id && (
                                        <div className="reply-input">
                                            <input
                                                type="text"
                                                placeholder="Write a reply..."
                                                value={replyText}
                                                onChange={(e) => setReplyText(e.target.value)}
                                                onKeyPress={(e) => {
                                                    if (e.key === 'Enter') {
                                                        onReply(comment._id, replyText);
                                                        setReplyText('');
                                                        setActiveReplyId(null);
                                                    }
                                                }}
                                                autoFocus
                                            />
                                            <button
                                                className="send-btn-small"
                                                onClick={() => {
                                                    onReply(comment._id, replyText);
                                                    setReplyText('');
                                                    setActiveReplyId(null);
                                                }}
                                            >
                                                ➤
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))
                        ) : (
                            <p className="no-comments">No comments yet. Be the first!</p>
                        )}
                    </div>
                    <div className="comment-input main-comment-input">
                        <input
                            type="text"
                            placeholder="Write a comment..."
                            value={commentText}
                            onChange={(e) => setCommentText(e.target.value)}
                            onKeyPress={(e) => {
                                if (e.key === 'Enter') {
                                    onComment(commentText);
                                    setCommentText('');
                                }
                            }}
                        />
                        <button
                            className="send-btn-small"
                            onClick={() => {
                                onComment(commentText);
                                setCommentText('');
                            }}
                        >
                            ➤
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Feed;
