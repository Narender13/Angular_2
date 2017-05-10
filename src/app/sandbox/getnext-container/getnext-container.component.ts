
import { Component, ViewEncapsulation, ViewChild, OnInit, OnDestroy, HostListener, NgZone } from '@angular/core';
import { FormGroup, FormControl, AbstractControl, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService, MenuItem } from 'primeng/primeng';

import { BaseComponent } from './../../common/base.component';
import { CarePlanComponent } from './../careplan/careplan.component';
import { CarePlanService } from './../careplan/careplan.service';
import { ChartNoteComponent } from './chart-note/chart-note.component';
import { MemberDemographicsComponent } from './member-demographics/member-demographics.component';
import { MemberCaregiverComponent } from './member-caregiver/member-caregiver.component';
import { MemberCaregiverService } from './member-caregiver/member-caregiver.service';
import { MemberOtherContactService } from './member-other-contact/member-other-contact.service';
import { MemberDemographicsService } from './member-demographics/member-demographics.service';
import { MemberPCPComponent } from './member-pcp/member-pcp.component';
import { MemberPCPService } from './member-pcp/member-pcp.service';


import { ConfigurationService } from './../../common/configuration.service';
import { RefreshGetNextQueueService }   from './../../common/refresh-getnext-queue-event.service';
import { WindowDefinitionService } from './../../common/window.definition/window.definition.service';
import {
    WindowDefinitionDto,
    RuleDomainTableDataRowsDto,
    DataRowDto
} from './../../common/window.definition/window.definition.dtos';
import { MessageService } from './../../common/message.service';
import { ShowDialogService } from './../../common/show.dialog.service';
import { GetNextContainerService } from './getnext-container.service';
import { TaskDefinitionDto } from './getnext-container.dtos';

// the HTML child components
import { MemberHeaderComponent, MemberHeaderService }       from './../member-header';
import { ApAssessmentComponent, ApAssessmentService }       from './../ap-assessment';
import { MemberCalendarComponent, MemberCalendarService }   from './../calendar/member';

// import { axis } from './gwt';

// declare the accessors for the GWT jsni exposed Javascript methods.
// see the intermediary functions in index.html
declare function openMemberChart(memberId: string): void;
declare function closeGetNextItem(getnextItemId: number, memberId: string): void;

@Component({
    selector: 'getNextContainer',
    encapsulation: ViewEncapsulation.None,
    templateUrl: './getnext-container.component.html',
    styleUrls: ['getnext-container.component.css'],
    providers: [MemberHeaderComponent, ChartNoteComponent, CarePlanComponent, MemberHeaderService,
        ApAssessmentComponent, ApAssessmentService, MemberDemographicsComponent,
        MemberCaregiverComponent, MemberCaregiverService, MemberOtherContactService,
        WindowDefinitionService, ConfirmationService, MemberDemographicsService,
        MemberPCPComponent, MemberPCPService, RefreshGetNextQueueService,
        MemberCalendarComponent, MemberCalendarService, CarePlanService,
        MessageService, ShowDialogService, GetNextContainerService]
})
export class GetNextContainerComponent extends BaseComponent implements OnInit, OnDestroy {

    isDevelopmentMode: boolean = false;

    tipAssessment: string = 'General Assessment';
    tipCalendar: string = 'Member Calendar';
    tipCaregiver: string = 'Caregiver';
    tipCareplan: string = 'Care Plan';
    tipDemographics: string = 'Demographics';
    tipMemberChart: string = 'Member Chart';
    tipNote: string = 'Note';
    tipPCP: string = 'PCP';

    showGeneralAssessmentToolbarButton: boolean = false;
    showMemberDemographicsToolbarButton: boolean = true;
    showMemberCaregiverToolbarButton: boolean = true;
    showMemberPCPToolbarButton: boolean = true;
    showCareplanToolbarButton: boolean = false;

    toolbarClickedHome: boolean = true;
    toolbarClickedCareplan: boolean = false;
    toolbarClickedMemberCalendar: boolean = false;
    toolbarClickedGeneralAssessment: boolean = false;

    hideHomeGetNextItem: boolean = false;
    hideGeneralAssessment: boolean = false;
    hideCalendar: boolean = false;
    hideAPCareplan: boolean = false;

