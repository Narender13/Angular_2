import { Http, Headers, RequestOptions } from '@angular/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import { ConfigurationService } from './../../../common/configuration.service';
import {
    AppointmentDto, UserSearchDto, UserGroupSearchDto, AppointmentTypeDto,
    AppointmentSubjectDto, UserTypesSearchDto, CreateAppointmentDto

} from './user.calendar.dtos';
import { appointments } from './user.calendar.appointment.mock-data';
import { appointmentTypes } from './user.calendar.appointmentType.mock-data';

@Injectable()
export class UserCalendarService {
    constructor(private _http: Http, private _configuration: ConfigurationService) {

    }

    setBearerToekn(sBearerToken: string) {
        ConfigurationService.usertoken = sBearerToken;
    }

    getAppointments(sUserId: number, mode, date): Observable<AppointmentDto[]> {
        let url = ConfigurationService.calendarAppointmentListApi+ '?userId=' + sUserId + '&mode=' + mode +'&calendarDate=' + date;
        console.log('url: ' + url);
        return this._http.get(url, ConfigurationService.getHeaders()).map(res => res.json());
    }
    getAppointmentsForListView(sUserId: number, listViewDate: string): Observable<AppointmentDto[]> {
        let url = ConfigurationService.calendarAppointmentListApi+ '?userId=' + sUserId +
        '&mode=list&calendarDate=' + listViewDate + '&noOfDays=14';
        return this._http.get(url, ConfigurationService.getHeaders()).map(res => res.json());
    }

    getAppointmentTypesStatic() {
        return appointmentTypes;
    }


    getUsersSearchResults(userName: string): Observable<UserSearchDto[]> {
        let url = ConfigurationService.searchUsers.replace('{userName}', userName);
        console.log('url', url);
        return this._http.get(url, ConfigurationService.getHeaders()).map(res => res.json());
    }

    getUserGroupSearchResults(userGroupName: string): Observable<UserTypesSearchDto[]> {
        let url = ConfigurationService.searchUserTypes.replace('{userTypeDesc}', userGroupName);
        console.log('url', url);
        return this._http.get(url, ConfigurationService.getHeaders()).map(res => res.json());
    }

    createAppointment(body: CreateAppointmentDto, userId: string): Observable<AppointmentDto> {
        console.log('post payload', JSON.stringify(body));
        let url = ConfigurationService.addAppointment.replace('{userId}', userId);
        console.log(url);
        return this._http.post(url, JSON.stringify(body), ConfigurationService.getHeaders()).map(res => res.json());
    }

    getAppointmentTypes(isMember): Observable<AppointmentTypeDto[]> {
        let url = isMember ? ConfigurationService.appointmentMemberTypes : ConfigurationService.appointmentTypes;
        // let url = ConfigurationService.appointmentTypes;
        console.log('url',  url);
        return this._http.get(url, ConfigurationService.getHeaders()).map(res => res.json());
    }

}
