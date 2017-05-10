
import { EventEmitter, Injectable } from '@angular/core';
import { ReplaySubject } from 'rxjs/ReplaySubject';

@Injectable()
export class RefreshGetNextQueueService {

    public refreshGetNextQueueEvent$ = null;
    private _eventSource = new ReplaySubject<string>(1, 500);

    constructor() {

        // Observable navItem stream
        this.refreshGetNextQueueEvent$ = this._eventSource.asObservable();
    }

    public fireEvent(source): void {

        console.log('firing refreshGetNextQueueEvent event with source: ' + source);

        this._eventSource.next(source);
    }
}
