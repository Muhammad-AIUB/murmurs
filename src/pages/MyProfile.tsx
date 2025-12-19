import { useState, useEffect } from 'react';
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

  useEffect(() => {
    fetchMyProfile();
  }, []);

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
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  if (!user) {
    return <div style={{ padding: '20px' }}>Error loading profile</div>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>My Profile</h1>
      <p><strong>Name:</strong> {user.name}</p>
      <p><strong>Email:</strong> {user.email}</p>
      <p><strong>Followers:</strong> {user.followerCount}</p>
      <p><strong>Following:</strong> {user.followingCount}</p>
      
      <h2>My Murmurs</h2>
      {murmurs.length === 0 ? (
        <p>No murmurs yet. Start posting!</p>
      ) : (
        murmurs.map((murmur) => (
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
            <Link
              to={`/murmurs/${murmur.id}`}
              style={{ textDecoration: 'none', color: '#333' }}
            >
              <p style={{ margin: '10px 0', whiteSpace: 'pre-wrap' }}>{murmur.text}</p>
            </Link>
            <p>❤️ {murmur.likeCount} likes</p>
            <p style={{ fontSize: '0.9em', color: '#666' }}>
              {new Date(murmur.createdAt).toLocaleString()}
            </p>
            <button
              onClick={() => handleDeleteMurmur(murmur.id)}
              style={{
                marginTop: '10px',
                padding: '5px 15px',
                backgroundColor: '#dc3545',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
              }}
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
