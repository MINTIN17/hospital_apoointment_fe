import React from 'react';
import '../styles/Loading.css';

const Loading: React.FC = () => {
    return (
        <div className="loading-container">
            <div className="loading-content">
                <div className="loading-spinner">
                    <div className="spinner-circle"></div>
                    <div className="spinner-circle"></div>
                    <div className="spinner-circle"></div>
                </div>
                <div className="loading-text">Đang tải...</div>
            </div>
        </div>
    );
};

export default Loading; 