    generalAssessmentType: string = 'GENERAL';
    generalAssessmentAlgorithmId: string = 'GENERAL_ASSESSMENT';

    // side slideouts and active menu item
    activeGetNextMenuId: string;
    getNextMenuOpen: boolean = false;
    notePanelOpen: boolean = false;

    taskDefinitionId: string = null;
    taskDefinitionDto: TaskDefinitionDto = null;

    memberFullName: string = '';

    // query params
    memberId: string;
    originalStatus: string;
    getNextTaskId: number;
    targetUIType: string;
    algorithmId: string;
    assessmentType: string;
    assessmentAction: string;
    memberPCP: string;

    // list of getnext types
    typeAssessment: boolean = false;
    typeCareplan: boolean = false;

    // list of toolbar accessed items
    @ViewChild(MemberDemographicsComponent) memberDemographicsDialog: MemberDemographicsComponent;
    @ViewChild(MemberCalendarComponent) memberCalendar: MemberCalendarComponent;
    @ViewChild(ChartNoteComponent) chartNotePanel: ChartNoteComponent;
    @ViewChild(MemberCaregiverComponent) careGiverDialog: MemberCaregiverComponent;
    @ViewChild(MemberPCPComponent) memberPCPDialog: MemberPCPComponent;
    @ViewChild(CarePlanComponent) carePlanPanel: CarePlanComponent;

    private getNextUiDefinition: WindowDefinitionDto[] = [];

    constructor(private _route: ActivatedRoute,
        private _getNextContainerService: GetNextContainerService,
        private _windowDefinitionService: WindowDefinitionService,
        private _confirmationService: ConfirmationService,
        private _refreshGetNextQueueService: RefreshGetNextQueueService,
        private _ngZone: NgZone) {
        super(_route, _windowDefinitionService);

        if (process.env.ENV === 'development') {
            this.isDevelopmentMode = true;
        }
    }

    public ngOnInit() {

        window.axis = window.axis || {};
        window.axis.namespace = window.axis.namespace || {};
        window.axis.namespace.areGetNextChildrenDirty = this.areGetNextChildrenDirty.bind(this);
        window.axis.namespace.saveGetNextChildren = this.saveGetNextChildren.bind(this);

        this.getGetNextUIDefinition();

        this.targetUIType = this._route.snapshot.params['type'];
        this.log('path param type: ' + this._route.snapshot.params);

        this._route.queryParams.subscribe(
            (param: String) => {

                this.getNextTaskId = param['getNextTaskId'];
                this.log('query param getNextTaskId: ' + this.getNextTaskId);

                this.taskDefinitionId = param['taskDefinitionId'];
                this.log('query param taskDefinitionId: ' + this.taskDefinitionId);

                this.originalStatus = param['status'];
                this.log('query param status: ' + this.originalStatus);

                this.memberId = param['memberId'];
                this.log('query param memberId: ' + this.memberId);

                if (this.targetUIType !== null) {
                    // based upon the type supplied, execute the corresponding getnext UI
                    if (this.targetUIType === 'ASSESSMENT') {
                        this.showAssessment();
                    } else if (this.targetUIType === 'CAREPLAN') {
                        this.showCareplan();
                    }
                } else {
                    this.handleError(null, 'The type: ' + this.targetUIType + ' is not a supported getNext container UI type.');
                }

                this.initializeChartNote();

                if (this.getNextTaskId !== null && this.getNextTaskId !== undefined
                    && this.taskDefinitionId !== null && this.taskDefinitionId !== undefined) {

                    this._getNextContainerService.getDetails(this.memberId, this.taskDefinitionId)
                        .subscribe(taskDefinition => {
                            this.taskDefinitionDto = taskDefinition;

                            // this.log(JSON.stringify(taskDefinition));

                            if (this.taskDefinitionDto.actions === null
                                || this.taskDefinitionDto.actions === undefined
                                || this.taskDefinitionDto.actions.length === 0) {

                                this.handleError(null, 'The task definition for this GetNext item ('
                                    + this.getNextTaskId + ') does not contain any action definitions.');
                            } else {
                                this.targetUIType = this.taskDefinitionDto.actions[0].taskActionType;
                                this.assessmentType = this.taskDefinitionDto.actions[0].taskActionDefinitionId;
                                this.algorithmId = this.taskDefinitionDto.actions[0].itemId;
                                this.assessmentAction = 'GETNEXT_START';

                                if (this.targetUIType !== null) {
                                    // based upon the type supplied, execute the corresponding getnext UI
                                    if (this.targetUIType === 'ASSESSMENT') {
                                        this.setToolbarForAssessmentMode();
                                        this.showAssessment();
                                        this.setGetNextTaskStatus(this.getNextTaskId, 'ZCOMPLETE');
                                    } else if (this.targetUIType === 'CAREPLAN') {
                                        this.setToolbarForCareplanMode();
                                        this.showCareplan();
                                        this.setGetNextTaskStatus(this.getNextTaskId, 'ZCOMPLETE');
                                    }
                                } else {
                                    this.handleError(null, 'The type: ' + this.targetUIType
                                        + ' is not a supported getNext container UI type.');
                                }
                            }
                        },
                        err => {
                            this.handleError(err.toString(),
                                'An error occurred retrieving the task definition for the GetNext item ('
                                + this.getNextTaskId + ')');
                        });
                } else {
                    if (this.targetUIType !== null) {
                        // based upon the type supplied, execute the corresponding getnext UI
                        if (this.targetUIType === 'ASSESSMENT') {
                            this.setToolbarForAssessmentMode();
                            this.showAssessment();
                        } else if (this.targetUIType === 'CAREPLAN') {
                            this.setToolbarForCareplanMode();
                            this.showCareplan();
                        }
                    } else {
                        this.handleError(null, 'The type: ' + this.targetUIType + ' is not a supported getNext container UI type.');
                    }
                }
            }
        );
    }

