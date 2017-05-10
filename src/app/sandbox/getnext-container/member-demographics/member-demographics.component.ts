import { Component, ViewEncapsulation, Input, Output, EventEmitter,
         ViewChild, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormControl,
         Validators, FormBuilder, FormArray }      from '@angular/forms';
import { ActivatedRoute }               from '@angular/router';

// the dropdown list items have to be setup as SelectItems
import {
    SelectItem, Dropdown, EditorModule,
    SharedModule, Dialog, Message, InputMaskModule
} from 'primeng/primeng';
import * as moment from 'moment';

import { ConfirmDialogComponent } from './../confirm-dialog/confirm-dialog.component';
import { MemberDemographicsService }    from './member-demographics.service';
import { MemberDemographicPhoneDto, MemberDemographicAddressDto, MemberDemographicsProfileDto } from './member-demographics.dtos';
import { BaseComponent }                from './../../../common/base.component';
import { ConfigurationService }         from './../../../common/configuration.service';
import { WindowDefinitionDto }          from './../../../common/window.definition/window.definition.dtos';
import { WindowDefinitionService }      from './../../../common/window.definition/window.definition.service';
import { MessageService } from './../../../common/message.service';

declare function closeParentWindow(): void;

@Component({
    selector: 'memberDemographics',
    encapsulation: ViewEncapsulation.None,
    templateUrl: './member-demographics.component.html',
    styleUrls: ['member-demographics.component.css'],
    providers: [MemberDemographicsService, WindowDefinitionService, MessageService]
})

export class MemberDemographicsComponent extends BaseComponent implements OnInit, OnDestroy {

    private  display:  boolean  =  false;
    private isLoading: boolean = true;
    private isError = false;
    private dirtyFlag = true;

    private memberEmailDisabled = false;
    private memberSpokenLanguageDisabled = false;
    private memberAddress1Disabled = false;
    private memberAddress2Disabled = false;
    private memberCountyDisabled = false;
    private memberCityDisabled = false;
    private memberStateDisabled = false;
    private memberZipDisabled = false;
    private deleteMemberAddressDisabled = false;

    private address1Disabled = false;
    private address2Disabled = false;
    private countyDisabled = false;
    private cityDisabled = false;
    private stateDisabled = false;
    private zipDisabled = false;
    private primaryAddressDisabled = false;
    private deleteAddressDisabled = false;

    private saveButtonDisabled = false;

    private phoneNumberDisabled = false;
    private phoneTypeDisabled = false;
    private primaryPhoneDisabled = false;
    private deletePhoneDisabled = false;

    dto: MemberDemographicsProfileDto;

    phones: MemberDemographicPhoneDto[];
    addresses: MemberDemographicAddressDto[];

    newphones: MemberDemographicPhoneDto[] = [];
    newaddresses: MemberDemographicAddressDto[]  = [];

    emptyProtectedFields : string[];

    private memberId: string;
    private uiDefinition: WindowDefinitionDto[] = [];
    private idOfUser: string;
    private update: boolean;
    private phonePrimary: string;
    private addressPrimary: string;


    spokenLanguageTypeOptions: SelectItem[];
    phoneTypeOptions: SelectItem[];
    stateTypeOptions: SelectItem[];

    address1Label: string;
    address2Label: string;
    countyLabel: string;
    cityLabel: string;
    zipLabel: string;
    phoneNumberLabel: string;
    emailLabel: string;

    private addressMarkedForDeletion : MemberDemographicAddressDto;
    private phoneMarkedForDeletion : MemberDemographicPhoneDto;
    private yesNoUse : string;

    @ViewChild(ConfirmDialogComponent) confirmDialog: ConfirmDialogComponent;

    constructor(private _route: ActivatedRoute,
        private _configuration: ConfigurationService,
        private _memberDemographicsService: MemberDemographicsService,
        private _windowDefinitionService: WindowDefinitionService,
        private _messageService: MessageService) {
        super(_route, _windowDefinitionService);
    }

    ngOnInit() {
        // This is for testing only
        // this._route.queryParams.subscribe(
        //     (param: String) => {

        //         this.memberId = param['memberId'];
          
        //     });
        // this.initFormView(this.memberId, this.idOfUser);
      
    }

    initFormView(memberId: string, idOfUser: string) {

        this.memberId = memberId;
        this.idOfUser = idOfUser;
        this.dto = new MemberDemographicsProfileDto();
        this.dto.memberId = memberId;
        this.isLoading = true;
        this.getMemberOtherContactUIDefinition();
        this.getMemberDemographics(this.memberId);        
 
    }

