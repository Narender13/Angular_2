
import { ActivatedRoute } from '@angular/router';
import { Component, ViewEncapsulation, OnInit, OnDestroy, Input, ViewChild, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormControl, Validators, FormBuilder } from '@angular/forms';
import { ConfirmationService, MenuItem } from 'primeng/primeng';
import { Observable } from 'rxjs/Observable';
import * as _ from 'underscore';
import {
    ApAssessmentDto, ApAssessmentNavigationRequestDto,
    AssessmentInfoDto, ApAssessmentViewRequestDto,
    ApAssessmentStartRequestDto, ApAnswerRequestDto,
    QuestionType, ApAssessmentListResponseDto,
    ApAssessmentListRequestDto,
    ApAssessmentViewDto, ApAssessmentSubmitRequestDto,
    AssessmentType, AssessmentStatusType, AssessmentActionType
} from './ap-assessment.dtos';
import {
    MemberHeaderComponent,
    MemberHeaderService
} from './../member-header';
import { GapStatementComponent } from './ap-gapstatement.component';
import { WindowDefinitionService } from './../../common/window.definition/window.definition.service';
import { BaseComponent } from './../../common/base.component';
import { ConfigurationService } from './../../common/configuration.service';
import { ShowDialogService } from './../../common/show.dialog.service';
import { ApAssessmentService } from './ap-assessment.service';
import { MemberDetailsDto } from './../member-header/member-header.dtos';
import { MemberCalendarComponent, MemberCalendarService } from './../calendar/member';


declare function notifyAssessment(): void;

@Component({
    selector: 'apAssessment',
    encapsulation: ViewEncapsulation.None,
    template: `
    <div [ngSwitch]="isGeneralAssessment">
      <template [ngSwitchCase]="true"> ${require('./ap-assessment-general.component.html')} </template>
      <template ngSwitchDefault> ${require('./ap-assessment.component.html')} </template>
    </div>`,
    styleUrls: ['ap-assessment.component.css'],
    providers: [ApAssessmentService, MemberHeaderComponent, MemberHeaderService,
        WindowDefinitionService, ConfirmationService, ShowDialogService, GapStatementComponent]
})
export class ApAssessmentComponent extends BaseComponent implements OnInit, OnDestroy {

    @Input() memberId: string = null;
    @Input() assessmentType: string = null;
    @Input() assessmentAlgorithmId: string = null;
    @Input() assessmentAction: string = null;
    @Output() onSetMemberAssessmentId = new EventEmitter<String>();
    @Output() onNotifyQuestionnaireEnd: EventEmitter<boolean> = new EventEmitter<boolean>();

    @ViewChild(MemberCalendarComponent) memberCalendar: MemberCalendarComponent;
    @ViewChild(GapStatementComponent) gapStatementComponent: GapStatementComponent;

    // UI display controls
    isGeneralAssessment: boolean = false;
    isLoading: boolean = false;
    isRecommendedSkillSetNull: boolean = false;
    isCalendarIconClicked: boolean = false;
    isSaveExit: boolean = false;
    isSubmit: boolean = false;
    isRequired: boolean = false;
    waitingLaunch: boolean = false;
    activeMenuId: string = null;
    setMargin: string;

    // Assessment navigation tracking - ids, status etc
    activeMiniAssessment: AssessmentInfoDto;
    memberAssessmentId: string = null;
    assessmentStatus: string = '';

    // DTOs
    assessmentStartRequest: ApAssessmentStartRequestDto = null;
    apAssessmentDto: ApAssessmentDto = null;
    apAssessmentViewDto: ApAssessmentViewDto = null;
    // apAssessmentListResponseDto: ApAssessmentListResponseDto = null; // TODO:to remove

    miniAssessmentList: AssessmentInfoDto[];

    // Answers from previous pending/completed assessment
    previousAnswerList: String[] = [];
    previousAnswerText: string = null;
    providedAnswerList: String[] = [];
    providedAnswerText: string = null;
    priorAssessmentAnswer: any;

    questionType: string = null;
    questionId: string = null;
    answerList: ApAnswerRequestDto[] = [];

    // For value entry height/weight questions
    providedFeet: string = null;
    providedInches: string = null;
    providedAppointmentMonth: string = null;
    providedAppointmentDay: string = null;
    providedAppointmentYear: string = null;
    pcpAppointmentDate: Date;

    gapStatment: any;
    index: number = -1; // TODO: This variable and the place it is used need to be refactored


    constructor(
        private _memberBannerService: MemberHeaderService,
        private _apAssessmentService: ApAssessmentService, private _confirmationService: ConfirmationService,
        private _showDialogService: ShowDialogService,
        private _windowDefinitionService: WindowDefinitionService, private _route: ActivatedRoute) {

        super(_route, _windowDefinitionService);
    }

