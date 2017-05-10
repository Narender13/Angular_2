
import { Component, ViewEncapsulation, ChangeDetectorRef, ChangeDetectionStrategy } from '@angular/core';
import { OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';

import { AdminCalendarService }  from './admin.calendar.service';
import { AppointmentDto }       from './admin.calendar.dtos';

// import { AppState } from './../../../app.service';
// import { RuleDomainTableService } from './rule.domain.table.service';
// import { FriendlyNamePipe } from './rule.domain.table.list.pipe';

// import { RuleDomainTableDto, RuleDomainTableDefinitionDto, ColumnDefinitionDto } from './rule.domain.table.dtos';


@Component({
    selector: 'adminCalendar',
    // encapsulation: ViewEncapsulation.None,
    changeDetection: ChangeDetectionStrategy.OnPush,
    templateUrl: './admin.calendar.component.html',
    styleUrls: ['admin.calendar.component.css'],
    providers: [AdminCalendarService]
})
export class AdminCalendarComponent implements OnInit, OnDestroy {
    // vars for the entire page
    isLoading: boolean = false;

    // vars for the form(s)
    theWellNamedForm: FormGroup;

    appointments: any[];    
    header: any;
    appointment: AppointmentDto;
    dialogVisible: boolean = false;
    idGen: number = 100;

    constructor(private _formBuilder: FormBuilder, private _adminCalendarService: AdminCalendarService,
        private _changeDetectorRef: ChangeDetectorRef) {


    }

    ngOnInit() {
        // this._adminCalendarService.getAppointments()
        //     .subscribe(
        //     appointments => { 
        //         this.appointments = appointments;
        //     },
        //     err => console.error(err),
        //     () => {
        //         this.isLoading = false;
        //     });

        this.header = {
            left: 'prev,next today',
            center: 'title',
            right: 'month,agendaWeek,agendaDay'
        };
    }

    handleDayClick(appointment) {
        this.appointment = new AppointmentDto();
        this.appointment.start = appointment.date.format();
        this.dialogVisible = true;

        // trigger detection manually as somehow only moving the 
        // mouse quickly after click triggers the automatic detection
        this._changeDetectorRef.detectChanges();
    }

    handleAppointmentClick(e) {
        
        this.appointment = new AppointmentDto();
        this.appointment.title = e.calEvent.title;

        let start = e.calEvent.start;
        let end = e.calEvent.end;
        if (e.view.name === 'month') {
            start.stripTime();
        }

        if (end) {
            end.stripTime();
            this.appointment.end = end.format();
        }

        this.appointment.id = e.calEvent.id;
        this.appointment.start = start.format();
        this.appointment.allDay = e.calEvent.allDay;
        this.dialogVisible = true;
    }

    saveAppointment() {
        // update
        if (this.appointment.id) {
            let index: number = this.findAppointmentIndexById(this.appointment.id);
            if (index >= 0) {
                this.appointments[index] = this.appointment;
            }
        }
        // new
        else {
            this.appointment.id = this.idGen;
            this.appointments.push(this.appointment);
            this.appointment = null;
        }

        this.dialogVisible = false;
    }

    deleteAppointment() {
        let index: number = this.findAppointmentIndexById(this.appointment.id);
        if (index >= 0) {
            this.appointments.splice(index, 1);
        }
        this.dialogVisible = false;
    }

    findAppointmentIndexById(id: number) {
        let index = -1;
        for (let i = 0; i < this.appointments.length; i++) {
            if (id === this.appointments[i].id) {
                index = i;
                break;
            }
        }

        return index;
    }

    ngOnDestroy() {

    }
}
