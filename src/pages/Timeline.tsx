import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';

interface Murmur {
  id: number;
  text: string;
  likeCount: number;
  userId: number;
  userName: string;
  createdAt: string;
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
  const [loading, setLoading] = useState(true);
  const [likingIds, setLikingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    fetchTimeline();
  }, [page]);

  const fetchTimeline = async () => {
    try {
      setLoading(true);
      const response = await api.get<TimelineResponse>(`/murmurs/?page=${page}&limit=10`);
      setMurmurs(response.data.data);
      setTotalPages(response.data.meta.totalPages);
    } catch (error) {
      console.error('Error fetching timeline:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (murmurId: number) => {
    if (likingIds.has(murmurId)) return;

    try {
      setLikingIds((prev) => new Set(prev).add(murmurId));
      
      // Optimistically update UI
      setMurmurs((prev) =>
        prev.map((m) =>
          m.id === murmurId ? { ...m, likeCount: m.likeCount + 1 } : m
        )
      );

      await api.post(`/murmurs/${murmurId}/like`);
    } catch (error: any) {
      // Revert on error
      setMurmurs((prev) =>
        prev.map((m) =>
          m.id === murmurId ? { ...m, likeCount: m.likeCount - 1 } : m
        )
      );
      
      if (error.response?.status === 409) {
        alert('You have already liked this murmur');
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
          m.id === murmurId ? { ...m, likeCount: Math.max(0, m.likeCount - 1) } : m
        )
      );

      await api.delete(`/murmurs/${murmurId}/like`);
    } catch (error) {
      // Revert on error
      setMurmurs((prev) =>
        prev.map((m) =>
          m.id === murmurId ? { ...m, likeCount: m.likeCount + 1 } : m
        )
      );
      console.error('Error unliking murmur:', error);
    } finally {
      setLikingIds((prev) => {
        const next = new Set(prev);
        next.delete(murmurId);
        return next;
      });
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>Timeline</h1>
      {murmurs.length === 0 ? (
        <p>No murmurs to display. Follow some users to see their posts!</p>
      ) : (
        <>
          {murmurs.map((murmur) => (
            <div
              key={murmur.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '15px',
                margin: '15px 0',
                backgroundColor: '#f9f9f9',
              }}
            >
              <div style={{ marginBottom: '10px' }}>
                <Link
                  to={`/users/${murmur.userId}`}
                  style={{ textDecoration: 'none', color: '#333', fontWeight: 'bold' }}
                >
                  {murmur.userName}
                </Link>
              </div>
              <Link
                to={`/murmurs/${murmur.id}`}
                style={{ textDecoration: 'none', color: '#333' }}
              >
                <p style={{ margin: '10px 0', whiteSpace: 'pre-wrap' }}>{murmur.text}</p>
              </Link>
              <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '10px' }}>
                <button
                  onClick={() => handleLike(murmur.id)}
                  disabled={likingIds.has(murmur.id)}
                  style={{
                    padding: '5px 15px',
                    cursor: likingIds.has(murmur.id) ? 'not-allowed' : 'pointer',
                    backgroundColor: '#007bff',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                  }}
                >
                  Like
                </button>
                <button
                  onClick={() => handleUnlike(murmur.id)}
                  disabled={likingIds.has(murmur.id)}
                  style={{
                    padding: '5px 15px',
                    cursor: likingIds.has(murmur.id) ? 'not-allowed' : 'pointer',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                  }}
                >
                  Unlike
                </button>
                <span>❤️ {murmur.likeCount}</span>
              </div>
            </div>
          ))}
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '10px', marginTop: '20px' }}>
            <button
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
              style={{
                padding: '8px 16px',
                cursor: page === 1 ? 'not-allowed' : 'pointer',
                backgroundColor: page === 1 ? '#ccc' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
              }}
            >
              Previous
            </button>
            <span>Page {page} of {totalPages}</span>
            <button
              onClick={() => setPage(page + 1)}
              disabled={page >= totalPages}
              style={{
                padding: '8px 16px',
                cursor: page >= totalPages ? 'not-allowed' : 'pointer',
                backgroundColor: page >= totalPages ? '#ccc' : '#007bff',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
              }}
            >
              Next
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Timeline;
