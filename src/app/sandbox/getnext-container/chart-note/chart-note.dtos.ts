
import { ApiStatusDto }                 from './../../../common/common.dtos';
import { UserDefinedFieldDto,
         UserDefinedFieldTypeRestrictionsDto,
         UserDefinedFieldTypeDto,
         UserDefinedFieldValueDto }     from './../../../common/user-defined-field.dtos';

export class ChartNoteDto {
    memberId: string;
    noteSeq: string = null;
    requestorId: string;
    encounterDateTime: string;
    noteType: string;
    noteText: string;
    userDefinedFieldList: ChartNoteUserDefinedFieldAnswerDto[];
}

export class ChartNoteUserDefinedFieldAnswerDto {
    fieldId: string = null;
    listItemId: string = null;
    answer: string = null;
}

export class ChartNoteUserDefinedFieldsListDto {
   apiStatus: ApiStatusDto;
   memberId: string;
   noteSeq: number;
   userDefinedFieldList: UserDefinedFieldDto[];
}
