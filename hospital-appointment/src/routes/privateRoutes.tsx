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
    const [redirectPath, setRedirectPath] = useState<string | null>(null);

    useEffect(() => {
        const checkAuth = () => {
            const token = localStorage.getItem('token');
            if (!token) {
                setRedirectPath('/login');
                setIsChecking(false);
                return;
            }

            // Kiểm tra quyền admin nếu cần
            if (requireAdmin) {
                const userData = localStorage.getItem('user');
                if (userData) {
                    setRedirectPath('/home');
                    setIsChecking(false);
                    return;
                }
                setIsAdmin(true);
            } else {
                // Kiểm tra trạng thái enabled cho user thường
                const userData = localStorage.getItem('user');
                if (userData) {
                    try {
                        const userInfo = JSON.parse(userData);
                        console.log('User info:', userInfo); // Debug log

                        // Xử lý khác nhau cho từng role
                        if (userInfo.role === 'PATIENT') {
                            // Kiểm tra enabled status cho PATIENT
                            if (userInfo.user && userInfo.user.enabled === false) {
                                setRedirectPath('/account-disabled');
                                setIsChecking(false);
                                return;
                            }
                        } else if (userInfo.role === 'DOCTOR') {
                            // DOCTOR không cần kiểm tra enabled
                            setIsAuthenticated(true);
                            setIsChecking(false);
                            return;
                        }
                    } catch (error) {
                        console.error('Error parsing user data:', error);
                        setRedirectPath('/login');
                        setIsChecking(false);
                        return;
                    }
                }
            }

            setIsAuthenticated(true);
            setIsChecking(false);
        };

        checkAuth();
    }, [requireAdmin]);

    if (isChecking) {
        return null;
    }

    if (redirectPath) {
        return <Navigate to={redirectPath} state={{ from: location }} replace />;
    }

    return children ? <>{children}</> : <Outlet />;
};

export default PrivateRoutes;
