
import { Component, ViewEncapsulation, HostListener, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Subscription } from 'rxjs/Subscription';
import * as moment from 'moment';

import { BaseComponent }                from './../../common/base.component';
import { ConfigurationService }         from './../../common/configuration.service';
import { RefreshGetNextQueueService }   from './../../common/refresh-getnext-queue-event.service';
import { WindowDefinitionService }      from './../../common/window.definition/window.definition.service';
import { GetNextService }               from './getnext.service';
import { TaskDefinitionHistoryDto,
         TaskDefinitionFieldHistoryDto,
         QueueItemDto, FormattedQueueItemDto } from './getnext.dtos';

// declare the accessor for the GWT jsni exposed Javascript method.
// see the intermediary function in index.html
declare function openGetNextItem(getnextItemId: number, taskDefinitionId: number,
                                 memberId: string, description: string, status: string): void;

@Component({
    selector: 'theselector',
    encapsulation: ViewEncapsulation.None,
    templateUrl: './getnext.component.html',
    styleUrls: ['getnext.component.css'],
    providers: [WindowDefinitionService, GetNextService, RefreshGetNextQueueService]
})
export class GetNextComponent extends BaseComponent implements OnInit, OnDestroy {

    isLoading: boolean = false;
    header: any;
    mode = 'Observable';
    noItemsMessage: string = '';

    /* Initial Setting For Calendar Display */
    gCalendarClass = 'ui-g-9';  // Initial Display width of calendar
    showDetails = false;        // Hide or show details section
    queueList: FormattedQueueItemDto[] = [];
    getNextTaskDetailsDto: TaskDefinitionHistoryDto = null;
    generalFields: TaskDefinitionFieldHistoryDto[] = [];
    events: any[];              // Event list	

    selectedQueueItemId: number = null;
    selectedQueueItemTaskDefinitionId: number = null;
    selectedQueueItemAppointmentId: number = null;
    selectedQueueItemStatus: string = null;
    selectedQueueItemMemberId: string = null;
    selectedQueueItemDescription: string = null;
    selectedQueueItemMember: string = null;
    selectedQueueItemDueDate: string = null;

    // special task definition field list. these fields are layed out in
    // certain locations in the hmtl, versus as specified in the field list order
    objective: string = null;
    objectiveLabel: string = null;
    careGapStatement: string = null;
    careGapStatementLabel: string = null;
    caregiverContactInfo: string = null;
    caregiverName: string = null;
    caregiverNameLabel: string = null;
    memberContactInfo: string = null;
    memberDobAndGender: string = null;
    memberDobAndGenderLabel: string = null;
    memberCareTrack: string = null;
    memberCareTrackLabel: string = null;
    memberCondition: string = null;
    memberConditionLabel: string = null;
    memberCareTrackMedication: string = null;
    memberCareTrackMedicationLabel: string = null;

    subscription: Subscription;

    constructor(private _formBuilder: FormBuilder,
                private _getnextService: GetNextService,
                private _refreshGetNextQueueService: RefreshGetNextQueueService,
                private _route: ActivatedRoute,
                private _windowDefinitionService: WindowDefinitionService) {

        super(_route, _windowDefinitionService);
    }

    public ngOnInit() {
        this.header = {
            left: 'title',
            right: ''
        };

        this.subscription = this._refreshGetNextQueueService.refreshGetNextQueueEvent$
            .subscribe(source => console.log('got the message: ' + source));

        // this._refreshGetNextQueueService.refreshGetNextQueueEvent$.subscribe(source => this.refreshGetNextQueue2(source));

        this.getQueueItemList();
        this.getCalendarAppointments();
    }

    public ngOnDestroy() {
        this.subscription.unsubscribe();
    }

    @HostListener('refreshGetNextQueue', ['$event'])
    public refreshGetNextQueue(event) {
        console.log('got refreshGetNextQueue in getnext queue listing component');
        this.refreshQueue();
    }

