
import { Http, Headers, RequestOptions }    from '@angular/http';
import { Injectable }                       from '@angular/core';
import { Observable }                       from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { ConfigurationService }             from './../../../common/configuration.service';

import { WindowDefinitionDto }              from './../../../common/window.definition/window.definition.dtos';
import { ApiStatusDto }             from './../../../common/common.dtos';
import { MemberCaregiverDto}    from './member-caregiver.dtos';
import { MemberOtherContactDto}    from './../member-other-contact/member-other-contact.dtos';

@Injectable()
export class MemberCaregiverService
{
    constructor(private _http: Http, private _configuration: ConfigurationService)
    {
    }

    public getMemberCaregivers(memberId:string): Observable<MemberCaregiverDto> {
            let url: string = ConfigurationService.getMemberCaregivers
            .replace('{memberId}', memberId);
            return this._http.get(url, ConfigurationService.getHeaders()).map(res => res.json());
        
    }

    public deleteMemberCareviver(memberId:string, contactSeq:string):Observable<MemberOtherContactDto>{
        let url: string = ConfigurationService.deleteMemberOtherContact
            .replace('{memberId}', memberId)
            .replace('{otherContactSeq}', contactSeq);
            return this._http.delete(url, ConfigurationService.getHeaders()).map(res => res.json());
    }

    public getMemberPrimaryOtherContact(memberId:string): Observable<MemberOtherContactDto> {
            let url: string = ConfigurationService.getMemberPrimaryOtherContact
            .replace('{memberId}', memberId);
            return this._http.get(url, ConfigurationService.getHeaders()).map(res => res.json());
        
    }

   
     
}
