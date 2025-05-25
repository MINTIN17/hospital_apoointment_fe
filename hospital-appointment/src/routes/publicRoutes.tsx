import { Navigate, Outlet } from 'react-router-dom';
import { useEffect, useState } from 'react';

const PublicRoutes = () => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isChecking, setIsChecking] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setIsAuthenticated(!!token);
        setIsChecking(false);
    }, []);

    if (isChecking) {
        return null;
    }

    if (isAuthenticated) {
        return <Navigate to="/home" replace />;
    }

    return <Outlet />;
};

export default PublicRoutes;
