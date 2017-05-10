
import { SelectItem } from 'primeng/primeng';

export class UserDefinedFieldDto {
    fieldId: string;
    fieldName: string;
    fieldType: UserDefinedFieldTypeDto;
    fieldValue: UserDefinedFieldValueDto;
    active: boolean;
    fieldRestrictions: UserDefinedFieldTypeRestrictionsDto;
    listItemsList: ListItemDto[];
    convertedListItemsList: SelectItem[] = [];
}

export type UserDefinedFieldTypeDto = 'LIST' | 'NUMBER' | 'TEXT' | 'BOOLEAN' | 'DATE';

export class UserDefinedFieldTypeRestrictionsDto {
    maxLength: number;
    maxNumber: number;
    minNumber: number;
    decimalPlaces: number;
    allowFutureDate: boolean;
    allowPastDate: boolean;
    defaultChecked: boolean;
}

export class UserDefinedFieldValueDto {
    listItemId: string;
    listItemName: string;
    value: string;
}

export class ListItemDto {
    listItemId: string;
    listItemName: string;
    active: boolean;
}


