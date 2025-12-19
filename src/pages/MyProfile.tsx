import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

interface User {
  id: number;
  name: string;
  email: string;
  followerCount: number;
  followingCount: number;
}

interface Murmur {
  id: number;
  text: string;
  likeCount: number;
  createdAt: string;
}

function MyProfile() {
  const [user, setUser] = useState<User | null>(null);
  const [murmurs, setMurmurs] = useState<Murmur[]>([]);
  const [loading, setLoading] = useState(true);
  const [newMurmurText, setNewMurmurText] = useState('');
  const [posting, setPosting] = useState(false);

  const fetchMyProfile = async () => {
    try {
      setLoading(true);
      const userResponse = await api.get<User>('/me');
      setUser(userResponse.data);
      
      const murmursResponse = await api.get<Murmur[]>(`/users/${userResponse.data.id}/murmurs`);
      setMurmurs(murmursResponse.data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMyProfile();
  }, []);

  const handleCreateMurmur = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!newMurmurText.trim()) {
      alert('Please enter some text');
      return;
    }

    if (newMurmurText.length > 500) {
      alert('Murmur text cannot exceed 500 characters');
      return;
    }

    try {
      setPosting(true);
      const response = await api.post<Murmur>('/me/murmurs/', {
        text: newMurmurText.trim(),
      });
      
      // Add new murmur to the beginning of the list
      setMurmurs([response.data, ...murmurs]);
      setNewMurmurText('');
    } catch (error) {
      console.error('Error creating murmur:', error);
      alert('Failed to create murmur');
    } finally {
      setPosting(false);
    }
  };

  const handleDeleteMurmur = async (murmurId: number) => {
    if (!confirm('Are you sure you want to delete this murmur?')) {
      return;
    }

    try {
      await api.delete(`/me/murmurs/${murmurId}/`);
      setMurmurs(murmurs.filter((m) => m.id !== murmurId));
    } catch (error) {
      console.error('Error deleting murmur:', error);
      alert('Failed to delete murmur');
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading profile...</div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="container">
        <div className="error-message">Error loading profile</div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="page-title">My Profile</h1>
      <div className="profile-header">
        <h2 className="profile-name">{user.name}</h2>
        <p style={{ color: '#657786', marginBottom: '16px' }}>{user.email}</p>
        <div className="profile-info">
          <div className="profile-info-item">
            <span className="profile-info-label">Followers</span>
            <span className="profile-info-value">{user.followerCount}</span>
          </div>
          <div className="profile-info-item">
            <span className="profile-info-label">Following</span>
            <span className="profile-info-value">{user.followingCount}</span>
          </div>
        </div>
      </div>

      {/* Create Murmur Form */}
      <div className="murmur-card" style={{ marginTop: '32px', marginBottom: '24px' }}>
        <h2 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '16px', color: '#14171a' }}>
          Create New Murmur
        </h2>
        <form onSubmit={handleCreateMurmur}>
          <textarea
            value={newMurmurText}
            onChange={(e) => setNewMurmurText(e.target.value)}
            placeholder="What's happening?"
            maxLength={500}
            rows={4}
            style={{
              width: '100%',
              padding: '12px',
              border: '1px solid #e1e8ed',
              borderRadius: '8px',
              fontSize: '15px',
              fontFamily: 'inherit',
              resize: 'vertical',
              marginBottom: '12px',
              outline: 'none',
              transition: 'border-color 0.2s ease',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = '#1da1f2';
            }}
            onBlur={(e) => {
              e.target.style.borderColor = '#e1e8ed';
            }}
            disabled={posting}
          />
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ color: '#657786', fontSize: '13px' }}>
              {newMurmurText.length}/500
            </span>
            <button
              type="submit"
              disabled={posting || !newMurmurText.trim()}
              className="btn btn-primary"
              style={{
                opacity: posting || !newMurmurText.trim() ? 0.6 : 1,
                cursor: posting || !newMurmurText.trim() ? 'not-allowed' : 'pointer',
              }}
            >
              {posting ? 'Posting...' : 'Post Murmur'}
            </button>
          </div>
        </form>
      </div>
      
      <h2 className="page-title" style={{ fontSize: '20px', marginTop: '32px' }}>My Murmurs</h2>
      {murmurs.length === 0 ? (
        <div className="empty-state">
          <h3>No murmurs yet</h3>
          <p>Start posting to share your thoughts!</p>
        </div>
      ) : (
        murmurs.map((murmur) => (
          <div key={murmur.id} className="murmur-card">
            <Link to={`/murmurs/${murmur.id}`} className="murmur-text-link">
              <p className="murmur-text">{murmur.text}</p>
            </Link>
            <div className="murmur-meta">
              <div className="like-count">
                <span className="heart">❤️</span>
                <span>{murmur.likeCount}</span>
              </div>
              <span className="murmur-date">
                {new Date(murmur.createdAt).toLocaleDateString('en-US', {
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </span>
            </div>
            <button
              onClick={() => handleDeleteMurmur(murmur.id)}
              className="btn btn-danger btn-sm"
              style={{ marginTop: '12px' }}
            >
              Delete
            </button>
          </div>
        ))
      )}
    </div>
  );
}

export default MyProfile;
