import React, { useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import './styles/App.css';
import Profile from './pages/Profile';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import PrivateRoutes from './routes/privateRoutes';
import Admin from './pages/Admin';
import Doctor from './pages/Doctor';
import AccountDisabled from './pages/AccountDisabled';

const App: React.FC = () => {
  const location = useLocation();

  useEffect(() => {
    console.log('App - Location changed:', {
      pathname: location.pathname,
      search: location.search,
      state: location.state
    });
  }, [location]);

  return (
    <div className="app">
      <Routes>
        <Route path="/" element={<Navigate to="/home" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/account-disabled" element={<AccountDisabled />} />

        {/* Admin route */}
        <Route path="/admin" element={
          <PrivateRoutes requireAdmin={true}>
            <Admin />
          </PrivateRoutes>
        } />

        {/* Doctor route */}
        <Route path="/doctor" element={
          <PrivateRoutes>
            <Doctor />
          </PrivateRoutes>
        } />

        {/* Regular user routes */}
        <Route element={<PrivateRoutes />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/account-disabled" element={<AccountDisabled />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
};

export default App;
