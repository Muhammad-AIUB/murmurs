import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import Timeline from './pages/Timeline';
import MyProfile from './pages/MyProfile';
import UserProfile from './pages/UserProfile';
import MurmurDetail from './pages/MurmurDetail';

function App() {
  return (
    <BrowserRouter>
      <nav style={{ padding: '10px', borderBottom: '1px solid #ccc' }}>
        <Link to="/" style={{ marginRight: '20px' }}>Timeline</Link>
        <Link to="/me" style={{ marginRight: '20px' }}>My Profile</Link>
      </nav>
      <Routes>
        <Route path="/" element={<Timeline />} />
        <Route path="/me" element={<MyProfile />} />
        <Route path="/users/:id" element={<UserProfile />} />
        <Route path="/murmurs/:id" element={<MurmurDetail />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;