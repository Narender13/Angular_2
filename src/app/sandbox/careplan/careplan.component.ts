
import { Component, ViewEncapsulation, OnInit, OnDestroy, Output, EventEmitter } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { FormGroup, FormControl, FormArray, AbstractControl, Validators, FormBuilder } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ConfirmationService, MenuItem, SelectItem } from 'primeng/primeng';
import * as _ from 'underscore';
import { BaseComponent } from './../../common/base.component';
import { ConfigurationService } from './../../common/configuration.service';
import { WindowDefinitionService } from './../../common/window.definition/window.definition.service';
import {
    WindowDefinitionDto
} from './../../common/window.definition/window.definition.dtos';
import { MessageService } from './../../common/message.service';
import { CarePlanService } from './careplan.service';
import {
    ApCarePlanDto, CpLabelDto, CpGoalDto, CpInterventionDto, UpdatedGoalDto, UpdatedCarePlanDto,
    UpdatedBarrierDto, UpdatedInterventionDto, SaveInterventionNoteRequestDto, SaveInterventionNoteResponseDto, CpViewNoteHistoryDto,
    CpEducationDto, DisplayType, UiDisplayControlDto, CpSaveEducationDto, CpInstructionsResponseDto, CpInstructionsRequestDto,
    CpActivityDto
} from './careplan.dtos';


@Component({
    selector: 'apCareplan',
    encapsulation: ViewEncapsulation.None,
    templateUrl: './careplan.component.html',
    styleUrls: ['careplan.component.css'],
    providers: [CarePlanService, WindowDefinitionService, ConfirmationService, MessageService]

})
export class CarePlanComponent extends BaseComponent implements OnInit, OnDestroy {

    private uiDisplayControl = new UiDisplayControlDto;
    private carePlanForm: FormGroup;
    private educationForm: FormGroup;
    private cpInstructionsForm: FormGroup;
    private uiLabel: CpLabelDto = new CpLabelDto();
    private memberId: string;
    private carePlanDto: ApCarePlanDto;
    private uiDefinition: WindowDefinitionDto[] = [];
    private goalList: UpdatedGoalDto[] = [];
    private interventionNoteDto = new SaveInterventionNoteRequestDto();
    private deliveryConfirmationList: SelectItem[] = [];
    private completionOfReviewingList: SelectItem[] = [];
    private saveInterventionNoteDto: SaveInterventionNoteResponseDto = null;
    private cpNoteHistoryDto: CpViewNoteHistoryDto = null;
    private cpEducationDto: CpEducationDto = null;
    private cpInstructionsResponseDto: CpInstructionsResponseDto = null;
    private cpInstructionsRequestDto: CpInstructionsRequestDto = null;
    private educationText: any = '';

    constructor(private _route: ActivatedRoute, private _windowDefinitionService: WindowDefinitionService,
        private _careplanService: CarePlanService, private _formBuilder: FormBuilder, private _messageService: MessageService,
        private _confirmationService: ConfirmationService, private _sanitized: DomSanitizer) {
        super(_route, _windowDefinitionService);
    }

    isCarePlanDirty() {
        return (this.carePlanForm !== null && this.carePlanForm.dirty)
            || (this.educationForm !== null && this.educationForm.dirty)
            || (this.cpInstructionsForm !== null && this.cpInstructionsForm.dirty);
    }

    ngOnInit() {
        this.deliveryConfirmationList = [{ value: 'Y', label: 'Yes' }, { value: 'N', label: 'No' }];
        this.completionOfReviewingList = [{ value: 'Y', label: 'Yes' }, { value: 'N', label: 'No' }];
        // this.getUIDefinition();
        this._route.queryParams.subscribe(
            (param: String) => {
                this.memberId = param['memberId'];
            }
        );
        this.buildCarePlanForm();
        this.displayCarePlan();
        this.buildcpInstructionForm();
    }

    ngOnDestroy() {
    }

    protected showInfoMessage(message: string) {
        this._messageService.show(message, 'info');
        super.log(message);
    }

