import { Http, Response, Headers, RequestOptions } from '@angular/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs/Observable';
import 'rxjs/add/operator/map';

import { ConfigurationService } from './../../common/configuration.service';
import { MemberDetailsDto }     from './member-header.dtos';
import { MemberLabelsDtos }     from './member-header.label.dtos';

@Injectable()
export class MemberHeaderService {
    constructor(private _http: Http,
        private _configuration: ConfigurationService) {
    }

    getMemberHeader(memberId: string): Observable<MemberDetailsDto> {
        let url = ConfigurationService.memberBannerApi.replace('{memberId}', memberId);
        return this._http.get(url, ConfigurationService.getHeaders()).map(this.extractData);
    }

    private extractData(res: Response) {
        let body = res.json();
        return body || {};
    }
}
