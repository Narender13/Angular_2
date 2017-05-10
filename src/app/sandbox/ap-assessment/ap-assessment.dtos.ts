import { ApiStatusDto } from './../../common/common.dtos';

export class ApAssessmentStartRequestDto {
    memberId: string;
    assessmentAlgorithmId: string;
}

export class ApAssessmentSubmitRequestDto {
    memberId: string;
    memberAssessmentId: string;
}

export class ApAssessmentViewRequestDto {
    memberId: string;
    memberAssessmentId: string;
}

export class ApAssessmentListRequestDto {
    memberId: string;
    parentAssessmentId?: string;
    memberAssessmentId?: string;
}

export class ApAssessmentNavigationRequestDto {
    memberId: string;
    memberAssessmentId: string;
    questionId: string;
    questionType: string;
    answerList: ApAnswerRequestDto[];
    responseMeasureUnitId?: string;
}

export class ApAssessmentDto {
    apiStatus: ApiStatusDto;
    memberAssessmentId: string;
    assessmentStatus: string;
    question: QuestionDto;
    answerList: ApAnswerResponseDto[];
    priorAnswerList: PriorAnswerResponseDto[];
}

export class QuestionDto {
    questionText: LiteracyTextDto;
    isRequired: boolean;
    helpText: string;
    questionType: string;
    questionId: string;
    isFirstQuestion: boolean;
    isLastQuestion: boolean;
    responseMeasureUnit: string;
    responseUOM: ResponseUOMDto[];
    answerList: ApAnswerResponseDto[];
}

export class ResponseUOMDto {
    id: string;
    uom: string;
    value: string;
    value_default: string;
    value_maximum: string;
    value_minimum: string;
}

export class ApAnswerResponseDto {
    answerText: LiteracyTextDto;
    helpText: string;
    answerId: string;
    userResponse: string;
}

export class ApAnswerRequestDto {
    answerId: string;
    answerText: string;
}

export class PriorAnswerResponseDto {
    answerText: LiteracyTextDto;
    assessmentCompletedDate: string;
}

export class LiteracyTextDto {
    baseText: string;
    layText: string;
    expertText: string;
}

export class ApAssessmentListResponseDto {
    apiStatus: ApiStatusDto;
    // assessmentName: string;
    assessmentList: AssessmentInfoDto[];
}

export class AssessmentInfoDto {
    assessmentAlgorithmId: string;
    assessmentName: string;
    assessmentStatus: string;
    memberAssessmentId: string;
}

export class ApAssessmentViewDto {
    apiStatus: ApiStatusDto;
    memberAssessmentId: string;
    assessmentStatus: string;
    questionList: QuestionDto[];
}

export enum QuestionType {
    FREE_TEXT,
    MULTIPLE_CHOICE_MULTIPLE_SELECT,
    MULTIPLE_CHOICE_SINGLE_SELECT,
    VALUEENTRY_WEIGHT,
    VALUEENTRY_HEIGHT,
    VALUEENTRY_DATE
}

export enum AssessmentType {
    GENERAL,
    CARETRACK
}

export enum AssessmentStatusType {
    NOT_STARTED,
    START,
    IN_PROGRESS,
    READY_TO_SUBMIT,
    COMPLETE,
}

export enum AssessmentActionType {
    GETNEXT_START,
    START,
    CONTINUE,
    VIEW,
}