    public refreshGetNextQueue2(source): void {
        console.log('in refreshGetNextQueue2, source: ' + source);
        this.refreshQueue();
    }

    public refreshQueue() {
        this.queueList = [];
        this.noItemsMessage = '';
        this.getQueueItemList();
        this.getCalendarAppointments();
    }

    public getCalendarHeight() {
        return window.innerHeight - 35;
    }

    public onNoContact() {
        this.showDetails = false;
        this.setGetNextTaskStatus(this.selectedQueueItemId, 'ZNOCONTACT');
        this.getQueueItemList();
    }

    public onContinue() {

        try {
            this.showDetails = false;

            setTimeout(() => this.getQueueItemList(), 5000);

            // call the GWT jsni exposed Javascript method for opening a GetNext item.
            openGetNextItem(this.selectedQueueItemId, this.selectedQueueItemTaskDefinitionId,
                this.selectedQueueItemMemberId, this.selectedQueueItemDescription,
                this.selectedQueueItemStatus);

        } catch (error) {
            this.showErrorMessage('An error occurred opening the GetNext item: ' + error);
        }
    }

    public sortScore(a, b) {
        if (a.score === b.score) {
            return 0;
        } else {
            return (a.score < b.score) ? -1 : 1;
        }
    }

    public sortOrder(a, b) {
        if (a.field_order === b.field_order) {
            return 0;
        } else {
            return (a.field_order < b.field_order) ? -1 : 1;
        }
    }

    /* Format the appoint list to display at the calendar */
    public formatAppointmentList(data) {
        let aDisplayArray = [];

        data.calendarItems = data.userCalendarAppointments;

        if (!data.calendarItems) {
            data.calendarItems = data;
        }

        for (let key in data.calendarItems) {

            if (key !== null && key !== undefined) {
                let aTempArray = data.calendarItems[key];
                let iKey = aDisplayArray.length;

                /*
                * Formatting array for Calendar
                * id 		=> Unique ID for Appointment reference
                * title 	=> Display at calendar
                * start		=> Start Date time of an appointment
                * end		=> End of an appointment
                */

                aDisplayArray[iKey] = {
                    id: aTempArray.id,
                    title: '',
                    tip: moment(aTempArray.startDate + ' ' + aTempArray.startTime).format('hh:mm:A') + ' : ' + aTempArray.taskObjective,
                    start: aTempArray.startDate + ' ' + aTempArray.startTime,
                    end: aTempArray.endDate + ' ' + aTempArray.endTime
                };

                if (aTempArray.member !== null && aTempArray.member !== undefined && aTempArray.member.name) {
                    aDisplayArray[iKey].title = aTempArray.member.name;
                }

                /* Include subject if avaliable */
                if (aTempArray.member !== null && aTempArray.member !== undefined
                    && (typeof aTempArray.member.primaryPhone !== undefined)
                    && aTempArray.member.primaryPhone !== '') {

                    aDisplayArray[iKey].title += '  - Ph: ' + aTempArray.member.primaryPhone + ' ';
                }

                /* Include subject if avaliable  */
                if (aTempArray.taskObjective !== '') {

                    aDisplayArray[iKey].title += ' ( ' + aTempArray.taskObjective + ' )';
                }

                /* Adding Attendies to teh calendar list, if attendees avaliable we will  add to the  title */
                if ((typeof aTempArray.attendees === 'object')) {

                    let sAttendees: String = '';

                    for (let iKey in aTempArray.attendees) {
                        if (aTempArray.attendees[iKey] !== null && aTempArray.attendees[iKey] !== undefined
                            && aTempArray.attendees[iKey].name) {

                            if ((typeof aTempArray.attendees[iKey].name) !== undefined)
                                sAttendees += ((sAttendees !== '') ? ', ' : 'Att: ') + aTempArray.attendees[iKey].name;
                        }
                    }

                    if (sAttendees !== '') {
                        aDisplayArray[iKey].title += ' - ' + sAttendees;
                    }
                }
            }
        }

        return aDisplayArray;
    }

