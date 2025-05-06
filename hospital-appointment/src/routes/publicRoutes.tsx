import { Route } from 'react-router-dom';
import LandingPage from '../pages/LandingPage';
import Login from '../pages/Login';
import Register from '../pages/Register';

const PublicRoutes = () => {
    return (
        <>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            {/* các route công khai khác */}
        </>
    );
};

export default PublicRoutes;
