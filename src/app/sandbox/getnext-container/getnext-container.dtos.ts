
export class TaskDefinitionDto {
    taskDefinitionId: number;
    taskDefinitionName: string;
    taskDefinitionDesc: string;
    taskDefinitionType: TaskTypeDto;
    sla: SLADto;
    duration: DurationDto;
    fields: TaskFieldDto[];
    actions: TaskActionDto[];
    active: boolean;
}

export class TaskFieldDto {
    fieldId: number;
    displayLabel: string;
    displayValue: string;
    textValueIsDate: boolean;
    orderOfDisplay: number;
    active: boolean;
}

export class TaskActionDto {
    taskActionType: string;
    taskActionDefinitionId: string;
    taskActionDefinitionDesc: string;
    itemId: string;
    taskActionOrder: number;
    active: boolean;
}

export class SLADto {
    id: string;
    description: string;
    minutes: number;
    active: boolean;
}

export class DurationDto {
    id: string;
    description: string;
    active: boolean;
}

export class TaskTypeDto {
    id: string;
    description: string;
    active: boolean;
}