    showDialog(memberId: string, idOfUser: string) {
        this.initFormView(memberId,idOfUser);
    }

    ngOnDestroy() {

    }

    private getMemberOtherContactUIDefinition() {
        if (this.uiDefinition.length === 0) {
            this._windowDefinitionService.getWindowDefinition('w_add_demographic')
                .subscribe(
                windowDefinition => {
                    this.uiDefinition = windowDefinition;
                    this.setLabels();
                    this.setDropDownOptions();
                    this.display = true;
                    this.isLoading = false;
                },
                err => {
                    this.isError = true;
                    this.isLoading = false;
                    this.showErrorMessage('An error occurred retrieving the add member demographic window definition.');
                },
                () => {
                });
        }
    }

    private  checkForEmptyAddress(address: MemberDemographicAddressDto){

        var emptyAddress: boolean = false;
			
			if(    (address.address1 === null || address.address1 === undefined || address.address1 === "")
			    && (address.address2 === null || address.address2 === undefined || address.address2 === "")
				&& (address.city === null || address.city === undefined || address.city === "")
				&& (address.county === null || address.county === undefined || address.county === "")
				&& (address.state === null || address.state === undefined || address.state === "")
				&& (address.zip === null || address.zip === undefined || address.zip === "") ){
				
					emptyAddress = true;
				}

          return  emptyAddress;     
    }

     private saveMemberDemographics() {

        this.saveButtonDisabled = true;
        let error: string = "";

        if(this.phones === null){
            this.phones = [];
        }

        if (this.newphones !== null) {
             for (var i = this.newphones.length - 1; i >= 0; i--){
                 this.phones.push(this.newphones[i]);
             }
        }

        this.newphones = [];

         if (this.phones !== null) {
            var primaryPhone = this.phonePrimary;

            console.log("this.phones.length: " + this.phones.length);

            for (var i = this.phones.length - 1; i >= 0; i--) {
                
                if (primaryPhone === this.phones[i].entryNumber) {
                    this.phones[i].isPrimary = true;
                }
                else {
                    this.phones[i].isPrimary = false;
                }
                
                if (this.phones[i].number === null || this.phones[i].number === undefined || this.phones[i].number === "") {
                    this.phones.splice(i, 1);
                }
                else if (this.phones[i].id === null && !this.phones[i].isActive) {
                    this.phones.splice(i, 1);
                }
            }

            this.dto.memberPhones = this.phones;
        }

        if(this.addresses === null){
            this.addresses = [];
        }

        if (this.newaddresses !== null) {
             for (var i = this.newaddresses.length - 1; i >= 0; i--){
                 this.addresses.push(this.newaddresses[i]);
             }
        }

        this.newaddresses = [];

        if (this.addresses !== null) {
            var primaryAddress = this.addressPrimary;

            for (var i = this.addresses.length - 1; i >= 0; i--) {
                if (this.checkForEmptyAddress(this.addresses[i]) === false) {

                    if (primaryAddress === this.addresses[i].entryNumber) {
                        this.addresses[i].isPrimary = true;
                    }
                    else {
                        this.addresses[i].isPrimary = false;
                    }
                }
                if (this.checkForEmptyAddress(this.addresses[i]) === true) {
                    this.addresses.splice(i, 1);
                }
                else if (this.addresses[i].id === null && !this.addresses[i].isActive) {
                    this.addresses.splice(i, 1);
                }
            }

            this.dto.memberAddresses = this.addresses;
        }

     
       
        if (error === "") {
            this._memberDemographicsService.saveMemberDemographics(this.dto)
                .subscribe(
                    demoGraphicModelAndProfile => {
                        this.showSuccessMessage('Member Demographics saved.');
                        this.saveButtonDisabled = false;
                        this.dto = demoGraphicModelAndProfile;
                        this.setMemberDemographicsUI(); 

                },
                err => {
                    this.saveButtonDisabled = false;
                    this.handleError(err.toString(), 'An error occurred saving the member demographics.');
                });

        }
        else {
            this.showErrorMessage("The following is required:" + error);
            if (this.phones === null || this.phones.length === 0) {
                this.addPhone();
            }
        }

    };

    private getMemberDemographics(memberId: string) {
        this._memberDemographicsService.getMemberDemographics(memberId)
            .subscribe(
            demoGraphicModelAndProfile => {

                this.dto = demoGraphicModelAndProfile;
                this.setMemberDemographicsUI(); 

            },
            err => {
                this.showErrorMessage('An error occurred retrieving the member demographics.');
                console.error(err);
            },
            () => {
            });
    }

