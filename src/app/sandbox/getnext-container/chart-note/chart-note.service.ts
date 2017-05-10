
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import * as moment from 'moment';

import { ConfigurationService }     from './../../../common/configuration.service';
import { ApiStatusDto }             from './../../../common/common.dtos';
import { ChartNoteDto,
         ChartNoteUserDefinedFieldsListDto } from './chart-note.dtos';
import { UserDefinedFieldDto,
         UserDefinedFieldTypeRestrictionsDto,
         UserDefinedFieldTypeDto,
         UserDefinedFieldValueDto }     from './../../../common/user-defined-field.dtos';

@Injectable()
export class ChartNoteService {
    constructor(private _http: Http, private _configuration: ConfigurationService) {
    }

    public saveNote(chartNoteDto: ChartNoteDto): Observable<ApiStatusDto> {

        if (chartNoteDto.noteSeq === null || chartNoteDto.noteSeq === undefined) {
            let now: string = moment().format('MMDDYYYY');
            chartNoteDto.encounterDateTime = now;
            let body = JSON.stringify( chartNoteDto );
            let url = ConfigurationService.createNote;

            console.log('the create note url: ' + url);

            return this._http.post(url, body, ConfigurationService.getHeaders()).map(res => res.json());
        } else {
            let url = ConfigurationService.updateNote;
            let body = JSON.stringify( chartNoteDto );
            return this._http.put(url, body, ConfigurationService.getHeaders()).map(res => res.json());
        }
    }

    public linkAssessmentToNote(memberAssessmentId: string, noteSeq: string, memberId: string, link: boolean): Observable<ApiStatusDto> {

        if (memberAssessmentId === null || memberAssessmentId === undefined) {
            throw 'memberAssessmentId cannot be null';
        } else if (noteSeq === null || noteSeq === undefined) {
            throw 'noteSeq cannot be null';
        } else {
            let url: string = ConfigurationService.linkMemberAssessmentToNote
                .replace('{memberAssessmentId}', memberAssessmentId)
                .replace('{noteSeq}', noteSeq)
                .replace('{memberId}', memberId)
                .replace('{isAPAssessment}', 'true')
                .replace('{link}', '' + link.valueOf());

            return this._http.post(url, '', ConfigurationService.getHeaders()).map(res => res.json());
        }
    }

    public getNoteUserDefinedFields(chartNoteDto: ChartNoteDto): Observable<ChartNoteUserDefinedFieldsListDto> {
        let url: string = ConfigurationService.noteUserDefinedFields
            .replace('{memberId}', chartNoteDto.memberId)
            .replace('{noteSeq}', chartNoteDto.noteSeq);
        return this._http.get(url, ConfigurationService.getHeaders()).map(res => res.json());
    }
}
