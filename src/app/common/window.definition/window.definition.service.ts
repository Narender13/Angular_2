
import { Injectable } from '@angular/core';
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { ConfigurationService } from '../configuration.service';
import { WindowDefinitionDto, RuleDomainTableDataRowsDto, DataRowDto } from './window.definition.dtos';

@Injectable()
export class WindowDefinitionService {
    constructor(private _http: Http, private _configuration: ConfigurationService) {
    }

    public getWindowDefinition(windowId: string): Observable<WindowDefinitionDto[]> {
        let url = ConfigurationService.windowDefinition.replace('{windowId}', windowId);
        return this._http.get(url, ConfigurationService.getHeaders()).map(res => res.json());
    }

    public getDataRowsForDomainTable(tableName: string): Observable<RuleDomainTableDataRowsDto> {
        let url = ConfigurationService.tableDataRows.replace('{tableName}', tableName);
        return this._http.get(url, ConfigurationService.getHeaders()).map(res => res.json());
    }

    public getDataRowsForDependentTable(tableName: string, column1FilterValue: string,
        column2FilterValue: string, column3FilterValue: string):
        Observable<DataRowDto[]> {

        let url = ConfigurationService.tableDataRows
            .replace('{tableName}', tableName)
            .replace('{column1FilterValue}', column1FilterValue)
            .replace('{column2FilterValue}', column2FilterValue)
            .replace('{column3FilterValue}', column3FilterValue);
        return this._http.get(url, ConfigurationService.getHeaders()).map(res => res.json());
    }

    public getFieldLabel(fieldArray: WindowDefinitionDto[], fieldId: string, defaultLabel: string) {

        if ( fieldArray != null && fieldId != null ) {
            for (let fieldDef of fieldArray) {
                if (fieldDef.fieldId === fieldId) {
                    return fieldDef.fieldLabel;
                }
            }
        }
        return defaultLabel;
    }

    public isFieldRequired(fieldArray: WindowDefinitionDto[], fieldId: string) {

        if ( fieldArray != null && fieldId != null ) {
            for (let fieldDef of fieldArray) {
                if (fieldDef.fieldId === fieldId) {
                    return fieldDef.isRequired;
                }
            }
        }
        return false;
    }

    public isFieldHidden(fieldArray: WindowDefinitionDto[], fieldId: string) {

        if ( fieldArray != null && fieldId != null ) {
            for (let fieldDef of fieldArray) {
                if (fieldDef.fieldId === fieldId && fieldDef.isHidden) {
                    return true;
                }
            }
        }
        return false;
    }
}
