
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { ApAssessmentDto, ApAssessmentNavigationRequestDto,
         ApAssessmentStartRequestDto, ApAssessmentListResponseDto,
         ApAssessmentListRequestDto, ApAssessmentViewDto,
         ApAssessmentSubmitRequestDto,
         ApAssessmentViewRequestDto }   from './ap-assessment.dtos';
import { ConfigurationService }             from './../../common/configuration.service';
import { MemberDetailsDto }     from './../member-header/member-header.dtos';


@Injectable()
export class ApAssessmentService {

    constructor(private _http: Http, private _configuration: ConfigurationService) {
    }

    public startNewAssessment(body: ApAssessmentStartRequestDto): Observable<ApAssessmentDto> {
        let url: string = ConfigurationService.apAssessmentStartApi;
        return this._http.post(url, JSON.stringify(body), ConfigurationService.getHeaders()).map(res => res.json());
    }

    public continueAssessment(body: ApAssessmentViewRequestDto): Observable<ApAssessmentDto> {
        let url: string = ConfigurationService.apAssessmentContinueApi;
        return this._http.post(url, JSON.stringify(body), ConfigurationService.getHeaders()).map(res => res.json());
    }

    public navigateToNext(body: ApAssessmentNavigationRequestDto): Observable<ApAssessmentDto> {
        let url: string = ConfigurationService.apAssessmentNextApi;
        return this._http.post(url, JSON.stringify(body), ConfigurationService.getHeaders()).map(res => res.json());
    }

    public navigateToPrevious(body: ApAssessmentNavigationRequestDto): Observable<ApAssessmentDto> {
        let url: string = ConfigurationService.apAssessmentPreviousApi;
        return this._http.post(url, JSON.stringify(body), ConfigurationService.getHeaders()).map(res => res.json());
    }

    public saveAssessment(body: ApAssessmentNavigationRequestDto) {
        let url: string = ConfigurationService.apAssessmentSaveApi;
        return this._http.post(url, JSON.stringify(body), ConfigurationService.getHeaders()).map(res => res.json());
        // let url: string = 'app/sandbox/ap-assessment/test/mock-data/save-response.json';
        // return this._http.get(url, ConfigurationService.getHeaders()).map(res => res.json());
    }

    public submitAssessment(body: ApAssessmentSubmitRequestDto): Observable<ApAssessmentDto> {
        let url: string = ConfigurationService.apAssessmentSubmitApi.replace('{userId}', ConfigurationService.userId);
        return this._http.post(url, JSON.stringify(body), ConfigurationService.getHeaders()).map(res => res.json());
    }

    public listAssessment(dto: ApAssessmentListRequestDto): Observable<ApAssessmentListResponseDto> {
        let url: string = ConfigurationService.apAssessmentListApi;
        if (!dto.parentAssessmentId) {
            url = url.replace('parentAssessmentAlgorithmId={parentAssessmentAlgorithmId}&', '');
        }
        if (!dto.memberAssessmentId) {
            url = url.replace('&parentMemberAssessmentId={parentMemberAssessmentId}', '');
        }

        url = url.replace('{memberId}', dto.memberId)
            .replace('{parentAssessmentAlgorithmId}', dto.parentAssessmentId)
            .replace('{parentMemberAssessmentId}' , dto.memberAssessmentId);
        return this._http.get(url, ConfigurationService.getHeaders()).map(res => res.json());
    }

    public getCompletedAssessmentDetail(dto: ApAssessmentViewRequestDto): Observable<ApAssessmentViewDto> {
        let url: string = ConfigurationService.apAssessmentViewApi
            .replace('{memberId}', dto.memberId)
            .replace('{memberAssessmentId}', dto.memberAssessmentId);
        return this._http.get(url, ConfigurationService.getHeaders()).map(res => res.json());
        // let url: string = 'app/sandbox/ap-assessment/test/mock-data/read-only-view.json';
        // return this._http.get(url, ConfigurationService.getHeaders()).map(res => res.json());
    }

    public getMemberAssessmentId(dto: ApAssessmentStartRequestDto): Observable<ApAssessmentDto> {
        let url: string = ConfigurationService.apAssessmentGetMemberAssessmentIdApi
            .replace('{memberId}', dto.memberId)
            .replace('{assessmentAlgorithmId}', dto.assessmentAlgorithmId);
        return this._http.get(url, ConfigurationService.getHeaders()).map(res => res.json());
    }
}