    private setMemberDemographicsUI() {	
	
	  this.checkForNullsInProfile();
      this.setProtectedFields();

      this.phones = [];
      this.newphones = [];
      this.addresses = [];
      this.newaddresses = [];


      this.phones = this.dto.memberPhones;

      if (this.phones === null){ 
        this.newphones = new Array<MemberDemographicPhoneDto>();
        var newPhone = new MemberDemographicPhoneDto();

        newPhone.isPrimary = true;
        newPhone.isActive = true;
        newPhone.entryNumber = "1";

        this.phonePrimary = "1";
        this.newphones.push(newPhone);
	  }
      else{
        for (var i = 0; i < this.phones.length; i++) {
            this.phones[i].entryNumber = (i + 1).toString();
        }

        for (var i = this.phones.length - 1; i >= 0; i--) {
            if (this.phones[i].isPrimary !== null && this.phones[i].isPrimary === true && this.phones[i].isActive) {
            this.phonePrimary = this.phones[i].entryNumber;
            }
        }
      }

      this.addresses = this.dto.memberAddresses;
     
      if (this.addresses == null) {
        this.newaddresses = new Array<MemberDemographicAddressDto>();
        var newAddress = new MemberDemographicAddressDto();

        newAddress.isPrimary = true;
        newAddress.isActive = true;
        newAddress.entryNumber = "1"
                    
        this.addressPrimary = "1";
        this.newaddresses.push(newAddress);
      }
      else{
        for (var i = 0; i < this.addresses.length; i++) {
            this.addresses[i].entryNumber = (i + 1).toString();
        }

        for (var i = this.addresses.length - 1; i >= 0; i--) {
            if (this.addresses[i].isPrimary !== null && this.addresses[i].isPrimary === true && this.addresses[i].isActive) {
                this.addressPrimary = this.addresses[i].entryNumber;
            }
        }
      }
 
      this.display = true;
      this.isLoading = false;
      this.dirtyFlag = false;
	
    }	

    private setProtectedFields(){

      for (var i = this.dto.protectedFields.length - 1; i >= 0; i--) {

        if(this.dto.protectedFields[i] === 'member_member_address1'){
            this.memberAddress1Disabled = true;
        }
	
        if(this.dto.protectedFields[i] === 'member_member_address2'){
            this.memberAddress2Disabled = true;
        }
	
        if(this.dto.protectedFields[i] === 'member_member_county'){
            this.memberCountyDisabled = true;
        }
	
        if(this.dto.protectedFields[i] === 'member_member_city'){
            this.memberCityDisabled = true;
        }
	
        if(this.dto.protectedFields[i] === 'member_member_state'){
            this.memberStateDisabled = true;
        }
	
        if(this.dto.protectedFields[i] === 'member_member_zip'){
            this.memberZipDisabled = true;
        }

        if(this.dto.protectedFields[i] === 'member_address1'){
            this.address1Disabled = true;
        }
	
        if(this.dto.protectedFields[i] === 'member_address2'){
            this.address2Disabled = true;
        }
	
        if(this.dto.protectedFields[i] === 'member_county'){
            this.countyDisabled = true;
        }
	
        if(this.dto.protectedFields[i] === 'member_city'){
            this.cityDisabled = true;
        }
	
        if(this.dto.protectedFields[i] === 'member_state'){
            this.stateDisabled = true;
        }
	
        if(this.dto.protectedFields[i] === 'member_zip'){
            this.zipDisabled = true;
        }
	
        if(this.dto.protectedFields[i] === 'primary_address'){
            this.primaryAddressDisabled = true;
        }
	
        if(this.dto.protectedFields[i] === 'member_phone'){
            this.phoneNumberDisabled = true;
        }
	
        if(this.dto.protectedFields[i] === 'member_phone_type'){
            this.phoneTypeDisabled = true;
        }

        if(this.dto.protectedFields[i] === 'primary_phone'){
            this.primaryPhoneDisabled = true;
        }	
	
        if(this.dto.protectedFields[i] === 'member_member_spoken_language'){
		    this.memberSpokenLanguageDisabled = true;
	    }
	
	    if(this.dto.protectedFields[i] === 'member_member_email'){
		    this.memberEmailDisabled = true;
	    }

      }

      if(this.memberAddress1Disabled === true || this.memberAddress2Disabled === true || this.memberCountyDisabled === true || this.memberCityDisabled === true || this.memberStateDisabled === true || this.memberZipDisabled === true){
	    this.deleteMemberAddressDisabled = true
	  }	

      if(this.address1Disabled === true || this.address2Disabled === true || this.countyDisabled === true || this.cityDisabled === true || this.stateDisabled === true || this.zipDisabled === true || this.primaryAddressDisabled === true){
	    this.deleteAddressDisabled = true
	  }	

      if(this.phoneNumberDisabled === true || this.phoneTypeDisabled === true || this.primaryPhoneDisabled === true){
	    this.deletePhoneDisabled = true;
      }

    }