    public getDetails(data) {
        let aDisplayArray = [];
        aDisplayArray = data.fields;
        aDisplayArray.sort(this.sortOrder);

        return aDisplayArray;
    }

    public getQueueItemList() {
        this._getnextService.getQueueItemList(this.userId)
            .subscribe(data => {
                // this.log('queue item list: ' + JSON.stringify(data));
                this.setFormattedQueueItemList(data);
            });
    }

    public getCalendarAppointments(sdate: string = '', currentDate: String = '') {
        this._getnextService.getAppointmentList(this.userId, currentDate)
            .subscribe(data => {
                // this.log('calendar appointment list: ' + JSON.stringify(data));
                this.events = this.formatAppointmentList(data);
            });
    }

    public eventRender(event, element) {
        element.attr('data-tooltip', event.tip);
    }

    public queueItemClick(queueItem: FormattedQueueItemDto) {

        this.gCalendarClass = 'ui-g-4';
        this.showDetails = true;
        this.selectedQueueItemId = queueItem.getNextTaskId;
        this.selectedQueueItemAppointmentId = queueItem.appointmentId;
        this.selectedQueueItemStatus = queueItem.currentStatus;
        this.selectedQueueItemTaskDefinitionId = queueItem.taskDefinitionId;
        this.selectedQueueItemMemberId = queueItem.memberId;
        this.selectedQueueItemDescription = queueItem.details;
        this.selectedQueueItemMember = queueItem.name;
        this.selectedQueueItemDueDate = queueItem.due;

        this._getnextService.getDetails(queueItem.getNextTaskId.toString())
            .subscribe(data => {

                // this.log(JSON.stringify(data));

                this.getDetails(data);
                this.getNextTaskDetailsDto = data;
                this.setGeneralFields();
                this.setSpecialFields();
            },
            err => {
                this.handleError(err.toString(), 'Error retrieving appointment details.', 'Appointment Details: ');
            });
    }

    public closeDetails() {
        this.gCalendarClass = 'ui-g-9';
        this.showDetails = false;
    }

    private setGetNextTaskStatus(getNextTaskId: number, status: string) {

        this._getnextService.setGetNextTaskStatus(getNextTaskId.toString(), status)
            .subscribe(
                result => {
                    if (result.statusCode !== '200') {
                        this.handleError(result.errorMessage, 'An error occurred saving the GetNext Task Status (' + status + ').',
                            'Queue Item Status: ');
                    }
            },
            err => {
                this.handleError(err.toString(),
                    'An error occurred saving the GetNext Task Status (' + status + ').', 'Queue Item Status: ');
            },
            () => {
            });
    }

    private setSpecialFields() {

        for (let fieldDto of this.getNextTaskDetailsDto.fields) {
            if (fieldDto.taskDefFieldType !== null && fieldDto.taskDefFieldType !== undefined) {
                if (fieldDto.taskDefFieldType.toUpperCase() === 'ZMEMBERDOBGENDER') {
                    this.memberDobAndGender = fieldDto.displayValue;
                    this.memberDobAndGenderLabel = fieldDto.displayLabel;
                } else if (fieldDto.taskDefFieldType.toUpperCase() === 'ZCAREGIVERCONTACTINFO') {
                    this.caregiverContactInfo = fieldDto.displayValue;
                } else if (fieldDto.taskDefFieldType.toUpperCase() === 'ZMEMBERCONTACTINFO') {
                    this.memberContactInfo = fieldDto.displayValue;
                } else if (fieldDto.taskDefFieldType.toUpperCase() === 'ZCAREGAPSTATEMENT') {
                    this.careGapStatement = fieldDto.displayValue;
                    this.careGapStatementLabel = fieldDto.displayLabel;
                } else if (fieldDto.taskDefFieldType.toUpperCase() === 'ZCAREGIVER') {
                    this.caregiverName = fieldDto.displayValue;
                    this.caregiverNameLabel = fieldDto.displayLabel;
                } else if (fieldDto.taskDefFieldType.toUpperCase() === 'ZMEMBERCARETRACK') {
                    this.memberCareTrack = fieldDto.displayValue;
                    this.memberCareTrackLabel = fieldDto.displayLabel;
                } else if (fieldDto.taskDefFieldType.toUpperCase() === 'ZMEMBERCONDITION') {
                    this.memberCondition = fieldDto.displayValue;
                    this.memberConditionLabel = fieldDto.displayLabel;
                } else if (fieldDto.taskDefFieldType.toUpperCase() === 'ZMEMBERCARETRACKMED') {
                    this.memberCareTrackMedication = fieldDto.displayValue;
                    this.memberCareTrackMedicationLabel = fieldDto.displayLabel;
                } else if (fieldDto.taskDefFieldType.toUpperCase() === 'ZOBJECTIVE') {
                    this.objective = fieldDto.displayValue;
                    this.objectiveLabel = fieldDto.displayLabel;
                }
            }
        }
    }

