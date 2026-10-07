import { useState } from 'react';
import { Search, Bell, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { mockNotifications } from '../data/mockUsers';
import { useAuth } from '../auth/useAuth';
import './Header.css';

export default function Header() {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [notifications, setNotifications] = useState(mockNotifications);
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleMarkAsRead = (id) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const handleMarkAllAsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login', { replace: true });
  };

  return (
    <header className="header">
      <div className="header-search">
        <button
          className="search-toggle"
          onClick={() => setShowSearch(!showSearch)}
        >
          <Search size={20} />
        </button>
        {showSearch && (
          <div className="search-popup">
            <input
              type="text"
              placeholder="Search resources, groups, quizzes..."
              className="search-input-popup"
              autoFocus
            />
          </div>
        )}
      </div>

      <div className="header-actions">
        <div className="notification-container">
          <button
            className="header-btn notification-btn"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <Bell size={20} />
            {unreadCount > 0 && (
              <span className="notification-badge">{unreadCount}</span>
            )}
          </button>

          {showNotifications && (
            <div className="notification-dropdown">
              <div className="notification-header">
                <h3>Notifications</h3>
                {unreadCount > 0 && (
                  <button className="mark-all-read" onClick={handleMarkAllAsRead}>
                    Mark all as read
                  </button>
                )}
              </div>
              <div className="notification-list">
                {notifications.length === 0 ? (
                  <div className="notification-empty">
                    <span>📭</span>
                    <p>No notifications</p>
                  </div>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`notification-item ${notif.isRead ? 'read' : 'unread'}`}
                      onClick={() => handleMarkAsRead(notif.id)}
                    >
                      <div className="notification-icon">{notif.icon}</div>
                      <div className="notification-content">
                        <p className="notification-title">{notif.title}</p>
                        <p className="notification-message">{notif.message}</p>
                        <span className="notification-time">{notif.time}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        <div className="user-menu-container">
          <button
            className="user-menu-btn"
            onClick={() => setShowUserMenu(!showUserMenu)}
          >
            <div className="user-avatar">👤</div>
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className="user-status">{user.email}</span>
            </div>
            <ChevronDown size={16} />
          </button>

          {showUserMenu && (
            <div className="user-dropdown">
              <button onClick={() => { navigate('/profile'); setShowUserMenu(false); }}>
                Profile
              </button>
              <button onClick={() => { navigate('/settings'); setShowUserMenu(false); }}>
                Settings
              </button>
              <button className="logout-btn" onClick={handleLogout}>Logout</button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
