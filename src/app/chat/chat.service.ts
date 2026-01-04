import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { environment } from '../../environments/environment';

export interface Room {
    id: string; // or number, depends on backend
    otherUser?: {
        id: number;
        fullName: string;
        isOnline?: boolean;
    };
    lastMessage?: string;
    unreadCount?: number;
}

export interface Message {
    id: string;
    content: string;
    senderId: number;
    timestamp: Date;
}

@Injectable({
    providedIn: 'root'
})
export class ChatService {
    private apiUrl = `${environment.apiUrl}/chat`;
    private http = inject(HttpClient);

    getRooms(): Observable<Room[]> {
        return this.http.get<Room[]>(`${this.apiUrl}/rooms`);
    }

    getMessages(roomId: string): Observable<Message[]> {
        return this.http.get<Message[]>(`${this.apiUrl}/rooms/${roomId}/messages`);
    }

    createRoom(): Observable<any> {
        // Just in case we need to manually create
        return this.http.post(`${this.apiUrl}/rooms`, {});
    }
}