    protected showSuccessMessage(message: string) {
        this._messageService.show(message, 'success');
        super.log(message);
    }

    private showDialog(target: string) {
        if (target === DisplayType[DisplayType.NOTEHISTORY]) {
            this.uiDisplayControl.isNoteHistoryVisible = true;
            this.uiDisplayControl.isEducatonVisible = false;
            this.uiDisplayControl.isInstructionsVisible = false;
        } else if (target === DisplayType[DisplayType.EDUCATION]) {
            this.uiDisplayControl.isEducatonVisible = true;
            this.uiDisplayControl.isNoteHistoryVisible = false;
            this.uiDisplayControl.isInstructionsVisible = false;
        } else if (target === DisplayType[DisplayType.INSTRUCTIONS]) {
            this.uiDisplayControl.isEducatonVisible = false;
            this.uiDisplayControl.isNoteHistoryVisible = false;
            this.uiDisplayControl.isInstructionsVisible = true;
        }
    }

    private buildEducationForm(memberGoalBarrierInterventionId) {
        this.educationForm = this._formBuilder.group({
            'levelOfUnderstanding': this.cpEducationDto.currentLevelOfUnderstanding.value,
            'deliveredFlag': this.cpEducationDto.isDelivered,
            'completedFlag': this.cpEducationDto.isComplete,
            'memberGoalBarrierInterventionId': memberGoalBarrierInterventionId,
            'educationDocumentId': this.cpEducationDto.educationDocumentId
        });
    }

    private viewEducation(memberGoalBarrierInterventionId: string) {
        this.uiDisplayControl.isLoading = true;
        return this._careplanService.viewEducation(memberGoalBarrierInterventionId).subscribe(
            cpEducationResponse => {
                if (cpEducationResponse.apiStatus.statusCode === this.API_RESPONSE.SUCCESS) {
                    this._careplanService.getEducationText(cpEducationResponse.fileName).subscribe(
                        educationTextResponse => {
                            this.educationText = this._sanitized.bypassSecurityTrustHtml(educationTextResponse);
                            this.cpEducationDto = cpEducationResponse;
                            this.buildEducationForm(memberGoalBarrierInterventionId);
                            this.showDialog(DisplayType[DisplayType.EDUCATION]);
                        },
                        error => {
                            this.handleCarePlanError('An error occured fetching the education document', error);
                        });
                } else if (cpEducationResponse.apiStatus.statusCode === this.API_RESPONSE.NO_DATA_FOUND) {
                    this.showInfoMessage('No education found for this intervention');
                } else {
                    this.handleCarePlanError('An error occured fetching the education document');
                }
            },
            error => {
                this.handleCarePlanError('An error occured fetching the education document', error);
            },
            () => {
                this.uiDisplayControl.isLoading = false;
                console.log('Education', this.cpEducationDto);
            });
    }

    private buildcpInstructionForm() {
        this.cpInstructionsForm = this._formBuilder.group({
            memberGoalBarrierInterventionId: '',
            instructionId: '',
            deliveredFlag: 'N'
        });
    }

    private setCpInstructionActivities(cpInstructionsResponseDto: CpInstructionsResponseDto, memberGoalBarrierInterventionId: string) {
        this.cpInstructionsForm.setValue({
            memberGoalBarrierInterventionId: memberGoalBarrierInterventionId,
            instructionId: cpInstructionsResponseDto.instructionId,
            deliveredFlag: cpInstructionsResponseDto.isDelivered
        });
    }

    private getCpInstructionsUpdatedDto(): CpInstructionsRequestDto {
        let cpInstructionsRequestDto = new CpInstructionsRequestDto();
        cpInstructionsRequestDto = {
            memberGoalBarrierInterventionId: this.cpInstructionsForm.get('memberGoalBarrierInterventionId').value,
            instructionId: this.cpInstructionsForm.get('instructionId').value,
            deliveredFlag: this.cpInstructionsForm.get('deliveredFlag').value
        };
        return cpInstructionsRequestDto;
    }

