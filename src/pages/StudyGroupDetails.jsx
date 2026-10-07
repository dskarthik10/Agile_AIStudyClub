import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Users, MessageSquare, BookOpen, Send, ThumbsUp } from 'lucide-react';
import { groupService } from '../services/groupService';
import { mockGroupPosts, mockGroupMembers } from '../data/mockGroups';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import './StudyGroupDetails.css';

export default function StudyGroupDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [group, setGroup] = useState(null);
  const [activeTab, setActiveTab] = useState('discussion');
  const [posts, setPosts] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newPost, setNewPost] = useState('');
  const [newComment, setNewComment] = useState({});
  const [toast, setToast] = useState(null);

  useEffect(() => {
    loadGroupData();
  }, [id]);

  const loadGroupData = async () => {
    setLoading(true);
    try {
      const groupData = await groupService.getGroupById(id);
      const groupPosts = await groupService.getGroupPosts(id);
      const groupMembers = await groupService.getGroupMembers(id);
      setGroup(groupData);
      setPosts(groupPosts);
      setMembers(groupMembers);
    } catch (error) {
      console.error('Error loading group:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLikePost = async (postId) => {
    try {
      await groupService.likePost(postId);
      setPosts(prev => prev.map(post =>
        post.id === postId
          ? { ...post, likes: post.isLiked ? post.likes - 1 : post.likes + 1, isLiked: !post.isLiked }
          : post
      ));
    } catch (error) {
      console.error('Error liking post:', error);
    }
  };

  const handleAddPost = async () => {
    if (!newPost.trim()) return;

    try {
      await groupService.addPost(id, newPost);
      setToast({ message: 'Post added successfully!', type: 'success' });
      setNewPost('');
      loadGroupData();
    } catch (error) {
      setToast({ message: 'Failed to add post', type: 'error' });
    }
  };

  const handleAddComment = async (postId) => {
    const content = newComment[postId];
    if (!content?.trim()) return;

    try {
      await groupService.addComment(postId, content);
      setToast({ message: 'Comment added!', type: 'success' });
      setNewComment(prev => ({ ...prev, [postId]: '' }));
      loadGroupData();
    } catch (error) {
      setToast({ message: 'Failed to add comment', type: 'error' });
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading group..." />;
  }

  if (!group) {
    return (
      <div className="study-group-details">
        <div className="error-state">
          <h2>Group not found</h2>
          <button onClick={() => navigate('/study-groups')}>Back to Study Groups</button>
        </div>
      </div>
    );
  }

  return (
    <div className="study-group-details">
      <button className="back-btn" onClick={() => navigate('/study-groups')}>
        <ArrowLeft size={20} /> Back to Groups
      </button>

      <div className="group-header">
        <div className="group-avatar-large">{group.avatar}</div>
        <div className="group-header-info">
          <h1>{group.name}</h1>
          <p className="group-subject-tag">{group.subject}</p>
          <p className="group-description-full">{group.description}</p>
          <div className="group-stats">
            <span>👥 {group.members} members</span>
            <span>📅 Created {group.createdDate}</span>
            <span className={`activity-status ${group.isActive ? 'active' : ''}`}>
              {group.isActive ? '🟢 Active' : '⚫ Inactive'}
            </span>
          </div>
        </div>
        {!group.isJoined && (
          <button className="join-group-btn">Join Group</button>
        )}
      </div>

      <div className="group-tabs">
        <button
          className={`tab-btn ${activeTab === 'discussion' ? 'active' : ''}`}
          onClick={() => setActiveTab('discussion')}
        >
          <MessageSquare size={18} /> Discussion
        </button>
        <button
          className={`tab-btn ${activeTab === 'resources' ? 'active' : ''}`}
          onClick={() => setActiveTab('resources')}
        >
          <BookOpen size={18} /> Resources
        </button>
        <button
          className={`tab-btn ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          <Users size={18} /> Members
        </button>
      </div>

      <div className="tab-content">
        {activeTab === 'discussion' && (
          <div className="discussion-tab">
            <div className="new-post-box">
              <textarea
                placeholder="Share your thoughts with the group..."
                value={newPost}
                onChange={(e) => setNewPost(e.target.value)}
                rows="3"
              />
              <button
                className="post-btn"
                onClick={handleAddPost}
                disabled={!newPost.trim()}
              >
                <Send size={18} /> Post
              </button>
            </div>

            <div className="posts-list">
              {posts.length === 0 ? (
                <div className="empty-posts">
                  <MessageSquare size={48} />
                  <p>No discussions yet. Be the first to start one!</p>
                </div>
              ) : (
                posts.map((post) => (
                  <div key={post.id} className="post-card">
                    <div className="post-header">
                      <div className="post-author-avatar">{post.avatar}</div>
                      <div className="post-author-info">
                        <strong>{post.author}</strong>
                        <span className="post-time">{post.time}</span>
                      </div>
                    </div>
                    <p className="post-content">{post.content}</p>
                    <div className="post-actions">
                      <button
                        className={`like-btn ${post.isLiked ? 'liked' : ''}`}
                        onClick={() => handleLikePost(post.id)}
                      >
                        <ThumbsUp size={16} /> {post.likes}
                      </button>
                      <span className="comment-count">
                        💬 {post.comments.length} comments
                      </span>
                    </div>

                    {post.comments.length > 0 && (
                      <div className="comments-list">
                        {post.comments.map((comment) => (
                          <div key={comment.id} className="comment">
                            <strong>{comment.author}</strong>
                            <p>{comment.content}</p>
                            <span className="comment-time">{comment.time}</span>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="add-comment">
                      <input
                        type="text"
                        placeholder="Add a comment..."
                        value={newComment[post.id] || ''}
                        onChange={(e) => setNewComment(prev => ({ ...prev, [post.id]: e.target.value }))}
                      />
                      <button
                        onClick={() => handleAddComment(post.id)}
                        disabled={!newComment[post.id]?.trim()}
                      >
                        Comment
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {activeTab === 'resources' && (
          <div className="resources-tab">
            <div className="empty-posts">
              <BookOpen size={48} />
              <p>No resources shared yet</p>
            </div>
          </div>
        )}

        {activeTab === 'members' && (
          <div className="members-tab">
            <div className="members-grid">
              {members.map((member) => (
                <div key={member.id} className="member-card">
                  <div className="member-avatar">{member.avatar}</div>
                  <div className="member-info">
                    <strong>{member.name}</strong>
                    <span className="member-role">{member.role}</span>
                    <span className="member-joined">Joined {member.joinedDate}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
