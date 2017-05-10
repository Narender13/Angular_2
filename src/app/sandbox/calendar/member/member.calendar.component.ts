import { Component, ViewEncapsulation, ChangeDetectorRef, ChangeDetectionStrategy,
    ElementRef, Renderer, Input, Output } from '@angular/core';
import { OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { MemberCalendarService }  from './member.calendar.service';
import {
    MemberHeaderService
} from './../../member-header';
import { AppointmentDto, UserSearchDto, OpenedTabUserInfoDto,
        AttendeeListDto, AppointmentTypeDto, User, CreateAppointmentDto,
        RequestAttendeesDto }  from './member.calendar.dtos';
import { Router, ActivatedRoute, Params } from '@angular/router';
import { Subscription } from 'rxjs';
import * as moment from 'moment';
import {  CalendarOpenedTabInfoDto } from './../common/calendar.dtos';
import { MemberDetailsDto } from './../../member-header/member-header.dtos';

@Component({
    selector: 'memberCalendar',
    templateUrl: './member.calendar.component.html',
    styleUrls: ['member.calendar.component.css'],
    providers: [MemberHeaderService, MemberCalendarService]
})

export class MemberCalendarComponent implements OnInit, OnDestroy {
    @Output() toolbarClickedMemberCalendar: boolean = true;
    @Input() memberId: string = null;
    @Input() loginUserId: string = null;
    @Input() sBearerToken: string = null;

    isLoading: boolean = false;
    events: any[] = [];
    saveEditEventParam: any = null;
    theWellNamedForm: FormGroup;
    header: any;
    busHrs: any;
    defaultView: string;
    backgroundColor: string;
    user: any;
    searchText: string = 'Enter User Name';
    scrollTime: any;
    aspectRatio: number;
    currentUserId: any;
    searchResultsIspopup: UserSearchDto[] = null;
    searchResultsBaseCal: UserSearchDto[] = null;
    searchedForBaseCal: string;
    searchedForIspopup: string;
    searchAlertText: string;
    isDuplicateUser: boolean = false;
    openedTabUserInfoList: OpenedTabUserInfoDto[] = [];
    popupOpenedTabInfoList: OpenedTabUserInfoDto[] = [];
    careManagerDivId: any[] = [];
    appointmentTypes: AppointmentTypeDto[] = null;
    appointmentTypesDesk: any [] = [];
    appointmentTypeSubject: any[] = [];
    appointmentStartDate: any;
    modelAppointmentStartDate: any;
    modelAppointmentEndDate: any;
    modelAppointmentStartTime: any;
    modelAppointmentEndTime: any;
    appointmentStartTime: any;
    appointmentEndDate: any;
    appointmentEndTime: any;
    checkValidEndTime: boolean = false;
    checkValidStartTime: boolean = false;
    appointmentDescription: any;
    checkValidEndDate: boolean = false;
    selectedSubjectType: string;
    selectedappointmenttype: any = {};
    currentAppointment: any = {};
    addAppointmentOverlay: boolean = false;
    editable: boolean = false;
    btnDisabled: boolean = false;
    blackOverlay: boolean = false;
    editAppointmentId: number = null;
    popupTabColorAvailableList: any[] = [];
    colorCode: any[] = [ '#31A7B8', '#35CBCF', '#8A930F', '#686E6B', '#B77F3B', '#735340',
                        '#D95151', '#A88904', '#E97909', '#2E7AA8', '#7C537D', '#129C99', '#7093C3',
                        '#686998', '#92363B', '#A87932', '#476259', '#423F6D', '#773564'
                        ];

    availableColorListForUserTab: any[] = this.colorCode.slice();
    //availableColorListForUserTabPopup: any[] = [];
    // dialog related properties
    userSelected: boolean = false;
    listViewAlert: string;
    viewType: string;
    selectUserInListAlert: string;
    userSelectedInList: boolean = false;
    member: MemberDetailsDto = new MemberDetailsDto();
    // member list view related properties
    currentCalView: string;
    currentCalDate: any;
    checkValidEntry: boolean = false;
    public viewOptions = [
        { value: 'UserView', display: 'View by User', searchTxt: 'Enter User Name'}
    ];
    dialogVisible: boolean = false;
    errormessage: boolean = false;
    checkAppointmentType: boolean = false;
    invalidEndDate: boolean = false;
    invalidStrtTime: boolean = false;
    checkSubjectType: boolean = false;
    memberApntDetails: FormGroup;
    submitted: boolean = false;
    msgs: any[] = [];
    appointment: any = {};
    duration: string;
    searchedUsers: any[] = [];
    getAppointmentAttendees: any = {};
    appointmentAttendeeList: RequestAttendeesDto[] = [];
    private userName: string = null;
    private memberName: string = null;
    private memberFullName: string = null;
    private subscription: Subscription;

    constructor(private _formBuilder: FormBuilder,
                private _memberCalendarService: MemberCalendarService,
                private _changeDetectorRef: ChangeDetectorRef,
                public el: ElementRef, public renderer: Renderer,
                private route: ActivatedRoute,
                private _memberBannerService: MemberHeaderService,) {

    };

    ngOnInit() {
        // need to fix this
        this.isLoading = false;


        if (this.sBearerToken === null || this.sBearerToken === undefined) {
            this.sBearerToken = this.route.snapshot.queryParams['bearerToken'];
        }
        console.log('member calendar sBearerToken: ' + this.sBearerToken);

        if (this.loginUserId === null || this.loginUserId === undefined) {
            this.loginUserId = this.route.snapshot.queryParams['userId'];
            if ( this.loginUserId === undefined) {
                this.loginUserId = null;
            }
        }
        console.log('member calendar loginUserId: ' + this.loginUserId);

        if (this.memberId === null || this.memberId === undefined) {
            this.memberId = this.route.snapshot.queryParams['memberId'];
        }
        console.log('member calendar memberId: ' + this.memberId);

        if (this.memberName === null || this.memberName === undefined) {
            this.memberName = this.route.snapshot.queryParams['memberFullName'];
            if ( this.memberName === undefined) {
                this.memberName = null;
            }
        }
        console.log('member name: ' + this.memberName);

        // The following line may need to be commented if configuration.services.ts is modified
        // and we decide not to invoke getHeaders in service call.
        if (this.sBearerToken && this.sBearerToken !== '') {
            this._memberCalendarService.setBearerToekn(this.sBearerToken);
        }

        this.getAppointmentTypeList();

        this.memberApntDetails = this._formBuilder.group({
            'appointmenttype': new FormControl('', Validators.required),
            'subjecttype': new FormControl('', Validators.required),
            'description': new FormControl(''),
            'appointmentStartDate': new FormControl('', Validators.required),
            'appointmentStartTime': new FormControl('', Validators.required),
            'appointmentEndDate': new FormControl('', Validators.required),
            'appointmentEndTime': new FormControl('', Validators.required)
        });

        this.user = {
            viewOption: this.viewOptions[0].value,
            searchText: this.viewOptions[0].searchTxt
        };

        this.header = {
            left: 'title prev,next today',
            right: 'month,agendaWeek,agendaDay,listMonth',
            month: {
            titleFormat: 'YYYY, MM, DD'
         }
        };

        this.busHrs = {
            dow: [ 0, 1, 2, 3, 4, 5, 6 ],
            start: '08:00',
            end: '08:01'
        };

        this.defaultView = 'agendaWeek';
        this.scrollTime = '08:00';
        this.aspectRatio = 2.5;

        this.recordUserInfo(this.memberId, this.memberName, '#29D235', true, 'BaseCal');
    }

    setMemberName(memberFullName) {
        this.memberName = memberFullName;
    }
    showMember(memberId) {
        this.memberId = memberId;
        return this._memberBannerService.getMemberHeader(memberId).subscribe(
            member => { this.member = member; },
            error => console.log('Error HTTP GET Service'),
            () => {
                this.memberFullName =  this.member.lastName + ',  ' + this.member.firstName;
                this.openedTabUserInfoList[0].userName = this.memberFullName;
            }
        );
    }
    checkAppointmentValidation(model: User, isValid: boolean, $event) {
        if (model.appointmentStartDate === '' && this.modelAppointmentStartDate !== null) {
            model.appointmentStartDate = this.modelAppointmentStartDate;
        } else if (model.appointmentStartTime === '' && this.modelAppointmentStartTime !== null) {
            model.appointmentStartTime = this.modelAppointmentStartTime;
        } else if (model.appointmentEndDate === '' && this.modelAppointmentEndDate !== null) {
            model.appointmentEndDate = this.modelAppointmentEndDate;
        } else if (model.appointmentEndTime === '' && this.modelAppointmentEndTime !== null) {
            model.appointmentEndTime = this.modelAppointmentEndDate;
        }
        let apntEndDate = moment(model.appointmentEndDate).format('YYYY/MM/DD');
        let apntEndTime = moment((moment(model.appointmentEndTime).format('hh:mm:a')), 'h:mma');
        let apntStartDate = moment(model.appointmentStartDate).format('YYYY/MM/DD');
        let apntStartTime = moment((moment(model.appointmentStartTime).format('hh:mm:a')), 'h:mma');
        let currentTime = moment((moment(new Date()).format('hh:mm:a')), 'h:mma');
        let currentDate = moment().format('YYYY/MM/DD');
        // creating appointment object. Can be modified
        let start = new Date(moment(apntStartDate) + ' ' + apntStartTime);
        let end  = new Date(moment(apntEndDate) + ' ' + apntEndTime);
        let endD  = moment(this.appointment.end).format('YYYY-MM-DDTHH:mm:ss');
        let timeDiff = moment(this.appointment.endD).diff(this.appointment.start, 'minutes');

        model.appointmentEndDate = this.memberApntDetails.controls['appointmentEndDate'].value;
        model.appointmentEndTime = this.memberApntDetails.controls['appointmentEndTime'].value;
        if (model.appointmenttype === null || model.appointmenttype === '') {
            this.errormessage = true;
        } else {
            this.errormessage = false;
        }
        if (model.subjecttype === null || model.subjecttype === '' || model.subjecttype === 'Select an Option') {
            this.checkSubjectType = true;
        } else {
            this.checkSubjectType = false;
        }
        if (model.subjecttype === 'Select an Option' || model.subjecttype === null) {
            this.checkSubjectType = true;
        } else {
            this.checkSubjectType = false;
        }

        if ((apntStartTime.isBefore(currentTime) && moment(apntStartDate).isSame(currentDate)) ||
            moment(apntStartDate).isBefore(currentDate)) {
            this.invalidStrtTime = true;
        } else {
            this.invalidStrtTime = false;
        }

        if (moment(apntStartDate).isAfter(apntEndDate)) { 
            this.invalidEndDate = true;
        } else {
            this.invalidEndDate = false;
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

        if (model.appointmentEndDate === null || model.appointmentEndDate === '') {
            this.checkValidEndDate = true;
        } else {
            this.checkValidEndDate = false;
        }

        if (model.appointmentStartDate === null || model.appointmentStartDate === '') {
            this.checkValidEntry = true;
        } else {
            this.checkValidEntry = false;
        }

        if (model.appointmentEndTime === null || model.appointmentEndTime === '') {
            this.checkValidEndTime = true;
        } else {
            this.checkValidEndTime = false;
        }

        if (model.appointmentStartTime === null || model.appointmentStartTime === '') {
            this.checkValidStartTime = true;
        } else {
            this.checkValidStartTime = false;
        }
        if (this.invalidEndDate === false && this.errormessage === false &&
            this.checkSubjectType === false && this.invalidStrtTime === false && this.checkValidEntry === false
            && this.checkValidEndDate === false && this.checkValidEndTime === false && this.checkValidStartTime === false) {
               this.saveAppointment(model);
        }
    }

    saveAppointment(model) {
        this.btnDisabled = true;
        this._memberCalendarService.createAppointment(this.createAppointmentRequestDto(model),
        this.loginUserId).subscribe(
            saveAppointmentResponse => {
                if (saveAppointmentResponse) {
                    console.log('response', saveAppointmentResponse);
                    this.dialogVisible = false;
                    this.events = [];
                    for (let openedTabUserInfo of this.openedTabUserInfoList) {
                            this.getExistingAppointments(openedTabUserInfo.userId,
                                openedTabUserInfo.colorCode, this.getCalendarModeName(this.currentCalView),
                                this.currentCalDate, openedTabUserInfo.isMember);
                    }
                } else {
                    console.log('response', saveAppointmentResponse);
                }
                this.closeAppointmentDialogBox();
            },
            error => console.log('Error HTTP GET Service'),
            () => {
                this.isLoading = false;
                console.log('Saved appointment', this.events);
            });
    }

    getAttendees(owerId) {
        let getAttendees = [];
        for (let attendee of this.popupOpenedTabInfoList) {
            // if (!attendee.isMember) {
                getAttendees.push({
                    'appointmentId': null,
                    'appointmentAttendeeId': null,
                    'appointmentAttendeeCCMSId': attendee.isMember ? null : attendee.userId,
                    'memberId': attendee.isMember ? this.memberId : null
                });
            // }
        }
        return getAttendees;
    }

    createAppointmentRequestDto(model): CreateAppointmentDto {
        let endTimeFormat = moment(model.appointmentEndTime).format('HH:mm:ss');
        let startTimeFormat = moment(model.appointmentStartTime).format('HH:mm:ss');
        let startDateFormat = moment(model.appointmentStartDate).format('DD-MM-YYYY');
        let endDateFormat = moment(model.appointmentEndDate).format('DD-MM-YYYY');
        return {
            appointmentId: (this.editAppointmentId === null) ? null : this.editAppointmentId,
            appointmentOwnerCCMSId: (this.loginUserId === undefined) ? null : this.loginUserId, // Needs to update once WS will be ready
            memberId: this.memberId,
            taskObjectiveId:  model.subjecttype.id,
            appointmentDescription: model.description,
            appointmentTypeId: model.appointmenttype.id,
            appointmentStartTime: startDateFormat + ' ' + startTimeFormat,
            appointmentEndTime: endDateFormat + ' ' + endTimeFormat,
            appointmentDuration: this.duration,
            appointmentStatusId: null,
            appointmentActiveCode: true,
            appointmentAttendee: (this.editAppointmentId === null) ? this.getAttendees(this.loginUserId) : this.appointmentAttendeeList
        };
    }

    appointmentTypeChanged(apptType) {
        this.appointmentTypeSubject = [];
        let appointmentDuration;
        let updateEndTime;
        this.appointmentTypeSubject.push(
            {label: 'Select an Option', value: null}
        );
        if (apptType.value !== null) {
            appointmentDuration = apptType.value.duration.split('minutes')[0].trim();
            updateEndTime = moment(this.appointmentEndTime).add(appointmentDuration, 'minutes').toDate();
            this.duration = appointmentDuration;
            this.memberApntDetails.controls['appointmentEndTime'].setValue(updateEndTime, { onlySelf: true });
            this.memberApntDetails.controls['appointmentEndDate'].setValue(this.appointmentStartDate, { onlySelf: true });
            this.memberApntDetails.controls['appointmentStartDate'].setValue(this.appointmentStartDate, { onlySelf: true });
            this.memberApntDetails.controls['appointmentStartTime'].setValue(this.appointmentEndTime, { onlySelf: true });
            this.modelAppointmentStartDate = this.appointmentStartDate;
            this.checkValidEndDate = this.checkValidEntry = this.checkValidEndTime = this.checkValidStartTime = false;
            apptType.value.subjectType.forEach((item, index) => {
                this.appointmentTypeSubject.push(
                    {label: item.subjectDesc, value: {id: item.subjectId, name: item.subjectDesc}}
                );
            });
            this.memberApntDetails.controls['subjecttype'].setValue('Select an Option', { onlySelf: true });
            if (this.saveEditEventParam !== '') {
                this.memberApntDetails = this._formBuilder.group({
                    'appointmenttype': new FormControl(apptType.value , Validators.required),
                    'subjecttype': new FormControl('Select an Option', Validators.required),
                    'description': new FormControl(this.appointmentDescription),
                    'appointmentStartDate': new FormControl(this.appointmentStartDate, Validators.required),
                    'appointmentStartTime': new FormControl(this.appointmentStartDate, Validators.required),
                    'appointmentEndDate': new FormControl(this.appointmentStartDate, Validators.required),
                    'appointmentEndTime': new FormControl(updateEndTime, Validators.required)
                });
            }
        }
    }

    getAppointmentTypeList() {
        this.appointmentTypesDesk.push(
            {label: 'Select an Option', value: null}
        );
        this._memberCalendarService.getAppointmentTypes().subscribe(
            appointmentTypesResponse => {
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
            },
            error => {
                console.log('Error HTTP GET Service');
            },
            () => {
                this.isLoading = false;
                console.log('AppointmentTypeData', this.appointmentTypes);
            });
    }

    showCalendarDetails() {
        this.popupOpenedTabInfoList = this.openedTabUserInfoList.slice();
        this.popupTabColorAvailableList = this.availableColorListForUserTab.slice();
        this.dialogVisible = true;
        this.btnDisabled = false;
        this.addAppointmentOverlay = false;
        this.editAppointmentId = null;
        this.editable = false;
        this.errormessage = this.invalidStrtTime = this.checkSubjectType = false;
        console.log('startdate', this.appointmentStartDate);
        this.appointmentEndTime = this.appointmentStartDate;
        let appointmentStartDate = null;
        if (this.saveEditEventParam ) {
            let calEvent = this.saveEditEventParam.calEvent;
            appointmentStartDate = (calEvent.start);
            this.appointmentStartDate = moment(appointmentStartDate).toDate();
            this.appointmentEndTime = moment(appointmentStartDate).toDate();
        }
        this.memberApntDetails = this._formBuilder.group({
            'appointmenttype': new FormControl('', Validators.required),
            'subjecttype': new FormControl('Select an Option', Validators.required),
            'description': new FormControl(''),
            'appointmentStartDate': new FormControl(this.appointmentStartDate, Validators.required),
            'appointmentStartTime': new FormControl(this.appointmentStartDate, Validators.required),
            'appointmentEndDate': new FormControl('', Validators.required),
            'appointmentEndTime': new FormControl('', Validators.required)
        });
        this.appointmentTypeSubject.push(
            {label: 'Select an Option', value: null}
        );



        let popupColors = this.popupOpenedTabInfoList.slice();
        setTimeout(function () {
         let blocknamePopup = document.getElementsByClassName('caremanagerblockIspopup');
        for (let i = 0; i < blocknamePopup.length; i++) {
                 blocknamePopup[i].lastElementChild.setAttribute('style', 'background-color:' + popupColors[i].colorCode);

            }
            }, 10);


    }

    handleDayClick(appointment) {
        this.saveEditEventParam = '';
        this.editable = false;
        this.editAppointmentId = null;
        this.appointmentEndTime = '';
        this.popupOpenedTabInfoList = this.openedTabUserInfoList.slice();
        this.popupTabColorAvailableList = this.availableColorListForUserTab.slice();
        // this.availableColorListForUserTabPopup = this.availableColorListForUserTab.slice();

        /* data ID is not applying on popup tabs so assigning them from bas calendar tabs 
            now  tabs can be deleted from popup and no duplicate user popup message
        */
        /*
        if (this.popupOpenedTabInfoList.length > 1) {
            let blockNameIspopup = document.getElementsByClassName('caremanagerblockIspopup');
            for (let i = 1; i < this.popupOpenedTabInfoList.length; i++) {
                let setDataId = this.popupOpenedTabInfoList[i].userId;
                let backgroundColor = this.popupOpenedTabInfoList[i].colorCode;
                for (let j = i + 1; j < blockNameIspopup.length; j++) {
                    if (blockNameIspopup[j].lastElementChild !== null) {
                        blockNameIspopup[j].lastElementChild.setAttribute('id', 'dataIdPopup:' + setDataId);
                        blockNameIspopup[i].lastElementChild.setAttribute('style', 'background-color:' +
                                                                                backgroundColor);
                    }
                    break;
                }
            }
        }

        */

        this.appointmentTypeSubject = [];
        if (this.currentCalView === 'agendaDay' || this.currentCalView === 'agendaWeek') {
            this.appointmentTypeSubject.push(
                {label: 'Select an Option', value: null}
            );
            let appointmentStartDate = moment(appointment.date.format()).toDate();
            let appointmentStartTime = moment(appointment.date.format()).toDate();
            this.appointmentStartDate = appointmentStartDate;
            if (this.currentCalView === 'agendaDay' || this.currentCalView === 'agendaWeek') {
                if (moment(moment(appointment.date.format()).toDate()).isBefore(moment(new Date).toDate()) === true) {
                    this.errormessage = true;
                    this.addAppointmentOverlay = true;
                } else {
                    this.errormessage = false;
                    this.addAppointmentOverlay = true;
                }
            }
        }

        //Why we are removing then adding here again?  Amarjit to Anurag
       /*
       // member name was not displaying when opening edit appointment popup, but it will be fixed once attendee
       issue will be fixed in ws.
        this.popupOpenedTabInfoList = [];
        for (let assignUser of this.openedTabUserInfoList) {
            console.log('assignUser', assignUser);
            this.popupOpenedTabInfoList.push(assignUser);
        }
        */

        this.btnDisabled = false;
        //this.setPopUpColorCode();
    }

    setPopUpColorCode() {
        let blockName = document.getElementsByClassName('caremanagerblock');
        let blockNameIspopup = document.getElementsByClassName('caremanagerblockIspopup');
        let popupColorCode = '';
        for (let i = 1; i < blockName.length; i++) {
            if (blockName[i].lastElementChild !== null) {
                popupColorCode = blockName[i].lastElementChild.getAttribute('style');
                if (blockNameIspopup[i] !== undefined) {
                    if (blockNameIspopup && blockNameIspopup[i].lastElementChild !== null) {
                        blockNameIspopup[i].lastElementChild.setAttribute('style', popupColorCode);
                    }
                }
            }
        }
    }

    updatePopupOpenedTabInfoList(attendeeList) {
        this.popupOpenedTabInfoList = [];
        for (let attendee of attendeeList) {
            let userId: any;
            let colorCode = '';
            let userName = '';
            let openedOnCalendar = false;
            let isMember = false;
            let attendeeId = attendee.id;
            if (attendeeId === undefined) {
                attendeeId = this.memberId;
            }
            if (typeof attendeeId === 'number') {
                attendeeId = attendeeId.toString();
            }
            for (let calendarOpenedTabInfo of this.openedTabUserInfoList) {
                if (attendee.isMember) {
                    userId = calendarOpenedTabInfo.userId;
                    colorCode = calendarOpenedTabInfo.colorCode;
                    userName = calendarOpenedTabInfo.userName;
                    openedOnCalendar = true;
                    isMember = calendarOpenedTabInfo.isMember;
                } else {
                    if (calendarOpenedTabInfo.userId === attendeeId) {
                        userId = calendarOpenedTabInfo.userId;
                        colorCode = calendarOpenedTabInfo.colorCode;
                        userName = calendarOpenedTabInfo.userName;
                        openedOnCalendar = true;
                        isMember = calendarOpenedTabInfo.isMember;
                    }
                }
            }
            if (!openedOnCalendar) {
                userId = attendeeId;
                colorCode = this.popupTabColorAvailableList[this.popupTabColorAvailableList.length - 1];
                userName = attendee.name;
            }
            this.recordPopUpTabInfo(userId, userName, colorCode, isMember);
        }
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
            this.checkValidEntry = true;
        } else if (event.target.value !== '' && type === 'startDate') {
            this.checkValidEntry = false;
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
    handleAppointmentClick(e) {
        this.modelAppointmentStartDate = this.modelAppointmentEndDate = '';
        this.modelAppointmentStartTime = this.modelAppointmentEndTime = '';
        this.appointmentAttendeeList = [];
        this.checkValidEntry = false;
        this.checkValidEndDate = false;
        this.popupOpenedTabInfoList = [];
        if ((this.currentCalView === 'agendaWeek' || this.currentCalView === 'agendaDay') &&
        moment(moment((e.calEvent.start).format()).toDate()).isBefore(moment(new Date).toDate()) === false ) {
            this.saveEditEventParam = e;
            this.editable = true;
            this.errormessage = false;
            this.addAppointmentOverlay = true;
            this.appointmentEndTime = moment(e.calEvent.start).toDate();
            this.appointmentStartDate = moment(e.calEvent.start).toDate();
        } else if (this.currentCalView === 'month' || this.currentCalView === 'listMonth') {
            this.addAppointmentOverlay = false;
            this.errormessage = false;
        } else {
            this.addAppointmentOverlay = true;
            this.editable = false;
            this.errormessage = true;
        }
        this.popupOpenedTabInfoList = this.openedTabUserInfoList.slice();
        let appointmentAttendees = e.calEvent.attendees;
        this.popupTabColorAvailableList = this.availableColorListForUserTab.slice();

       // TODO  here is problem, you are pushing opened tab user from main calendar, causing duplicate

       // appointmentAttendees.push(this.popupOpenedTabInfoList[0]);
        this.updatePopupOpenedTabInfoList(appointmentAttendees);
        this.editAppointmentId = e.calEvent.id;
        let appointmentId = e.calEvent.id;
        for (let attendee of e.calEvent.attendees ) {
            let attendeeInfo = new RequestAttendeesDto;
            attendeeInfo.appointmentId = this.editAppointmentId.toString();
            attendeeInfo.appointmentAttendeeId = attendee.attendeeId;
            if (attendee.id === undefined) {
                attendee.id = this.memberId;
            }
            attendeeInfo.appointmentAttendeeCCMSId = ((typeof attendee.id) === 'string') ? null : (attendee.id).toString();
            attendeeInfo.memberId = ((typeof attendee.id) === 'string') ? (attendee.id).toString() : null;
            this.appointmentAttendeeList.push(attendeeInfo);
        }
    }

    editAppointmentDetails(e) {
        this.dialogVisible = true;
        this.addAppointmentOverlay = false;
        this.checkSubjectType = false;
        let calAppointment = this.saveEditEventParam.calEvent;
        let appointmentId = this.saveEditEventParam.calEvent.id;
        this.currentAppointment = this.setAppointmentTypeValues(calAppointment.title);
        this.appointment = new AppointmentDto();
        this.appointment.title = calAppointment.title;
        this.appointmentEndTime = moment((calAppointment.start).format()).toDate();
        for (let i = 0; i < this.appointmentTypes.length; i++) {
            if (calAppointment.appointmentType === this.appointmentTypes[i].appointmentTypeDesc) {
                console.log('appointtype subject', this.appointmentTypes[i].appointmentTypeSubject);
                console.log('current appointment', this.appointmentTypes[i]);
                let updateAppointmentStartDateTime = moment(calAppointment.start).toDate();
                let updateAppointmentEndDateTime = moment(calAppointment.end).toDate();
                let updateAppointmentDescription = calAppointment.description;
                this.appointmentDescription = updateAppointmentDescription;
                this.appointmentEndDate = updateAppointmentEndDateTime;
                this.appointmentStartDate = updateAppointmentStartDateTime;
                let updatedSubjectType ;
                let updateAppointmentType = {
                        duration: this.appointmentTypes[i].duration,
                        id: this.appointmentTypes[i].appointmentId,
                        name: this.appointmentTypes[i].appointmentTypeDesc,
                        subjectType: this.appointmentTypes[i].appointmentTypeSubject
                };
                this.selectedappointmenttype = updateAppointmentType;
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
                this.memberApntDetails = this._formBuilder.group({
                    'appointmenttype': new FormControl(updateAppointmentType, Validators.required),
                    'subjecttype': new FormControl(updatedSubjectType, Validators.required),
                    'description': new FormControl(updateAppointmentDescription),
                    'appointmentStartDate': new FormControl(updateAppointmentStartDateTime, Validators.required),
                    'appointmentStartTime': new FormControl(updateAppointmentStartDateTime, Validators.required),
                    'appointmentEndDate': new FormControl(updateAppointmentEndDateTime, Validators.required),
                    'appointmentEndTime': new FormControl(updateAppointmentEndDateTime, Validators.required)
                });
                console.log('test edit subject', updatedSubjectType, this.memberApntDetails.controls['subjecttype'].value);
                this.btnDisabled = false;
            }
        }
        let blocknamePopup = document.getElementsByClassName('caremanagerblockIspopup');
        for (let i = 0; i < blocknamePopup.length; i++) {
            if ((blocknamePopup[i].lastElementChild !== undefined) || (blocknamePopup[i].lastElementChild !== null)) {
                blocknamePopup[i].lastElementChild.setAttribute('style', 'background-color:' + this.popupOpenedTabInfoList[i].colorCode);
            }
        }
    }

    setAppointmentTypeValues(currentApptType) {
            if (currentApptType !== null) {
                for ( let apptType of this.appointmentTypes ) {
                    for (let apptDesc of apptType.appointmentTypeSubject){
                        if (apptDesc.subjectDesc === currentApptType) {
                            this.currentAppointment = apptType;
                            return this.currentAppointment;
                        }
                }
            }
            } else {
                console.log('appointmentTypes null:');
            }
        }

    closeAppointmentDialogBox() {
        this.dialogVisible = false;
        this.searchedForIspopup = '';
        this.errormessage = this.invalidEndDate = this.invalidStrtTime = false;
        this.invalidEndDate = this.checkValidEntry = false;
        this.checkValidEndDate = this.checkValidEndTime = this.checkValidStartTime = false;
        this.appointmentTypeSubject = [];
        this.appointmentTypeSubject = [];
    }

    setValue() {
        if (this.user.viewOption === 'UserView') {
       /*     this.searchText = 'Enter Group Name';
        }else { */
            this.searchText = 'Enter User Name';
        }
   };

    filterCareManagerSingle(event, dialogVisible) {
        // let dialogVisible = this.dialogVisible;
            if (this.dialogVisible === true) {
                dialogVisible = 'Ispopup';
            } else {
                dialogVisible = 'BaseCal';
            }
            let query = event.query;
            this._memberCalendarService.getUsersSearchResults(query).subscribe(
            searchResults => {
                let filtered: any[] = [];
                this.searchedUsers = [];
                for (let searchResult of searchResults) {
                    let name = searchResult.userName;
                    this.searchedUsers.push({id: searchResult.userId, name: searchResult.userName});
                    filtered.push(name);
                }
                if (dialogVisible === 'Ispopup') {
                    this.searchResultsIspopup = filtered;
                    this.searchResultsIspopup = this.searchResultsIspopup.sort();
                } else {
                    this.searchResultsBaseCal = filtered;
                    this.searchResultsBaseCal = this.searchResultsBaseCal.sort();
                }
            },
            error => {
                console.log('Error:  memberCalendarService.getUsersSearchResults');
            },
            () => {
                this.isLoading = false;
            });
        }

    selectUserName(checkDialogVisible) {
        let userName;
        /*
        if (this.viewType === 'listMonth') {
                this.selectUserInListAlert = 'You can not add user(s) in List View mode.';
                this.userSelectedInList = true;
                this.searchedForBaseCal = '';
                return;
        }
        */

         if (checkDialogVisible === 'Ispopup') {
            userName = this.searchedForIspopup;
            for (let i = 0; i < this.searchedUsers.length; i++) {
                if (this.searchedUsers[i].name === userName) {
                    this.currentUserId = this.searchedUsers[i].id;
                }
            }
            let setUserId = 'dataId:' + this.currentUserId;
            if (this.isUserTabAlreadyOpened(this.popupOpenedTabInfoList, userName)) {
                this.searchAlertText = 'The selected user name is already present';
                this.isDuplicateUser = true;
            } else {
                  let bgColorCode = '';
                  for (let user of this.openedTabUserInfoList){
                        if ( this.currentUserId === user.userId) {
                            bgColorCode = user.colorCode;
                        }
                    }
                   bgColorCode = (bgColorCode !== '') ? bgColorCode :
                    this.popupTabColorAvailableList[this.popupTabColorAvailableList.length - 1];

                    let blockNameIspopup = document.getElementsByClassName('caremanagerblockIspopup');
                    let currentcount = blockNameIspopup.length;
                    setTimeout(function () {
                        for (let i = currentcount; i < blockNameIspopup.length; i++) {
                            blockNameIspopup[i].lastElementChild.setAttribute('style', 'background-color:' +
                                                                                bgColorCode);
                            blockNameIspopup[i].lastElementChild.setAttribute('id', setUserId);
                        }
                    }, 500);
                    this.recordPopUpTabInfo(this.currentUserId, userName, bgColorCode, false);
                    let attendeeInfo = new RequestAttendeesDto;
                    attendeeInfo.appointmentId = (this.editAppointmentId !== null) ? this.editAppointmentId.toString() : null;
                    attendeeInfo.appointmentAttendeeCCMSId = this.currentUserId;
                    attendeeInfo.memberId = null;
                    if (this.editAppointmentId !== null) {
                        if (this.saveEditEventParam !== null && this.saveEditEventParam !== 'undefined') {
                            for (let attendee of this.saveEditEventParam.calEvent.attendees) {
                                if ( (attendee.id).toString() === this.currentUserId) {
                                    attendeeInfo.appointmentAttendeeId = attendee.attendeeId;
                                }
                            }
                        }
                    else {
                        attendeeInfo.appointmentAttendeeId = null;
                      }
                    }

                    this.appointmentAttendeeList.push(attendeeInfo);
                    this.searchedForIspopup = '';

            }
            this.searchedUsers = [];

        } else {
            userName = this.searchedForBaseCal;
            for (let i = 0; i < this.searchedUsers.length; i++) {
                if (this.searchedUsers[i].name === userName) {
                    this.currentUserId = this.searchedUsers[i].id;
                }
            }
            let setUserId = 'dataId:' + this.currentUserId;
            if (this.isUserTabAlreadyOpened(this.openedTabUserInfoList, userName)) {
                this.searchAlertText = 'The selected user name is already present';
                this.isDuplicateUser = true;
            } else {

                 let blockName = document.getElementsByClassName('caremanagerblock');
                 let currentcount = blockName.length;
                 let bgColorCode = '';
                  for (let user of this.openedTabUserInfoList){
                        if ( this.currentUserId === user.userId) {
                            bgColorCode = user.colorCode;
                        }
                    }
                   bgColorCode = (bgColorCode !== '') ? bgColorCode :
                   this.availableColorListForUserTab[this.availableColorListForUserTab.length - 1];
                   setTimeout(function () {
                        for (let i = currentcount; i < blockName.length; i++) {
                            blockName[i].lastElementChild.setAttribute('style', 'background-color:' +
                                                                                bgColorCode);
                            blockName[i].lastElementChild.setAttribute('id', setUserId);
                        }
                    }, 500);

                    this.recordUserInfo(this.currentUserId, userName, bgColorCode, false, checkDialogVisible);
                    if (this.currentCalView === 'listMonth') {
                        this.getExistingAppointmentsForListView(this.currentUserId, bgColorCode, false);
                    } else {
                        this.getUserAppointments(this.currentUserId,
                        bgColorCode, this.getCalendarModeName(this.viewType), this.currentCalDate,
                        false, true);
                    }

                    this.searchedForBaseCal  = '';

            }
            this.searchedUsers = [];

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

    fetchEvents(eventData) {
        if (!this.isLoading) {
            this.viewType = eventData.view.name;
            this.currentCalDate = this.getDateForViewNavigation(eventData);
            this.currentCalView = this.viewType;

            if (this.viewType === 'listMonth') {
                if (this.events.length !== 0) {
                    this.events = [];
                    for (let openedTabUserInfo of this.openedTabUserInfoList) {
                        this.getExistingAppointmentsForListView(openedTabUserInfo.userId,
                        openedTabUserInfo.colorCode,  openedTabUserInfo.isMember);
                    }
                    eventData.view.intervalStart._d = eventData.view.start._d = new Date();
                    eventData.view.intervalEnd._i = moment(eventData.view.intervalStart._d).add(44, "days");
                    eventData.view.end._d = moment(eventData.view.start._d).add(44, "days");
                }
            } else {
                this.events = [];
                for (let openedTabUserInfo of this.openedTabUserInfoList) {
                    this.getExistingAppointments(openedTabUserInfo.userId,
                        openedTabUserInfo.colorCode, this.getCalendarModeName(this.currentCalView),
                        this.currentCalDate, openedTabUserInfo.isMember);
                }
            }
        }
    }

    getExistingAppointments(ccm, colorData , mode , date, isMember) {
        this._memberCalendarService.getAppointments(ccm, mode, date, isMember).subscribe(
            appointmentsResponse => {
                this.processAppointments(ccm, appointmentsResponse, colorData, isMember, false);
                if ( this.openedTabUserInfoList[0].userName === null || this.openedTabUserInfoList[0].userName === '' ||
                 this.openedTabUserInfoList[0].userName === undefined ) {
                    this.updateMemberInfo(appointmentsResponse);
                }
            },
            error => {
                console.log('Error:  Get memberCalendarService.getAppointments');
            },
            () => {
                this.isLoading = false;
            });

    }

    getUserAppointments(ccm, colorData , mode , date, isMember, isSelectedUser ) {
        this._memberCalendarService.getUserAppointments(ccm, mode, date).subscribe(
            appointmentsResponse => {
                this.processAppointments(ccm, appointmentsResponse, colorData, isMember, isSelectedUser);
            },
            error => {
                console.log('Error:  Get memberCalendarService.getUserAppointments');
            },
            () => {
                this.isLoading = false;
            });

    }

    getExistingAppointmentsForListView(ccm, colorData ,  isMember) {
        let listViewDate = moment(new Date()).format('MMDDYYYY');
        this._memberCalendarService.getAppointmentsForListView(ccm, listViewDate,  isMember).subscribe(
            appointmentsResponse => {
                this.processAppointments(ccm, appointmentsResponse, colorData, isMember, false);
            },
            error => {
                console.log('Error: memberCalendarService.getAppointmentsForListView');
            },
            () => {
                this.isLoading = false;
            });
    }

    attendeeNames(attendeesList, isMember) {
      if (!isMember ) {
          return '';
      } else {
            let attendees = ' ';
            for (let attendee of attendeesList) {
                if (attendee.id !== -1) {
                    attendees = attendees + '; ' + attendee.name;
                }
            }
            return attendees;
      }
    }

    processAttendees(existingAppt) {
        let attendees =  existingAppt.attendees.attendee;
        for (let i = 0; i < attendees.length; i++) {
             if (existingAppt.attendees.attendee[i].id === -1) {
               existingAppt.attendees.attendee[i].id = existingAppt.member.id;
               existingAppt.attendees.attendee[i].name = existingAppt.member.name;
             }
        }
        return attendees;
    }

    processAppointments(ccm, appointmentsRes, colorData, isMember, isSelectedUser) {
        this.toolbarClickedMemberCalendar = true;
        let appointmentList = appointmentsRes;
        if (appointmentList != null) {
            for (let existingAppt of appointmentList) {
                console.log('33', existingAppt);
                this.events.push({
                    start: moment(existingAppt.startDate + ' ' + existingAppt.startTime).format(),
                    end: moment((existingAppt.endDate + ' ' + existingAppt.endTime)).format(),
                    title: existingAppt.taskObjective,
                    backgroundColor: ((colorData !== '') ? colorData : ''),
                    tip: moment(existingAppt.startDate + ' ' + existingAppt.startTime).format('hh:mm A') + ' : '
                     + existingAppt.taskObjective + this.attendeeNames(existingAppt.attendees.attendee, isMember),
                    careManagerId: ccm,
                    id: existingAppt.id,
                    attendees: this.processAttendees(existingAppt),
                    ownerCcmsId : existingAppt.OwnerCcmsId,
                    duration: existingAppt.duration,
                    appointmentType: existingAppt.type,
                    description: existingAppt.description
                });
            }
            console.log('attendee array', this.events);
            if (this.openedTabUserInfoList[0].userName === null) {
                this.showMember(this.memberId);
            }
        }
    }

    eventRender(event, element) {
        element.attr('title', event.tip);
    }

    public getCalendarHeight() {
        return window.innerHeight - 90;
    }

    listViewDialogOk() {
        this.listViewAlert = '';
        this.userSelected = false;
        return;
    }

    duplicateUserDialogOk() {
        this.searchedForBaseCal = this.searchedForIspopup = '';
        this.isDuplicateUser = false;
    }

    selectUserDialogOk() {
        this.userSelectedInList = false;
    }

    errorMessageDialogOk() {
       this.addAppointmentOverlay = false;
    }

    removePopupTabInfo(userId) {
        let userColor = '';
        let userName = '';
        for (let popupOpenedTabInfo of this.popupOpenedTabInfoList) {
            if (popupOpenedTabInfo.userId === userId) {
                userColor = popupOpenedTabInfo.colorCode;
                userName = popupOpenedTabInfo.userName;
                let userIndex = this.popupOpenedTabInfoList.indexOf(popupOpenedTabInfo);
                this.popupOpenedTabInfoList.splice(userIndex, 1);
            }
        }

        // TODO don't remove color if it is opend in base calandar
        if ( !this.isUserTabAlreadyOpened(this.openedTabUserInfoList, userName)){
            this.popupTabColorAvailableList.push(userColor);
        }
        for ( let attendeeInfo of  this.appointmentAttendeeList){
            if (attendeeInfo.appointmentAttendeeCCMSId === userId ) {
                let userIndex = this.appointmentAttendeeList.indexOf(attendeeInfo);
                this.appointmentAttendeeList.splice(userIndex, 1);
            }
        }
    }

    removeCareManagerName(divIndex, currentId, checkDialogVisible) {
        if (checkDialogVisible === 'isPopup') {
            let userId = currentId.currentTarget.parentElement.getAttribute('id');
            let a =  userId.indexOf(':');
            if (  userId.indexOf(':') >= 0) {

               // userId = currentId.currentTarget.parentElement.getAttribute('dataIdPopup').split(':')[1];
                 userId = userId.split(':')[1];
            }
            this.removePopupTabInfo(userId);
        } else if (checkDialogVisible === 'baseCal') {
            let currentCareManagerId = currentId.currentTarget.parentElement.getAttribute('id').split(':')[1];
            this.removeUserInfo(currentCareManagerId, checkDialogVisible);
            let currentCareManagerColor = currentId.currentTarget.parentElement.style.backgroundColor;
             /*
              TODO 
              As per Jody don't use setAttribute('hidden', 'true'); 
              as it is dynamically generated element so how we can implement using ngIf or [hidden]  attribute in html??
              Answer: add the attribute [Hidden] to the HTML element, usually a parent div wrapping your element.
             */
            for (let i = this.events.length - 1; i >= 0; i--) {
                if (this.events[i].careManagerId !== undefined) {
                    if (this.events[i].careManagerId === currentCareManagerId) {
                        this.events.splice(i, 1);
                    }
                }
            }
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

   recordUserInfo(userId,  userName, userColor, isMember, mainCalendar) {
        let openedTabUserInfo = new OpenedTabUserInfoDto;
        openedTabUserInfo.userId = userId;
        openedTabUserInfo.userName = userName;
        openedTabUserInfo.isMember = isMember;
        openedTabUserInfo.colorCode = (userColor !== 'na') ? userColor : '';
        this.popupOpenedTabInfoList.push(openedTabUserInfo);
        if (mainCalendar === 'BaseCal') {
            this.openedTabUserInfoList.push(openedTabUserInfo);
        }
        console.log('user info', this.openedTabUserInfoList);
        console.log('user info popup', this.popupOpenedTabInfoList);
        this.availableColorListForUserTab = this.removeColorFromList(this.availableColorListForUserTab, userColor);
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

    removeUserInfo(userId, checkDialogVisible) {
        let userColor = '';
        if (checkDialogVisible === 'isPopup') {
            for (let openedTabUserInfo of this.popupOpenedTabInfoList) {
                if (openedTabUserInfo.userId === userId) {
                    userColor = openedTabUserInfo.colorCode;
                    let userIndex = this.popupOpenedTabInfoList.indexOf(openedTabUserInfo);
                    this.popupOpenedTabInfoList.splice(userIndex, 1);
                }
            }
             this.availableColorListForUserTab.push(userColor);
        } else {
            for (let openedTabUserInfo of this.openedTabUserInfoList) {
                if (openedTabUserInfo.userId === userId) {
                    userColor = openedTabUserInfo.colorCode;
                    let userIndex = this.openedTabUserInfoList.indexOf(openedTabUserInfo);
                    this.openedTabUserInfoList.splice(userIndex, 1);
                }
            }
            this.availableColorListForUserTab.push(userColor);
        }
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

    displayDialogHeading() {
        let text = '';
        if (this.errormessage) {
            text = 'Info Message';
        } else {
            text = 'Calendar Actions';
        }
        return text;
    }

    ngOnDestroy() {

    }

    updateMemberInfo(appointmentsResponse) {
        if ( appointmentsResponse !== undefined && appointmentsResponse.length > 0 ) {
             this. openedTabUserInfoList[0].userName  = appointmentsResponse[0].member.name;
             /*
             if (appointmentsResponse[0].id === -1) {
                 this. openedTabUserInfoList[0].userId  = appointmentsResponse[0].member.id;
                 this. openedTabUserInfoList[0].isMember  = true;
             }
             */
        }
    }


}