    private resetbuildcpInstructionForm() {
        this.cpInstructionsForm.reset({
            memberGoalBarrierInterventionId: this.cpInstructionsForm.get('memberGoalBarrierInterventionId').value,
            instructionId: this.cpInstructionsForm.get('instructionId').value,
            deliveredFlag: this.cpInstructionsForm.get('deliveredFlag').value
        });
    }

    private onClickViewInstructions(memberGoalBarrierInterventionId: string) {
        this.uiDisplayControl.isLoading = true;
        return this._careplanService.viewInstruction(memberGoalBarrierInterventionId).subscribe(
            cpInstructionsResponse => {
                this.cpInstructionsResponseDto = cpInstructionsResponse;
                if (cpInstructionsResponse.apiStatus.statusCode === this.API_RESPONSE.SUCCESS) {
                    this.cpInstructionsResponseDto = cpInstructionsResponse;
                    this.setCpInstructionActivities(this.cpInstructionsResponseDto, memberGoalBarrierInterventionId);
                    this.showDialog(DisplayType[DisplayType.INSTRUCTIONS]);
                } else if (cpInstructionsResponse.apiStatus.statusCode === this.API_RESPONSE.NO_DATA_FOUND) {
                    this._messageService.show('No instruction found for this intervention', 'info');
                } else {
                    this._messageService.show(cpInstructionsResponse.apiStatus.errorMessage, 'error');
                }
            },
            error => {
                this.handleCarePlanError('An error occured fetching instruction for this intervention', error);
            },
            () => {
                this.uiDisplayControl.isLoading = false;
                console.log('Instructions', this.cpInstructionsResponseDto);
            });
    }

    private getLastDate(activityList: CpActivityDto[]) {
        let sortedActivityList: CpActivityDto[] = _.sortBy(activityList, (activity) => { return activity.activityDate; });
        let activityDateList: string[] = _.map(sortedActivityList, (activity) => { return activity.activityDate; });
        return activityDateList[activityDateList.length - 1];
    }

    private getLastActivity(activityList: CpActivityDto[]) {
        let latestActivity: string = this.getLastDate(activityList);
        activityList = _.groupBy(activityList, (activity) => { return activity.activityDate; });
        let latestActivityList: CpActivityDto[] = activityList[latestActivity];
        // console.log('latestActivityList', latestActivityList);
        return latestActivityList;
    }

    private getGoalLastActivity(goalStatus: CpActivityDto, goalActivitySource: CpActivityDto, goalType: CpActivityDto) {
        goalStatus.title = 'Status';
        goalActivitySource.title = 'Source';
        goalType.title = 'Type';
        let activityList: CpActivityDto[] = [goalStatus, goalActivitySource, goalType];
        let latestActivityList: CpActivityDto[] = this.getLastActivity(activityList);
        return this.createActivityResponse(latestActivityList);
    }

    private getBarrierLastActivity(barrierStatus: CpActivityDto, barrierMotivationalState: CpActivityDto) {
        barrierStatus.title = 'Status';
        barrierMotivationalState.title = 'Motivational State';
        let activityList: CpActivityDto[] = [barrierStatus, barrierMotivationalState];
        let latestActivityList: CpActivityDto[] = this.getLastActivity(activityList);
        return this.createActivityResponse(latestActivityList);
    }

    private getIntervetionLastActivity(interventionStatus: CpActivityDto,
        interventionNote: CpActivityDto, interventionAssignedTo: CpActivityDto) {
        interventionStatus.title = 'Status';
        interventionNote.title = 'Note';
        interventionAssignedTo.title = 'Assigned To';
        let activityList: CpActivityDto[] = [interventionStatus, interventionNote, interventionAssignedTo];
        let latestActivityList: CpActivityDto[] = this.getLastActivity(activityList);
        // console.log('latestActivityList', latestActivityList);
        return this.createActivityResponse(latestActivityList);
    }

