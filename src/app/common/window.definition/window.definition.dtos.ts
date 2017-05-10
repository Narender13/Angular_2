
export class WindowDefinitionDto {
    fieldId: string;
    fieldLabel: string;
    isRequired: boolean;
    isRequiredToClose: boolean;
    isHidden: boolean;
    fkTableData: RuleDomainTableDataRowsDto;
}

export class RuleDomainTableDataRowsDto {
    tableName: string;
    tableFriendlyName: string;
    idColumn1Name: string;
    idColumn2Name: string;
    idColumn3Name: string;
    descriptionColumn: string;
    activeColumn: string;
    dataRows: DataRowDto[];
};

export class DataRowDto {
    idColumn1: string;
    idColumn2: string;
    idColumn3: string;
    description: string;
    description2: string;
    active: boolean;
}
