
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { ConfigurationService }  from './../../common/configuration.service';
import { ApiStatusDto }          from './../../common/common.dtos';
import { TaskDefinitionDto }     from './getnext-container.dtos';

@Injectable()
export class GetNextContainerService {
    constructor(private _http: Http, private _configuration: ConfigurationService) {
    }

    public getDetails(memberId: string, taskDefinitionId: string): Observable<TaskDefinitionDto> {

        let url: string = ConfigurationService.resolveTaskDefinition
            .replace('{memberId}', memberId)
            .replace('{taskDefinitionId}', taskDefinitionId);

        return this._http.get(url, ConfigurationService.getHeaders()).map(res => res.json());
    }

    public setGetNextTaskStatus(getNextTaskId: string, status: string): Observable<ApiStatusDto> {

        if (getNextTaskId === null || getNextTaskId === undefined) {
            throw 'getNextTaskId cannot be null';
        } else if (status === null || status === undefined) {
            throw 'GetNext Task status cannot be null';
        } else {
            let url: string = ConfigurationService.getNextSetStatus
                .replace('{getNextTaskId}', getNextTaskId)
                .replace('{status}', status);

            return this._http.post(url, '', ConfigurationService.getHeaders()).map(res => res.json());
        }
    }
}
