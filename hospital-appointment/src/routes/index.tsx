// src/routes/index.tsx
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PublicRoutes from './publicRoutes';
import PrivateRoutes from './privateRoutes';
import HomePage from '../pages/HomePage';
import Profile from '../pages/Profile';
import Admin from '../pages/Admin';

const PrivateRoute: React.FC<{ children: React.ReactNode; requireAdmin?: boolean }> = ({ children, requireAdmin }) => {
    const token = localStorage.getItem('token');
    if (!token) {
        return <Navigate to="/login" replace />;
    }

    // Nếu route yêu cầu quyền admin
    if (requireAdmin) {
        const userData = localStorage.getItem('user');
        // Nếu có user data -> là patient -> không có quyền truy cập
        if (userData) {
            return <Navigate to="/home" replace />;
        }
        // Nếu không có user data -> là admin -> cho phép truy cập
        return <>{children}</>;
    }

    // Các route thông thường chỉ cần token
    return <>{children}</>;
};

const AppRoutes = () => {
    return (
        <BrowserRouter>
            <Routes>
                {PublicRoutes()}
                <Route path="/home" element={
                    <PrivateRoute>
                        <HomePage />
                    </PrivateRoute>
                } />
                <Route path="/profile" element={
                    <PrivateRoute>
                        <Profile />
                    </PrivateRoute>
                } />
                <Route path="/admin" element={
                    <PrivateRoute requireAdmin>
                        <Admin />
                    </PrivateRoute>
                } />
                <Route path="*" element={<Navigate to="/home" replace />} />
            </Routes>
        </BrowserRouter>
    );
};

export default AppRoutes;
