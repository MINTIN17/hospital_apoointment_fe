import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { authService } from '../services/api';

interface PrivateRoutesProps {
    children?: React.ReactNode;
    requireAdmin?: boolean;
}

const PrivateRoutes: React.FC<PrivateRoutesProps> = ({ children, requireAdmin }) => {
    const location = useLocation();
    const [isChecking, setIsChecking] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        const checkAuth = () => {
            console.log('PrivateRoutes - Starting auth check');
            console.log('PrivateRoutes - Current path:', location.pathname);

            const token = localStorage.getItem('token');
            if (!token) {
                console.log('PrivateRoutes - No token found');
                setIsAuthenticated(false);
                setIsChecking(false);
                return;
            }

            // Kiểm tra quyền admin nếu cần
            if (requireAdmin) {
                const userData = localStorage.getItem('user');
                if (userData) {
                    console.log('PrivateRoutes - User data found, not admin');
                    setIsAdmin(false);
                    setIsAuthenticated(false);
                    setIsChecking(false);
                    return;
                }
                console.log('PrivateRoutes - No user data, is admin');
                setIsAdmin(true);
            }

            console.log('PrivateRoutes - Authentication successful');
            setIsAuthenticated(true);
            setIsChecking(false);
        };

        checkAuth();
    }, [location.pathname, requireAdmin]);

    if (isChecking) {
        console.log('PrivateRoutes - Still checking authentication');
        return null;
    }

    if (!isAuthenticated) {
        console.log('PrivateRoutes - Not authenticated, redirecting to login');
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    if (requireAdmin && !isAdmin) {
        console.log('PrivateRoutes - Not admin, redirecting to home');
        return <Navigate to="/home" replace />;
    }

    console.log('PrivateRoutes - Rendering protected route');
    return children ? <>{children}</> : <Outlet />;
};

export default PrivateRoutes;