    public ngOnDestroy() {
        window.axis.namespace.areGetNextChildrenDirty = null;
        window.axis.namespace.saveGetNextChildren = null;
    }

    public areGetNextChildrenDirty(getNextQueueItemId: number) {
        return this._ngZone.run(() => this.areChildrenUIsDirty(getNextQueueItemId));
    }

    public saveGetNextChildren(getNextQueueItemId: number) {
        return this._ngZone.run(() => this.saveGetNextContainer(getNextQueueItemId));
    }

    public onNotifyQuestionnaireEnd(message: boolean): void {
        this.toolbarClickedHome = false;
        this.toolbarClickedMemberCalendar = true;
    }

    public onSetMemberAssessmentId(memberAssessmentId: string) {
        this.log('received member assessment id: ' + memberAssessmentId + ', calling link assessment note');
        this.chartNotePanel.linkAssessmentNote(memberAssessmentId);
    }

    public onNoteError(message: string) {
        this.log('received note error: ' + message);
        if (!this.notePanelOpen) {
            this.showErrorMessage(message, 'Note Error:');
        }
    }

    public notifyOfSendBackToQueue() {

        let placeInQueueMessage: string = 'Continue placing this item back into the GetNext Queue?';

        if (this.areChildrenUIsDirty(this.getNextTaskId)) {
            this._confirmationService.confirm({
                message: 'There are unsaved items. Do you wish to save them?',
                accept: () => {
                    this.saveGetNextContainer(this.getNextTaskId);
                },
                reject: () => {
                    this.sendBackToQueue();
                }
            });
        } else {
            this._confirmationService.confirm({
                message: placeInQueueMessage,
                accept: () => {
                    this.sendBackToQueue();
                }
            });
        }
    }

    public sendBackToQueue() {

        // console.log('firing event from getnext container 1');
        this._refreshGetNextQueueService.fireEvent('getnext container');

        this.setGetNextTaskStatus(this.getNextTaskId, this.originalStatus);

        if (!this.isDevelopmentMode) {
            closeGetNextItem(this.getNextTaskId, this.memberId);
        }

        let ev = new Event('refreshGetNextQueue', {'bubbles': true, 'cancelable': false});
        window.dispatchEvent(ev);
    }

    public setGetNextMenuState() {

        this.getNextMenuOpen = !this.getNextMenuOpen;

        if (this.getNextMenuOpen) {
            document.getElementById('getNextBody').style.marginLeft = '200px';
            document.getElementById('leftMenu').style.width = '200px';
            document.getElementById('leftMenu').style.display = 'block';
        } else {
            document.getElementById('getNextBody').style.marginLeft = '0px';
            document.getElementById('leftMenu').style.display = 'none';
        }
    }

