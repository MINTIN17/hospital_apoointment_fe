import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

// Fix lỗi global is not defined
if (typeof window !== 'undefined') {
    (window as any).global = window;
}

const stompClient = new Client({
    webSocketFactory: () => new SockJS('http://localhost:8801/ws'),
    reconnectDelay: 5000,
    debug: function (str) {
        console.log(str);
    },
    onStompError: function (frame) {
        console.error('STOMP error', frame);
    }
});

export default stompClient; 