    private createActivityResponse(latestActivityList: CpActivityDto[]) {
        if (latestActivityList[0].activityPerformedBy && latestActivityList[0].activityDate) {
            return [{
                activityPerformedBy: latestActivityList[0].activityPerformedBy,
                activityDate: latestActivityList[0].activityDate,
                titleList: _.map(latestActivityList, (latestActivity) => { return latestActivity.title; }).join(',')
            }];
        } else {
            return [];
        }
    }

    private onClickSaveInstructions() {
        let cpInstructionsUpdatedDto = this.getCpInstructionsUpdatedDto();
        this.uiDisplayControl.isLoading = true;
        this._careplanService.saveInstruction(cpInstructionsUpdatedDto).subscribe(
            saveInstructionResponse => {
                if (saveInstructionResponse.apiStatus.statusCode === this.API_RESPONSE.SUCCESS) {
                    this._messageService.show('Instruction saved successfully', 'success');
                    this.resetbuildcpInstructionForm();
                } else {
                    this.handleCarePlanError('An error occured saving instruction' + saveInstructionResponse.apiStatus.errorMessage);
                }
            },
            error => {
                this.handleCarePlanError('An error occured saving instruction', error);
            },
            () => {
                this.uiDisplayControl.isLoading = false;
                this.uiDisplayControl.isInstructionsVisible = false;
            });
    }

    private saveEducation() {
        this._careplanService.saveEducation(this.educationForm.value).subscribe(
            saveEducationResponse => {
                if (saveEducationResponse.apiStatus.statusCode === this.API_RESPONSE.SUCCESS) {
                    this.showSuccessMessage('Education activity saved successfully');
                } else {
                    this.handleCarePlanError('An error occured saving education activity');
                }
            },
            error => {
                this.handleCarePlanError('An error occured saving education activity', error);
            },
            () => {
                this.uiDisplayControl.isLoading = false;
                this.uiDisplayControl.isEducatonVisible = false;
            });
    }

    private viewNoteHistory(memberGoalBarrierInterventionId: string) {
        this.uiDisplayControl.isLoading = true;
        return this._careplanService.viewNoteHistory(memberGoalBarrierInterventionId).subscribe(
            cpNoteHistoryResponse => {

                if (cpNoteHistoryResponse.apiStatus.statusCode === this.API_RESPONSE.SUCCESS) {
                    this.cpNoteHistoryDto = cpNoteHistoryResponse;
                    this.showDialog(DisplayType[DisplayType.NOTEHISTORY]);
                } else if (cpNoteHistoryResponse.apiStatus.statusCode === this.API_RESPONSE.NO_DATA_FOUND) {
                    this._messageService.show('No note history found.', 'info');
                } else {
                    this._messageService.show(cpNoteHistoryResponse.apiStatus.errorMessage, 'error');
                }
            },
            error => {
                this.handleCarePlanError('An error occured fetching note history', error);
            },
            () => {
                this.uiDisplayControl.isLoading = false;
            });
    }

    private buildCarePlanForm() {
        this.carePlanForm = this._formBuilder.group({
            goalFormList: this._formBuilder.array([
                this._formBuilder.group({
                    memberGoalId: '',
                    goalStatus: 'ZDEFAULT',
                    goalActivitySource: 'ZDEFAULT',
                    goalType: 'ZDEFAULT',
                    barrierFormList: this._formBuilder.array([
                        this._formBuilder.group({
                            memberGoalBarrierId: '',
                            barrierStatus: 'ZDEFAULT',
                            motivationalState: 'ZDEFAULT',
                            interventionFormList: this._formBuilder.array([
                                this._formBuilder.group({
                                    memberGoalBarrierInterventionId: '',
                                    interventionStatus: 'ZDEFAULT',
                                    interventionAssignedTo: 'ZDEFAULT'
                                }),
                            ])
                        }),
                    ])
                })
            ])
        });
    }