    public ngOnInit() {
        this.pcpAppointmentDate = new Date();

        if (!this.assessmentAction) {
            this._route.params.subscribe(
                (param: String) => {
                    console.log('assessment route param', param);
                    this.assessmentType = param['assessmentType'];
                }
            );

            this._route.queryParams.subscribe(
                (param: String) => {
                    console.log('assessment queryParams.param', param);
                    this.assessmentAction = param['assessmentAction'];
                    this.assessmentType = this.assessmentType ? this.assessmentType : param['assessmentType'];
                    this.memberId = param['memberId'];
                    this.assessmentAlgorithmId = param['assessmentAlgorithmId'];
                    this.memberAssessmentId = param['memberAssessmentId'];
                }
            );
            if (!this.memberId || !this.assessmentAction || !this.assessmentType) {
                this.handleError(null, 'Did not receive enough information to start assessment.');
                return;
            } else {
                this.performAssessment();
            }
        }

        if (this.assessmentAction === AssessmentActionType[AssessmentActionType.GETNEXT_START]) {
            this.log('Assessment launched from GetNext with memberId:' + this.memberId + ',assessmentAction:' +
                this.assessmentAction + ', assessmentType:' + this.assessmentType + ', assessmentAlgorithmId:'
                + this.assessmentAlgorithmId + ', memberAssessmentId:' + this.memberAssessmentId);

            if (!this.memberId || !this.assessmentAction || !this.assessmentType || !this.assessmentAlgorithmId) {
                this.handleError(null, 'Did not receive enough information from GetNext to start assessment.');
            } else {
                this.getMemberAssessmentId().then(apAssessmentResponse => {
                    if (apAssessmentResponse.apiStatus.statusCode === this.API_RESPONSE.SUCCESS) {
                        this.memberAssessmentId = apAssessmentResponse.memberAssessmentId;
                        this.assessmentAction = AssessmentActionType[AssessmentActionType.CONTINUE];
                        this.performAssessment();
                    } else if (apAssessmentResponse.apiStatus.statusCode === this.API_RESPONSE.NO_DATA_FOUND) {
                        this.assessmentAction = AssessmentActionType[AssessmentActionType.START];
                        this.performAssessment();
                    } else {
                        let message = 'An error occurred starting the assessment.';
                        this.handleError(apAssessmentResponse.apiStatus.errorStackTrace, message,
                            'Unable to get service response:');
                    }
                });
            }
        } else {
            this.handleError(null, 'Did not receive enough information to perform assessment.');
        }
    }

    public ngOnDestroy() {
    }

    // TODO: Need a review of this
    public handleNoneOfAbove(e, answer) {
        if (answer.isExclusive && e) {
            this.providedAnswerList = [];
            this.providedAnswerList.push(answer.answerId);
            this.index = this.providedAnswerList.indexOf(answer.answerId);
        } else {
            if (this.index > -1) {
                this.providedAnswerList = [];
                this.providedAnswerList.push(answer.answerId);
                this.index = -1;
            }
        }
    }

    public onClickCalendarIcon() {
        this.isCalendarIconClicked = true;
        this.onNotifyQuestionnaireEnd.emit(true);
    }

    public onClickNextQuestion() {
        if (this.isUserInputValid() === false) {
            this._confirmationService.confirm({
                message: 'This question is required. Please supply an answer and select Next to continue.',
                header: 'Required Question'
            });
        } else if (this.isUserInputInrange() === false) {
            this._confirmationService.confirm({
                message: this.getUserInputOutofRangeErrorMessage(),
                header: 'Validator Error'
            });
        } else {
            this.isLoading = true;
            this._showDialogService.isHelpVisible = false;

            return this._apAssessmentService.navigateToNext(
                this.createNavigationRequestDto(this.providedAnswerList, this.providedAnswerText)).subscribe(
                apAssessmentResponse => {
                    this.apAssessmentDto = apAssessmentResponse;
                    if (apAssessmentResponse.apiStatus.statusCode === this.API_RESPONSE.SUCCESS) {
                        this.setValues(apAssessmentResponse);
                        this.setAnswer(apAssessmentResponse);
                        this.setPreviousAnswer(apAssessmentResponse);
                    } else {
                        let message = 'An error occurred navigating to the next assessment question.';
                        this.handleError(apAssessmentResponse.apiStatus.errorStackTrace, message, 'Navigate Assessment:');
                    }
                },
                error => {
                    let message = 'An error occurred navigating to the next assessment question.';
                    this.handleError(error.toString(), message, 'Navigate Assessment:');
                },
                () => {
                    this.isLoading = false;
                    this.log('Assessment Data' + JSON.stringify(this.apAssessmentDto));
                });
        }
    }

    public onClickPreviousQuestion() {
        if (this.isPreviousAnswerValid() === false) {
            this._confirmationService.confirm({
                message: 'This question is required. Please supply an answer and select Previous to continue.',
                header: 'Required Question'
            });
        } else if (this.isUserInputInrange() === false) {
            this._confirmationService.confirm({
                message: this.getUserInputOutofRangeErrorMessage(),
                header: 'Validator Error'
            });
        } else {
            this.isLoading = true;
            this._showDialogService.isHelpVisible = false;
            return this._apAssessmentService.navigateToPrevious(
                this.createNavigationRequestDto(this.providedAnswerList, this.providedAnswerText)).subscribe(
                apAssessmentResponse => {
                    this.apAssessmentDto = apAssessmentResponse;
                    if (apAssessmentResponse.apiStatus.statusCode === this.API_RESPONSE.SUCCESS) {
                        this.setValues(apAssessmentResponse);
                        this.setAnswer(apAssessmentResponse);
                        this.setPreviousAnswer(apAssessmentResponse);
                        console.log('providedAnswerList', this.providedAnswerList, this.providedAnswerText);
                    } else {
                        let message = 'An error occurred navigating to the previous assessment question.';
                        this.handleError(apAssessmentResponse.apiStatus.errorStackTrace, message, 'Navigate Assessment:');
                    }
                },
                error => {
                    let message = 'An error occurred navigating to the previous assessment question.';
                    this.handleError(error.toString(), message, 'Navigate Assessment:');
                },
                () => {
                    this.isLoading = false;
                    this.log('Assessment Data' + JSON.stringify(this.apAssessmentDto));
                });
        }
    }

