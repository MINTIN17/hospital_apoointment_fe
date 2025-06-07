import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import './styles/App.css';
import Profile from './pages/Profile';
import HomePage from './pages/HomePage';
import Login from './pages/Login';
import Register from './pages/Register';
import PrivateRoutes from './routes/privateRoutes';
import Admin from './pages/Admin';
import Doctor from './pages/Doctor';
import AccountDisabled from './pages/AccountDisabled';
import HospitalList from './pages/HospitalList';
import Layout from './components/Layout';
import DoctorList from './components/DoctorList';
import DoctorDetail from './pages/DoctorDetail';
import PatientHistory from './pages/PatientHistory';

const App: React.FC = () => {
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

        {/* Regular user routes with Layout */}
        <Route element={<Layout />}>
          <Route path="/home" element={<HomePage />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/hospitals" element={<HospitalList />} />
          <Route path="/doctorList/:hospitalId/" element={<DoctorList />} />
          <Route path="/hospitals/:hospitalId/doctors/:doctorId" element={<DoctorDetail />} />
          <Route path="/introduction" element={<div>Giới thiệu</div>} />
          <Route path="/diagnosis" element={<div>Chuẩn đoán</div>} />
          <Route path="/history" element={<PatientHistory />} />
        </Route>

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </div>
  );
};

export default App;
