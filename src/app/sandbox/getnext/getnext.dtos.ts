
export class FormattedQueueItemDto {
    getNextTaskId: number;
    taskDefinitionId: number;
    appointmentId: number;
    currentStatus: string;
    due: string;
    score: number;
    memberId: string;
    name: string;
    details: string;
}

export class QueueItemDto {
    getNextTaskId: number;
    taskDefinitionId: number;
    appointmentId: number;
    currentStatus: string;
    due: string;
    score: number;
    memberId: string;
    memberName: string;
    taskObjective: string;
    fieldObjective: string;
    slaMinutes: number;
}

export class TaskDefinitionHistoryDto {
    getNextTaskDefinitionId: number;
    taskDefinitionHistoryId: number;
    taskDefinitionId: number;
    taskDefinitionName: string;
    taskDefinitionDesc: string;
    taskDefinitionTypeDesc: string;
    taskDefinitionObjectiveDesc: string;
    slaDesc: string;
    slaMinutes: number;
    durationDesc: string;
    active: boolean;
    fields: TaskDefinitionFieldHistoryDto[];
}

export class TaskDefinitionFieldHistoryDto {
    taskDefinitionFieldHistoryId: number;
    taskDefHistoryId: number;
    taskDefinitionId: number;
    taskDefinitionFieldId: number;
    taskDefFieldType: string;
    displayLabel: string;
    displayValue: string;
    displayValueIsDate: boolean;
    displayOrder: number;
    active: boolean;
}