    public onClickSubmit() {
        if (this.isGeneralAssessment) {
            this.submitGeneralAssessment();
        } else {
            this.submitAssessment();
        }
    }

    public onClickSave(assessmentDto: AssessmentInfoDto = null) {
        if (this.isGeneralAssessment) {
            this.saveGeneralAssessment(assessmentDto);
        } else {
            this.saveAssessment();
        }
    }

    private performAssessment() {
        if (!this.assessmentAction || !this.assessmentType) {
            this.handleError(null, 'Did not receive enough information from GetNext to start assessment.');
            return;
        }

        if (this.isAssessmentActionStart()) {
            if (this.assessmentType === AssessmentType[AssessmentType.GENERAL]) {
                this.listGeneralAssessment();
            } else if (this.assessmentType === AssessmentType[AssessmentType.CARETRACK]) {
                this.isGeneralAssessment = false;
                this.startAssessment();
            }
        } else if (this.isAssessmentActionContinue()) {
            if (this.assessmentType === AssessmentType[AssessmentType.GENERAL]) {
                this.listGeneralAssessment();
            } else if (this.assessmentType === AssessmentType[AssessmentType.CARETRACK]) {
                this.isGeneralAssessment = false;
                this.continueAssessment();
            }
        } else if (this.isAssessmentActionView()) {
            if (this.assessmentType === AssessmentType[AssessmentType.GENERAL]) {
                this.listGeneralAssessment();
            } else if (this.assessmentType === AssessmentType[AssessmentType.CARETRACK]) {
                this.isGeneralAssessment = false;
                this.fetchCompletedAssessmentDetails();
            }
        }
    }

    private setValues(assessmentDto) {
        this.memberAssessmentId = assessmentDto.memberAssessmentId;
        this.questionId = assessmentDto.question.questionId;
        this.questionType = assessmentDto.question.questionType;
        this.isRequired = assessmentDto.question.isRequired;
        this.assessmentStatus = assessmentDto.assessmentStatus;
    }

    private createAssessmentStartRequestDto(): ApAssessmentStartRequestDto {
        return {
            memberId: this.memberId,
            assessmentAlgorithmId: this.assessmentAlgorithmId,
        };
    }

    private createAssessmentContinueRequestDto(): ApAssessmentViewRequestDto {
        return {
            memberId: this.memberId,
            memberAssessmentId: this.memberAssessmentId,
        };
    }

    private createAssessmentViewRequestDto(): ApAssessmentViewRequestDto {
        return {
            memberId: this.memberId,
            memberAssessmentId: this.memberAssessmentId
        };
    }

    private listGeneralAssessment() {
        if (!this.memberId) {
            console.log('Invalid member id');
            return;
        }

        this.isGeneralAssessment = true;
        this.isLoading = true;

        let assessmentListRequest: ApAssessmentListRequestDto = null;

        if (this.assessmentAction === AssessmentActionType[AssessmentActionType.START]) {
            assessmentListRequest = {
                memberId: this.memberId,
                parentAssessmentId: this.assessmentAlgorithmId,
            };
        } else {
            assessmentListRequest = {
                memberId: this.memberId,
                memberAssessmentId: this.memberAssessmentId
            };
        }

        this._apAssessmentService.listAssessment(assessmentListRequest).subscribe(
            apGroupAssessmentListResponse => {
                // this.apAssessmentListResponseDto = apGroupAssessmentListResponse; // TODO: to remove
                this.miniAssessmentList = apGroupAssessmentListResponse.assessmentList;
                if (apGroupAssessmentListResponse.apiStatus.statusCode === this.API_RESPONSE.SUCCESS) {
                    let miniAssessmentSelected: AssessmentInfoDto = this.getNextMiniAssessmentToDisplay();
                    this.loadMiniAssessment(miniAssessmentSelected);
                    notifyAssessment();
                } else {
                    let message = 'An error occurred retrieving the assessment list.';
                    this.handleError(apGroupAssessmentListResponse.apiStatus.errorStackTrace, message, 'List Assessments:');
                }
            },
            error => {
                let message = 'An error occurred retrieving the assessment list.';
                this.handleError(error.toString(), message, 'List Assessments:');
            },
            () => {
                this.log('Group Assessment List' + JSON.stringify(this.miniAssessmentList));
            });
    }

    private startAssessment(assessmentAlgorithmId?: string): Promise<ApAssessmentDto> {
        if (!this.memberId) {
            super.log('Invalid memberId');
            return;
        }

        this.isLoading = true;
        this.waitingLaunch = true;
        this.clearDisplayData();
        if (assessmentAlgorithmId) {
            this.assessmentAlgorithmId = assessmentAlgorithmId;
        }

        return new Promise(resolve => {
            this._apAssessmentService.startNewAssessment(this.createAssessmentStartRequestDto()).subscribe(
                apAssessmentResponse => {
                    this.apAssessmentDto = apAssessmentResponse;
                    if (apAssessmentResponse.apiStatus.statusCode === this.API_RESPONSE.SUCCESS) {
                        this.setValues(apAssessmentResponse);
                        this.setAnswer(apAssessmentResponse);
                        this.setPreviousAnswer(apAssessmentResponse);
                        this.onSetMemberAssessmentId.emit(apAssessmentResponse.memberAssessmentId);
                        this.gapStatment = apAssessmentResponse;
                        resolve(apAssessmentResponse);
                    } else {
                        let message = 'An error occurred starting the assessment.';
                        this.handleError(apAssessmentResponse.apiStatus.errorStackTrace, message,
                            'Could Not Retrieve Content:');
                    }
                },
                error => {
                    let message = 'An error occurred starting the assessment.';
                    this.handleError(error.toString(), message);
                },
                () => {
                    this.isLoading = false;
                    this.waitingLaunch = false;
                    this.log('Assessment Data' + JSON.stringify(this.apAssessmentDto));
                });
        });
    }

