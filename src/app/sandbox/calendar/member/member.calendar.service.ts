
import { Http, Headers, RequestOptions } from '@angular/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { ConfigurationService } from './../../../common/configuration.service';

import { AppointmentDto, UserSearchDto, AppointmentTypeDto, CreateAppointmentDto } from './member.calendar.dtos';

@Injectable()
export class MemberCalendarService {
    constructor(private _http: Http, private _configuration: ConfigurationService) {
    }

    /**
     * Sets Bearer token / user token to be used for web services invocation
     */
    setBearerToekn(sBearerToken: string) {
        ConfigurationService.usertoken = sBearerToken;
    }
    
    createAppointment(body: CreateAppointmentDto, userId: string): Observable<AppointmentDto> {
        console.log('post payload', JSON.stringify(body));
        let url = ConfigurationService.addAppointment.replace('{userId}', userId);
        console.log(url);
        return this._http.post(url, JSON.stringify(body), ConfigurationService.getHeaders()).map(res => res.json());
    }

    getAppointments(sUserId: number, mode: string , date: string, isMember: boolean): Observable<AppointmentDto[]> {
        let url = '';
        if (isMember) {
            url = ConfigurationService.calendarAppointmentListMemberApi + '?memberId=' +
                  sUserId + '&mode=' + mode + '&calendarDateAsString=' + date;
        } else {
            url = ConfigurationService.calendarAppointmentListApi + '?userId=' +
                  sUserId + '&mode=' + mode + '&calendarDate=' + date;
        }
        console.log('URL', url);
        return this._http.get(url, ConfigurationService.getHeaders()).map(res => res.json());
    }

    getUserAppointments(sUserId: number, mode: string , date: string): Observable<AppointmentDto[]> {
        let url = ConfigurationService.calendarAppointmentListApi + '?userId=' +
        sUserId + '&mode=' + mode + '&calendarDate=' + date;
        console.log('URL', url);
        return this._http.get(url, ConfigurationService.getHeaders()).map(res => res.json());
    }

    getAppointmentsForListView(sUserId: any, listViewDate: string,  isMember: boolean): Observable<AppointmentDto[]> {
        let url = '';
        if (isMember) {

                url = ConfigurationService.appointmentListMember +
                  '?memberId=' + sUserId  + '&mode=' + 'list' +
                   '&calendarDateAsString=' + listViewDate + '&noOfDays=' + 45;
                    console.log('url', url);
     }else {
            url = ConfigurationService.calendarAppointmentListApi + '?userId=' +
             sUserId + '&mode=' + 'list' + '&calendarDate=' + listViewDate + '&noOfDays=' + 45;
    }
        return this._http.get(url, ConfigurationService.getHeaders()).map(res => res.json());
    }

    getUsersSearchResults(userName: string): Observable<UserSearchDto[]> {
        let url = ConfigurationService.searchUsers.replace('{userName}', userName);
        return this._http.get(url, ConfigurationService.getHeaders()).map(res => res.json());
    }
    getAppointmentTypes(): Observable<AppointmentTypeDto[]> {
        let url = ConfigurationService.appointmentMemberTypes;
        return this._http.get(url, ConfigurationService.getHeaders()).map(res => res.json());
    }

}
