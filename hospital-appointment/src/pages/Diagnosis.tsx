import React, { useState, useRef, useEffect } from 'react';
import '../styles/Diagnosis.css';
import doctorAI from '../assets/doctor_ai.jpg';

interface Message {
    id: number;
    text: string;
    sender: 'user' | 'doctor';
    timestamp: Date;
}

const Diagnosis: React.FC = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [inputMessage, setInputMessage] = useState('');
    const messagesEndRef = useRef<HTMLDivElement>(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const handleSendMessage = (e: React.FormEvent) => {
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

        // Giả lập phản hồi từ bác sĩ
        setTimeout(() => {
            const doctorMessage: Message = {
                id: Date.now() + 1,
                text: "Tôi đang phân tích triệu chứng của bạn. Vui lòng cho biết thêm về thời gian và mức độ của các triệu chứng này.",
                sender: 'doctor',
                timestamp: new Date()
            };
            setMessages(prev => [...prev, doctorMessage]);
        }, 1000);
    };

    return (
        <div className="diagnosis-container">
            <div className="diagnosis-box">
                <div className="doctor-info">
                    <img src={doctorAI} alt="Doctor" className="doctor-avatar" />
                    <div className="doctor-details">
                        <h3>Bác sĩ AI</h3>
                        <p>Chuyên gia tư vấn sức khỏe</p>
                    </div>
                </div>

                <div className="chat-container">
                    <div className="messages">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`message ${message.sender === 'user' ? 'user-message' : 'doctor-message'}`}
                            >
                                {message.sender === 'doctor' && (
                                    <img src={doctorAI} alt="Doctor" className="message-avatar" />
                                )}
                                <div className="message-content">
                                    <div className="message-text">{message.text}</div>
                                    <div className="message-time">
                                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </div>
                                </div>
                            </div>
                        ))}
                        <div ref={messagesEndRef} />
                    </div>

                    <form onSubmit={handleSendMessage} className="message-input">
                        <input
                            type="text"
                            value={inputMessage}
                            onChange={(e) => setInputMessage(e.target.value)}
                            placeholder="Nhập triệu chứng của bạn..."
                        />
                        <button type="submit">
                            <i className="fas fa-paper-plane"></i>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Diagnosis; 