    public setNotePanelState() {

        this.notePanelOpen = !this.notePanelOpen;

        if (this.notePanelOpen) {
            document.getElementById('getNextBody').style.marginRight = '300px';
            document.getElementById('rightMenu').style.width = '300px';
            document.getElementById('rightMenu').style.display = 'block';
        } else {
            document.getElementById('getNextBody').style.marginRight = '0px';
            document.getElementById('rightMenu').style.display = 'none';
        }
    }

    public openMemberChart() {
        this.addActivityLog('Open Member Chart');

        try {
            window['openMemberChart'](this.memberId);
            // call the GWT jsni exposed Javascript method for opening a member chart.
            openMemberChart(this.memberId);
        } catch (error) {
            this.showErrorMessage('An error occurred opening the Member Chart: ' + error);
        }

        this.log('open the member chart for member: ' + this.memberId);
    }

    public openMemberCalendar() {
        this.toolbarClickedMemberCalendar = true;
        this.toolbarClickedGeneralAssessment = false;
        this.toolbarClickedCareplan = false;
        this.toolbarClickedHome = false;

        this.hideAPCareplan = true;
        this.hideGeneralAssessment = true;
        this.hideHomeGetNextItem = true;
        this.hideCalendar = false;

        // this.memberCalendar.setMemberName(this.memberFullName);

        this.addActivityLog('View Member Calendar');
        this.log('View the member calendar for member: ' + this.memberId);
    }

    public openCarePlan() {
        this.toolbarClickedCareplan = true;
        this.toolbarClickedGeneralAssessment = false;
        this.toolbarClickedMemberCalendar = false;
        this.toolbarClickedHome = false;

        this.hideCalendar = true;
        this.hideGeneralAssessment = true;
        this.hideHomeGetNextItem = true;
        this.hideAPCareplan = false;
        this.addActivityLog('View Careplan');
        this.log('View the member care plan UI for member: ' + this.memberId);
    }

    public openHomeView() {
        this.toolbarClickedHome = true;
        this.toolbarClickedGeneralAssessment = false;
        this.toolbarClickedCareplan = false;
        this.toolbarClickedMemberCalendar = false;

        this.hideCalendar = true;
        this.hideGeneralAssessment = true;
        this.hideAPCareplan = true;
        this.hideHomeGetNextItem = false;
        this.addActivityLog('View original getnext item');
        this.log('View the original getnext item');
    }

    public openMemberDemographics() {
        this.addActivityLog('View Demographics');
        this.memberDemographicsDialog.showDialog(this.memberId, this.userId);
        this.log('View the demographics dialog for member: ' + this.memberId);
    }

    public openCareGiver() {
        this.addActivityLog('View Caregiver');
        this.careGiverDialog.initFormView(this.memberId);
    }

    public openPCP() {
        this.addActivityLog('View PCP');
        this.memberPCPDialog.showDialog(this.memberId, this.userId);
        this.log('View the member pcp dialog for member: ' + this.memberId);
    }

    public openGeneralAssessment() {
        this.toolbarClickedGeneralAssessment = true;
        this.toolbarClickedCareplan = false;
        this.toolbarClickedMemberCalendar = false;
        this.toolbarClickedHome = false;

        this.hideAPCareplan = true;
        this.hideCalendar = true;
        this.hideHomeGetNextItem = true;
        this.hideGeneralAssessment = false;
        this.addActivityLog('Start General Assessment');
        this.log('Start the general assessment: ' + this.memberId);
    }

    public setMemberFullName(memberFullName) {
        this.log('member full name: ' + memberFullName);

        this.memberFullName = memberFullName;
    }

    private areChildrenUIsDirty(getNextQueueItemId: number): boolean {

        this.log('entering angular areChildrenUIsDirty. local id: [' + this.getNextTaskId
            + '], provided id: [' + getNextQueueItemId + ']');

        let noteIsDirty: boolean = this.chartNotePanel.isNoteDirty();
        this.log('areChildrenUIsDirty, note panel is dirty: ' + noteIsDirty);

        let carePlanIsDirty: boolean = this.carePlanPanel === null
            || this.carePlanPanel === undefined ? false : this.carePlanPanel.isCarePlanDirty();
        this.log('areChildrenUIsDirty, careplan is dirty: ' + carePlanIsDirty);

        this.log('returning: ' + (noteIsDirty || carePlanIsDirty));

        return noteIsDirty || carePlanIsDirty;
    }

