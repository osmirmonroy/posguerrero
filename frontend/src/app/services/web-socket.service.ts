import { Injectable } from '@angular/core';
import { Client, Message } from '@stomp/stompjs';
import * as SockJS from 'sockjs-client';
import { BehaviorSubject, Observable } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
    providedIn: 'root'
})
export class WebSocketService {
    private client: Client;
    private state: BehaviorSubject<any> = new BehaviorSubject<any>(null);

    constructor() {
        this.client = new Client({
            webSocketFactory: () => new SockJS(`${environment.apiUrl.replace('/api', '')}/ws`),
            debug: (msg: string) => console.log(msg),
            reconnectDelay: 5000,
            heartbeatIncoming: 4000,
            heartbeatOutgoing: 4000,
        });

        this.client.onConnect = (frame) => {
            console.log('Connected: ' + frame);
            this.client.subscribe('/topic/orders', (message: Message) => {
                if (message.body) {
                    this.state.next(JSON.parse(message.body));
                }
            });
        };

        this.client.onStompError = (frame) => {
            console.error('Broker reported error: ' + frame.headers['message']);
            console.error('Additional details: ' + frame.body);
        };

        this.client.activate();
    }

    public getOrderUpdates(): Observable<any> {
        return this.state.asObservable();
    }
}
