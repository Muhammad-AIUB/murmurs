import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
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

function UserProfile() {
  const { id } = useParams<{ id: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [murmurs, setMurmurs] = useState<Murmur[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [followLoading, setFollowLoading] = useState(false);

  useEffect(() => {
    if (id) {
      fetchUserProfile();
    }
  }, [id]);

  const fetchUserProfile = async () => {
    try {
      setLoading(true);
      const userResponse = await api.get<User>(`/users/${id}`);
      setUser(userResponse.data);
      
      const murmursResponse = await api.get<Murmur[]>(`/users/${id}/murmurs`);
      setMurmurs(murmursResponse.data);
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    if (!id || followLoading) return;

    try {
      setFollowLoading(true);
      await api.post(`/users/${id}/follow`);
      setIsFollowing(true);
      if (user) {
        setUser({ ...user, followerCount: user.followerCount + 1 });
      }
    } catch (error: any) {
      if (error.response?.status === 409) {
        alert('You are already following this user');
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

  if (loading) {
    return <div style={{ padding: '20px' }}>Loading...</div>;
  }

  if (!user) {
    return <div style={{ padding: '20px' }}>User not found</div>;
  }

  return (
    <div style={{ maxWidth: '600px', margin: '0 auto', padding: '20px' }}>
      <h1>{user.name}</h1>
      <p>Email: {user.email}</p>
      <p>Followers: {user.followerCount}</p>
      <p>Following: {user.followingCount}</p>
      
      <div style={{ margin: '20px 0' }}>
        {isFollowing ? (
          <button
            onClick={handleUnfollow}
            disabled={followLoading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: followLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {followLoading ? 'Unfollowing...' : 'Unfollow'}
          </button>
        ) : (
          <button
            onClick={handleFollow}
            disabled={followLoading}
            style={{
              padding: '8px 16px',
              backgroundColor: '#007bff',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: followLoading ? 'not-allowed' : 'pointer',
            }}
          >
            {followLoading ? 'Following...' : 'Follow'}
          </button>
        )}
      </div>

      <h2>Murmurs</h2>
      {murmurs.length === 0 ? (
        <p>No murmurs yet.</p>
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
          </div>
        ))
      )}
    </div>
  );
}

export default UserProfile;
