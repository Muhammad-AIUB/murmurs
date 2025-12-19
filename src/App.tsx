import React from 'react';
import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router-dom';
import Timeline from './pages/Timeline';
import MyProfile from './pages/MyProfile';
import UserProfile from './pages/UserProfile';
import MurmurDetail from './pages/MurmurDetail';

function Navigation() {
  const location = useLocation();
  
  return (
    <nav>
      <Link to="/" className={location.pathname === '/' ? 'active' : ''}>
        Timeline
      </Link>
      <Link to="/me" className={location.pathname === '/me' ? 'active' : ''}>
        My Profile
      </Link>
    </nav>
  );
}

function App() {
  return (
    <BrowserRouter>
      <Navigation />
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