    private continueAssessment(memberAssessmentId?: string): Promise<ApAssessmentDto> {
        if (!this.memberId) {
            super.log('Invalid memberId');
            return;
        }

        this.isLoading = true;
        this.waitingLaunch = true;
        this.clearDisplayData();

        if (memberAssessmentId) {
            this.memberAssessmentId = memberAssessmentId;
        }

        return new Promise(resolve => {
            this._apAssessmentService.continueAssessment(this.createAssessmentContinueRequestDto()).subscribe(
                apAssessmentResponse => {
                    this.apAssessmentDto = apAssessmentResponse;
                    if (apAssessmentResponse.apiStatus.statusCode === this.API_RESPONSE.SUCCESS) {
                        this.setValues(apAssessmentResponse);
                        this.setAnswer(apAssessmentResponse);
                        this.setPreviousAnswer(apAssessmentResponse);
                        this.onSetMemberAssessmentId.emit(apAssessmentResponse.memberAssessmentId);
                        this.gapStatment = apAssessmentResponse;
                        resolve(apAssessmentResponse);
                    } else {
                        let message = 'An error occurred continuing the assessment.';
                        this.handleError(apAssessmentResponse.apiStatus.errorStackTrace, message,
                            'Could Not Retrieve Content:');
                    }
                },
                error => {
                    let message = 'An error occurred continuing the assessment.';
                    this.handleError(error.toString(), message);
                },
                () => {
                    this.isLoading = false;
                    this.waitingLaunch = false;
                    this.log('Assessment Data' + JSON.stringify(this.apAssessmentDto));
                });
        });
    }

    private fetchCompletedAssessmentDetails(memberAssessmentId?: string) {
        this.isLoading = true;
        if (memberAssessmentId) {
            this.memberAssessmentId = memberAssessmentId;
        }

        this.isLoading = true;
        this.waitingLaunch = true;
        this.clearDisplayData();

        return this._apAssessmentService.getCompletedAssessmentDetail(this.createAssessmentViewRequestDto()).subscribe(
            apAssessmentResponse => {
                this.apAssessmentViewDto = apAssessmentResponse;
                this.assessmentStatus = this.apAssessmentViewDto.assessmentStatus;
            },
            error => this.log('Error HTTP GET Service'),
            () => {
                this.isLoading = false;
                this.waitingLaunch = false;
                this.log('Completed Assessment Details' + JSON.stringify(this.apAssessmentViewDto));
            });
    }

    private getMemberAssessmentId(): Promise<ApAssessmentDto> {
        this.isLoading = true;
        this.waitingLaunch = true;
        this.clearDisplayData();

        return new Promise(resolve => {
            this._apAssessmentService.getMemberAssessmentId(this.createAssessmentStartRequestDto()).subscribe(
                apAssessmentResponse => {
                    resolve(apAssessmentResponse);
                },
                error => {
                    let message = 'An error occurred starting the assessment.';
                    this.handleError(error.toString(), message);
                },
                () => {
                    this.isLoading = false;
                    this.waitingLaunch = false;
                    this.log('Assessment Data' + JSON.stringify(this.apAssessmentDto));
                });
        });
    }

    private clearDisplayData() {
        this.apAssessmentDto = null;
        this.apAssessmentViewDto = null;
        this._showDialogService.isHelpVisible = false;
        this._showDialogService.isSubmit = false;
    }

    private isPreviousAnswerValid(): boolean {
        let isValid: boolean = true;

        if (this.questionType === QuestionType[QuestionType.FREE_TEXT]) {
            if (this.previousAnswerText !== null) {   // was if (this.previousAnswerText != undefined) {
                if (this.previousAnswerText !== null || this.previousAnswerText !== '') {
                    if (this.providedAnswerText === null || this.providedAnswerText === '') {
                        isValid = false;
                    }
                }
            }
        } else if (this.questionType === QuestionType[QuestionType.MULTIPLE_CHOICE_SINGLE_SELECT]
            || this.questionType === QuestionType[QuestionType.MULTIPLE_CHOICE_MULTIPLE_SELECT]) {
            if (this.previousAnswerList.length > 0) {
                if (this.providedAnswerList === null || this.providedAnswerList.length === 0) {
                    isValid = false;
                }
            }
        } else if (this.questionType === QuestionType[QuestionType.VALUEENTRY_WEIGHT]) {
            if (this.previousAnswerText !== null) {
                if (this.providedAnswerList == null || this.providedAnswerText === '') {
                    isValid = false;
                }
            }
        } else if (this.questionType === QuestionType[QuestionType.VALUEENTRY_HEIGHT]) {
            let feetMax = this.apAssessmentDto.question.responseUOM[0].value_maximum;
            let feetMin = this.apAssessmentDto.question.responseUOM[0].value_minimum;
            let inchMax = this.apAssessmentDto.question.responseUOM[1].value_maximum;
            let inchMin = this.apAssessmentDto.question.responseUOM[1].value_minimum;
            if (this.isRequired && ((this.providedFeet == null || this.providedFeet === '')
                && (this.providedInches == null || this.providedInches === '')
                || (Number(this.providedFeet) === 0 && Number(this.providedInches) === 0))) {
                isValid = false;
            }
        } else if (this.questionType === QuestionType[QuestionType.VALUEENTRY_DATE]) {
            if (this.isRequired && (this.pcpAppointmentDate == null)) {
                isValid = false;
            }
        }

        return isValid;
    }

