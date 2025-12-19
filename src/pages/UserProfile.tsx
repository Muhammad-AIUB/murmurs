import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

interface User {
  id: number;
  name: string;
  email: string;
  followerCount: number;
  followingCount: number;
  isFollowing?: boolean;
}

interface Murmur {
  id: number;
  text: string;
  likeCount: number;
  createdAt: string;
}

function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [murmurs, setMurmurs] = useState<Murmur[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      
      // Get current user ID
      try {
        const currentUserResponse = await api.get<User>('/me');
        setCurrentUserId(currentUserResponse.data.id);
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
      
      const userResponse = await api.get<User>(`/users/${id}`);
      const userData = userResponse.data;
      setUser(userData);
      // Set isFollowing state from API response
      setIsFollowing(userData.isFollowing || false);
      
      const murmursResponse = await api.get<Murmur[]>(`/users/${id}/murmurs`);
      setMurmurs(murmursResponse.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchUserProfile();
    }
  }, [id]);

  const handleFollow = async () => {
    if (!id || followLoading) return;

    try {
      setFollowLoading(true);
      await api.post(`/users/${id}/follow`);
      setIsFollowing(true);
      if (user) {
        setUser({ ...user, followerCount: user.followerCount + 1 });
      }
    } catch (error) {
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 409) {
          // Already following - update state to reflect this
          setIsFollowing(true);
          alert('You are already following this user');
        } else {
          console.error('Error following user:', error);
        }
      } else {
        console.error('Error following user:', error);
      }
    } finally {
      setFollowLoading(false);
    }
  };

  const handleUnfollow = async () => {
    if (!id || followLoading) return;

    try {
      setFollowLoading(true);
      await api.delete(`/users/${id}/follow`);
      setIsFollowing(false);
      if (user) {
        setUser({ ...user, followerCount: Math.max(0, user.followerCount - 1) });
      }
    } catch (error) {
      console.error('Error unfollowing user:', error);
    } finally {
      setFollowLoading(false);
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

  // Check if viewing own profile
  const isOwnProfile = currentUserId !== null && id && parseInt(id) === currentUserId;

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
        <div className="error-message">User not found</div>
      </div>
    );
  }

  return (
    <div className="container">
      <h1 className="page-title">{user.name}</h1>
      <div className="profile-header">
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
      
      <div className="profile-actions">
        {!isOwnProfile && (
          isFollowing ? (
            <button
              onClick={handleUnfollow}
              disabled={followLoading}
              className="btn btn-danger"
            >
              {followLoading ? 'Unfollowing...' : 'Unfollow'}
            </button>
          ) : (
            <button
              onClick={handleFollow}
              disabled={followLoading}
              className="btn btn-primary"
            >
              {followLoading ? 'Following...' : 'Follow'}
            </button>
          )
        )}
      </div>

      <h2 className="page-title" style={{ fontSize: '20px', marginTop: '32px' }}>Murmurs</h2>
      {murmurs.length === 0 ? (
        <div className="empty-state">
          <h3>No murmurs yet</h3>
          <p>This user hasn't posted anything.</p>
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
            {isOwnProfile && (
              <button
                onClick={() => handleDeleteMurmur(murmur.id)}
                className="btn btn-danger btn-sm"
                style={{ marginTop: '12px' }}
              >
                Delete
              </button>
            )}
          </div>
        ))
      )}
    </div>
  );
}

export default UserProfile;
