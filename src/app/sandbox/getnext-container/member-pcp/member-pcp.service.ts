import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import 'rxjs/add/operator/toPromise';
import * as moment from 'moment';

import { ConfigurationService }     from './../../../common/configuration.service';
import { ApiStatusDto }             from './../../../common/common.dtos';

import { MemberPCPDTO,MemberPCPDTOList }    from './member-pcp.dtos';

@Injectable()
export class MemberPCPService
{
    constructor(private _http: Http, private _configuration: ConfigurationService)
    {
    }

    public updateMemberPCP(memberId:string,memberPCP: MemberPCPDTOList): Observable<MemberPCPDTOList> {
            
        let url = ConfigurationService.updateMemberPCP.replace('{memberId}', memberId);
        let body = JSON.stringify( memberPCP );
        return this._http.put(url, body, ConfigurationService.getHeaders()).map(res => res.json());

    }

    public createMemberPCP(memberId:string, memberPCP: MemberPCPDTOList): Observable<MemberPCPDTOList> {
            
        let url = ConfigurationService.createMemberPCP.replace('{memberId}', memberId);
        let body = JSON.stringify( memberPCP )
        return this._http.post(url, body, ConfigurationService.getHeaders()).map(res => res.json());

    }
 
   public getMemberPCP(memberId:string) : Observable<any> {
       let url: string = ConfigurationService.retrieveMemberPCP
            .replace('{memberId}', memberId);
        return this._http.get(url, ConfigurationService.getHeaders()).map(res => res.json());
   }  
 
   public searchProviders(searchText:string) {
       
       let url:string = ConfigurationService.searchProvider.replace('{name}', searchText);
        
        return this._http.get(url, ConfigurationService.getHeaders()).toPromise()
                    .then(res => {return res.json();});
                    
   }
    
}