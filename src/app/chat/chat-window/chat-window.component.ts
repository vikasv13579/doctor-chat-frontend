import { Component, inject, OnInit, OnDestroy, signal, ViewChild, ElementRef, AfterViewChecked } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ChatService, Message, Room } from '../chat.service';
import { SocketService } from '../socket.service';
import { AuthService } from '../../auth/auth.service';
import { takeUntil } from 'rxjs/operators';
import { Subject } from 'rxjs';

@Component({
    selector: 'app-chat-window',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="chat-layout">
      <!-- Sidebar / Room List -->
      <div class="sidebar">
        <div class="sidebar-header">
           <h2>Messages</h2>
           <button class="back-link" (click)="goBack()">Back to Dashboard</button>
        </div>
        
        <div class="room-list">
          <div *ngIf="loadingRooms" class="loading">Loading...</div>
          <div 
            *ngFor="let room of rooms()" 
            class="room-item" 
            [class.active]="currentRoom()?.id === room.id"
            (click)="selectRoom(room)"
          >
             <div class="avatar">{{ room.otherUser?.fullName?.charAt(0) || 'U' }}</div>
             <div class="room-info">
               <h4>{{ room.otherUser?.fullName || 'Unknown User' }}</h4>
               <p>{{ room.lastMessage || 'No messages yet' }}</p>
             </div>
             <div class="unread" *ngIf="room.unreadCount">{{ room.unreadCount }}</div>
          </div>
        </div>
      </div>

      <!-- Main Chat Area -->
      <div class="chat-main" *ngIf="currentRoom(); else noRoom">
        <div class="chat-header">
           <div class="header-info">
             <h3>{{ currentRoom()?.otherUser?.fullName }}</h3> 
             <span class="status" [class.online]="currentRoom()?.otherUser?.isOnline">
                {{ currentRoom()?.otherUser?.isOnline ? 'Online' : 'Offline' }}
             </span>
           </div>
           <div class="connection-status" [class.connected]="socketService.connected()">
              {{ socketService.connected() ? 'Connected' : 'Reconnecting...' }}
           </div>
        </div>

        <div class="messages-container" #scrollContainer>
           <div *ngIf="messages().length === 0" class="empty-messages">
              No messages yet. Say hello!
           </div>
           
           <div *ngFor="let msg of messages()" class="message-wrapper" [class.me]="msg.senderId === myId">
              <div class="message-bubble">
                {{ msg.content }}
              </div>
              <div class="time">{{ msg.timestamp | date:'shortTime' }}</div>
           </div>
        </div>

        <div class="typing-indicator" *ngIf="isTyping()">
           {{ currentRoom()?.otherUser?.fullName }} is typing...
        </div>

        <div class="chat-input">
           <input 
             type="text" 
             [(ngModel)]="newMessage" 
             (keydown.enter)="sendMessage()"
             (input)="onTyping()"
             placeholder="Type a message..."
             [disabled]="!socketService.connected()"
           >
           <button (click)="sendMessage()" [disabled]="!newMessage.trim() || !socketService.connected()">Send</button>
        </div>
      </div>

      <ng-template #noRoom>
        <div class="chat-main empty">
           <p>Select a conversation to start chatting.</p>
        </div>
      </ng-template>
    </div>
  `,
    styles: [`
    .chat-layout { display: flex; height: 90vh; max-width: 1200px; margin: 20px auto; background: white; border-radius: 16px; box-shadow: 0 5px 20px rgba(0,0,0,0.05); overflow: hidden; }
    
    .sidebar { width: 300px; border-right: 1px solid #e2e8f0; display: flex; flex-direction: column; }
    .sidebar-header { padding: 20px; border-bottom: 1px solid #e2e8f0; }
    .sidebar-header h2 { margin: 0; font-size: 1.2rem; }
    .back-link { font-size: 0.8rem; color: #718096; margin-top: 5px; cursor: pointer; border: none; background: transparent; padding: 0; text-decoration: underline; }

    .room-list { overflow-y: auto; flex: 1; }
    .room-item { padding: 15px; display: flex; align-items: center; cursor: pointer; border-bottom: 1px solid #edf2f7; transition: background 0.2s; }
    .room-item:hover { background: #f7fafc; }
    .room-item.active { background: #ebf8ff; border-left: 4px solid #4299e1; }
    
    .avatar { width: 40px; height: 40px; background: #cbd5e0; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-right: 12px; font-weight: bold; color: white; }
    .room-info { flex: 1; min-width: 0; }
    .room-info h4 { margin: 0; font-size: 0.95rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .room-info p { margin: 2px 0 0; color: #718096; font-size: 0.8rem; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .unread { background: #e53e3e; color: white; font-size: 0.7rem; padding: 2px 6px; border-radius: 10px; }

    .chat-main { flex: 1; display: flex; flex-direction: column; }
    .chat-main.empty { align-items: center; justify-content: center; color: #a0aec0; }
    
    .chat-header { padding: 15px 20px; border-bottom: 1px solid #e2e8f0; display: flex; align-items: center; justify-content: space-between; }
    .chat-header h3 { margin: 0; font-size: 1.1rem; }
    .status { font-size: 0.8rem; color: #a0aec0; }
    .status.online { color: #48bb78; }
    
    .connection-status { font-size: 0.7rem; padding: 2px 8px; border-radius: 10px; background: #e53e3e; color: white; }
    .connection-status.connected { background: #48bb78; }
    .empty-messages { text-align: center; color: #a0aec0; margin-top: 40px; }

    .messages-container { flex: 1; padding: 20px; overflow-y: auto; background: #f9fafb; display: flex; flex-direction: column; gap: 10px; }
    
    .message-wrapper { max-width: 70%; display: flex; flex-direction: column; align-self: flex-start; }
    .message-wrapper.me { align-self: flex-end; align-items: flex-end; }
    
    .message-bubble { padding: 10px 15px; border-radius: 12px; background: white; box-shadow: 0 1px 2px rgba(0,0,0,0.05); color: #2d3748; }
    .message-wrapper.me .message-bubble { background: #4299e1; color: white; }
    
    .time { font-size: 0.7rem; color: #a0aec0; margin-top: 4px; padding: 0 4px; }

    .typing-indicator { padding: 5px 20px; font-size: 0.8rem; color: #718096; font-style: italic; min-height: 20px; }

    .chat-input { padding: 20px; border-top: 1px solid #e2e8f0; display: flex; gap: 10px; background: white; }
    .chat-input input { flex: 1; padding: 10px 15px; border: 1px solid #e2e8f0; border-radius: 20px; outline: none; transition: border-color 0.2s; }
    .chat-input input:focus { border-color: #4299e1; }
    .chat-input button { padding: 10px 20px; background: #4299e1; color: white; border: none; border-radius: 20px; cursor: pointer; font-weight: 600; }
    .chat-input button:disabled { background: #cbd5e0; cursor: default; }
  `]
})
export class ChatWindowComponent implements OnInit, OnDestroy, AfterViewChecked {
    chatService = inject(ChatService);
    socketService = inject(SocketService);
    authService = inject(AuthService);
    route = inject(ActivatedRoute);
    router = inject(Router);

    @ViewChild('scrollContainer') private scrollContainer!: ElementRef;

    rooms = signal<Room[]>([]);
    messages = signal<Message[]>([]);
    currentRoom = signal<Room | null>(null);

    myId = this.authService.currentUser()?.id;
    newMessage = '';
    isTyping = signal(false);
    loadingRooms = true;

    private destroy$ = new Subject<void>();

    ngOnInit() {
        this.socketService.connect();
        this.loadRooms();

        this.setupSocketListeners();

        // Check route params for room ID
        this.route.paramMap.pipe(takeUntil(this.destroy$)).subscribe(params => {
            const roomId = params.get('roomId');
            if (roomId) {
                this.selectRoomById(roomId);
            }
        });

        if (!this.myId) {
            // Fallback if signal lost or refresh
            this.authService.getMe().subscribe(u => this.myId = u?.id);
        }
    }

    ngAfterViewChecked() {
        this.scrollToBottom();
    }

    scrollToBottom(): void {
        try {
            if (this.scrollContainer) {
                this.scrollContainer.nativeElement.scrollTop = this.scrollContainer.nativeElement.scrollHeight;
            }
        } catch (err) { }
    }

    ngOnDestroy() {
        this.destroy$.next();
        this.destroy$.complete();
        this.socketService.disconnect();
    }

    loadRooms() {
        this.loadingRooms = true;
        this.chatService.getRooms().subscribe({
            next: (rooms) => {
                this.rooms.set(rooms);
                this.loadingRooms = false;
            },
            error: () => this.loadingRooms = false
        });
    }

    selectRoomById(roomId: string) {
        // Find within loaded rooms, or if rooms not loaded yet, wait? 
        // For simplicity, we assume rooms are loading or loaded. 
        // We can also fetch just the room details if needed.
        const room = this.rooms().find(r => r.id === roomId) || this.rooms().find(r => r.id == roomId);
        if (room) {
            this.selectRoom(room);
        }
    }

    selectRoom(room: Room) {
        if (this.currentRoom()?.id === room.id) return;

        this.currentRoom.set(room);
        this.socketService.joinRoom(room.id);

        this.chatService.getMessages(room.id).subscribe(msgs => {
            this.messages.set(msgs);
            this.scrollToBottom();
        });

        // Update URL without navigation
        // this.router.navigate(['/chat', room.id]); 
    }

    setupSocketListeners() {
        this.socketService.onMessage().pipe(takeUntil(this.destroy$)).subscribe((msg: Message) => {
            // Fix: Use loose equality (==) to handle string/number mismatch for IDs
            // And safely access roomId if present (msg usually has roomId attached by backend)
            const msgRoomId = (msg as any).roomId;
            const currentRoomId = this.currentRoom()?.id;

            if (currentRoomId && msgRoomId == currentRoomId) {
                this.messages.update(prev => [...prev, msg]);
                setTimeout(() => this.scrollToBottom(), 50); // Small delay for render
            } else {
                // Increment unread count in room list (prototype logic)
            }
        });

        this.socketService.onTyping().pipe(takeUntil(this.destroy$)).subscribe((data: any) => {
            if (data.roomId === this.currentRoom()?.id) {
                this.isTyping.set(true);
                setTimeout(() => this.isTyping.set(false), 3000);
            }
        });
    }

    sendMessage() {
        if (!this.newMessage.trim() || !this.currentRoom()) return;

        const payload = {
            roomId: this.currentRoom()!.id,
            content: this.newMessage
        };

        this.socketService.sendMessage(payload);

        // Optimistic update? Or wait for server echo?
        // Usually socket emits back the message to confirmation.
        // But we can append locally if we want.
        // Let's wait for the `receive_message` event which usually broadcasts to sender too or use ack.
        // For now, assume broadcast includes sender.

        this.newMessage = '';
    }

    onTyping() {
        if (this.currentRoom()) {
            this.socketService.sendTyping(this.currentRoom()!.id);
        }
    }

    goBack() {
        const role = this.authService.currentUser()?.role;
        if (role === 'doctor') {
            this.router.navigate(['/doctor-dashboard']);
        } else {
            this.router.navigate(['/patient-dashboard']);
        }
    }
}
