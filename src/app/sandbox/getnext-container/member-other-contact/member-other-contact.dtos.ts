import { ApiStatusDto }                 from './../../../common/common.dtos';

export class MemberOtherContactDto {
    memberId: string;
    memberContactSeq: string;
    active: boolean;
    primary: boolean;
    caregiver:boolean;
    sendConsent:boolean;
    prefix:string;
    preferedContactMethod:string;
    preferedContactMethodDesc:string;    
    firstName: string;
    lastName: string;
    relationship:string;
    relationshipDesc:string;
    spokenLanguage:string;
    addressLine1:string;
    addressLine2: string;
    city:string;
    state:string;
    email:string;
    sentConsentFormDate:string;
    comments:string;
    phones: MemberOtherContactPhoneDto[];
    apiStatus: ApiStatusDto;
}

export class MemberOtherContactPhoneDto {
    phoneNumber:string;
    phoneType:string;
    phoneTypeDesc:string;
    text:boolean;
    phoneSeq:string;
    contactSeq:string;
    primary:boolean;
    active:boolean;
}