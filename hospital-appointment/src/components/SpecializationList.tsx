import React, { useState, useEffect } from 'react';
import { specializationService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import '../styles/SpecializationList.css';

interface Specialization {
    id: number;
    name: string;
}

interface SpecializationListProps {
    hospitalId: string;
}

const SpecializationList: React.FC<SpecializationListProps> = ({ hospitalId }) => {
    const [specializations, setSpecializations] = useState<Specialization[]>([]);
    const [newSpecialization, setNewSpecialization] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const navigate = useNavigate();

    const checkAuth = () => {
        const token = localStorage.getItem('token');
        if (!token) {
            navigate('/login');
            return false;
        }
        return true;
    };

    const fetchSpecializations = async () => {
        if (!checkAuth()) return;

        try {
            setLoading(true);
            const data = await specializationService.getAllSpecializations(hospitalId);
            setSpecializations(data);
            setError(null);
        } catch (err: any) {
            if (err.status === 401) {
                navigate('/login');
            } else {
                setError('Không thể tải danh sách chuyên khoa');
                console.error(err);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSpecializations();
    }, [hospitalId]);

    const handleAddSpecialization = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!checkAuth()) return;
        if (!newSpecialization.trim()) return;

        try {
            setLoading(true);
            await specializationService.addSpecialization({
                name: newSpecialization,
                hospital_id: hospitalId
            });
            setNewSpecialization('');
            await fetchSpecializations(); // Tải lại danh sách sau khi thêm
            setError(null);
        } catch (err: any) {
            if (err.status === 401) {
                navigate('/login');
            } else {
                setError('Không thể thêm chuyên khoa mới');
                console.error(err);
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="specialization-container">
            <h2>Danh sách chuyên khoa</h2>

            {/* Form thêm chuyên khoa mới */}
            <form onSubmit={handleAddSpecialization} className="add-specialization-form">
                <input
                    type="text"
                    value={newSpecialization}
                    onChange={(e) => setNewSpecialization(e.target.value)}
                    placeholder="Nhập tên chuyên khoa mới"
                    disabled={loading}
                />
                <button type="submit" disabled={loading}>
                    {loading ? 'Đang xử lý...' : 'Thêm chuyên khoa'}
                </button>
            </form>

            {error && <div className="error-message">{error}</div>}

            {/* Danh sách chuyên khoa */}
            <div className="specialization-list">
                {loading ? (
                    <div>Đang tải...</div>
                ) : (
                    <ul>
                        {specializations.map((spec) => (
                            <li key={spec.id}>
                                {spec.name}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    );
};

export default SpecializationList; 