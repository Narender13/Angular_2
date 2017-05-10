import {ConfirmDialogModule,ConfirmationService} from 'primeng/primeng';
import { Component, Input, Output,
    EventEmitter, HostListener,
    ViewEncapsulation,
    OnInit, OnDestroy} from '@angular/core';

@Component({
    selector: 'confirmDialog',
    templateUrl: './confirm-dialog.component.html',
    providers: [ConfirmationService]
})
export class ConfirmDialogComponent {
       
    @Input() text:string;
    @Output() acceptedEmitter:EventEmitter<boolean> = new EventEmitter();   
    
    constructor(private confirmationService: ConfirmationService) {}

    show(text: string) {
        this.confirmationService.confirm({
            message: text,
            accept: () => {
                this.acceptedEmitter.emit(true);
            },
            reject: () => {
                this.acceptedEmitter.emit(false);
            }
        });
    }
    
   
}