    private saveGetNextContainer(getNextQueueItemId: number): boolean {

        this.log('in saveGetNextContainer with ' + getNextQueueItemId);

        // save notes and careplan
        try {
            this.chartNotePanel.saveNote();
        } catch (e) {
            // return a negative success value
            this.log('got error: ' + e);
            return false;
        }

        this.log('saveGetNextContainer, about to return: ' + true);
        return true;
    }

    private setGetNextTaskStatus(getNextTaskId: number, status: string) {

        this._getNextContainerService.setGetNextTaskStatus(getNextTaskId.toString(), status)
            .subscribe(
                result => {
                    if (result.statusCode !== '200') {
                        this.handleError(result.errorMessage, 'An error occurred saving the GetNext Task Status (' + status + ').');
                    }
            },
            err => {
                this.handleError(err.toString(),
                    'An error occurred saving the GetNext Task Status (' + status + ').');
            },
            () => {
            });
    }

    private initializeChartNote() {
        let firstLogMessage: string = 'Open GetNext item XYZ for member: ' + this.memberId;
        this.chartNotePanel.initFormView(this.memberId, this.userId, firstLogMessage);
    }

    private showAssessment() {
        this.typeAssessment = true;
    }

    private showCareplan() {
        this.typeCareplan = true;
    }

    private addActivityLog(activity: string) {
        this.chartNotePanel.addActivityLog(activity);
    }

    private getGetNextUIDefinition() {

        if (this.getNextUiDefinition.length === 0) {
            this.getWindowDefinition('w_get_next_container')
                .subscribe(
                windowDefinition => {
                    this.getNextUiDefinition = windowDefinition;
                    this.setToolbarTooltips();
                },
                err => {
                    this.handleError(err.toString(), 'An error occurred retrieving the getnext container window definition.');
                },
                () => {
                });
        }
    }

    private setToolbarTooltips() {
        this.log('this.getNextUiDefinition: ' + this.getNextUiDefinition);
        for (let row of this.getNextUiDefinition) {
            if (row.fieldId === 'toolbar_assessment') {
                this.tipAssessment = row.fieldLabel;
            } else if (row.fieldId === 'toolbar_calendar') {
                this.tipCalendar = row.fieldLabel;
            } else if (row.fieldId === 'toolbar_caregiver') {
                this.tipCaregiver = row.fieldLabel;
            } else if (row.fieldId === 'toolbar_careplan') {
                this.tipCareplan = row.fieldLabel;
            } else if (row.fieldId === 'toolbar_demographics') {
                this.tipDemographics = row.fieldLabel;
            } else if (row.fieldId === 'toolbar_member_chart') {
                this.tipMemberChart = row.fieldLabel;
            } else if (row.fieldId === 'toolbar_note') {
                this.tipNote = row.fieldLabel;
            } else if (row.fieldId === 'toolbar_pcp') {
                this.tipPCP = row.fieldLabel;
            }
        }
    }

    private setToolbarForCareplanMode() {
        this.showGeneralAssessmentToolbarButton = true;
        this.showMemberDemographicsToolbarButton = false;
        this.showMemberCaregiverToolbarButton = false;
        this.showMemberPCPToolbarButton = false;
        this.showCareplanToolbarButton = false;
    }

    private setToolbarForAssessmentMode() {

        if (this.assessmentType === 'GENERAL') {
            this.showGeneralAssessmentToolbarButton = false;
            this.showMemberDemographicsToolbarButton = false;
            this.showMemberCaregiverToolbarButton = false;
            this.showMemberPCPToolbarButton = false;
            this.showCareplanToolbarButton = false;
        } else {
            this.showGeneralAssessmentToolbarButton = false;
            this.showMemberDemographicsToolbarButton = true;
            this.showMemberCaregiverToolbarButton = true;
            this.showMemberPCPToolbarButton = true;
            this.showCareplanToolbarButton = true;
        }
    }

    private setMemberPcp(pcp: string)
    {
        this.memberPCP = pcp;
    }
}
