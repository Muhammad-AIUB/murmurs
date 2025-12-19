import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import api from '../services/api';

interface Murmur {
  id: number;
  text: string;
  likeCount: number;
  userId: number;
  userName: string;
  createdAt: string;
}

function MurmurDetail() {
  const { id } = useParams<{ id: string }>();
  const [murmur, setMurmur] = useState<Murmur | null>(null);
  const [loading, setLoading] = useState(true);
  const [liking, setLiking] = useState(false);

  useEffect(() => {
    if (id) {
      fetchMurmur();
    }
  }, [id]);

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

  const handleLike = async () => {
    if (!id || liking || !murmur) return;

    try {
      setLiking(true);
      setMurmur({ ...murmur, likeCount: murmur.likeCount + 1 });
      await api.post(`/murmurs/${id}/like`);
      await fetchMurmur();
    } catch (error: any) {
      if (murmur) {
        setMurmur({ ...murmur, likeCount: murmur.likeCount - 1 });
      }
      if (error.response?.status === 409) {
        alert('You have already liked this murmur');
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
      setMurmur({ ...murmur, likeCount: Math.max(0, murmur.likeCount - 1) });
      await api.delete(`/murmurs/${id}/like`);
      await fetchMurmur();
    } catch (error) {
      if (murmur) {
        setMurmur({ ...murmur, likeCount: murmur.likeCount + 1 });
      }
      console.error('Error unliking murmur:', error);
    } finally {
      setLiking(false);
    }
  };

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  if (!murmur) {
    return <div style={{ padding: '20px' }}>Murmur not found</div>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <Link
        to="/"
        style={{
          display: 'inline-block',
          marginBottom: '20px',
          color: '#007bff',
          textDecoration: 'none',
        }}
      >
        ← Back to Timeline
      </Link>

      <div
        style={{
          border: '1px solid #ddd',
          borderRadius: '8px',
          padding: '20px',
          backgroundColor: '#f9f9f9',
        }}
      >
        <div style={{ marginBottom: '15px' }}>
          <Link
            to={`/users/${murmur.userId}`}
            style={{
              textDecoration: 'none',
              color: '#333',
              fontWeight: 'bold',
              fontSize: '1.1em',
            }}
          >
            {murmur.userName}
          </Link>
        </div>

        <p style={{ fontSize: '1.2em', margin: '15px 0', whiteSpace: 'pre-wrap' }}>
          {murmur.text}
        </p>

        <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginTop: '20px' }}>
          <button
            onClick={handleLike}
            disabled={liking}
            style={{
              padding: '8px 16px',
              cursor: liking ? 'not-allowed' : 'pointer',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
            }}
          >
            Like
          </button>
          <button
            onClick={handleUnlike}
            disabled={liking}
            style={{
              padding: '8px 16px',
              cursor: liking ? 'not-allowed' : 'pointer',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
            }}
          >
            Unlike
          </button>
          <span style={{ fontSize: '1.1em' }}>❤️ {murmur.likeCount} likes</span>
        </div>

        <p style={{ marginTop: '15px', fontSize: '0.9em', color: '#666' }}>
          Posted: {new Date(murmur.createdAt).toLocaleString()}
        </p>
      </div>
    </div>
  );
}

export default MurmurDetail;