    private setCarePlanActivities(goalList: CpGoalDto[]) {
        const goalActivityFormGroups = goalList.map(goal => {
            if (!goal.barrierList) {
                goal.barrierList = [];
            }

            return this._formBuilder.group({
                memberGoalId: goal.memberGoalId,
                goalStatus: goal.currentGoalStatus.value,
                goalActivitySource: goal.currentGoalActivitySource.value,
                goalType: goal.currentGoalType.value,
                barrierFormList: this._formBuilder.array(goal.barrierList.map(barrier => {
                    if (!barrier.interventionList) {
                        barrier.interventionList = [];
                    }
                    return this._formBuilder.group({
                        memberGoalBarrierId: barrier.memberGoalBarrierId,
                        barrierStatus: barrier.currentBarrierStatus.value,
                        motivationalState: barrier.currentBarrierMotivationalState.value,
                        interventionFormList: this._formBuilder.array(barrier.interventionList.map(intervention =>
                            this._formBuilder.group({
                                memberGoalBarrierInterventionId: intervention.memberGoalBarrierInterventionId,
                                interventionStatus: intervention.currentInterventionStatus.value,
                                interventionAssignedTo: intervention.currentInterventionAssignedTo.value
                            })
                        )),
                    });
                }
                )),
            });
        }
        );
        const activityFormArray = this._formBuilder.array(goalActivityFormGroups);
        this.carePlanForm.setControl('goalFormList', activityFormArray);
    }

    private displayCarePlan() {
        this.uiDisplayControl.isSpinnerVisible = true;
        this._careplanService.view(this.memberId).subscribe(
            carePlanResponse => {
                if (carePlanResponse.apiStatus.statusCode === this.API_RESPONSE.SUCCESS) {
                    this.carePlanDto = carePlanResponse;
                    this.setCarePlanActivities(this.carePlanDto.goalList);
                    // this.carePlanForm.valueChanges.subscribe(data => this.onFormInputChanged(data));
                } else if (carePlanResponse.apiStatus.statusCode === this.API_RESPONSE.NO_DATA_FOUND) {
                    this.showInfoMessage('Looking for the Care Plan? Please complete an assessment and come back.');
                } else {
                    this._messageService.show(carePlanResponse.apiStatus.errorMessage, 'error');
                }
            },
            error => {
                this.handleCarePlanError('An error occured fetching the care plan', error);
            },
            () => {
                this.uiDisplayControl.isSpinnerVisible = false;
            });
    }

    private getUpdatedCarePlanDto(): UpdatedCarePlanDto {
        const goalFormArray = this.carePlanForm.get('goalFormList') as FormArray;
        const updatedGoalFormList = _.filter(goalFormArray.controls, (item) => { return item && item.dirty === true; });
        const updatedCarePlanDto = new UpdatedCarePlanDto();
        updatedCarePlanDto.memberId = this.memberId;
        updatedCarePlanDto.goalList = [];
        for (let goalForm of updatedGoalFormList) {
            const goalStatus = goalForm.get('goalStatus').dirty === true ?
                goalForm.get('goalStatus').value : null;
            const goalActivitySource = goalForm.get('goalActivitySource').dirty === true ?
                goalForm.get('goalActivitySource').value : null;
            const goalType = goalForm.get('goalType').dirty === true ?
                goalForm.get('goalType').value : null;
            const barrierFormArray = goalForm.get('barrierFormList') as FormArray;
            const updatedBarrierFormList = _.filter(barrierFormArray.controls, (item) => { return item && item.dirty === true; });
            const updatedBarrierDto: UpdatedBarrierDto[] = [];
            for (let barrierForm of updatedBarrierFormList) {

                const interventionFormArray = barrierForm.get('interventionFormList') as FormArray;
                const updatedInterventionFormList = _.filter(interventionFormArray.controls, (item) => {
                    return item && item.dirty === true;
                });
                const updatedinterventionDto: UpdatedInterventionDto[] = [];
                for (let interventionForm of updatedInterventionFormList) {
                    const interventionStatus = interventionForm.get('interventionStatus').dirty === true ?
                        interventionForm.get('interventionStatus').value : null;
                    const interventionAssignedTo = interventionForm.get('interventionAssignedTo').dirty === true ?
                        interventionForm.get('interventionAssignedTo').value : null;
                    console.log('memberGoalBarrierInterventionId', interventionForm.get('memberGoalBarrierInterventionId').value);
                    updatedinterventionDto.push({
                        memberGoalBarrierInterventionId: interventionForm.get('memberGoalBarrierInterventionId').value,
                        interventionStatus: interventionStatus,
                        interventionAssignedTo: interventionAssignedTo,
                    });

                }

                const barrierStatus = barrierForm.get('barrierStatus').dirty === true ?
                    barrierForm.get('barrierStatus').value : null;
                const motivationalState = barrierForm.get('motivationalState').dirty === true ?
                    barrierForm.get('motivationalState').value : null;

                updatedBarrierDto.push({
                    memberGoalBarrierId: barrierForm.get('memberGoalBarrierId').value,
                    barrierStatus: barrierStatus,
                    motivationalState: motivationalState,
                    interventionList: updatedinterventionDto
                });
            }
            updatedCarePlanDto.goalList.push({
                memberGoalId: goalForm.get('memberGoalId').value,
                goalStatus: goalStatus,
                goalActivitySource: goalActivitySource,
                goalType: goalType,
                barrierList: updatedBarrierDto
            });
        }
        return updatedCarePlanDto;
    }