    private setGeneralFields() {

        this.generalFields = [];

        for (let fieldDto of this.getNextTaskDetailsDto.fields) {
            if (fieldDto.taskDefFieldType === null || fieldDto.taskDefFieldType === undefined
                || (fieldDto.taskDefFieldType.toUpperCase() !== 'ZMEMBERDOBGENDER'
                    && fieldDto.taskDefFieldType.toUpperCase() !== 'ZMEMBERCONTACTINFO'
                    && fieldDto.taskDefFieldType.toUpperCase() !== 'ZCAREGIVERCONTACTINFO'
                    && fieldDto.taskDefFieldType.toUpperCase() !== 'ZCAREGAPSTATEMENT'
                    && fieldDto.taskDefFieldType.toUpperCase() !== 'ZCAREGIVER'
                    && fieldDto.taskDefFieldType.toUpperCase() !== 'ZMEMBERCARETRACK'
                    && fieldDto.taskDefFieldType.toUpperCase() !== 'ZMEMBERCONDITION'
                    && fieldDto.taskDefFieldType.toUpperCase() !== 'ZMEMBERCARETRACKMED'
                    && fieldDto.taskDefFieldType.toUpperCase() !== 'ZOBJECTIVE'
                    && fieldDto.taskDefFieldType.toUpperCase() !== 'ZSERVICEACTIONFIELD')) {

                this.generalFields.push(fieldDto);
            }
        }
    }

    private setFormattedQueueItemList(queueItemList: QueueItemDto[]) {

        this.queueList = [];

        for (let queueItem of queueItemList) {
            if (queueItem !== null && queueItem !== undefined) {

                // this.log('queueItem: ' + JSON.stringify(queueItem));

                let formattedDto: FormattedQueueItemDto = new FormattedQueueItemDto();

                formattedDto.getNextTaskId = queueItem.getNextTaskId;
                formattedDto.taskDefinitionId = queueItem.taskDefinitionId;
                formattedDto.memberId = queueItem.memberId;
                formattedDto.appointmentId = queueItem.appointmentId;
                formattedDto.currentStatus = queueItem.currentStatus;
                formattedDto.name = queueItem.memberName + ' ' + queueItem.memberId;
                formattedDto.details = queueItem.fieldObjective || queueItem.taskObjective;
                formattedDto.score = queueItem.score;
                formattedDto.due = queueItem.due;

                if (queueItem.due === null || queueItem.due === undefined || queueItem.due.trim() === '') {
                    if (queueItem.slaMinutes) {
                        let returnedEndDate = moment().add(queueItem.slaMinutes, 'm');
                        formattedDto.due = 'Due : ' + returnedEndDate.format('MMMM Do YYYY, h:mm a');
                    } else {
                        formattedDto.due = 'Due : Unknown';
                    }
                } else {
                    formattedDto.due = 'Due : ' + queueItem.due;
                }

                this.queueList[this.queueList.length] = formattedDto;
            }
        }

        if (this.queueList.length === 0) {
            this.noItemsMessage = 'No items found for this user.';
        }
    }
}
