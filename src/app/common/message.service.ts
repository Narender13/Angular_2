
import { Injectable } from '@angular/core';
import { Message } from 'primeng/primeng';

@Injectable()
export class MessageService {
    public msgs: Message[] = [];

     public show(message: string, severity: string) {
        this.msgs = [];
        this.msgs.push({ severity: severity, summary: 'Response', detail: message });
    }
}
