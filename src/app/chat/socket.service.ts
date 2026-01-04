import { Injectable, inject, signal } from '@angular/core';
import { io, Socket } from 'socket.io-client';
import { AuthService } from '../auth/auth.service';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class SocketService {
    private socket: Socket | undefined;
    private authService = inject(AuthService);
    private url = environment.socketUrl;

    // Track connection status
    connected = signal(false);

    connect() {
        const token = this.authService.getToken();
        if (!token) return;

        if (this.socket && this.socket.connected) {
            this.connected.set(true);
            return;
        }

        this.socket = io(this.url, {
            auth: { token }
        });

        this.socket.on('connect', () => {
            console.log('Socket connected');
            this.connected.set(true);
        });

        this.socket.on('disconnect', () => {
            console.log('Socket disconnected');
            this.connected.set(false);
        });
    }

    disconnect() {
        if (this.socket) {
            this.socket.disconnect();
        }
    }

    joinRoom(roomId: string) {
        this.socket?.emit('join_room', roomId);
    }

    sendMessage(payload: { roomId: string, content: string }) {
        this.socket?.emit('send_message', payload);
    }

    sendTyping(roomId: string) {
        this.socket?.emit('typing', { roomId });
    }

    // Observables for events
    onMessage(): Observable<any> {
        return new Observable(observer => {
            this.socket?.on('receive_message', (msg) => observer.next(msg));
        });
    }

    onTyping(): Observable<any> {
        return new Observable(observer => {
            this.socket?.on('user_typing', (data) => observer.next(data));
        });
    }

    onUserStatus(): Observable<any> {
        return new Observable(observer => {
            this.socket?.on('user_status', (data) => observer.next(data));
        });
    }
}
