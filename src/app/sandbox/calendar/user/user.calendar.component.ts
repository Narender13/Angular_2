
import {
    Component, ViewEncapsulation, ChangeDetectorRef, ChangeDetectionStrategy, ElementRef,
    Renderer, ViewChild
} from '@angular/core';
import { OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { MessageService } from './../../../common/message.service';
import { UserCalendarService } from './user.calendar.service';
import {  CalendarOpenedTabInfoDto } from './../common/calendar.dtos';

import {
    AppointmentDto, UserSearchDto, AppointmentTypeDto, AppointmentSubjectDto,
    MyEvent, CreateAppointmentDto, GetAvailabilityDTO, RequestAttendeesDto, UserAppointmentDetail, attendeeListIdType
}
    from './user.calendar.dtos';

import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import { AppointmentDetail } from './user.interface';
import { AvailabilityUser } from './user.interface';


@Component({
    selector: 'userCalendar',
    /* changeDetection: ChangeDetectionStrategy.OnPush, */
    templateUrl: './user.calendar.component.html',
    styleUrls: ['user.calendar.component.css'],
    providers: [UserCalendarService, MessageService]
})

export class UserCalendarComponent implements OnInit, OnDestroy {

/**
 * TODO Amarjit:need to reduce further  global vatraibles 
 */

    isLoading: boolean = false;
    events: any[] = [];
    header: any;
    appointmentdatetime: any;
    appointment: any = {};
    saveEditEventParam: any = null;
    appointments: AppointmentDto[] = null;
    active: string = null;
    timeDiff: number;
    submitted: boolean = false;
    editAppointmentId: any = null;
    searchResults: UserSearchDto[] = null;
    popupSearchResults: UserSearchDto[] = null;
    appointmentTypes: AppointmentTypeDto[] = null;
    memberAppointmentTypes: AppointmentTypeDto[] = null;
    appointmentTypesDesk: any [] = [];
    memberAppointmentTypesDesk: any [] = [];
    appointmentStartTime: any;
    appointmentEndDate: any;
    appointmentEndTime: any;
    appointmentTypeSubject: any[] = [];
    isMemberAppointmentTypes: boolean = false;
    dialogVisible: boolean = false;
    errordialogVisible: boolean = false;
    backgroundColor: string;
    agendaweekdialog: boolean = false;
    sameuserdialog: boolean = false;
    errormessage: boolean = false;
    subjecttypeselect: boolean = false;
    editable: boolean = false;
    addappointmentpop: boolean = false;
    editAppointmentPop: boolean = false;
    loginUserId: any = 0;
    busHrs: any;
    defaultView: string;
    currentCalView: string;
    currentCalDate: any;
    userFullName: string;
    searchText: string = 'Enter User Name';
    searchTextpopUp: string = 'Enter User Name';
    searchAlertText: string;
    scrollTime: any;
    aspectRatio: number;
    text: string;
    popupSearchText: string;
    apptStartDate: any;
    apptEndDate: any;
    userform: FormGroup;
    apptStartTime: any;
    apptEndTime: any;
    selectedAppType: any;
    selectedSubject: string;
    appointmentType: any = {};
    appointmentSubject: any[];
    appointmentDesc: string;
    invalidEndDate: boolean = false;
    invalidStrtTime: boolean = false;
    invalidStartDate: boolean = false;
    checkValidEndDate: boolean = false;
    checkValidEndTime: boolean = false;
    checkValidStartTime: boolean = false;
    checkValidStartDate: boolean = false;
    appointmentStartDate: any;
    modelAppointmentStartDate: any;
    modelAppointmentStartTime: any;
    modelAppointmentEndDate: any;
    modelAppointmentEndTime: any;
    sBearerToken: string;
    currentAppointment: any = {};
    availabilitydatetime: any;
    appointmentOwnerCCMSId: number;
    currentUserID: any;
    appointmentAttendeeInfoList: RequestAttendeesDto[] = [];
    searchUserArray: any[] = [];
    calendarOpenedTabInfoList:      CalendarOpenedTabInfoDto[] = [];
    popupOpenedTabInfoList:      CalendarOpenedTabInfoDto[] = [];
    popupTabColorAvailableList: any[] = [];
    isAddOrUpdateClicked: boolean = false;
    colorCode: any[] = [ '#31A7B8', '#35CBCF', '#8A930F', '#686E6B', '#B77F3B', '#735340',
                        '#D95151', '#A88904', '#E97909', '#2E7AA8', '#7C537D', '#129C99', '#7093C3',
                        '#686998', '#92363B', '#A87932', '#476259', '#423F6D', '#00B050', '#773564'
                        ];
    calendarTabColorAvailableList: any[] = this.colorCode.slice();

    // TODO not sure if we need these variables 
    userId: string = null;
    userName: string = null;
    gotEventCalendar: Boolean;
    event: MyEvent;
    user: any;
    userGroup: any;

    // TODO need to fix below
    getMins: any;
    getDuration: any;
    minDate: Date;
    maxDate: Date;

    public availabilityForm: FormGroup;
    public viewOptions = [
        { value: 'UserView', display: 'View by User', searchTxt: 'Enter User Name' }
    ];
    public myForm: FormGroup;
    constructor(private _formBuilder: FormBuilder,
        private _userCalendarService: UserCalendarService,
        private _changeDetectorRef: ChangeDetectorRef,
        public el: ElementRef,
        public renderer: Renderer,
        private route: ActivatedRoute,
        private _messageService: MessageService) {
        this.gotEventCalendar = false;
        this.route.queryParams.subscribe(
            (param: any) => {
                 let loggedUserName = '';
                if (param['userFullName']) {
                   loggedUserName = this.userFullName = param['userFullName'];
                }
                if (param['userId']) {
                    this.loginUserId = param['userId'];
                }
                 let isMember = false;
                 let mainCalendar = true;
                 this.recordUserInfo(this.loginUserId, loggedUserName, '#7093C3', isMember, mainCalendar);
                 this.setOpenedTabAttributes(this.loginUserId, '#7093C3', true);

            });
    }

    ngOnInit() {
        this.sBearerToken = this.route.snapshot.queryParams['bearerToken'];
        // The following line may need to be commented if configuration.services.ts is modified
        // and we decide not to invoke getHeaders in service call.
        if (this.sBearerToken && this.sBearerToken !== '') {
            this._userCalendarService.setBearerToekn(this.sBearerToken);
        }

        this.getAppointmentTypeList(false);
        this.getAppointmentTypeList(true);
        let today = new Date();
        let month = today.getMonth();
        let prevMonth = (month === 0) ? 11 : month - 1;
        let nextMonth = (month === 11) ? 0 : month + 1;
        this.minDate = new Date();
        this.minDate.setMonth(month);
        this.selectedAppType = 'SELECTOPTIONS';
        this.appointment = new AppointmentDto();
        this.appointmentType = [];


        this.myForm = this._formBuilder.group({
            checkBoxGroup: [''],
            appointmentTypeId: ['', <any>Validators.required],
            subjecttype: ['', <any>Validators.required],
            description: [''],
            appointmentdatetime: this._formBuilder.group({
                appointmentstartdate: new FormControl('', Validators.required),
                appointmentstarttime: new FormControl('', Validators.required),
                appointmentenddate: ['', <any>Validators.required],
                appointmentendtime: ['', <any>Validators.required]
            })
        });


        /* setting aspectRatio according to window height */
        if (window.innerWidth > 1020 && window.innerWidth < 1120 && window.innerHeight > 750) {
            this.aspectRatio = 1.5;
        } else if (window.innerWidth > 1020 && window.innerWidth < 1120 && window.innerHeight > 620) {

            this.aspectRatio = 1.90;
        } else if (window.innerWidth > 1275 && window.innerWidth < 1320 && window.innerHeight > 1000) {

            this.aspectRatio = 1.3;
        } else if (window.innerWidth > 1275 && window.innerWidth < 1320 && window.innerHeight > 768) {

            this.aspectRatio = 1.9;
        } else if (window.innerWidth > 1360 && window.innerWidth < 1380 && window.innerHeight > 700) {

            this.aspectRatio = 2.3;
        } else if (window.innerWidth > 1360 && window.innerWidth < 1380 && window.innerHeight > 650) {

            this.aspectRatio = 2.6;
        } else if (window.innerWidth > 1435 && window.innerWidth < 1450 && window.innerHeight > 850) {

            this.aspectRatio = 1.8;
        } else if (window.innerWidth > 1435 && window.innerWidth < 1450 && window.innerHeight > 650) {

            this.aspectRatio = 2.1;
        } else if (window.innerWidth > 1590 && window.innerWidth < 1700 && window.innerHeight > 850) {

            this.aspectRatio = 2.0;
        }
        this.user = {
            viewOption: this.viewOptions[0].value,
        };

        this.userGroup = {
            viewOption: this.viewOptions[0].value,
        };

        this.header = {
            left: 'title prev,next today',
            right: 'month,agendaWeek,agendaDay,listMonth',
            month: {
                titleFormat: 'YYYY, MM, DD'
            }
        };

        this.busHrs = {
            dow: [0, 1, 2, 3, 4, 5, 6],
            start: '08:00',
            end: '08:01'
        };

        this.scrollTime = '08:00';
        this.defaultView = 'agendaWeek';
        this.events = [];
    }

    save(model: AppointmentDetail, isValid: boolean, $event) {

        $event.preventDefault();
        let blocknamePopup = document.getElementsByClassName('caremanagerblockPopup');
        if (blocknamePopup.length === 0) {
            this.searchAlertText = 'Please add at least one user to be able to add appointment.';
            this.sameuserdialog = true;
        }

        let apntEndDate = moment(model.appointmentdatetime.appointmentenddate).format('YYYY/MM/DD');
        let apntEndTime = moment((moment(model.appointmentdatetime.appointmentendtime).format('hh:mm:a')), 'h:mma');
        let apntStartDate = moment(model.appointmentdatetime.appointmentstartdate).format('YYYY/MM/DD');
        let apntStartTime = moment((moment(model.appointmentdatetime.appointmentstarttime).format('hh:mm:a')), 'h:mma');
        let currentTime = moment((moment(new Date()).format('hh:mm:a')), 'h:mma');
        let currentDate = moment().format('YYYY/MM/DD');

        if (model.appointmentTypeId === 'SELECTOPTIONS' || model.appointmentTypeId === '') {
            this.errormessage = true;
        } else {
            this.errormessage = false;
        }
        if (model.subjecttype === 'Select an Option' || model.subjecttype === '' || model.subjecttype === null) {
            this.subjecttypeselect = true;
        } else {
            this.subjecttypeselect = false;
        }
        if (moment(apntEndDate).isBefore(apntStartDate)) {
            this.invalidEndDate = true;
        } else {
            this.invalidEndDate = false;
        }
        if (apntStartTime.isBefore(currentTime) && moment(apntStartDate).isSame(currentDate)) {
            this.invalidStrtTime = true;
        } else {
            this.invalidStrtTime = false;
        }
        if (moment(apntEndDate).isSame(apntStartDate)) {
            if (apntEndTime.isBefore(apntStartTime)) {
                this.invalidEndDate = true;
            } else if (apntEndTime.isSame(apntStartTime)) {
                this.invalidEndDate = true;
            } else {
                this.invalidEndDate = false;
            }
        }
        if (model.appointmentdatetime.appointmentenddate === null || model.appointmentdatetime.appointmentenddate === '') {
            this.checkValidEndDate = true;
        } else {
            this.checkValidEndDate = false;
        }
        if (model.appointmentdatetime.appointmentendtime === null || model.appointmentdatetime.appointmentendtime === '') {
            this.checkValidEndTime = true;
        } else {
            this.checkValidEndTime = false;
        }
        if (model.appointmentdatetime.appointmentstartdate === null || model.appointmentdatetime.appointmentstartdate === '') {
            this.checkValidStartDate = true;
        } else {
            this.checkValidStartDate = false;
        }
        if (model.appointmentdatetime.appointmentstarttime === null || model.appointmentdatetime.appointmentstarttime === '') {
            this.checkValidStartTime = true;
        } else {
            this.checkValidStartTime = false;
        }
        if (this.invalidEndDate !== true && this.invalidStartDate !== true && this.checkValidEndDate !== true
            && this.checkValidEndTime !== true && this.checkValidStartDate !== true
            && this.checkValidStartTime !== true && this.errormessage !== true && this.subjecttypeselect !== true 
            && this.invalidStrtTime !== true && !(this.sameuserdialog)) {
            this.submitted = true;
            this.saveAppointment(model);
        }
    }

    typeChanged(apptType) {
        let appointmentDuration;
        let updateEndTime;
        this.appointmentTypeSubject = [];
        this.appointmentTypeSubject.push(
            {label: 'Select an Option', value: null}
        );
        if (apptType.value !== null) {
            this.modelAppointmentStartDate = this.appointmentStartDate;
            this.modelAppointmentEndDate = this.appointmentStartDate;
            appointmentDuration = apptType.value.duration.split('minutes')[0].trim();
            updateEndTime = moment(this.modelAppointmentEndDate).add(appointmentDuration, 'minutes').toDate();
            this.getDuration = appointmentDuration;
            this.modelAppointmentEndTime = updateEndTime;
            // this.checkValidEndDate = this.checkValidEntry = this.checkValidEndTime = this.checkValidStartTime = false;
            apptType.value.subjectType.forEach((item, index) => {
                this.appointmentTypeSubject.push(
                    {label: item.subjectDesc, value: {id: item.subjectId, name: item.subjectDesc}}
                );
            });
            this.myForm.controls['subjecttype'].setValue('Select an Option', { onlySelf: true });
        }
        // this.appointmentSubject = [];
        this.invalidStartDate = this.invalidEndDate = false;
        this.checkValidEndTime = this.checkValidEndDate = false;
        if (this.saveEditEventParam !== '') {
            this.myForm = this._formBuilder.group({
                'appointmentTypeId': new FormControl(apptType.value , Validators.required),
                'subjecttype': new FormControl('Select an Option', Validators.required),
                'description': new FormControl(this.appointmentDesc),
                'appointmentdatetime': this._formBuilder.group({
                    'appointmentstartdate': new FormControl(this.appointmentStartDate, Validators.required),
                    'appointmentstarttime': new FormControl(this.appointmentStartDate, Validators.required),
                    'appointmentenddate': new FormControl(this.appointmentStartDate, Validators.required),
                    'appointmentendtime': new FormControl(updateEndTime, Validators.required)
                })
            });
        }
    }


    handleDayClick(appt) {
        this.isMemberAppointmentTypes = false;
        this.saveEditEventParam = appt;
        this.isAddOrUpdateClicked = false;
        this.popupOpenedTabInfoList = this.calendarOpenedTabInfoList.slice();
        this.popupTabColorAvailableList = this.calendarTabColorAvailableList.slice();
        this.errormessage = this.editAppointmentPop = false;
        this.addappointmentpop = true;
        this.editable = false;
        this.appointmentOwnerCCMSId = this.loginUserId;
        if (this.saveEditEventParam.date !== undefined ) {
            this.appointmentStartDate = moment(this.saveEditEventParam.date.format()).toDate();
        } else {
            this.appointmentStartDate = moment(this.saveEditEventParam.calEvent.start).toDate();
        }
        if (appt.view.name === 'month') {
            this.agendaweekdialog = false;
            this.dialogVisible = false;
            if (moment(moment(appt.date.format()).toDate()).isBefore(moment(new Date).toDate()) === true) {
                this.errormessage = true;
            }
        } else {
            this.agendaweekdialog = true;
            if (moment(moment(appt.date.format()).toDate()).isBefore(moment(new Date).toDate()) === true) {
                this.errormessage = true;
            }
        }
    }


    showAddAppointment() {
        this.saveEditEventParam = '';
        this.popupOpenedTabInfoList = this.calendarOpenedTabInfoList.slice();
        this.getAttendeeList( this.popupOpenedTabInfoList);
        this.editAppointmentId =  null;
        this.appointmentOwnerCCMSId = this.loginUserId;
        this.isAddOrUpdateClicked = this.errormessage = false;
        this.editable = false;
        this.addappointmentpop = true;
        this.invalidStrtTime = this.subjecttypeselect = false;
        this.appointmentTypeSubject = [];
        this.myForm = this._formBuilder.group({
            'appointmentTypeId': ['', <any>Validators.required],
            'subjecttype': [this.selectedSubject, <any>Validators.required],
            'description': [''],
            appointmentdatetime: this._formBuilder.group({
                'appointmentstartdate': new FormControl(this.appointmentStartDate, Validators.required),
                'appointmentstarttime': new FormControl(this.appointmentStartDate, Validators.required),
                'appointmentenddate': new FormControl('', Validators.required),
                'appointmentendtime': ['', <any>Validators.required]
            })
        });
        this.appointmentTypeSubject.push(
            {label: 'Select an Option', value: null}
        );
        this.agendaweekdialog = false;
        this.dialogVisible = true;
        let popupColors = this.popupOpenedTabInfoList.slice();
        setTimeout(function () {
            let blocknamePopup = document.getElementsByClassName('caremanagerblockPopup');
            for (let i = 0; i < blocknamePopup.length; i++) {
                blocknamePopup[i].lastElementChild.setAttribute('style', 'background-color:' + popupColors[i].colorCode);
            }
        }, 10);
    }



    EditAppointment(event) {
        this.saveEditEventParam = '';
        this.isMemberAppointmentTypes = false;
        this.editable = true;
        this.appointmentAttendeeInfoList = [];
        this.editAppointmentId = event.calEvent.id;
        this.appointmentEndTime = moment(event.calEvent.start).toDate();
        this.popupOpenedTabInfoList = this. calendarOpenedTabInfoList.slice();
        this.popupTabColorAvailableList = this.calendarTabColorAvailableList.slice();
        let appointmentAttendees = event.calEvent.attendees;
        this.updatePopupOpenedTabInfoList(appointmentAttendees);
        if (moment(moment((event.calEvent.start).format()).toDate()).isBefore(moment(new Date).toDate()) === true) {
                this.errormessage = true;
                this.editAppointmentPop = false;
               } else {
                   this.errormessage = false;
                   this.editAppointmentPop = true;
               }
        if (this.currentCalView === 'listMonth') {
            this.dialogVisible = false;
            this.agendaweekdialog = false;
        } else if (this.currentCalView === 'month') {
            this.dialogVisible = false;
            this.agendaweekdialog = false;
        } else {
            this.agendaweekdialog = true;
        }
        this.saveEditEventParam = event;
        this.addappointmentpop = false;
    }

    onBlurMethod(event, type) {
        if (this.modelAppointmentEndDate === null && type === 'endDate') {
            event.target.value = '';
            this.modelAppointmentEndDate = '';
            this.checkValidEndDate = true;
        } else if (event.target.value !== '' && type === 'endDate') {
            this.checkValidEndDate = false;
        }
        if ((this.modelAppointmentEndTime === null && type === 'endTime') ||
            (type === 'endTime' && event.target.value.length > 5)) {
            event.target.value = '';
            this.modelAppointmentEndTime = '';
            this.checkValidEndTime = true;
        } else if (event.target.value !== '' && type === 'endTime') {
            this.checkValidEndTime = false;
        }

        if (this.modelAppointmentStartDate === null && type === 'startDate') {
            event.target.value = '';
            this.modelAppointmentStartDate = '';
            this.checkValidStartDate = true;
        } else if (event.target.value !== '' && type === 'startDate') {
            this.checkValidStartDate = false;
        }

        if ((this.modelAppointmentStartTime === null && type === 'startTime') ||
            (type === 'startTime' && event.target.value.length > 5)) {
            event.target.value = '';
            this.modelAppointmentStartTime = '';
            this.checkValidStartTime = true;
        } else if (event.target.value !== '' && type === 'startTime') {
            this.checkValidStartTime = false;
        }
    }

    handleAppointmentClick(event) {
         let checkAppointmentTypes = [];
          let calAppointment = this.saveEditEventParam.calEvent;
          let appointmentId = this.saveEditEventParam.calEvent.id;
          for (let attendee of this.saveEditEventParam.calEvent.attendees ) {
               let attendeeInfo = new RequestAttendeesDto;
                attendeeInfo.appointmentId = appointmentId;
                attendeeInfo.appointmentAttendeeId = attendee.attendeeId;
                attendeeInfo.appointmentAttendeeCCMSId = (attendee.id === -1) ? null : (attendee.id);
                attendeeInfo.memberId = (attendee.id === -1) ? attendee.memberId : null;
                this.appointmentAttendeeInfoList.push (attendeeInfo);
          }

        this.isAddOrUpdateClicked = false;
        this.agendaweekdialog = false;
        this.addappointmentpop = false;
        this.editAppointmentPop = false;

        let blocknamePopup = document.getElementsByClassName('caremanagerblockPopup');

        for (let i = 0; i < blocknamePopup.length; i++) {
                blocknamePopup[i].lastElementChild.setAttribute('style', 'background-color:' + this.popupOpenedTabInfoList[i].colorCode);
        }
        if (this.isMember(calAppointment.attendees)) {
            this.isMemberAppointmentTypes = true;
        } else {
            this.isMemberAppointmentTypes = false;
        }
        this.currentAppointment = this.setAppointmentTypeValues(calAppointment, this.isMember(calAppointment.attendees));
        if (this.isMember(calAppointment.attendees) === true) {
            checkAppointmentTypes = this.memberAppointmentTypes.slice();
        } else {
            checkAppointmentTypes = this.appointmentTypes.slice();
        }
        // this.appointment = new AppointmentDto();
       // this.appointment.title = calAppointment.title;
        this.selectedAppType = this.currentAppointment.appointmentTypeDesc;
        this.appointmentSubject = this.currentAppointment.appointmentTypeSubject;
        for (let i = 0; i < checkAppointmentTypes.length; i++) {
            if (this.selectedAppType === checkAppointmentTypes[i].appointmentTypeDesc) {
                console.log('appointtype subject', checkAppointmentTypes[i].appointmentTypeSubject);
                console.log('current appointment', checkAppointmentTypes[i]);
                let updateAppointmentStartDateTime = moment(calAppointment.start).toDate();
                let updateAppointmentEndDateTime = moment(calAppointment.end).toDate();
                let updateAppointmentDescription = calAppointment.description;
                this.appointmentDesc = updateAppointmentDescription;
                this.appointmentEndDate = updateAppointmentEndDateTime;
                this.appointmentStartDate = updateAppointmentStartDateTime;
                let updatedSubjectType ;
                let updateAppointmentType = {
                        duration: checkAppointmentTypes[i].duration,
                        id: checkAppointmentTypes[i].appointmentId,
                        name: checkAppointmentTypes[i].appointmentTypeDesc,
                        subjectType: checkAppointmentTypes[i].appointmentTypeSubject
                };
                // this.selectedappointmenttype = updateAppointmentType;
                this.appointmentTypeSubject = [];
                this.appointmentTypes[i].appointmentTypeSubject.forEach((item, index) => {
                    this.appointmentTypeSubject.push(
                        {label: item.subjectDesc, value: {id: item.subjectId, name: item.subjectDesc}}
                    );
                    if (item.subjectDesc === calAppointment.title) {
                        updatedSubjectType = {
                            id: item.subjectId, name: item.subjectDesc
                        };
                    }
                });
                this.myForm = this._formBuilder.group({
                    'appointmentTypeId': new FormControl(updateAppointmentType, Validators.required),
                    'subjecttype': new FormControl(updatedSubjectType, Validators.required),
                    'description': [this.appointmentDesc, <any>Validators.required],
                    appointmentdatetime: this._formBuilder.group({
                    'appointmentstartdate': new FormControl(updateAppointmentStartDateTime, Validators.required),
                    'appointmentstarttime': new FormControl(updateAppointmentStartDateTime, Validators.required),
                    'appointmentenddate': new FormControl(updateAppointmentEndDateTime, Validators.required),
                    'appointmentendtime': new FormControl(updateAppointmentEndDateTime, Validators.required)
                    })
                });
                this.selectedAppType = updateAppointmentType;
                console.log('test edit subject', updatedSubjectType, this.myForm.controls['subjecttype'].value);
                // this.btnDisabled = false;
            }
        }
        this.dialogVisible = true;
    }

    saveAppointment(model) {
        this.isAddOrUpdateClicked = true;
        if (this.appointmentAttendeeInfoList.length === 0) {
             this.getAttendeeList( this.popupOpenedTabInfoList);
        }
        this.appointment.start = new Date(this.apptStartDate + ' ' + this.apptStartTime);
        this.appointment.end = new Date(this.apptEndDate + ' ' + this.apptEndTime);
        this.appointment.end = moment(this.appointment.end).format('YYYY-MM-DDTHH:mm:ss');
        this.timeDiff = moment(this.appointment.end).diff(this.appointment.start, 'minutes');
        this.appointment.type = this.selectedAppType['name'];
        this.appointment.description = model.description;
        this.appointment.duration = this.timeDiff;
        this._userCalendarService.createAppointment(this.createAppointmentRequestDto(model),
        this.loginUserId).subscribe(
            saveAppointmentResponse => {
                if (saveAppointmentResponse) {
                    console.log('response', saveAppointmentResponse);
                    this.dialogVisible = false;
                    this.events = [];
                    for (let calendarOpenedTabInfo of this.calendarOpenedTabInfoList) {
                        this.getExistingAppointments(calendarOpenedTabInfo.userId, calendarOpenedTabInfo.colorCode,
                        this.getCalendarModeName(this.currentCalView), this.currentCalDate);
                    }
                }
                this.closeAppointmentPopup();
            },
            error => console.log('Error HTTP GET Service'),
            () => {
                this.isLoading = false;
                console.log('Saved appointment', this.appointments);
            });
    }

    /**
     * Amarjit
     * TODO
     * need to create appointment object from model not global variables
     */
    createAppointmentRequestDto(model): CreateAppointmentDto {
        let endTimeFormat = moment(model.appointmentdatetime.appointmentendtime).format('HH:mm:ss');
        let startTimeFormat = moment(model.appointmentdatetime.appointmentstarttime).format('HH:mm:ss');
        let startDateFormat = moment(model.appointmentdatetime.appointmentstartdate).format('DD-MM-YYYY');
        let endDateFormat = moment(model.appointmentdatetime.appointmentenddate).format('DD-MM-YYYY');
        return {
            appointmentId: this.editAppointmentId,
            appointmentOwnerCCMSId: this.appointmentOwnerCCMSId,
            memberId: null,
            taskObjectiveId: model.subjecttype.id,
            appointmentDescription: this.appointment.description,
            appointmentTypeId: model.appointmentTypeId.id,
            appointmentStartTime: startDateFormat + ' ' + startTimeFormat,
            appointmentEndTime: endDateFormat + ' ' + endTimeFormat,
            appointmentDuration: this.getDuration,
            appointmentStatusId: null,
            appointmentActiveCode: true,
            appointmentAttendee: this.appointmentAttendeeInfoList
        };
    }


    selectName(appoinmentSearchBox) {

        let isMember = false;
        let mainCalendar = false;
        if (appoinmentSearchBox === 'apptPopup') {

            for (let searchedUser of this.searchUserArray){
                if (searchedUser.name === this.popupSearchText) {
                    this.currentUserID = searchedUser.id;
                }
            }
            if (this.isUserTabAlreadyOpened(this.popupOpenedTabInfoList, this.popupSearchText)) {

                this.searchAlertText = 'The selected user name is already present';
                this.sameuserdialog = true;
                this.searchText = '';
                }else {
                    let backgroundColorCode = '';
                    for (let user of this.calendarOpenedTabInfoList){
                        if ( this.currentUserID === user.userId) {
                            backgroundColorCode = user.colorCode;
                        }
                    }
                    backgroundColorCode = (backgroundColorCode !== '') ? backgroundColorCode :
                    this.popupTabColorAvailableList[this.popupTabColorAvailableList.length - 1];
                    this.setOpenedTabAttributes(this.currentUserID, backgroundColorCode, false);
                    this.recordUserInfo(this.currentUserID, this.popupSearchText, backgroundColorCode, isMember, mainCalendar);
                    this.popupTabColorAvailableList = this.removeColorFromList(
                    this.popupTabColorAvailableList, backgroundColorCode);
                    let attendeeInfo = new RequestAttendeesDto;
                    attendeeInfo.appointmentId = this.editAppointmentId;
                    attendeeInfo.appointmentAttendeeId = null;
                    attendeeInfo.appointmentAttendeeCCMSId = this.currentUserID;
                    if (this.saveEditEventParam !== null && this.saveEditEventParam !== 'undefined' && this.saveEditEventParam !== '') {
                        for (let attendee of this.saveEditEventParam.calEvent.attendees) {
                        if ( (attendee.id).toString() === this.currentUserID) {
                            attendeeInfo.appointmentAttendeeId = attendee.attendeeId;
                        }
                    }
                    }

                    this.appointmentAttendeeInfoList.push (attendeeInfo);
                    this.searchUserArray = [];
                    this.popupSearchText = '';
                    this.searchText = '';
                }

            } else {

                let userName = this.text;
                for (let i = 0; i < this.searchUserArray.length; i++) {
                    if (this.searchUserArray[i].name === userName) {
                        this.currentUserID = this.searchUserArray[i].id;
                    }
                }
                if (this.isUserTabAlreadyOpened(this.calendarOpenedTabInfoList, userName)) {
                this.searchAlertText = 'The selected user name is already present';
                this.sameuserdialog = true;
                this.searchText = '';
                }else {
                    let backgroundColorCode = this.calendarTabColorAvailableList[this.calendarTabColorAvailableList.length - 1];
                    this.setOpenedTabAttributes(this.currentUserID, backgroundColorCode, true);
                    mainCalendar = true;
                    this.recordUserInfo(this.currentUserID, userName, backgroundColorCode, isMember,  mainCalendar);
                    this.calendarTabColorAvailableList = this.removeColorFromList(
                    this.calendarTabColorAvailableList, backgroundColorCode);
                    if (this.currentCalView === 'listMonth') {
                        this.getExistingAppointmentsForListView(this.currentUserID, backgroundColorCode);
                    }else {
                        this.getExistingAppointments(this.currentUserID, backgroundColorCode,
                        this.getCalendarModeName(this.currentCalView), this.currentCalDate);
                    }
                    this.searchUserArray = [];
                    this.text = '';
                    this.searchText = '';
                }
        }
    }


    getExistingAppointmentsForListView(userId, colorCode ) {
        let listViewDate = moment(new Date()).format('MMDDYYYY');
        this._userCalendarService.getAppointmentsForListView(userId, listViewDate).subscribe(
            appointmentsResponse => {
                this.appointments = this.processAppointments(userId, appointmentsResponse, colorCode);
            },
            error => {
                console.log('Error HTTP GET Service');
            },
            () => {
                this.isLoading = false;
            });

    }

    eventRender(event, element) {
        element.attr('title', event.tip);
    }

    fetchEvents(eventData) {
        let mode = eventData.view.intervalUnit;
        this.currentCalDate = this.getDateForViewNavigation(eventData);
        this.currentCalView = eventData.view.name;
        if (eventData.view.name === 'listMonth') {
            this.events = [];
            for (let tabUserInfo of this.calendarOpenedTabInfoList) {
                console.log('Getting appointments For : ' + tabUserInfo.userId);
                this.getExistingAppointmentsForListView(tabUserInfo.userId, tabUserInfo.colorCode);
            }
            eventData.view.intervalStart._d = eventData.view.start._d = new Date();
            eventData.view.intervalEnd._i = moment(eventData.view.intervalStart._d).add(14, "days");
            eventData.view.end._d = moment(eventData.view.start._d).add(14, "days");
        } else {
            this.events = [];
            for (let tabUserInfo of this.calendarOpenedTabInfoList) {
                console.log('Getting Appointments For : ' + tabUserInfo.userId);
                this.getExistingAppointments(tabUserInfo.userId, tabUserInfo.colorCode,
                 this.getCalendarModeName(this.currentCalView), this.currentCalDate);
            }
        }

    }



    ngOnDestroy() {

    }

    public getCalendarHeight() {
        return window.innerHeight - 88;
    }

    setValues(searchResults) {
        this.userId = searchResults.userId;
        this.userName = searchResults.userName;
        this.active = searchResults.active;
    }

  isMember(attendees) {
    for ( let attendee of attendees) {
        let isMember = (attendee.id === -1) ? true : false;
        return isMember;
    }
  }

    setAppointmentTypeValues(currentApptType, isMember) {
        let apptTypes = isMember ? this.memberAppointmentTypes : this.appointmentTypes;
        if (currentApptType.title !== null) {
                for ( let apptType of apptTypes ) {
                    for (let apptDesc of apptType.appointmentTypeSubject){
                        if (apptDesc.subjectDesc === currentApptType.title) {
                            this.currentAppointment = apptType;
                            return this.currentAppointment;
                        }
                }
              }
        } else {
            console.log('appointmentTypes null:');
        }
        console.log('current Appointment', this.currentAppointment);
    }

/*
    setAppointmentTypeValues(currentApptType) {
        console.log('event title', currentApptType.title);
        if (currentApptType.title !== null) {
            if (this.isMember(currentApptType.attendees)) {
                console.log('appt types', this.memberAppointmentTypes);
                for ( let apptType of this.memberAppointmentTypes ) {
                    for (let apptDesc of apptType.appointmentTypeSubject){
                        if (apptDesc.subjectDesc !== currentApptType.title) {
                            this.currentAppointment = apptType;
                            return this.currentAppointment;
                        }
                }
              }
            } else {
                console.log('appt types', this.appointmentTypes);
                for ( let apptType of this.appointmentTypes ) {
                    for (let apptDesc of apptType.appointmentTypeSubject){
                        if (apptDesc.subjectDesc === currentApptType.title) {
                            this.currentAppointment = apptType;
                            return this.currentAppointment;
                        } else {
                            this.currentAppointment = apptType;
                            return this.currentAppointment;
                        }
                }
              }
            }
        } else {
            console.log('appointmentTypes null:');
        }
    }
   
    setAppointmentTypeValues2(currentApptType) {
        if (currentApptType !== null) {
            for ( let apptType in this.appointmentTypes ) {
                for (let apptDesc in this.appointmentTypes[apptType].appointmentTypeSubject){
                    if (this.appointmentTypes[apptType].appointmentTypeSubject[apptDesc].subjectDesc === currentApptType) {
                        this.currentAppointment = this.appointmentTypes[apptType];
                     return this.currentAppointment;
                    }
            }
         }
        } else {
            console.log('appointmentTypes null:');
        }
    }
    */

    setAppointmentSubject(currentSubjectID) {
        for (let subId in this.appointmentSubject) {
            if (this.appointmentSubject[subId].subjectDesc == currentSubjectID) {
                return this.appointmentSubject[subId].subjectId;
            }
        }
    }

    filterCareManagerSingle(event) {
        let query = event.query;
            this._userCalendarService.getUsersSearchResults(query).subscribe(
                searchResults => {
                    let filtered: any[] = [];
                    this.searchUserArray = [];
                    for (let searchResult of searchResults) {
                        let name = searchResult.userName;
                        this.searchUserArray.push({id: searchResult.userId, name: searchResult.userName});
                        filtered.push(name);
                    }
                    this.searchResults = filtered;
                    this.setValues(filtered);
                },
                error => {
                    console.log('Error HTTP GET Service');
                },
                () => {
                    this.isLoading = false;
                    console.log('User Data ', this.searchResults);

                });
    }

    // Applying quick fix by creating a duplicate method later on refactor this
    filterCareManagerSingleForPopup(event) {
        let query = event.query;
            this._userCalendarService.getUsersSearchResults(query).subscribe(
                popupSearchResults => {
                    let filtered: any[] = [];
                    this.searchUserArray = [];
                    for (let searchResult of popupSearchResults) {
                        let name = searchResult.userName;
                        this.searchUserArray.push({id: searchResult.userId, name: searchResult.userName});
                        filtered.push(name);
                    }
                    this.popupSearchResults = filtered;
                    this.setValues(this.popupSearchResults);
                },
                error => {
                    console.log('Error HTTP GET Service');
                },
                () => {
                    this.isLoading = false;
                    console.log('User Data popup', this.popupSearchResults);
                });
    }

    getAttendeeList(attendeeList) {
        this.appointmentAttendeeInfoList = [];
        if (attendeeList) {
            for (let attendee of attendeeList) {
                this.appointmentAttendeeInfoList.push({
                    'appointmentId': null,
                    'appointmentAttendeeId': null,
                    'appointmentAttendeeCCMSId': attendee.userId,
                    'memberId' : null
                });
                }
            }
    }

    crossButtonClass(user) {
        if (user.userId === '-1') {
            return '';
        } else {
            return 'close fa fa-times';
        }
    }

    removeCareManagerName2(appoinmentSearchBox, divIndex, currentId) {
            let currentCareManagerId = currentId.currentTarget.parentElement.getAttribute('id').split(':')[1];
            this.removeUserInfo(currentCareManagerId);
            let currentCareManagerColor = currentId.currentTarget.parentElement.style.backgroundColor;
            let divId = currentId.currentTarget.parentElement.getAttribute('id');
            document.getElementById(divId).setAttribute('hidden', 'true');
            for (let i = this.events.length - 1; i >= 0; i--) {
                if (this.events[i].careManagerId !== undefined) {
                    if (this.events[i].careManagerId === currentCareManagerId) {
                        this.events.splice(i, 1);
                    }
                }
            }
        }


    removePopupTab(appoinmentSearchBox, divIndex, currentId) {
        if ( this. popupOpenedTabInfoList.length === 1) {
            this.searchAlertText = 'Please add at least one user to be able to add an appointment.';
            this.sameuserdialog = true;
        } else {
            // why we added inpopup <div class="showusername" id={{popupOpenedTabInfo.userId}} [hidden]="hideCareManagerName">
            // need to handle differntly for user added from popup directly 
            let userId = currentId.currentTarget.parentElement.getAttribute('id');
            if (  userId.indexOf(':') >= 0) {
                userId = currentId.currentTarget.parentElement.getAttribute('id').split(':')[1];
            }
            this.removePopupTabInfo(userId);
        }

        }

    removeIdFromList(currentList, id) {
            let updatedList: any[] = [];
            for (let i of currentList) {
                if (i !== id) {
                    updatedList.push(i);
                }
            }
            return updatedList;
        }


    sameUserDialogOk() {
        this.text = '';
        this.popupSearchText = '';
        this.sameuserdialog = false;
    }


    ngAfterViewChecked() {
    }

    getAppointmentTypeList(isMember) {
        this._userCalendarService.getAppointmentTypes(isMember).subscribe(
            appointmentTypesResponse => {
                if (isMember) {
                    this.isMemberAppointmentTypes = true;
                    this.memberAppointmentTypesDesk.push(
                        {label: 'Select an Option', value: null}
                    );
                    this.memberAppointmentTypes = appointmentTypesResponse;
                    this.memberAppointmentTypes.forEach((item, index) => {
                        if (item) {
                            this.memberAppointmentTypesDesk.push(
                                {label: item.appointmentTypeDesc,
                                value: {id: item.appointmentId, name: item.appointmentTypeDesc,
                                        subjectType: item.appointmentTypeSubject, duration: item.duration
                                        }
                                }
                            );
                        }
                    });
                } else {
                    this.isMemberAppointmentTypes = true;
                    this.appointmentTypesDesk.push(
                        {label: 'Select an Option', value: null}
                    );
                    this.appointmentTypes = appointmentTypesResponse;
                    this.appointmentTypes.forEach((item, index) => {
                        if (item) {
                            this.appointmentTypesDesk.push(
                                {label: item.appointmentTypeDesc,
                                value: {id: item.appointmentId, name: item.appointmentTypeDesc,
                                        subjectType: item.appointmentTypeSubject, duration: item.duration
                                        }
                                }
                            );
                        }
                    });
                }
            },
            error => {
                console.log('Error HTTP GET Service');
            },
            () => {
                this.isLoading = false;
                console.log('AppointmentTypeData', this.appointmentTypes);
            });
    }

    processAppointments(ccm, appointmentsRes, colorData) {
        this.appointments = appointmentsRes;
        if (this.appointments != null) {
            for (let existingAppt = 0; existingAppt < (this.appointments.length); existingAppt++) {
                this.events.push({
                    start: moment(this.appointments[existingAppt].startDate + ' ' + this.appointments[existingAppt].startTime).format(),
                    end: moment((this.appointments[existingAppt].endDate + ' ' + this.appointments[existingAppt].endTime)).format(),
                    title: this.appointments[existingAppt].taskObjective,
                    backgroundColor: ((colorData !== 'na') ? colorData : ''),
                    tip: moment(this.appointments[existingAppt].startDate + ' ' +
                     this.appointments[existingAppt].startTime).format('hh:mm A') + ' : ' + this.appointments[existingAppt].taskObjective,
                    careManagerId: ccm,
                    id: this.appointments[existingAppt].id,
                    attendees: this.appointments[existingAppt].attendees.attendee,
                    OwnerCcmsId : this.appointments[existingAppt].OwnerCcmsId,
                    duration: this.appointments[existingAppt].duration,
                    description: this.appointments[existingAppt].description

                });
            }
        }
        return appointmentsRes;
    }


    getExistingAppointments(ccm, colorData, mode , date ) {
        this._userCalendarService.getAppointments(ccm, mode, date).subscribe(
            appointmentsResponse => {
                this.appointments = this.processAppointments(ccm, appointmentsResponse, colorData);
            },
            error => {
                console.log('Error HTTP GET Service');
            },
            () => {
                this.isLoading = false;
            });

    }


    recordUserInfo(userId, userName,  userColor, isMember, mainCalendar) {
        let calendarOpenedTabInfoDto = new CalendarOpenedTabInfoDto;
        calendarOpenedTabInfoDto.userId = userId;
        calendarOpenedTabInfoDto.userName = userName;
        calendarOpenedTabInfoDto.isMember = isMember;
        calendarOpenedTabInfoDto.colorCode = (userColor !== 'na') ? userColor : this.backgroundColor;
        if (mainCalendar) {
            this.calendarOpenedTabInfoList.push(calendarOpenedTabInfoDto);
        this.calendarTabColorAvailableList = this.removeColorFromList(this.calendarTabColorAvailableList, userColor);
        } else {
            this.popupOpenedTabInfoList.push(calendarOpenedTabInfoDto);
        }
    }

    recordPopUpTabInfo(userId, userName,  userColor, isMember) {
        let calendarOpenedTabInfoDto = new CalendarOpenedTabInfoDto;
        calendarOpenedTabInfoDto.userId = userId;
        calendarOpenedTabInfoDto.userName = userName;
        calendarOpenedTabInfoDto.isMember = isMember;
        calendarOpenedTabInfoDto.colorCode = (userColor !== 'na') ? userColor : this.backgroundColor;
        this.popupOpenedTabInfoList.push(calendarOpenedTabInfoDto);
        this.popupTabColorAvailableList = this.removeColorFromList(this.popupTabColorAvailableList, userColor);

    }

    removeUserInfo(userId) {
        let userColor = '';
        for (let calendarOpenedTabInfoDto of this.calendarOpenedTabInfoList) {
            if (calendarOpenedTabInfoDto.userId === userId) {
                userColor = calendarOpenedTabInfoDto.colorCode;
                let userIndex = this.calendarOpenedTabInfoList.indexOf(calendarOpenedTabInfoDto);
                this.calendarOpenedTabInfoList.splice(userIndex, 1);
            }
        }
        this.calendarTabColorAvailableList.push(userColor);
    }


    removePopupTabInfo(userId) {
        let userColor = '';
        for (let popupOpenedTabInfo of this.popupOpenedTabInfoList) {
            if (popupOpenedTabInfo.userId === userId) {
                userColor = popupOpenedTabInfo.colorCode;
                let userIndex = this.popupOpenedTabInfoList.indexOf(popupOpenedTabInfo);
                this.popupOpenedTabInfoList.splice(userIndex, 1);
            }
        }
        this.popupTabColorAvailableList.push(userColor);
        for ( let attendeeInfo of  this.appointmentAttendeeInfoList) {
            if (!(attendeeInfo.appointmentAttendeeCCMSId === null) ) {
                if ((attendeeInfo.appointmentAttendeeCCMSId.toString() === userId.toString()) ) {
                    let userIndex = this.appointmentAttendeeInfoList.indexOf(attendeeInfo);
                    this.appointmentAttendeeInfoList.splice(userIndex, 1);
                }
            }
        }
    }
    /*
    getUserColor(userId) {
        let userColor: string = '#7093c3';
        for (let item of this.calendarOpenedTabInfoList) {
            if (item.userId === userId) {
                userColor = item.colorCode;
            }
        }
        return userColor;
    }
    */


    /**
     * TODO 
     * needd to find some other parameter from eventData so there should be no need for date manuplation
     */
    getDateForViewNavigation(eventData) {
        let calDate = eventData.view.title;
        let mode = eventData.view.intervalUnit;
        if (mode === 'day') {
            calDate = moment(eventData.view.title).format('MMDDYYYY');
        } else if (mode === 'week') {
            let dateSplit = calDate.split(' ');
            let y = (Number(dateSplit[1]) + 1).toString() + ' ' + dateSplit[0] + ' ' + calDate.split(',')[1];
            calDate = moment(y).format('MMDDYYYY');
        } else if (mode === 'month') {
            // IE issue with month date
            let calDates = calDate.split(' ');
            let y = calDates[0] + ' ' + '01' + ',' + calDates[1];
            calDate = moment(y).format('MMDDYYYY');
        }
        return calDate;
    }

    isUserTabAlreadyOpened(list, userName) {
        let userExist = false;
        for (let user of list){
            if ( userName === user.userName) {
                userExist = true;
            }
        }

        return userExist;
    }

    removeColorFromList(list, color) {

        let updatedList: any[] = [];
        for (let i of list) {
            if (i !== color) {
                updatedList.push(i);
            }
        }
        return updatedList;
    }

    addColorToList(list, color) {

     let newList: any[] = list;
    newList.push(color);
    return null;
    }

    setOpenedTabAttributes(userId, backgroundColor, mainCalendar) {
         let blockNames = null;
         if ( mainCalendar) {
             blockNames = document.getElementsByClassName('caremanagerblock');
         }else {
             blockNames = document.getElementsByClassName('caremanagerblockPopup');
         }

        let setUserId = 'dataId:' + userId;
        let currentcount = blockNames.length;
        setTimeout(function () {
            for (let i = currentcount; i < blockNames.length; i++) {
                blockNames[i].lastElementChild.setAttribute('style', 'background-color:' +
                                                                        backgroundColor);
                blockNames[i].lastElementChild.setAttribute('id', setUserId);
            }
        }, 500);
    }

    updatePopupOpenedTabInfoList(attendeeList) {
        this.popupOpenedTabInfoList = [];
        for (let attendee of attendeeList) {
            let userId: any;
            let colorCode = '';
            let userName = '';
            let openedOnCalendar = false;
            for (let calendarOpenedTabInfo of this.calendarOpenedTabInfoList) {
                if (calendarOpenedTabInfo.userId === attendee.id.toString()) {
                    userId = calendarOpenedTabInfo.userId;
                    colorCode = calendarOpenedTabInfo.colorCode;
                    userName = calendarOpenedTabInfo.userName;
                    openedOnCalendar = true;
                }
            }
            if ( !openedOnCalendar) {
                userId = attendee.id.toString();
                colorCode = this.popupTabColorAvailableList[this.popupTabColorAvailableList.length - 1];
                userName = attendee.name;
            }
            this.recordPopUpTabInfo(userId, userName, colorCode, false);
        }
    }

    getCalendarModeName(viewType) {
       let mode = '';
       if (viewType === 'agendaDay') {
           mode = 'day';
       } else if (viewType === 'agendaWeek') {
           mode = 'week';
       } else if (viewType === 'month') {
           mode = 'month';
       }
       return mode;
    }

    getBgColor(attendeeId) {
            console.log(this.calendarOpenedTabInfoList, ' from record user info');
            for ( let item of this.calendarOpenedTabInfoList ) {
                if ( item.userId === attendeeId.toString() ) {
                    return item.colorCode;
                }
            }

            return null;
        }

    closeAppointmentPopup() {
        this.popupSearchText = '';
        this.dialogVisible = false;
        this.checkValidStartDate = this.checkValidStartTime = false;
        this.checkValidEndDate = this.checkValidEndTime = false;
        this.subjecttypeselect = false;
        this.invalidEndDate = false;
        this.invalidStrtTime = false;
    }

    displayDialogHeading() {
        let text = '';
        if (this.errormessage) {
            text = 'Info Message';
        } else {
            text = 'Calendar Actions';
        }
        return text;
    }

    errorMessageDialogOk() {
       this.agendaweekdialog = false;
    }

    setValue(popUp) {
            this.searchText = 'Enter User Name';
            /*usergroup
            if (popUp === 'true') {
                if (this.userGroup.viewOption === 'UserView') {
                    this.searchTextpopUp = 'Enter Group Name';
                } else {
                    this.searchTextpopUp = 'Enter User Name';
                }
            } else {
                if (this.user.viewOption === 'UserView') {
                    this.searchText = 'Enter Group Name';
                } else {
                    this.searchText = 'Enter User Name';
                }
            } */
        }

}
