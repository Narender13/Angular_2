
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import * as moment from 'moment';

import { ConfigurationService }     from './../../../common/configuration.service';
import { ApiStatusDto }             from './../../../common/common.dtos';
import { MemberDemographicsProfileDto }    from './member-demographics.dtos';

@Injectable()
export class MemberDemographicsService
{
    constructor(private _http: Http, private _configuration: ConfigurationService)
    {
    }



   public getMemberDemographics(memberId:string) : Observable<MemberDemographicsProfileDto> {
        let url: string = ConfigurationService.retrieveMemberDemographics
            .replace('{memberId}', memberId);
        return this._http.get(url, ConfigurationService.getHeaders()).map(res => res.json());
   }  

   public saveMemberDemographics(memberDemographicsProfileDto: MemberDemographicsProfileDto): Observable<MemberDemographicsProfileDto> {

        let url = ConfigurationService.saveMemberDemographics;
        let body = JSON.stringify( memberDemographicsProfileDto );
        return this._http.put(url, body, ConfigurationService.getHeaders()).map(res => res.json());
        
  }
   
     
}