    private checkForNullsInProfile(){
     
     if(this.dto.address1 === null){
        this.dto.address1 = '';
      }

      if(this.dto.address2 === null){
        this.dto.address2 = '';
      }

      if(this.dto.city === null){
        this.dto.city = '';
      }

      if(this.dto.county === null){
        this.dto.county = '';
      }
            
      if(this.dto.email === null){
        this.dto.email = '';
      }

      if(this.dto.firstName === null){
        this.dto.firstName = '';
      }

      if(this.dto.lastName === null){
        this.dto.lastName = '';
      }

      if(this.dto.middleName === null){
        this.dto.middleName = '';
      }

      if(this.dto.spokenLanguage === null){
        this.dto.spokenLanguage = '';
      }

      if(this.dto.state === null){
        this.dto.state = '';
      }

	  if(this.dto.zip === null){
        this.dto.zip = '';
      }

      if(this.dto.protectedFields === null){
        this.dto.protectedFields = this.emptyProtectedFields;
      }


    }

    private setDropdownItemsToArray(soughtListId: string, windowFields: WindowDefinitionDto[], options: SelectItem[],
        activeOnly: boolean, selectValue: string) {

        if (windowFields != null && options != null && soughtListId != null) {

            options.push({ label: selectValue, value: null });

            for (let fieldDef of windowFields) {
                if (fieldDef.fieldId === soughtListId) {
                    for (let dataRow of fieldDef.fkTableData[0].dataRows) {
                        if (dataRow.description !== null && dataRow.description !== undefined) {
                            if (activeOnly) {
                                if (dataRow.active) {
                                    options.push({ label: dataRow.description, value: dataRow.idColumn1 });                                   
                                }
                            } else {
                                options.push({ label: dataRow.description, value: dataRow.idColumn1 });
                            }
                        }
                    }
                }
            }
        }
    }

    private setDropdownItemsToArrayIdOnly(soughtListId: string, windowFields: WindowDefinitionDto[], options: SelectItem[],
        activeOnly: boolean, selectValue: string) {

        if (windowFields != null && options != null && soughtListId != null) {

            options.push({ label: selectValue, value: null });

            for (let fieldDef of windowFields) {
                if (fieldDef.fieldId === soughtListId) {
                    for (let dataRow of fieldDef.fkTableData[0].dataRows) {
                        if (dataRow.idColumn1 !== null && dataRow.idColumn1 !== undefined) {
                            if (activeOnly) {
                                if (dataRow.active) {
                                    options.push({ label: dataRow.idColumn1, value: dataRow.idColumn1 });                                   
                                }
                            } else {
                                options.push({ label: dataRow.idColumn1, value: dataRow.idColumn1 });
                            }
                        }
                    }
                }
            }
        }
    }


    private setSpokenLanguageTypeOptions() {
        this.spokenLanguageTypeOptions = [];
        this.setDropdownItemsToArray('member_spoken_language', this.uiDefinition, this.spokenLanguageTypeOptions, true, 'Select...');
    }


    private setStateTypeOptions() {        
        this.stateTypeOptions = [];
        this.setDropdownItemsToArrayIdOnly('member_state', this.uiDefinition, this.stateTypeOptions, false, 'State...');
    }

    private setPhoneTypeOptions() {
        this.phoneTypeOptions = [];
        this.setDropdownItemsToArray('member_phone_type', this.uiDefinition, this.phoneTypeOptions, true, ' Phone Type...');
    }

   
    private setDropDownOptions() {
        this.setStateTypeOptions();
        this.setSpokenLanguageTypeOptions();
        this.setPhoneTypeOptions();

    }

    private setLabels() {

        this.address1Label = this._windowDefinitionService
            .getFieldLabel(this.uiDefinition, 'member_address1', 'Address 1');
        this.address2Label = this._windowDefinitionService
            .getFieldLabel(this.uiDefinition, 'member_address2', 'Address 2');
        this.countyLabel = this._windowDefinitionService
            .getFieldLabel(this.uiDefinition, 'member_county', 'County');
        this.cityLabel = this._windowDefinitionService
            .getFieldLabel(this.uiDefinition, 'member_city', 'City');
        this.zipLabel = this._windowDefinitionService
            .getFieldLabel(this.uiDefinition, 'member_zip', 'Zip');
        this.phoneNumberLabel = this._windowDefinitionService
            .getFieldLabel(this.uiDefinition, 'member_phone', 'Phone Number');
        this.emailLabel = this._windowDefinitionService
            .getFieldLabel(this.uiDefinition, 'member_email', 'Email');
       
    }

