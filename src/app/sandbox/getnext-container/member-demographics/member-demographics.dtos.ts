import { ApiStatusDto }  from './../../../common/common.dtos';


export class MemberDemographicsProfileDto {
    spokenLanguage:string;
    firstName:string;
    middleName:string;
    lastName:string;
    email:string;
    address1:string;
    address2:string;
    county:string;
    city:string;
    state:string;
    zip:string;
    memberId:string;
    memberAddresses:MemberDemographicAddressDto[] = []; 
    memberPhones:MemberDemographicPhoneDto[] = [];
    protectedFields:string[] = [];
    apiStatus: ApiStatusDto;
}


export class MemberDemographicPhoneDto {
    isPrimary:boolean;
    number:string;
    id:string;
    memberId:string;
    phoneType:string;
    isActive:boolean;
    entryNumber:string;
 }


export class MemberDemographicAddressDto {
    address1:string;
    address2:string;
    city:string;
    county:string;
    id:string;
    isPrimary:boolean;
    state:string;
    zip:string;
    memberId:string;
    isActive:boolean;
    entryNumber:string;
}








       