    private resetCarePlanForm() {
        let goalFormArrayToReset = this.carePlanForm.get('goalFormList') as FormArray;
        let updatedGoalFormListToRest = _.filter(goalFormArrayToReset.controls, (item) => { return item; });

        for (let goalForm of updatedGoalFormListToRest) {
            const barrierFormArrayToReset = goalForm.get('barrierFormList') as FormArray;
            const updatedBarrierFormListToRest = _.filter(barrierFormArrayToReset.controls, (item) => { return item; });

            let barrierDataToReset = [];
            for (let barrierForm of updatedBarrierFormListToRest) {
                const interventionFormArrayToReset = barrierForm.get('interventionFormList') as FormArray;
                const updatedInterventionFormListToRest = _.filter(interventionFormArrayToReset.controls, (item) => {
                    return item;
                });
                let interventionDataToReset = [];
                for (let interventionForm of updatedInterventionFormListToRest) {
                    interventionDataToReset.push({
                        memberGoalBarrierInterventionId: interventionForm.get('memberGoalBarrierInterventionId').value,
                        interventionStatus: interventionForm.get('interventionStatus').value,
                        interventionAssignedTo: interventionForm.get('interventionAssignedTo').value
                    });
                }
                barrierDataToReset.push({
                    memberGoalBarrierId: barrierForm.get('memberGoalBarrierId').value,
                    barrierStatus: barrierForm.get('barrierStatus').value,
                    motivationalState: barrierForm.get('motivationalState').value,
                    interventionFormList: interventionDataToReset
                });
            }

            goalForm.reset({
                memberGoalId: goalForm.get('memberGoalId').value,
                goalStatus: goalForm.get('goalStatus').value,
                goalActivitySource: goalForm.get('goalActivitySource').value,
                goalType: goalForm.get('goalType').value,
                barrierFormList: barrierDataToReset
            });
        }
    }

