export class ApCarePlanDto {
    apiStatus: ApiStatusDto;
    goalList: CpGoalDto[];
    goalSourceList: CpActivityDto[];
    goalTypeList: CpActivityDto[];
    goalStatusList: CpActivityDto[];
    barrierStatusList: CpActivityDto[];
    barrierMotivationStateList: CpActivityDto[];
    interventionStatusList?: CpActivityDto[];
}

export class CpGoalDto {
    memberGoalId: string;
    goalId: string;
    goalName: string;
    goalStartDate: string;
    goalEndDate: string;
    goalSensitivityCategoryDesc: string;
    currentGoalStatus: CpActivityDto;
    currentGoalActivitySource: CpActivityDto;
    currentGoalType: CpActivityDto;
    barrierList?: CpBarrierDto[];
}

export class CpBarrierDto {
    memberGoalBarrierId: string;
    barrierId: string;
    barrierName: string;
    barrierStartDate: string;
    barrierEndDate: string;
    barrierSensitivityCategoryDescription: string;
    barrierMotivationalStateFlag: string;
    currentBarrierStatus: CpActivityDto;
    currentBarrierMotivationalState: CpActivityDto;
    interventionList: CpInterventionDto[];
}

export class CpInterventionDto {
    memberGoalBarrierInterventionId: string;
    interventionId: string;
    interventionName: string;
    interventionStartDate: string;
    interventionEndDate: string;
    interventionSensitivityCategoryDescription: string;
    isInstructionAvailable: string;
    isEducationMaterialAvailable: string;
    currentInterventionStatus: CpActivityDto;
    currentInterventionAssignedTo: CpActivityDto;
    currentInterventionNote: CpActivityDto;
    interventionAssignedToList: CpActivityDto[];
}

export class CpInterventionNoteDto {
    memberGoalBarrierInterventionId: string;
    note: string;
    interventionActivityDate: string;
    interventionStartDate: string;
    currentInterventionNote: CpActivityDto;
    apiStatus: ApiStatusDto;
}

export class UpdatedCarePlanDto {
    apiStatus: ApiStatusDto;
    memberId: string;
    goalList: UpdatedGoalDto[];
}

export class UpdatedGoalDto {
    memberGoalId: string;
    goalStatus: string;
    goalActivitySource: string;
    goalType: string;
    barrierList: UpdatedBarrierDto[];
}

export class UpdatedBarrierDto {
    memberGoalBarrierId: string;
    barrierStatus: string;
    motivationalState: string;
    interventionList?: UpdatedInterventionDto[];
}

export class UpdatedInterventionDto {
    memberGoalBarrierInterventionId: string;
    interventionStatus: string;
    interventionAssignedTo: string;
}

export class SaveInterventionNoteRequestDto {
    memberGoalBarrierInterventionId: string;
    note: string;
}

export class SaveInterventionNoteResponseDto {
    memberGoalBarrierInterventionId: string;
    note: string;
    interventionActivityDate: string;
}

export class CpActivityDto {
    title: string;
    label: string;
    value: string;
    activityDate: string;
    activityPerformedBy: string;

}

export class ApiStatusDto {
    statusCode: string;
    errorMessage: string;
}

export class CpViewNoteHistoryDto {
    memberGoalBarrierInterventionId: string;
    noteList: CpNoteHistoryDto[];
    apiStatus: ApiStatusDto;
}

export class CpNoteHistoryDto {
    interventionActivityDate: string;
    note: string;
}

export class CpEducationDto {
    apiStatus: ApiStatusDto;
    education: string;
    levelOfUnderstanding: CpActivityDto[];
    title: string;
    text: string;
    currentLevelOfUnderstanding: CpActivityDto;
    isDelivered: string;
    isComplete: string;
    educationDocumentId: string;
    fileName: string;
}

export class CpSaveEducationDto {
    memberGoalBarrierInterventionId: string;
    educationDocumentId: string;
    levelOfUnderstanding: string;
    deliveredFlag: string;
    completedFlag: string;
}

export class CpInstructionsRequestDto {
    memberGoalBarrierInterventionId: string;
    instructionId: string;
    deliveredFlag: string;
}
export class CpInstructionsResponseDto {
    apiStatus: ApiStatusDto;
    instructionId: string;
    title: string;
    text: string;
    isDelivered: string;
}


export class UiDisplayControlDto {
    isSpinnerVisible: boolean = false;
    isLoading: boolean = false;
    isAccordianDisabled: boolean = true;
    isEducatonVisible: boolean = false;
    isInstructionsVisible: boolean = false;
    isNoteHistoryVisible: boolean = false;
    isDraggable: boolean = false;
    isDismissableMask: boolean = true;
}

export enum DisplayType {
    NOTEHISTORY,
    EDUCATION,
    INSTRUCTIONS
}

export class CpLabelDto {
    goalTitle: string = 'Title';
    goalStatus: string = 'Status';
    goalLastActivity: string = 'Last Activity';
    goalStartDate: string = 'Start Date';
    goalEndDate: string = 'End Date';
    goalSource: string = 'Source';
    goalType: string = 'Type';
}