    private deleteAddress(address: MemberDemographicAddressDto) {
        this.addressMarkedForDeletion = address;
        this.yesNoUse = "deleteAddress";
        this.confirmDialog.show("Are you sure you want to delete this address?");

    }

    private deletePhone(phone: MemberDemographicPhoneDto) {
        this.phoneMarkedForDeletion = phone;
        this.yesNoUse = "deletePhone";
        this.confirmDialog.show("Are you sure you want to delete this phone number?");

    }

   private deleteMemberAddress() {

        this.yesNoUse = "deleteMemberAddress";
        this.confirmDialog.show("Are you sure you want to delete this address?");
   }

    private changeModel(){
        this.dirtyFlag = true;
        console.log('changeModel()');
    }

    private onNgModelChange(){
        this.dirtyFlag = true;
        console.log('onNgModelChange()');
    }
    

    private warnUserDiscardingChanges() {

        this.yesNoUse = "warnUserDiscardingChanges";

        if(this.dirtyFlag === true){
            this.confirmDialog.show("Do you want to save edits to the Member Demographics? If so, please select 'Save'");
        }
        else{
            this.messages = [];
            this.display=false;
        }
    }

    yesNo(accepted: boolean){

        if(accepted){

            if(this.yesNoUse === "deletePhone"){
                this.dirtyFlag = true;
                this.phoneMarkedForDeletion.isActive = false;
            }
            else if(this.yesNoUse === "deleteAddress"){
                this.dirtyFlag = true;
                this.addressMarkedForDeletion.isActive = false;
            }
            else if(this.yesNoUse === "deleteMemberAddress"){
                this.dirtyFlag = true;
                
                this.dto.address1 = "";
                this.dto.address2 = "";
                this.dto.city = "";
                this.dto.county = "";
                this.dto.state = "";
                this.dto.zip = "";
            }
  
        }
        else{
            if(this.yesNoUse === "warnUserDiscardingChanges"){
                this.messages = [];
                this.display=false;
            }
        }
    
    }

    private getNextActivePhone() {
        var found: boolean = false;
        for (var i = this.phones.length - 1; i >= 0; i--) {
            if (this.phones[i].isActive === true) {
                found = true;
                this.phonePrimary = this.phones[i].id;
            }
        }
        if (!found) {
            this.phonePrimary = "";
        }
    }

    private addAddress() {
        
        let newAddress = new MemberDemographicAddressDto();
        
        newAddress.isPrimary = false;
        newAddress.isActive = true;
        newAddress.memberId = this.dto.memberId;

        var addressLength : number;
        var newAddressLength : number;

        if(this.addresses === null){
            addressLength = 0;
        }
        else{
            addressLength = this.addresses.length;
        }

        if(this.newaddresses === null){
            newAddressLength = 0;
        }
        else{
            newAddressLength = this.newaddresses.length;
        }

        var entryNumber : number = addressLength + newAddressLength + 1;
        newAddress.entryNumber = entryNumber.toString();
        
        this.newaddresses.push(newAddress);

    }

    private addPhone() {
        
        let newPhone = new MemberDemographicPhoneDto();
        
        newPhone.isPrimary = false;
        newPhone.isActive = true;
        newPhone.memberId = this.dto.memberId;

        var phoneLength : number;
        var newPhoneLength : number;

        if(this.phones === null){
            phoneLength = 0;
        }
        else{
            phoneLength = this.phones.length;
        }

        if(this.newphones === null){
            newPhoneLength = 0;
        }
        else{
            newPhoneLength = this.newphones.length;
        }

        var entryNumber : number = phoneLength + newPhoneLength + 1;
        newPhone.entryNumber = entryNumber.toString();
         
        this.newphones.push(newPhone);

    }
   
    private closeWindow() {
        this.display = false;
        if (process.env.ENV !== 'development') {
            try {
                closeParentWindow();
            } catch (error) {

            }
        }
    }

    // private onBeforeDialogHide(event) {
    
    //     event.stopPropagation();
    //     this.yesNoUse = "warnUserDiscardingChanges";
    //     this.confirmDialog.show("Do you want to save edits to the Member Demographics? If so, please select 'Save'");
    //     return false;

    // }

   }