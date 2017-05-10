import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import * as moment from 'moment';

import { ConfigurationService }             from './../../common/configuration.service';
import { ApiStatusDto }                     from './../../common/common.dtos';
import { TaskDefinitionHistoryDto,
         TaskDefinitionFieldHistoryDto,
         QueueItemDto }                     from './getnext.dtos';

@Injectable()
export class GetNextService {

    constructor(private http: Http, private _configuration: ConfigurationService) {
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

            return this.http.post(url, '', ConfigurationService.getHeaders()).map(res => res.json());
        }
    }

    public getQueueItemList(userId: string): Observable<QueueItemDto[]> {
        let url = ConfigurationService.getNextQueueItems.replace('{userId}', userId);
        return this.http.get(url, ConfigurationService.getHeaders()).map(res => res.json());
    }

    public getAppointmentList(userId: string, currentDate: String = '') {
        if (currentDate === null || currentDate === undefined || currentDate.trim() === '') {
            currentDate = moment().format('MMDDYYYY');
        }

        let url = ConfigurationService.calendarAppointmentListApi + '?userId=' + userId
            + '&mode=day&calendarDate=' + currentDate;
        return this.http.get(url, ConfigurationService.getHeaders()).map(res => res.json());
    }

    public getDetails(getNextTaskId: string): Observable<TaskDefinitionHistoryDto> {
        let url = ConfigurationService.getNextTaskHistory
            .replace('{getNextTaskId}', getNextTaskId);
        return this.http.get(url, ConfigurationService.getHeaders()).map(res => res.json());
    }
}
