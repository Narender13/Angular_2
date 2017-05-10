
import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';
import * as moment from 'moment';

import { ConfigurationService }     from './../../../common/configuration.service';
import { ApiStatusDto }             from './../../../common/common.dtos';
import { MemberOtherContactDto,
        MemberOtherContactPhoneDto }    from './member-other-contact.dtos';

@Injectable()
export class MemberOtherContactService
{
    constructor(private _http: Http, private _configuration: ConfigurationService)
    {
    }

    public saveMemberOtherContact(memberOtherContact: MemberOtherContactDto): Observable<MemberOtherContactDto> {

        if (memberOtherContact.memberContactSeq === null || memberOtherContact.memberContactSeq === undefined) {
           // let now: string = moment().format('MMDDYYYY'); sent_consent?
           // chartNoteDto.encounterDateTime = now;
            let body = JSON.stringify( memberOtherContact );
            let url = ConfigurationService.createMemberOtherContact;
            return this._http.post(url, body, ConfigurationService.getHeaders()).map(res => res.json());
        } else {
            let url = ConfigurationService.updateMemberOtherContact;
            let body = JSON.stringify( memberOtherContact );
            return this._http.put(url, body, ConfigurationService.getHeaders()).map(res => res.json());
        }
    }

   public getMemberOtherContact(memberId:string, contactSeq:string) : Observable<MemberOtherContactDto> {
        let url: string = ConfigurationService.retrieveMemberOtherContact
            .replace('{memberId}', memberId)
            .replace('{otherContactSeq}', contactSeq);
        return this._http.get(url, ConfigurationService.getHeaders()).map(res => res.json());
   }  
   
     
}
