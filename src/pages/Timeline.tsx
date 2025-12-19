import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
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

interface TimelineResponse {
  data: Murmur[];
  meta: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

function Timeline() {
  const [murmurs, setMurmurs] = useState<Murmur[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [likingIds, setLikingIds] = useState<Set<number>>(new Set());
  const [currentUserId, setCurrentUserId] = useState<number | null>(null);

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      
      // Get current user ID
      try {
        const currentUserResponse = await api.get<{ id: number }>('/me');
        setCurrentUserId(currentUserResponse.data.id);
      } catch (error) {
        console.error('Error fetching current user:', error);
      }
      
      const response = await api.get<TimelineResponse>(`/murmurs/?page=${page}&limit=10`);
      setMurmurs(response.data.data);
      setTotalPages(response.data.meta.totalPages);
      setTotal(response.data.meta.total);
    } catch (error) {
      console.error('Error fetching timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTimeline();
  }, [page]);

  // Fix pagination: ensure we don't go beyond totalPages
  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
    }
  };

  const handlePreviousPage = () => {
    if (page > 1) {
      setPage(page - 1);
    }
  };

  const handleLike = async (murmurId: number) => {
    if (likingIds.has(murmurId)) return;

    try {
      setLikingIds((prev) => new Set(prev).add(murmurId));
      
      // Optimistically update UI
      setMurmurs((prev) =>
        prev.map((m) =>
          m.id === murmurId 
            ? { ...m, likeCount: m.likeCount + 1, isLiked: true } 
            : m
        )
      );

      await api.post(`/murmurs/${murmurId}/like`);
      
      // Don't call fetchTimeline() to avoid scroll jump
    } catch (error) {
      // Revert on error
      setMurmurs((prev) =>
        prev.map((m) =>
          m.id === murmurId 
            ? { ...m, likeCount: m.likeCount - 1, isLiked: false } 
            : m
        )
      );
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 409) {
          // Already liked - update state to reflect this
          setMurmurs((prev) =>
            prev.map((m) =>
              m.id === murmurId ? { ...m, isLiked: true } : m
            )
          );
        } else {
          console.error('Error liking murmur:', error);
        }
      } else {
        console.error('Error liking murmur:', error);
      }
    } finally {
      setLikingIds((prev) => {
        const next = new Set(prev);
        next.delete(murmurId);
        return next;
      });
    }
  };

  const handleUnlike = async (murmurId: number) => {
    if (likingIds.has(murmurId)) return;

    try {
      setLikingIds((prev) => new Set(prev).add(murmurId));
      
      // Optimistically update UI
      setMurmurs((prev) =>
        prev.map((m) =>
          m.id === murmurId 
            ? { ...m, likeCount: Math.max(0, m.likeCount - 1), isLiked: false } 
            : m
        )
      );

      await api.delete(`/murmurs/${murmurId}/like`);
      
      // Don't call fetchTimeline() to avoid scroll jump
    } catch (error) {
      // Revert on error
      setMurmurs((prev) =>
        prev.map((m) =>
          m.id === murmurId 
            ? { ...m, likeCount: m.likeCount + 1, isLiked: true } 
            : m
        )
      );
      
      if (error && typeof error === 'object' && 'response' in error) {
        const axiosError = error as { response?: { status?: number } };
        if (axiosError.response?.status === 404) {
          // Like doesn't exist - update state to reflect this
          setMurmurs((prev) =>
            prev.map((m) =>
              m.id === murmurId ? { ...m, isLiked: false } : m
            )
          );
        } else {
          console.error('Error unliking murmur:', error);
        }
      } else {
        console.error('Error unliking murmur:', error);
      }
    } finally {
      setLikingIds((prev) => {
        const next = new Set(prev);
        next.delete(murmurId);
        return next;
      });
    }
  };

  if (loading) {
    return (
      <div className="container">
        <div className="loading">Loading timeline...</div>
      </div>
    );
  }

  const startItem = (page - 1) * 10 + 1;
  const endItem = Math.min(page * 10, total);

  return (
    <div className="container">
      <h1 className="page-title">Timeline</h1>
      {murmurs.length === 0 ? (
        <div className="empty-state">
          <h3>No murmurs to display</h3>
          <p>Follow some users to see their posts!</p>
        </div>
      ) : (
        <>
          {total > 0 && (
            <div style={{ marginBottom: '16px', color: '#657786', fontSize: '14px' }}>
              Showing {startItem}-{endItem} of {total} murmurs
            </div>
          )}
          {murmurs.map((murmur) => {
            const isOwnMurmur = currentUserId !== null && murmur.userId === currentUserId;
            return (
            <div key={murmur.id} className="murmur-card">
              <div className="murmur-header">
                <Link to={`/users/${murmur.userId}`} className="murmur-username">
                  {isOwnMurmur ? 'You' : murmur.userName}
                  {isOwnMurmur && (
                    <span style={{ 
                      marginLeft: '8px', 
                      fontSize: '12px', 
                      color: '#657786',
                      fontWeight: 'normal'
                    }}>
                      ({murmur.userName})
                    </span>
                  )}
                </Link>
              </div>
              <Link to={`/murmurs/${murmur.id}`} className="murmur-text-link">
                <p className="murmur-text">{murmur.text}</p>
              </Link>
              <div className="murmur-meta">
                {murmur.isLiked ? (
                  <button
                    onClick={() => handleUnlike(murmur.id)}
                    disabled={likingIds.has(murmur.id)}
                    className="btn btn-danger btn-sm"
                  >
                    Unlike
                  </button>
                ) : (
                  <button
                    onClick={() => handleLike(murmur.id)}
                    disabled={likingIds.has(murmur.id)}
                    className="btn btn-primary btn-sm"
                  >
                    Like
                  </button>
                )}
                <div className="like-count">
                  <span className="heart">❤️</span>
                  <span>{murmur.likeCount}</span>
                </div>
              </div>
            </div>
            );
          })}
          {totalPages > 1 && (
            <div className="pagination">
              <button
                onClick={handlePreviousPage}
                disabled={page === 1}
                className="btn btn-secondary"
              >
                Previous
              </button>
              <span className="pagination-info">Page {page} of {totalPages}</span>
              <button
                onClick={handleNextPage}
                disabled={page >= totalPages}
                className="btn btn-secondary"
              >
                Next
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default Timeline;
