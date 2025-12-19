import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

interface Murmur {
  id: number;
  text: string;
  likeCount: number;
  userId: number;
  userName: string;
  createdAt: string;
  isLiked?: boolean;
}

function MurmurDetail() {
  const { id } = useParams<{ id: string }>();
  const [murmur, setMurmur] = useState<Murmur | null>(null);
  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState(false);

  const fetchMurmur = async () => {
    try {
      setLoading(true);
      const response = await api.get<Murmur>(`/murmurs/${id}`);
      setMurmur(response.data);
    } catch (error) {
      console.error('Error fetching murmur:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (id) {
      fetchMurmur();
    }
  }, [id]);

  const handleLike = async () => {
    if (!id || liking || !murmur) return;

    try {
      setLiking(true);
      setMurmur({ ...murmur, likeCount: murmur.likeCount + 1, isLiked: true });
      await api.post(`/murmurs/${id}/like`);
      await fetchMurmur();
    } catch (error) {
      if (murmur) {
        setMurmur({ ...murmur, likeCount: murmur.likeCount - 1, isLiked: false });
      }
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 409) {
          // Already liked - update state
          if (murmur) {
            setMurmur({ ...murmur, isLiked: true });
          }
        } else {
          console.error('Error liking murmur:', error);
        }
      } else {
        console.error('Error liking murmur:', error);
      }
    } finally {
      setLiking(false);
    }
  };

  const handleUnlike = async () => {
    if (!id || liking || !murmur) return;

    try {
      setLiking(true);
      setMurmur({ ...murmur, likeCount: Math.max(0, murmur.likeCount - 1), isLiked: false });
      await api.delete(`/murmurs/${id}/like`);
      await fetchMurmur();
    } catch (error) {
      if (murmur) {
        setMurmur({ ...murmur, likeCount: murmur.likeCount + 1, isLiked: true });
      }
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 404) {
          // Like doesn't exist - update state
          if (murmur) {
            setMurmur({ ...murmur, isLiked: false });
          }
        } else {
          console.error('Error unliking murmur:', error);
        }
      } else {
        console.error('Error unliking murmur:', error);
      }
    } finally {
      setLiking(false);
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading murmur...</div>
      </div>
    );
  }

  if (!murmur) {
    return (
      <div className="container">
        <div className="error-message">Murmur not found</div>
      </div>
    );
  }

  return (
    <div className="container">
      <Link to="/" className="link-back">
        ← Back to Timeline
      </Link>

      <div className="murmur-card" style={{ padding: '24px' }}>
        <div className="murmur-header">
          <Link to={`/users/${murmur.userId}`} className="murmur-username" style={{ fontSize: '18px' }}>
            {murmur.userName}
          </Link>
        </div>

        <p className="murmur-text" style={{ fontSize: '18px', margin: '16px 0' }}>
          {murmur.text}
        </p>

        <div className="murmur-meta">
          {murmur.isLiked ? (
            <button
              onClick={handleUnlike}
              disabled={liking}
              className="btn btn-danger"
            >
              Unlike
            </button>
          ) : (
            <button
              onClick={handleLike}
              disabled={liking}
              className="btn btn-primary"
            >
              Like
            </button>
          )}
          <div className="like-count" style={{ fontSize: '16px' }}>
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
      </div>
    </div>
  );
}

export default MurmurDetail;