    private updateLastActivity(saveResponseGoalList: CpGoalDto[]) {
        for (let saveResponseGoal of saveResponseGoalList) {
            for (let goal of this.carePlanDto.goalList) {
                if (goal.memberGoalId === saveResponseGoal.memberGoalId) {
                    if (saveResponseGoal.goalStartDate) {
                        goal.goalStartDate = saveResponseGoal.goalStartDate;
                    }
                    if (saveResponseGoal.goalEndDate) {
                        goal.goalEndDate = saveResponseGoal.goalEndDate;
                    }
                    if (saveResponseGoal.currentGoalStatus) {
                        goal.currentGoalStatus = saveResponseGoal.currentGoalStatus;
                    }
                    if (saveResponseGoal.currentGoalType) {
                        goal.currentGoalType = saveResponseGoal.currentGoalType;
                    }

                    if (saveResponseGoal.currentGoalActivitySource) {
                        goal.currentGoalActivitySource = saveResponseGoal.currentGoalActivitySource;
                    }
                    if (saveResponseGoal.barrierList) {
                        for (let saveResponseGoalBarrier of saveResponseGoal.barrierList) {
                            for (let barrier of goal.barrierList) {
                                if (barrier.memberGoalBarrierId === saveResponseGoalBarrier.memberGoalBarrierId) {
                                    if (saveResponseGoalBarrier.barrierStartDate) {
                                        barrier.barrierStartDate = saveResponseGoalBarrier.barrierStartDate;
                                    }
                                    if (saveResponseGoalBarrier.barrierEndDate) {
                                        barrier.barrierEndDate = saveResponseGoalBarrier.barrierEndDate;
                                    }
                                    if (saveResponseGoalBarrier.currentBarrierStatus) {
                                        barrier.currentBarrierStatus = saveResponseGoalBarrier.currentBarrierStatus;
                                    }
                                    if (saveResponseGoalBarrier.currentBarrierMotivationalState) {
                                        barrier.currentBarrierMotivationalState = saveResponseGoalBarrier.currentBarrierMotivationalState;
                                    }
                                }
                                if (saveResponseGoalBarrier.interventionList) {
                                    for (let saveResponseGoalBarrierIntervention of saveResponseGoalBarrier.interventionList) {
                                        for (let intervention of barrier.interventionList) {
                                            if (intervention.memberGoalBarrierInterventionId
                                                === saveResponseGoalBarrierIntervention.memberGoalBarrierInterventionId) {
                                                if (saveResponseGoalBarrierIntervention.interventionStartDate) {
                                                    intervention.interventionStartDate = saveResponseGoalBarrierIntervention.
                                                        interventionStartDate;

                                                }

                                                if (saveResponseGoalBarrierIntervention.interventionEndDate) {
                                                    intervention.interventionEndDate = saveResponseGoalBarrierIntervention.
                                                        interventionEndDate;

                                                }
                                                if (saveResponseGoalBarrierIntervention.currentInterventionStatus) {
                                                    intervention.currentInterventionStatus = saveResponseGoalBarrierIntervention.
                                                        currentInterventionStatus;

                                                }

                                                if (saveResponseGoalBarrierIntervention.currentInterventionNote) {
                                                    intervention.currentInterventionNote = saveResponseGoalBarrierIntervention.
                                                        currentInterventionNote;
                                                }

                                                if (saveResponseGoalBarrierIntervention.currentInterventionAssignedTo) {
                                                    intervention.currentInterventionAssignedTo = saveResponseGoalBarrierIntervention.
                                                        currentInterventionAssignedTo;
                                                }

                                            }
                                        }
                                    }

                                }

                            }

                        }

                    }
                }
            }
        }
    }

    private onClickSaveCarePlan() {
        this.showInfoMessage('Saving Care Plan');
        this.uiDisplayControl.isLoading = true;
        let updatedCarePlanDto: UpdatedCarePlanDto = this.getUpdatedCarePlanDto();
        console.log('To save', updatedCarePlanDto);
        this._careplanService.saveCarePlan(updatedCarePlanDto).subscribe(
            carePlanResponse => {
                if (carePlanResponse.apiStatus.statusCode === this.API_RESPONSE.SUCCESS) {
                    console.log('carePlanResponse', carePlanResponse);
                    this.resetCarePlanForm();
                    this.updateLastActivity(carePlanResponse.goalList);
                    console.log('carePlanResponse', carePlanResponse);
                    this.showSuccessMessage('Care Plan saved successfully');
                } else {
                    this.handleCarePlanError('An error occurred saving the care plan');
                }
            },
            error => {
                this.handleCarePlanError('An error occurred saving the care plan.', error);
            },
            () => {
                this.uiDisplayControl.isLoading = false;
            });
    }

