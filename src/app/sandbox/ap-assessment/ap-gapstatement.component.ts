import { Component, ViewEncapsulation, OnInit, OnDestroy, Input, ViewChild } from '@angular/core';

@Component({
    selector: 'gapStatementComponent',
    encapsulation: ViewEncapsulation.None,
    templateUrl: './ap-gapstatement.component.html'
})


export class GapStatementComponent {
    @Input() gapStatmentObject: string;
}
