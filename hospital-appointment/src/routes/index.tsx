// src/routes/index.tsx
import { Routes, Route, Navigate } from 'react-router-dom';
import PublicRoutes from './publicRoutes';
import PrivateRoutes from './privateRoutes';
import HomePage from '../pages/HomePage';
import Profile from '../pages/Profile';
import Admin from '../pages/Admin';
import AccountDisabled from '../pages/AccountDisabled';
import Doctor from '../pages/Doctor';
import Login from '../pages/Login';
import Register from '../pages/Register';
import LandingPage from '../pages/LandingPage';

const AppRoutes = () => {
    return (
        <Routes>
            <Route element={<PublicRoutes />}>
                <Route path="/" element={<LandingPage />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
            </Route>

            <Route path="/home" element={
                <PrivateRoutes>
                    <HomePage />
                </PrivateRoutes>
            } />
            <Route path="/profile" element={
                <PrivateRoutes>
                    <Profile />
                </PrivateRoutes>
            } />
            <Route path="/admin" element={
                <PrivateRoutes requireAdmin>
                    <Admin />
                </PrivateRoutes>
            } />
            <Route path="/doctor" element={
                <PrivateRoutes>
                    <Doctor />
                </PrivateRoutes>
            } />
            <Route path="/account-disabled" element={<AccountDisabled />} />
            <Route path="*" element={<Navigate to="/home" replace />} />
        </Routes>
    );
};

export default AppRoutes;
