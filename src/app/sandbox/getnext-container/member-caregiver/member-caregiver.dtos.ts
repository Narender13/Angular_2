import { ApiStatusDto }                 from './../../../common/common.dtos';
import {MemberOtherContactDto}          from './../member-other-contact/member-other-contact.dtos'

export class MemberCaregiverDto {
   
    caregivers: MemberOtherContactDto[];
    apiStatus: ApiStatusDto;
}

