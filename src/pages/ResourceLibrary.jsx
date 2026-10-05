import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Filter, Download, Eye, Bookmark } from 'lucide-react';
import { resourceService } from '../services/resourceService';
import { subjects, resourceTypes, semesters } from '../data/mockResources';
import LoadingSpinner from '../components/LoadingSpinner';
import EmptyState from '../components/EmptyState';
import './ResourceLibrary.css';

export default function ResourceLibrary() {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filters, setFilters] = useState({
    subject: 'All Subjects',
    type: 'All Types',
    semester: 'All Semesters',
    sortBy: 'newest',
  });
  const [showFilters, setShowFilters] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    loadResources();
  }, [filters, searchQuery]);

  const loadResources = async () => {
    setLoading(true);

    try {
      const data = await resourceService.getResources({
        ...filters,
        search: searchQuery,
      });

      setResources(data);
    } catch (error) {
      console.error('Error loading resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const handleClearFilters = () => {
    setFilters({
      subject: 'All Subjects',
      type: 'All Types',
      semester: 'All Semesters',
      sortBy: 'newest',
    });

    setSearchQuery('');
  };

  const hasActiveFilters =
    filters.subject !== 'All Subjects' ||
    filters.type !== 'All Types' ||
    filters.semester !== 'All Semesters' ||
    searchQuery !== '';

  return (
    <div className="resource-library">

      <div className="page-header">
        <div>
          <h1>Resource Library</h1>
          <p>
            Find notes, guides and study materials shared by your community
          </p>
        </div>
      </div>

      <div className="search-filter-bar">

        <div className="search-box">
          <Search size={20} />

          <input
            type="text"
            placeholder="Search resources..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>

        {/* Filters button */}
        <button
          className="filter-toggle"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter size={18} />
          Filters

          {hasActiveFilters && (
            <span className="filter-badge"></span>
          )}
        </button>

      </div>

      {showFilters && (
        <div className="filters-panel">

          <div className="filter-group">
            <label>Subject</label>

            <select
              value={filters.subject}
              onChange={(e) =>
                handleFilterChange('subject', e.target.value)
              }
            >
              {subjects.map(subject => (
                <option key={subject} value={subject}>
                  {subject}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Type</label>

            <select
              value={filters.type}
              onChange={(e) =>
                handleFilterChange('type', e.target.value)
              }
            >
              {resourceTypes.map(type => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Semester</label>

            <select
              value={filters.semester}
              onChange={(e) =>
                handleFilterChange('semester', e.target.value)
              }
            >
              {semesters.map(semester => (
                <option key={semester} value={semester}>
                  {semester}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By</label>

            <select
              value={filters.sortBy}
              onChange={(e) =>
                handleFilterChange('sortBy', e.target.value)
              }
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="popular">Most Downloads</option>
              <option value="liked">Most Liked</option>
            </select>
          </div>

          {hasActiveFilters && (
            <button
              className="clear-filters"
              onClick={handleClearFilters}
            >
              Clear All Filters
            </button>
          )}

        </div>
      )}

      <div className="results-info">
        <p>{resources.length} resources found</p>
      </div>

      {loading ? (

        <LoadingSpinner text="Loading resources..." />

      ) : resources.length === 0 ? (

        <EmptyState
          icon="📚"
          title="No resources found"
          message="Try adjusting your filters or search query"
          action={{
            label: 'Clear Filters',
            onClick: handleClearFilters,
          }}
        />

      ) : (

        <div className="resources-grid">

          {resources.map((resource) => (

            <div
              key={resource.id}
              className="resource-card"
              onClick={() =>
                navigate(`/resources/${resource.id}`)
              }
            >

              <div className="resource-card-header">

                <div className="resource-type-badge">
                  {resource.type}
                </div>

                <button
                  className="bookmark-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    resourceService.saveResource(resource.id);
                  }}
                >
                  <Bookmark size={18} />
                </button>

              </div>

              <div className="resource-card-icon">
                📄
              </div>

              <h3 className="resource-card-title">
                {resource.title}
              </h3>

              <p className="resource-card-subject">
                {resource.subject}
              </p>

              <p className="resource-card-description">
                {resource.description}
              </p>

              <div className="resource-card-meta">
                <span>
                  👤 {resource.uploadedBy}
                </span>

                <span>
                  📅 {resource.uploadDate}
                </span>
              </div>

              <div className="resource-card-stats">

                <span>
                  <Download size={14} />
                  {resource.downloads}
                </span>

                <span>
                  ❤️ {resource.likes}
                </span>

                <span>
                  {resource.fileSize}
                </span>

              </div>

              <div className="resource-card-actions">

                {/* View */}
                <button
                  className="btn-secondary"
                  onClick={(e) => {
                    e.stopPropagation();
                    navigate(`/resources/${resource.id}`);
                  }}
                >
                  <Eye size={16} />
                  View
                </button>

                {/* Download */}
                <button
                  className="btn-primary"
                  onClick={(e) => {
                    e.stopPropagation();
                    resourceService.downloadResource(
                      resource.s3Key
                    );
                  }}
                >
                  <Download size={16} />
                  Download
                </button>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>
  );
}