    private isPreviousAssessmentComplete(): boolean {
        if (this.assessmentStatus === AssessmentStatusType[AssessmentStatusType.COMPLETE]) {
            return true;
        } else {
            return false;
        }
    }

    private loadMiniAssessment(miniAssessmentInfo: AssessmentInfoDto) {
        this.activeMiniAssessment = miniAssessmentInfo;
        this.assessmentAlgorithmId = miniAssessmentInfo.assessmentAlgorithmId;
        this.memberAssessmentId = miniAssessmentInfo.memberAssessmentId;
        this.activeMenuId = this.assessmentAlgorithmId;

        if (miniAssessmentInfo.assessmentStatus === AssessmentStatusType[AssessmentStatusType.COMPLETE]) {
            this.fetchCompletedAssessmentDetails(miniAssessmentInfo.memberAssessmentId);
        } else {
            this.continueAssessment(miniAssessmentInfo.memberAssessmentId).then(apAssessmentDto => {
                miniAssessmentInfo.memberAssessmentId = apAssessmentDto.memberAssessmentId;
                if (apAssessmentDto.assessmentStatus === AssessmentStatusType[AssessmentStatusType.COMPLETE]) {
                    miniAssessmentInfo.assessmentStatus = apAssessmentDto.assessmentStatus;
                }
            });
        }
    }

    private saveGeneralAssessment(assessmentInfoDto: AssessmentInfoDto = null) {
        if (this.isPreviousAnswerValid() === false) {
            this._confirmationService.confirm({
                message: 'This question is required. Please supply an answer and select Save and Exit to continue.',
                header: 'Required Question'
            });
        } else if (this.isUserInputInrange() === false) {
            this._confirmationService.confirm({
                message: this.getUserInputOutofRangeErrorMessage(),
                header: 'Validator Error'
            });
        } else {
            this.isLoading = true;
            if (this.isPreviousAssessmentComplete() && assessmentInfoDto) {
                this.loadMiniAssessment(assessmentInfoDto);
            } else {
                return this._apAssessmentService.saveAssessment(
                    this.createNavigationRequestDto(this.providedAnswerList, this.providedAnswerText)).subscribe(
                    apAssessmentResponse => {
                        this.apAssessmentDto = apAssessmentResponse;
                        if (apAssessmentResponse.apiStatus.statusCode === this.API_RESPONSE.SUCCESS) {
                            if (assessmentInfoDto) {
                                this.loadMiniAssessment(assessmentInfoDto);
                            } else {
                                this.isSaveExit = true;
                            }
                        } else {
                            let message = 'An error occurred saving the assessment.';
                            this.handleError(apAssessmentResponse.apiStatus.errorStackTrace, message,
                                'Save Assessment:');
                        }
                    },
                    error => {
                        this.isLoading = false;
                        let message = 'An error occurred saving the assessment.';
                        this.handleError(error.toString(), message, 'Save Assessment:');
                    },
                    () => {
                        this.log('Assessment Data' + JSON.stringify(this.apAssessmentDto));
                    });
            }
        }
    }

    private saveAssessment() {

        if (this.isPreviousAnswerValid() === false) {
            this._confirmationService.confirm({
                message: 'This question is required. Please supply an answer and select Save and Exit to continue.',
                header: 'Required Question'
            });
        } else if (this.isUserInputInrange() === false) {
            this._confirmationService.confirm({
                message: this.getUserInputOutofRangeErrorMessage(),
                header: 'Validator Error'
            });
        } else {
            this.isLoading = true;
            this.isRecommendedSkillSetNull = false;
            return this._apAssessmentService.saveAssessment(
                this.createNavigationRequestDto(this.providedAnswerList, this.providedAnswerText)).subscribe(
                apAssessmentResponse => {
                    this.apAssessmentDto = apAssessmentResponse;

                    if (apAssessmentResponse.apiStatus.statusCode === this.API_RESPONSE.SUCCESS) {
                        this.setValues(apAssessmentResponse);
                    } else {
                        let message = 'An error occurred saving the assessment.';
                        this.handleError(apAssessmentResponse.apiStatus.errorStackTrace, message,
                            'Save Assessment:');
                    }
                    this.isSaveExit = true;
                    this.isLoading = false;
                },
                error => {
                    let message = 'An error occurred saving the assessment.';
                    this.handleError(error.toString(), message, 'Save Assessment:');
                },
                () => {
                    this.log('Assessment Data' + JSON.stringify(this.apAssessmentDto));
                });
        }
    }

    private getNextMiniAssessmentToDisplay(): AssessmentInfoDto {
        let nextAssessmentToDisplay: AssessmentInfoDto = null;
        if (this.isAssessmentActionView()) {
            if (this.activeMiniAssessment) {
                let index: number = _.indexOf(this.miniAssessmentList, this.activeMiniAssessment);
                if (index < this.miniAssessmentList.length) {
                    nextAssessmentToDisplay = this.miniAssessmentList[index + 1];
                }
            }
        } else {
            nextAssessmentToDisplay = _.find(this.miniAssessmentList, assessment => {
                if (!this.activeMiniAssessment) {
                    return assessment.assessmentStatus !== AssessmentStatusType[AssessmentStatusType.COMPLETE];
                } else {
                    return assessment.assessmentStatus !== AssessmentStatusType[AssessmentStatusType.COMPLETE] &&
                        assessment.memberAssessmentId !== this.activeMiniAssessment.memberAssessmentId;
                }

            });
        }

        if (!nextAssessmentToDisplay) {
            nextAssessmentToDisplay = this.miniAssessmentList[0];
        }
        return nextAssessmentToDisplay;
    }

