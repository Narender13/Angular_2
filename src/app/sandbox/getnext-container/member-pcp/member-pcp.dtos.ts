import { ApiStatusDto }                 from './../../../common/common.dtos';

export class MemberPCPDTO  {
    memberId: string;
    providerId: string;
    providerFirstName: string;
    providerLastName: string;
    providerDisplayName:string;
    startDate: string;  
    endDate: string;
    pcpType:string;
    pcpTypeDesc:string;
    providerRiskGroupDesc: string;
    
}    

export class MemberPCPDTOList  {
    pcps: MemberPCPDTO[];
    apiStatus: ApiStatusDto;    
}    

export class ProviderModel {
    name:string;
    providerId:string;
    address:string;
    firstName:string;
    lastName:string;

}
