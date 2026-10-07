import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Users, Search } from 'lucide-react';
import { groupService } from '../services/groupService';
import LoadingSpinner from '../components/LoadingSpinner';
import Toast from '../components/Toast';
import './StudyGroups.css';

export default function StudyGroups() {
  const [myGroups, setMyGroups] = useState([]);
  const [allGroups, setAllGroups] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [toast, setToast] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    loadGroups();
  }, []);

  const loadGroups = async () => {
    setLoading(true);
    try {
      const [my, all] = await Promise.all([
        groupService.getMyGroups(),
        groupService.getGroups(),
      ]);
      setMyGroups(my);
      setAllGroups(all);
    } catch (error) {
      console.error('Error loading groups:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinGroup = async (groupId) => {
    try {
      await groupService.joinGroup(groupId);
      setToast({ message: 'Joined group successfully!', type: 'success' });
      loadGroups();
    } catch (error) {
      setToast({ message: 'Failed to join group', type: 'error' });
    }
  };

  const discoverGroups = allGroups.filter(g => !g.isJoined);
  const filteredGroups = searchQuery
    ? discoverGroups.filter(g =>
        g.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        g.subject.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : discoverGroups;

  if (loading) {
    return <LoadingSpinner text="Loading study groups..." />;
  }

  return (
    <div className="study-groups">
      <div className="page-header">
        <div>
          <h1>Study Groups</h1>
          <p>Learn together, share knowledge and stay accountable</p>
        </div>
      </div>

      <div className="groups-container">
        <section className="groups-section">
          <h2>
            <Users size={20} /> My Groups ({myGroups.length})
          </h2>
          {myGroups.length === 0 ? (
            <div className="empty-groups">
              <p>You haven't joined any study groups yet</p>
            </div>
          ) : (
            <div className="groups-grid">
              {myGroups.map((group) => (
                <div
                  key={group.id}
                  className="group-card"
                  onClick={() => navigate(`/study-groups/${group.id}`)}
                >
                  <div className="group-avatar">{group.avatar}</div>
                  <div className="group-info">
                    <h3>{group.name}</h3>
                    <p className="group-subject">{group.subject}</p>
                    <p className="group-description">{group.description}</p>
                    <div className="group-meta">
                      <span>👥 {group.members} members</span>
                      <span className={`activity-status ${group.isActive ? 'active' : ''}`}>
                        {group.isActive ? '🟢 Active' : '⚫ Inactive'}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="groups-section">
          <div className="section-header">
            <h2>Discover Groups ({filteredGroups.length})</h2>
            <div className="search-box">
              <Search size={18} />
              <input
                type="text"
                placeholder="Search groups..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
            </div>
          </div>

          {filteredGroups.length === 0 ? (
            <div className="empty-groups">
              <p>No groups found matching your search</p>
            </div>
          ) : (
            <div className="groups-grid">
              {filteredGroups.map((group) => (
                <div key={group.id} className="group-card">
                  <div className="group-avatar">{group.avatar}</div>
                  <div className="group-info">
                    <h3>{group.name}</h3>
                    <p className="group-subject">{group.subject}</p>
                    <p className="group-description">{group.description}</p>
                    <div className="group-meta">
                      <span>👥 {group.members} members</span>
                      <span className={`activity-status ${group.isActive ? 'active' : ''}`}>
                        {group.isActive ? '🟢 Active' : '⚫ Inactive'}
                      </span>
                    </div>
                  </div>
                  <div className="group-actions">
                    <button
                      className="join-btn"
                      onClick={() => handleJoinGroup(group.id)}
                    >
                      Join Group
                    </button>
                    <button
                      className="view-btn"
                      onClick={() => navigate(`/study-groups/${group.id}`)}
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </div>

      {toast && <Toast {...toast} onClose={() => setToast(null)} />}
    </div>
  );
}