    private isAssessmentActionStart(): boolean {
        return this.assessmentAction === AssessmentActionType[AssessmentActionType.START];
    }

    private isAssessmentActionContinue(): boolean {
        return this.assessmentAction === AssessmentActionType[AssessmentActionType.CONTINUE];
    }

    private isAssessmentActionView(): boolean {
        return this.assessmentAction === AssessmentActionType[AssessmentActionType.VIEW];
    }

    private submitGeneralAssessment() {
        this.isLoading = true;
        let assessmentSubmitRequestDto: ApAssessmentSubmitRequestDto = {
            memberId: this.memberId,
            memberAssessmentId: this.memberAssessmentId,
        };

        return this._apAssessmentService.submitAssessment(assessmentSubmitRequestDto).subscribe(
            apAssessmentResponse => {
                if (apAssessmentResponse.apiStatus.statusCode === this.API_RESPONSE.SUCCESS) {
                    this.apAssessmentDto = apAssessmentResponse;
                    this.activeMiniAssessment.assessmentStatus = AssessmentStatusType[AssessmentStatusType.COMPLETE];
                    let miniAssessmentSelected: AssessmentInfoDto = this.getNextMiniAssessmentToDisplay();
                    this.loadMiniAssessment(miniAssessmentSelected);
                } else {
                    let message = 'An error occurred submitting the assessment.';
                    this.handleError(apAssessmentResponse.apiStatus.errorStackTrace, message,
                        'Submit Assessment:');
                }
                this.isSubmit = true;
            },
            error => {
                this.isLoading = false;
                let message = 'An error occurred submitting the assessment.';
                this.handleError(error.toString(), message, 'Submit Assessment:');
            },
            () => {
                this.log('Assessment Data' + JSON.stringify(this.apAssessmentDto));
            });
    }

    private submitAssessment() {
        this.isLoading = true;
        return this._apAssessmentService.submitAssessment(
            this.createNavigationRequestDto(this.providedAnswerList, this.providedAnswerText)).subscribe(
            apAssessmentResponse => {
                this.apAssessmentDto = apAssessmentResponse;
                if (apAssessmentResponse.apiStatus.statusCode === this.API_RESPONSE.SUCCESS) {
                    if (apAssessmentResponse.answerList) {
                        let text: string = '<p>';
                        for (let i = 0; i < apAssessmentResponse.answerList.length; i++) {
                            text = text + apAssessmentResponse.answerList[i].answerText.baseText + '</p>';
                        }
                        this._showDialogService.showDialog(text, false, true);
                    } else {
                        this.isRecommendedSkillSetNull = true;
                    }
                } else {
                    let message = 'An error occurred submitting the assessment.';
                    this.handleError(apAssessmentResponse.apiStatus.errorStackTrace, message, 'Submit Assessment:');
                }
            },
            error => {
                let message = 'An error occurred submitting the assessment.';
                this.handleError(error.toString(), message, 'Submit Assessment:');
            },
            () => {
                this.isLoading = false;
                this.log('Assessment Data' + JSON.stringify(this.apAssessmentDto));
            });
    }

    private createAnswerList(providedAnswers, providedAnswerText): ApAnswerRequestDto[] {
        this.answerList = [];
        if (this.questionType === QuestionType[QuestionType.FREE_TEXT]) {
            this.answerList.push({ answerId: null, answerText: providedAnswerText });
        } else if (this.questionType === QuestionType[QuestionType.VALUEENTRY_WEIGHT]) {
            this.answerList.push({ answerId: this.apAssessmentDto.question.responseUOM[0].id, answerText: providedAnswerText });
        } else if (this.questionType === QuestionType[QuestionType.VALUEENTRY_HEIGHT]) {
            this.answerList.push({ answerId: this.apAssessmentDto.question.responseUOM[0].id, answerText: this.providedFeet },
                { answerId: this.apAssessmentDto.question.responseUOM[1].id, answerText: this.providedInches });
        } else if (this.questionType === QuestionType[QuestionType.VALUEENTRY_DATE]) {
            this.providedAppointmentMonth = String(this.pcpAppointmentDate.getMonth() + 1);
            this.providedAppointmentDay = String(this.pcpAppointmentDate.getDate());
            this.providedAppointmentYear = String(this.pcpAppointmentDate.getFullYear());
            this.answerList.push(
                { answerId: this.apAssessmentDto.question.responseUOM[0].id, answerText: this.providedAppointmentMonth },
                { answerId: this.apAssessmentDto.question.responseUOM[1].id, answerText: this.providedAppointmentDay },
                { answerId: this.apAssessmentDto.question.responseUOM[2].id, answerText: this.providedAppointmentYear }
            );
        } else if (this.questionType === QuestionType[QuestionType.MULTIPLE_CHOICE_SINGLE_SELECT]
            || this.questionType === QuestionType[QuestionType.MULTIPLE_CHOICE_MULTIPLE_SELECT]) {

            if (providedAnswers instanceof Array && providedAnswers.length > 0) {
                for (let i: number = 0; i < providedAnswers.length; i++) {
                    this.answerList.push({ answerId: providedAnswers[i], answerText: null });
                }
            } else if (providedAnswers instanceof Array && providedAnswers.length === 0) {
                this.answerList.push({ answerId: null, answerText: null });
            } else {
                this.answerList.push({ answerId: providedAnswers, answerText: null });
            }
        }
        this.log('createAnswerList' + JSON.stringify(this.answerList));
        return this.answerList;
    }

