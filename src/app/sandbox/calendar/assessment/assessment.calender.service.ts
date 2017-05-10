
import { Http, Headers, RequestOptions } from '@angular/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { ConfigurationService } from './../../../common/configuration.service';

import { AppointmentDto } from './assessment.calendar.dtos';

@Injectable()
export class AssessmentCalendarService {
    constructor(private _http: Http, private _configuration: ConfigurationService) {

    }

    getAppointments(): Observable<AppointmentDto[]> {

        // todo: this isn't the correct code yet as the service hasn't been written yet
        let url = ConfigurationService.appointmentListApi
            .replace('{activeOnly}', 'false');

        return this._http.get(url, ConfigurationService.getHeaders()).map(res => res.json());
    }

    // getRuleTokenDefinition(token: string): Observable<TokenDefinitionDto> {

    //     let url = ConfigurationService.serverWithApiUrl + ConfigurationService.ruleTokenDefinition
    //         .replace('{tenantId}', ConfigurationService.tenantId)
    //         .replace('{token}', token);

    //     return this._http.get(url, ConfigurationService.getHeaders()).map(res => res.json());
    // }

    // createRuleToken(tokenToSave: TokenDefinitionDto): Observable<TokenDefinitionDto> {
    //     let url = ConfigurationService.serverWithApiUrl + ConfigurationService.ruleTokenDefinition
    //         .replace('{tenantId}', ConfigurationService.tenantId) ;

    //     let body = JSON.stringify( tokenToSave );

    //     return this._http.post(url, body, ConfigurationService.getHeaders()).map(res => res.json());
    // }
}
