import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, TrendingUp } from 'lucide-react';
import StatCard from '../components/StatCard';
import LoadingSpinner from '../components/LoadingSpinner';
import { useAuth } from '../auth/useAuth';
import { mockResources } from '../data/mockResources';
import { mockExams } from '../data/mockExams';
import { mockRecentActivity } from '../data/mockUsers';
import './Dashboard.css';

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    // Simulate loading
    setTimeout(() => setLoading(false), 500);
  }, []);

  const stats = [
    {
      title: 'Resources',
      value: 42,
      icon: '📚',
      color: '#a855f7',
      trend: { direction: 'up', value: '+12 this week' }
    },
    {
      title: 'Quizzes Taken',
      value: 18,
      icon: '✏️',
      color: '#3b82f6',
      trend: { direction: 'up', value: '+3 quizzes' }
    },
    {
      title: 'Study Groups',
      value: 5,
      icon: '👥',
      color: '#10b981',
      trend: { direction: 'up', value: '+2 groups' }
    },
    {
      title: 'Progress',
      value: '78%',
      icon: '📈',
      color: '#f59e0b'
    },
  ];

  const recentResources = mockResources.slice(0, 4);
  const upcomingExams = mockExams.slice(0, 3);

  const subjectProgress = [
    { subject: 'Data Structures', progress: 85, color: '#a855f7' },
    { subject: 'Machine Learning', progress: 72, color: '#3b82f6' },
    { subject: 'Database Management', progress: 80, color: '#10b981' },
    { subject: 'Cloud Computing', progress: 68, color: '#f59e0b' },
  ];

  if (loading) {
    return <LoadingSpinner text="Loading dashboard..." />;
  }

  return (
    <div className="dashboard">
      <div className="dashboard-hero">
        <div>
          <h1>Welcome back, {user.name}! 👋</h1>
          <p>Here's what's happening with your studies today</p>
        </div>
        <div className="quick-actions">
          <button className="quick-action-btn primary" onClick={() => navigate('/upload')}>
            <span>📤</span> Upload Resource
          </button>
          <button className="quick-action-btn" onClick={() => navigate('/exams')}>
            <span>✏️</span> Take Quiz
          </button>
        </div>
      </div>

      <div className="stats-grid">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      <div className="dashboard-content">
        <section className="dashboard-section recent-resources-section">
          <div className="section-header">
            <h2>Recent Study Resources</h2>
            <button className="view-all-btn" onClick={() => navigate('/resources')}>
              View All <ArrowRight size={16} />
            </button>
          </div>
          <div className="resources-list">
            {recentResources.map((resource) => (
              <div
                key={resource.id}
                className="resource-item"
                onClick={() => navigate(`/resources/${resource.id}`)}
              >
                <div className="resource-icon">📄</div>
                <div className="resource-details">
                  <h4>{resource.title}</h4>
                  <p className="resource-meta">
                    {resource.type} • {resource.subject} • {resource.uploadedBy}
                  </p>
                  <span className="resource-date">{resource.uploadDate}</span>
                </div>
                <button className="resource-action">Open</button>
              </div>
            ))}
          </div>
        </section>

        <div className="dashboard-sidebar">
          <section className="dashboard-section upcoming-exams">
            <div className="section-header">
              <h2>Upcoming Exams</h2>
            </div>
            <div className="exams-list">
              {upcomingExams.map((exam) => (
                <div key={exam.id} className="exam-item">
                  <div className="exam-date">
                    <span className="exam-day">{new Date(exam.date).getDate()}</span>
                    <span className="exam-month">
                      {new Date(exam.date).toLocaleDateString('en-US', { month: 'short' })}
                    </span>
                  </div>
                  <div className="exam-details">
                    <h4>{exam.subject}</h4>
                    <p>{exam.time} • {exam.room}</p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="dashboard-section study-progress">
            <div className="section-header">
              <h2>
                <TrendingUp size={20} /> Study Progress
              </h2>
            </div>
            <div className="progress-list">
              {subjectProgress.map((item, index) => (
                <div key={index} className="progress-item">
                  <div className="progress-info">
                    <span className="progress-subject">{item.subject}</span>
                    <span className="progress-value">{item.progress}%</span>
                  </div>
                  <div className="progress-bar-container">
                    <div
                      className="progress-bar-fill"
                      style={{
                        width: `${item.progress}%`,
                        backgroundColor: item.color
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      <section className="dashboard-section recent-activity-section">
        <div className="section-header">
          <h2>Recent Activity</h2>
        </div>
        <div className="activity-list">
          {mockRecentActivity.map((activity) => (
            <div key={activity.id} className="activity-item">
              <div className="activity-icon">{activity.icon}</div>
              <div className="activity-content">
                <p>{activity.description}</p>
                <span className="activity-time">{activity.time}</span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