    private createNavigationRequestDto(providedAnswers = null, providedAnswerText = null): ApAssessmentNavigationRequestDto {
        if (providedAnswerText === '') {
            providedAnswerText = null;
        }

        if (this.providedFeet === '') {
            this.providedFeet = null;
        }

        if (this.providedInches === '') {
            this.providedInches = null;
        }
        if (this.providedAppointmentMonth === '') {
            this.providedAppointmentMonth = null;
        }
        if (this.providedAppointmentDay === '') {
            this.providedAppointmentDay = null;
        }
        if (this.providedAppointmentYear === '') {
            this.providedAppointmentYear = null;
        }
        if (this.isRequired && providedAnswers.length === 0 && providedAnswerText == null &&
            this.apAssessmentDto.question.questionType.indexOf('VALUEENTRY') < 0) {
            this.questionId = null;
        }
        return {
            memberId: this.memberId,
            memberAssessmentId: this.memberAssessmentId,
            questionId: this.questionId,
            questionType: this.questionType,
            answerList: this.createAnswerList(providedAnswers, providedAnswerText),
            responseMeasureUnitId: this.apAssessmentDto.question.responseMeasureUnit,
        };
    }

    private isUserInputInrange() {
        let isValidRange: boolean = true;
        if (this.questionType === QuestionType[QuestionType.VALUEENTRY_WEIGHT]) {
            isValidRange = (this.checkUOMLimit(this.providedAnswerText, this.apAssessmentDto.question.responseUOM[0].value_minimum,
                this.apAssessmentDto.question.responseUOM[0].value_maximum));
        } else if (this.questionType === QuestionType[QuestionType.VALUEENTRY_HEIGHT]) {
            isValidRange = ((this.checkUOMLimit(this.providedFeet, this.apAssessmentDto.question.responseUOM[0].value_minimum,
                this.apAssessmentDto.question.responseUOM[0].value_maximum)) &&
                (this.checkUOMLimit(this.providedInches, this.apAssessmentDto.question.responseUOM[1].value_minimum,
                    this.apAssessmentDto.question.responseUOM[1].value_maximum)));
        } else if (this.questionType === QuestionType[QuestionType.VALUEENTRY_DATE]) {
            if (this.isRequired && (this.pcpAppointmentDate === null)) {
                isValidRange = false;
            }
        }
        this.log('isUserInputInrange: isValidRange:' + isValidRange);
        return isValidRange;
    }

    private checkUOMLimit(providedAnswerText, minVal, maxVal): boolean {
        if (providedAnswerText === null) {
            return false;
        }
        if (providedAnswerText > (maxVal) || providedAnswerText < minVal) {
            return false;
        } else {
            return true;
        }
    }

    private getUserInputOutofRangeErrorMessage() {
        let validationMessage: string = '';
        if (this.questionType === QuestionType[QuestionType.VALUEENTRY_WEIGHT]) {
            let maxLimitValue = Number(this.apAssessmentDto.question.responseUOM[0].value_maximum);
            let minLimitValue = this.apAssessmentDto.question.responseUOM[0].value_minimum;
            let uomValue = this.apAssessmentDto.question.responseUOM[0].uom;
            validationMessage = 'Value for ' + uomValue + ' must be between ' + minLimitValue + '-' + maxLimitValue;
        }
        if (this.questionType === QuestionType[QuestionType.VALUEENTRY_HEIGHT]) {
            validationMessage = 'Value for ' + this.apAssessmentDto.question.responseUOM[0].uom + ' must be between ' +
                this.apAssessmentDto.question.responseUOM[0].value_minimum + '-' +
                (Number(this.apAssessmentDto.question.responseUOM[0].value_maximum)) + '.' +
                'Value for ' + this.apAssessmentDto.question.responseUOM[1].uom +
                ' must be between ' + this.apAssessmentDto.question.responseUOM[1].value_minimum + '-' +
                (Number(this.apAssessmentDto.question.responseUOM[1].value_maximum)) + '.';
        }
        if (this.questionType === QuestionType[QuestionType.VALUEENTRY_DATE]) {
            validationMessage = 'Please provide a valid date.';
        }
        return validationMessage;
    }

    private isUserInputValid() {
        let isValidInput: boolean = true;

        if (this.questionType === QuestionType[QuestionType.FREE_TEXT]) {
            if (this.providedAnswerText != null) {
                this.providedAnswerText = this.providedAnswerText.trim();
            }
            if (this.isRequired && (this.providedAnswerText == null || this.providedAnswerText === '')) {
                isValidInput = false;
            }
        } else if (this.questionType === QuestionType[QuestionType.MULTIPLE_CHOICE_SINGLE_SELECT]
            || this.questionType === QuestionType[QuestionType.MULTIPLE_CHOICE_MULTIPLE_SELECT]) {

            if (this.isRequired && (this.providedAnswerList == null || this.providedAnswerList.length === 0)) {
                isValidInput = false;
            }
        } else if (this.questionType === QuestionType[QuestionType.VALUEENTRY_WEIGHT]) {
            if (this.isRequired && (this.providedAnswerText == null || this.providedAnswerText === '')) {
                isValidInput = false;
            }
        } else if (this.questionType === QuestionType[QuestionType.VALUEENTRY_DATE]) {
            /* if (this.isRequired && (this.pcpAppointmentDate === null)) {
                isValidInput = false;
             }*/
        } else if (this.questionType === QuestionType[QuestionType.VALUEENTRY_HEIGHT]) {
            let feetMax = this.apAssessmentDto.question.responseUOM[0].value_maximum;
            let feetMin = this.apAssessmentDto.question.responseUOM[0].value_minimum;
            let inchMax = this.apAssessmentDto.question.responseUOM[1].value_maximum;
            let inchMin = this.apAssessmentDto.question.responseUOM[1].value_minimum;
            if (this.isRequired && ((this.providedFeet == null || this.providedFeet === '')
                && (this.providedInches == null || this.providedInches === '')
                || (Number(this.providedFeet) === 0 && Number(this.providedInches) === 0))) {
                isValidInput = false;
            }
        }
        return isValidInput;
    }