    private setLabels() {
        this.uiLabel.goalTitle = this._windowDefinitionService
            .getFieldLabel(this.uiDefinition, 'title', this.uiLabel.goalTitle);
        this.uiLabel.goalStatus = this._windowDefinitionService
            .getFieldLabel(this.uiDefinition, 'status', this.uiLabel.goalStatus);
        this.uiLabel.goalLastActivity = this._windowDefinitionService
            .getFieldLabel(this.uiDefinition, 'last_activity', this.uiLabel.goalLastActivity);
        this.uiLabel.goalStartDate = this._windowDefinitionService
            .getFieldLabel(this.uiDefinition, 'start_date', this.uiLabel.goalStartDate);
        this.uiLabel.goalEndDate = this._windowDefinitionService
            .getFieldLabel(this.uiDefinition, 'end_date', this.uiLabel.goalEndDate);
        this.uiLabel.goalSource = this._windowDefinitionService
            .getFieldLabel(this.uiDefinition, 'source', this.uiLabel.goalSource);
        this.uiLabel.goalType = this._windowDefinitionService
            .getFieldLabel(this.uiDefinition, 'type', this.uiLabel.goalType);
    }

    private getUIDefinition() {
        if (this.uiDefinition.length === 0) {
            this.getWindowDefinition('w_member')
                .subscribe(
                windowDefinition => {
                    this.uiDefinition = windowDefinition;
                    this.setLabels();
                },
                err => {
                    console.error(err);
                },
                () => {
                });
        }
    }

    private checkForEmpty(noteText: string) {
        if (noteText.trim() === '') {
            return true;
        } else {
            return false;
        }
    }


    private OnClickSaveNote(intervention: CpInterventionDto, text: HTMLInputElement) {
        this.uiDisplayControl.isLoading = true;
        let value = text.value.trim();
        this.showInfoMessage('Saving Note');
        this.interventionNoteDto = {
            'memberGoalBarrierInterventionId': intervention.memberGoalBarrierInterventionId,
            'note': value
        };
        console.log(this.interventionNoteDto);
        if (this.interventionNoteDto) {
            let interventionNoteDto = this.interventionNoteDto;
            this._careplanService.saveNote(interventionNoteDto).subscribe(
                saveNoteResponse => {
                    if (saveNoteResponse.apiStatus.statusCode === this.API_RESPONSE.SUCCESS) {
                        this.showSuccessMessage('Note saved successfully');
                        intervention.interventionStartDate = saveNoteResponse.interventionStartDate;
                        console.log('saveNoteResponse', saveNoteResponse)
                        intervention.currentInterventionNote.activityPerformedBy = saveNoteResponse.
                            currentInterventionNote.activityPerformedBy;
                        intervention.currentInterventionNote.activityDate = saveNoteResponse.interventionActivityDate;
                        intervention.currentInterventionNote.label = saveNoteResponse.note;
                        text.value = '';
                    } else {
                        this.handleCarePlanError(saveNoteResponse.apiStatus.errorMessage);
                    }
                },
                error => {
                    this.handleCarePlanError('An error occurred saving the care plan', error);
                },
                () => {
                    this.uiDisplayControl.isLoading = false;
                });
        }
    }

    private handleCarePlanError(message: string, error?: any) {
        this._messageService.show(message, 'error');
        super.handleError(error, message);
    }

    private onEvent(event) {
        this.uiDisplayControl.isAccordianDisabled = false;
    }

    private blurEvent() {
        setTimeout(() => {
            if (this.uiDisplayControl.isAccordianDisabled === false) {
                this.uiDisplayControl.isAccordianDisabled = true;
            }
        }, 500);
    }

    private changeEvent(event) {
        setTimeout(() => {
            if (this.uiDisplayControl.isAccordianDisabled === false) {
                this.uiDisplayControl.isAccordianDisabled = true;
            }
        }, 500);
    }
}
