
import { Component, ViewEncapsulation, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

// import { AppState } from './../../../app.service';
// import { RuleDomainTableService } from './rule.domain.table.service';
// import { FriendlyNamePipe } from './rule.domain.table.list.pipe';

// import { RuleDomainTableDto, RuleDomainTableDefinitionDto, ColumnDefinitionDto } from './rule.domain.table.dtos';

@Component({
    selector: 'theselector',
    // encapsulation: ViewEncapsulation.None,
    templateUrl: './getnext.calendar.component.html',
    styleUrls: ['getnext.calendar.component.css'],
    // providers: [RuleDomainTableService],
    // pipes: [FriendlyNamePipe]
})
export class GetNextCalendarComponent implements OnInit, OnDestroy {
    // vars for the entire page
    isLoading: boolean = false;

    // vars for the form(s)
    theWellNamedForm: FormGroup;

  constructor(private _formBuilder: FormBuilder) {
    // constructor(public _appState: AppState, private _tableService: RuleDomainTableService,
    //     private _formBuilder: FormBuilder) {

    }

    ngOnInit() {

    }

    ngOnDestroy() {

    }
}