    private setAnswer(apAssessmentDto) {
        this.providedAnswerText = null;
        this.providedAnswerList = [];
        this.previousAnswerText = null;
        this.previousAnswerList = [];
        if ((this.questionType === QuestionType[QuestionType.FREE_TEXT])) {

            if (apAssessmentDto.answerList != null && apAssessmentDto.answerList.length > 0) {
                this.providedAnswerText = apAssessmentDto.answerList[0].userResponse;
                this.previousAnswerText = apAssessmentDto.answerList[0].userResponse;
            }
        } else if (this.questionType === QuestionType[QuestionType.MULTIPLE_CHOICE_SINGLE_SELECT]
            || this.questionType === QuestionType[QuestionType.MULTIPLE_CHOICE_MULTIPLE_SELECT]) {

            if (apAssessmentDto.answerList != null) {
                let filteredAnswer = _.filter(apAssessmentDto.answerList, answer => {
                    return answer.userResponse === 'TRUE';
                });
                // let filteredAnswer = apAssessmentDto.answerList.filter(this.hasUserResponse);
                if (filteredAnswer != null) {
                    this.providedAnswerList = _.map(filteredAnswer, i => i.answerId);
                    this.previousAnswerList = _.map(filteredAnswer, i => i.answerId);
                }
            }
        } else if (this.questionType === QuestionType[QuestionType.VALUEENTRY_WEIGHT]) {
            this.providedAnswerText = apAssessmentDto.question.responseUOM[0].value;
        } else if (this.questionType === QuestionType[QuestionType.VALUEENTRY_HEIGHT]) {
            this.providedFeet = apAssessmentDto.question.responseUOM[0].value;
            this.providedInches = apAssessmentDto.question.responseUOM[1].value;

        } else if (this.questionType === QuestionType[QuestionType.VALUEENTRY_DATE]) {
            let pcpAppointmentMonth = apAssessmentDto.question.responseUOM[0].value;
            let pcpAppointmentDate = apAssessmentDto.question.responseUOM[1].value;
            let pcpAppointmentYear = apAssessmentDto.question.responseUOM[2].value;
            let pcpAppointmentCombinedDate = pcpAppointmentMonth + '/' + pcpAppointmentDate + '/' + pcpAppointmentYear;
            if (!((new Date(pcpAppointmentCombinedDate) == null) || (pcpAppointmentCombinedDate === '0/0/0')))
                this.pcpAppointmentDate = new Date(pcpAppointmentCombinedDate);

        }
    }

    private setPreviousAnswer(apAssessmentDto) {
        if (apAssessmentDto.priorAnswerList) {
            if (this.questionType === QuestionType[QuestionType.VALUEENTRY_HEIGHT]) {
                let totalHeightInInches = apAssessmentDto.priorAnswerList[0].answerText.baseText;
                let heightInFeet = Math.floor(totalHeightInInches / 12);
                let heightInInches = totalHeightInInches % 12;
                this.priorAssessmentAnswer = null;
                this.priorAssessmentAnswer = heightInFeet + ' ' + apAssessmentDto.question.responseUOM[0].uom + ' ' +
                    + heightInInches + ' ' + apAssessmentDto.question.responseUOM[1].uom;
            } else if (this.questionType === QuestionType[QuestionType.VALUEENTRY_WEIGHT]) {
                this.priorAssessmentAnswer = apAssessmentDto.priorAnswerList[0].answerText.baseText
                    + ' ' + apAssessmentDto.question.responseUOM[0].uom;
            } else if (this.questionType === QuestionType[QuestionType.VALUEENTRY_DATE]) {
                this.priorAssessmentAnswer = apAssessmentDto.priorAnswerList[0].answerText.baseText;
            } else {
                this.priorAssessmentAnswer = apAssessmentDto.priorAnswerList;
            }
        }
    }
    // // TODO: the callees of this method (the method above) do not pass a variable.  can you clean this up to be accurate
    // private hasUserResponse(obj) {
    //     if (obj.userResponse === 'TRUE') {
    //         return true;
    //     } else if (obj.userResponse === 'FALSE') {
    //         return false;
    //     } else {
    //         return obj.userResponse;
    //     }
    // }

    // // TODO: the callees of this method (the method above) do not pass a variable.  can you clean this up to be accurate
    // private mapAnswerId(obj) {
    //     return obj.answerId;
    // }

    // TODO: This should be replced with ngClass concept
    private alignCalendar(align, val) {
        if (align) {
            this.setMargin = '240px';
        } else {
            this.setMargin = '10px';
        }
    }
}
