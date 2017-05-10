import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { ConfigurationService } from './../../common/configuration.service';
import {
    ApCarePlanDto, UpdatedCarePlanDto, SaveInterventionNoteRequestDto, CpInterventionNoteDto,
    CpSaveEducationDto, CpInstructionsRequestDto, CpViewNoteHistoryDto, CpEducationDto, ApiStatusDto, CpInstructionsResponseDto
} from './careplan.dtos';

@Injectable()
export class CarePlanService {
    constructor(private _http: Http, private _configuration: ConfigurationService) {
    }

    public view(memberId: string): Observable<ApCarePlanDto> {
        // return this.mockView(memberId);
        let url: string = ConfigurationService.carePlanViewApi
            .replace('{memberId}', memberId);
        return this._http.get(url, ConfigurationService.getHeaders()).map(res => res.json());
    }

    public saveCarePlan(body: UpdatedCarePlanDto): Observable<ApCarePlanDto> {
        // return this.mockSaveCarePlan(body);
        let url: string = ConfigurationService.carePlanSaveApi;
        return this._http.post(url, JSON.stringify(body), ConfigurationService.getHeaders()).map(res => res.json());
    }

    public saveNote(body: SaveInterventionNoteRequestDto): Observable<CpInterventionNoteDto> {
        let url: string = ConfigurationService.carePlanSaveNoteApi;
        console.log(JSON.stringify(body));
        return this._http.post(url, JSON.stringify(body), ConfigurationService.getHeaders()).map(res => res.json());
    }

    public viewNoteHistory(memberGoalBarrierInterventionId: string): Observable<CpViewNoteHistoryDto> {
        let url = ConfigurationService.carePlanInterventionNoteHistoryApi
            .replace('{memberGoalBarrierInterventionId}', memberGoalBarrierInterventionId);
        return this._http.get(url, ConfigurationService.getHeaders()).map(res => res.json());
    }

    public viewEducation(memberGoalBarrierInterventionId: string): Observable<CpEducationDto> {
        let url = ConfigurationService.carePlanInterventionViewEducationApi
            .replace('{memberGoalBarrierInterventionId}', memberGoalBarrierInterventionId);
        return this._http.get(url, ConfigurationService.getHeaders()).map(res => res.json());
    }


    public saveEducation(body: CpSaveEducationDto): Observable<CpEducationDto> {
        let url = ConfigurationService.carePlanInterventionSaveEducationApi;
        return this._http.post(url, JSON.stringify(body), ConfigurationService.getHeaders()).map(res => res.json());
    }


    public getEducationText(fileName: string): Observable<string> {
        let url = ConfigurationService.carePlanEducationViewFileApi
            .replace('{fileName}', fileName);
        return this._http.get(url, ConfigurationService.getHeaders()).map(res => res.text());
    }

    public viewInstruction(memberGoalBarrierInterventionId: string): Observable<CpInstructionsResponseDto> {
        let url = ConfigurationService.carePlanInterventionViewInstructionApi
            .replace('{memberGoalBarrierInterventionId}', memberGoalBarrierInterventionId);
        // let url = 'app/sandbox/careplan/test/mock-data/view-instructions.json';
        return this._http.get(url, ConfigurationService.getHeaders()).map(res => res.json());
    }
    public saveInstruction(body: CpInstructionsRequestDto): Observable<CpInstructionsResponseDto> {
        console.log(body);
        let url = ConfigurationService.carePlanInterventionSaveInstructionApi;
        return this._http.post(url, JSON.stringify(body), ConfigurationService.getHeaders()).map(res => res.json());

    }

    public mockView(memberId: string): Observable<ApCarePlanDto> {
        let url = 'app/sandbox/careplan/test/mock-data/view-goal-list.json';
        return this._http.get(url, ConfigurationService.getHeaders()).map(res => res.json());
    }

    private mockSaveCarePlan(body: UpdatedCarePlanDto): Observable<ApCarePlanDto> {
        let url = 'app/sandbox/careplan/test/mock-data/update-goal-list.json';
        console.log(JSON.stringify(body));
        return this._http.get(url, ConfigurationService.getHeaders()).map(res => res.json());
    }
}
