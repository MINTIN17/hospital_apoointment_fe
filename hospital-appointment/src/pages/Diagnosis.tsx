import React, { useState, useRef, useEffect } from 'react';
import '../styles/Diagnosis.css';
import doctorAI from '../assets/doctor_ai.jpg';
import { diagnosisService } from '../services/diagnosisService';
import { specialtyService } from '../services/specialtyService';
// import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// import { faPaperPlane } from '@fortawesome/free-solid-svg-icons';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'doctor';
    timestamp: Date;
    prediction?: {
        result: string;
        confidence: number;
    };
}

const Diagnosis: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const messagesContainerRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!inputMessage.trim()) return;

        // Thêm tin nhắn của người dùng
        const userMessage: Message = {
            id: Date.now(),
            text: inputMessage,
            sender: 'user',
            timestamp: new Date()
        };
        setMessages(prev => [...prev, userMessage]);
        setInputMessage('');
        setIsLoading(true);

        try {
            // Gọi API chẩn đoán thông qua service
            const prediction = await diagnosisService.predict(inputMessage);
            let specialtyMessage = '';

            if (prediction.prediction !== "Không xác định") {
                const specialty = await specialtyService.getSpecialtyByDisease(prediction.prediction);
                if (specialty) {
                    specialtyMessage = `\nKhuyến nghị bạn nên đi khám ở khoa ${specialty}`;
                }
            }
            
            // Thêm tin nhắn phản hồi từ bác sĩ với kết quả dự đoán
            const doctorMessage: Message = {
                id: Date.now() + 1,
                text: prediction.prediction === "Không xác định"
                    ? "Các triệu chứng của bạn thì chúng tôi không thể xác định được"
                    : `Dựa trên triệu chứng bạn mô tả, tôi có một số phân tích sau:\n\n` +
                    `Kết quả dự đoán: ${prediction.prediction}${specialtyMessage}\n\n` +
                    // `Độ tin cậy: ${(prediction.confidence * 100).toFixed(1)}%\n\n` +
                    `Lưu ý: Đây chỉ là kết quả dự đoán sơ bộ. Bạn nên đến gặp bác sĩ để được khám và tư vấn chi tiết hơn.`,
                sender: 'doctor',
                timestamp: new Date(),
                prediction: {
                    result: prediction.prediction,
                    confidence: prediction.confidence
                }
            };
            setMessages(prev => [...prev, doctorMessage]);
        } catch (error) {
            // Xử lý lỗi
            const errorMessage: Message = {
                id: Date.now() + 1,
                text: "Xin lỗi, có lỗi xảy ra khi phân tích triệu chứng. Vui lòng thử lại sau.",
                sender: 'doctor',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="diagnosis-container">
            <div className="diagnosis-box">
                <div className="doctorAI-info">
                    <img src={doctorAI} alt="Doctor" className="doctor-avatar" />
                    <div className="doctor-details">
                        <h3>Bác sĩ AI</h3>
                        <p>Chuyên gia tư vấn sức khỏe</p>
                    </div>
                </div>

                <div className="chat-container">
                    <div className="messages" ref={messagesContainerRef}>
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`message ${message.sender === 'user' ? 'user-message' : 'doctor-message'}`}
                            >
                                {message.sender === 'doctor' && (
                                    <img src={doctorAI} alt="Doctor" className="message-avatar" />
                                )}
                                <div className="message-content">
                                    <div className="message-time">
                                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                    <div className="message-text">{message.text}</div>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="message doctor-message">
                                <img src={doctorAI} alt="Doctor" className="message-avatar" />
                                <div className="message-content">
                                    <div className="message-text">Đang phân tích triệu chứng...</div>
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    <form className="message-input" onSubmit={handleSendMessage}>
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="Nhập triệu chứng của bạn..."
                            disabled={isLoading}
                        />
                        <button type="submit" disabled={isLoading}>
                            <svg viewBox="0 0 24 24" width="50" height="50" stroke="currentColor" strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round">
                                <line x1="22" y1="2" x2="11" y2="13"></line>
                                <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                            </svg>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Diagnosis; 