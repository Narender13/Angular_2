import {
    Component, Input, Output,
    EventEmitter, HostListener,
    ViewEncapsulation, ViewChild,
    OnInit, OnDestroy
} from '@angular/core';
import {
    FormGroup, FormControl,
    Validators, FormBuilder,
    FormArray
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import {
    SelectItem, Dropdown, EditorModule,
    SharedModule, Dialog, Message, InputMaskModule
} from 'primeng/primeng';

import { TabPanel, TabView, TabViewNav, TabViewModule } from 'primeng/primeng';

import * as moment from 'moment';

import { BaseComponent } from './../../../common/base.component';
import { ConfigurationService } from './../../../common/configuration.service';
import { MemberPCPService } from './member-pcp.service';
import { MemberPCPDTO, MemberPCPDTOList, ProviderModel } from './member-pcp.dtos';
import { MessageService } from './../../../common/message.service';
import { WindowDefinitionService } from './../../../common/window.definition/window.definition.service';
import { ConfirmDialogComponent } from './../confirm-dialog/confirm-dialog.component';

import {
    WindowDefinitionDto,
    RuleDomainTableDataRowsDto,
    DataRowDto
} from './../../../common/window.definition/window.definition.dtos';


@Component({
    selector: 'memberPCP',
    encapsulation: ViewEncapsulation.None,
    templateUrl: './member-pcp.component.html',
    styleUrls: ['member-pcp.component.css'],
    providers: [MemberPCPService, WindowDefinitionService, MessageService]
})
export class MemberPCPComponent extends BaseComponent implements OnInit {
    @Output() setMemberPcpEmitter = new EventEmitter();
    private display: boolean = false;
    addedDto: MemberPCPDTO[] = [];
    providers: ProviderModel[] = [];
    provider: ProviderModel;
    private memberId: string;
    private uiDefinition: WindowDefinitionDto[] = [];
    private idOfUser: string;
    private update: boolean;
    firstNameLabel: string;
    lastNameLabel: string;
    providerIdLabel: string;
    startDateLabel: string;
    endDateLabel: string;
    private title: string;
    private isLoading: boolean = true;
    private isError = false;
    private pcps: MemberPCPDTO[] = [];
    private pcpList: MemberPCPDTO[] = [];



    add: boolean[] = [];
    edit: boolean[] = [];
    view: boolean[] = [];
    changed: boolean[] = [];
    dirty: boolean[] = [];
    startDate: string[] = [];
    endDate: string[] = [];
    firstAdded: boolean[] = [];
    minDate: Date[] = [];
    maxDate: Date = new Date();
    selected: number = 0;
    disabled: boolean = false;
    checkValidEntry: boolean[] = [];
    provDisabled: boolean = true;
    errorProvider: string = "";
    pcpNameClass: string;
    dateError: string[] = [];



    @ViewChild(ConfirmDialogComponent) confirmDialog: ConfirmDialogComponent;


    constructor(private _route: ActivatedRoute,
        private _configuration: ConfigurationService,
        private _memberPCPService: MemberPCPService,
        private _windowDefinitionService: WindowDefinitionService,
        private _messageService: MessageService) {
        super(_route, _windowDefinitionService);
    }

    ngOnInit() {
    }

    showDialog(memberId: string, idOfUser: string) {
        this.initFormView(memberId, idOfUser);
    }

    initFormView(memberId: string, idOfUser: string) {

        this.memberId = memberId;
        this.idOfUser = idOfUser;
        this.view[0] = true;
        this.view[1] = true;
        this.view[2] = true;
        this.edit[0] = false;
        this.edit[1] = false;
        this.edit[2] = false;
        this.add[0] = false;
        this.add[1] = false;
        this.add[2] = false;
        this.changed[0] = false;
        this.changed[1] = false;
        this.changed[2] = false;
        this.addedDto[0] = null;
        this.addedDto[1] = null;
        this.addedDto[2] = null;
        this.firstAdded[0] = false;
        this.firstAdded[1] = false;
        // this.dto.memberId = memberId;
        this.isLoading = true;
        this.display = true;
        this.getMemberPCPUIDefinition();
        this.getMemberPCP(this.memberId);



    }


    private getMemberPCPUIDefinition() {
        if (this.uiDefinition.length === 0) {
            this._windowDefinitionService.getWindowDefinition('w_member_pcp_listing')
                .subscribe(
                windowDefinition => {
                    this.uiDefinition = windowDefinition;
                    this.setLabels();
                    this.display = true;
                    this.isLoading = false;

                },
                err => {
                    this.isError = true;
                    this.isLoading = false;
                    this.showErrorMessage('An error occurred retrieving the get member pcp window definition.');
                },
                () => {
                });
        }
    }

    private getMemberPCP(memberId: string) {
        this.pcps = [];
        this.pcpList = [];
        this._memberPCPService.getMemberPCP(memberId)
            .subscribe(
            memberPCPProfile => {
                this.pcps = memberPCPProfile.pcps;
                this.pcpList = [];
                this.addMissing(this.pcps);
                this.display = true;
                this.isLoading = false;
                this.selected = 0;
            },
            err => {
                this.showErrorMessage('An error occurred retrieving the member pcp.');
                console.error(err);

            },
            () => {
            });
    }


    private searchProviders(event) {
        this.providers = [];
        this.provDisabled = true;
        this._memberPCPService.searchProviders(event.query).then(data => {

            for (var i = data.length - 1; i >= 0; i--) {
                var provider = new ProviderModel();;
                provider.providerId = data[i].provider.providerID;
                provider.address = data[i].address.address1 + " " + data[i].address.city + " " + data[i].address.zip + " " + data[i].address.state;

                var specialty: string;
                if (data[i].specialty === undefined || data[i].specialty === null) {
                    specialty = "";
                }
                else {
                    specialty = data[i].specialty;
                }
                var firstName: string = "";
                if (data[i].person.firstName !== undefined && data[i].person.firstName !== null) {
                    firstName = data[i].person.firstName;
                }
                provider.name = data[i].person.lastName + " , " + firstName + "   " + specialty + "  " + provider.address;
                provider.firstName = data[i].person.firstName;
                provider.lastName = data[i].person.lastName;
                this.providers.push(provider);
            }

        });


    }

    private setLabels() {
        this.providerIdLabel = this._windowDefinitionService
            .getFieldLabel(this.uiDefinition, 'id', 'ID');
        this.firstNameLabel = this._windowDefinitionService
            .getFieldLabel(this.uiDefinition, 'first_name', 'First Name');
        this.lastNameLabel = this._windowDefinitionService
            .getFieldLabel(this.uiDefinition, 'last_name', 'Last Name');
        this.startDateLabel = this._windowDefinitionService
            .getFieldLabel(this.uiDefinition, 'start_date', 'Start Date');
        this.endDateLabel = this._windowDefinitionService
            .getFieldLabel(this.uiDefinition, 'end_date', 'End Date');


    }

    private closeWindow() {
        this.display = false;
        this.messages = [];
    }


    ngOnDestroy() {

    }

    private addNewPCP(i: number) {
        if (this.provider.providerId !== null && this.provider.providerId !== undefined) {
            if (this.provider.providerId === this.pcpList[i].providerId) {
                this.errorProvider = " This provider is already selected as PCP. Please select a different one.";
                return;
            }
            this.errorProvider = "";
            this.addedDto[i] = new MemberPCPDTO();
            this.addedDto[i].providerId = this.provider.providerId;
            this.addedDto[i].providerFirstName = this.provider.firstName;
            this.addedDto[i].providerLastName = this.provider.lastName;
            if (this.addedDto[i].providerLastName.length > 40) {
                this.pcpNameClass = 'pcp_last_name_long';
            }
            else {
                this.pcpNameClass = 'pcp_last_name';
            }
            var date = new Date();
            this.addedDto[i].startDate = moment(new Date()).format('MM/DD/YYYY');
            this.addedDto[i].endDate = null;
            var current: MemberPCPDTO = this.pcpList[i];
            if (current.providerId === null || current.providerId === undefined) {               
                current = this.addedDto[i];
                this.addedDto[i] = null;
                this.firstAdded[i] = true;
                current.pcpType = this.pcpList[i].pcpType;
                current.pcpTypeDesc = this.pcpList[i].pcpTypeDesc;
            }
            else {
                current.endDate = moment(new Date()).format('MM/DD/YYYY');

            }

            this.pcpList[i] = current;
            this.provider = null;
            this.add[i] = false;
            this.changed[i] = true;
            this.dirty[i] = true;
            this.startDate[i] = moment(new Date()).format('MM/DD/YYYY');
        }
        else {
            this.errorProvider = "Please select a provider";
        }
    }

    private onEditClick(i: number) {
        this.messages = [];
        this.view[i] = false;
        this.edit[i] = true;
        this.add[i] = false;
        this.changed[i] = false;
    }

    private onAddClick(i: number) {
        this.messages = [];
        this.view[i] = false;
        this.edit[i] = false;
        this.add[i] = true;
        this.changed[i] = false;
    }

    private onCancelClick(i: number) {
        this.messages = [];
        this.dateError[i] = "";

        if (this.firstAdded[i]) {
            this.pcpList[i].providerId = null;
            this.firstAdded[i] = false;
        }
        this.endDate[i] = null;
        this.checkValidEntry[i] = false;
        this.addedDto[i] = null;
        this.view[i] = true;
        this.edit[i] = false;
        this.add[i] = false;
        this.pcpList[i].endDate = null;
        this.provider = null;
        this.addedDto[i] = null;
        this.changed[i] = false;
        this.dirty[i] = false;
    }

    private addMissing(pcps: MemberPCPDTO[]): void {


        var hasGeneral: boolean = false;
        var indexGeneral = null;
        var hasBehav: boolean = false;
        var indexBehav = null;
        var hasClient: boolean = false;
        var indexClient = null;
        if (pcps == null) {
            pcps = [];
            this.pcps = [];
        }
        if (pcps != null) {
            for (var i = pcps.length - 1; i >= 0; i--) {
                this.checkValidEntry[i] = false;
                this.dateError[i] = "";
                this.startDate[i] = pcps[i].startDate.split(" ")[0];
                this.minDate[i] = new Date(this.startDate[i]);
                this.endDate[i] = null;
                this.dirty[i]=false;    

                if (pcps[i].pcpType === "ZBEHAVIORALPCP") {
                    hasBehav = true;
                    indexBehav = i;


                }
                else if (pcps[i].pcpType === "ZGENERALPCP") {
                    hasGeneral = true;
                    indexGeneral = i;
                }
                else {
                    hasClient = true;
                    indexClient = i;
                }
            }
        }
        if (!hasGeneral) {
            var dto: MemberPCPDTO = new MemberPCPDTO();
            dto.pcpType = "ZGENERALPCP";
            dto.pcpTypeDesc = "General Medicine PCP";
            indexGeneral = this.pcps != null ? this.pcps.length : 0;
            this.minDate[indexGeneral] = new Date();
            this.endDate[indexGeneral] = null;
            this.checkValidEntry[indexGeneral] = false;
            this.dateError[indexGeneral] = "";
            this.dirty[indexGeneral]=false; 
            this.pcps.push(dto);

        }
        if (!hasBehav) {
            var dto: MemberPCPDTO = new MemberPCPDTO();
            dto.pcpType = "ZBEHAVIORALPCP";
            dto.pcpTypeDesc = "Behavioral Health PCP";
            indexBehav = this.pcps.length;
            this.minDate[indexBehav] = new Date();
            this.endDate[indexBehav] = null;
            this.checkValidEntry[indexBehav] = false;
            this.dateError[indexBehav] = "";            
            this.dirty[indexBehav]=false; 
            this.pcps.push(dto);
        }
        if (!hasClient) {
            var dto: MemberPCPDTO = new MemberPCPDTO();

            dto.pcpType = "";
            dto.pcpTypeDesc = "Client Provided Gen Med PCP";
            indexClient = this.pcps.length;
            this.minDate[indexBehav] = new Date();
            this.endDate[indexClient] = null;
            this.checkValidEntry[indexClient] = false;
            this.dateError[indexClient] = "";
            this.dirty[indexClient]=false; 
            this.pcps.push(dto);
        }
        this.pcpList.push(this.pcps[indexGeneral]);
        this.pcpList.push(this.pcps[indexBehav]);
        this.pcpList.push(this.pcps[indexClient]);

    }

    changedDate(i: number) {
       
        this.endDate[i] = moment(this.endDate[i]).format('MM/DD/YYYY');
        this.changed[i] = true;
        this.dirty[i] = true;
        this.checkValidEntry[i] = false;
    }

    focusDate(i: number) {
       
        this.checkValidEntry[i] = false;
        this.endDate[i] = null;
    }

    blurDate(i: number) {
        this.checkValidEntry[i] = true;
        this.changed[i] = false;
        this.dirty[i] = false;
        if (this.endDate[i] == null) {

            this.dateError[i] = " Date has to be in format mm/dd/yyyy"
        }
        else {
            var date: Date = new Date(this.endDate[i]);
           
            var startDate: Date = new Date(this.startDate[i]);
            startDate.setMinutes(0, 0, 0);
           
            var endDate: Date = new Date();
            endDate.setMinutes(0, 0, 0);
           
            if (date < startDate) {
                this.dateError[i] = " End date can't be before start date";
            }
            else if (date > endDate) {
                this.dateError[i] = " End date can't be in the future ";
            }
            else {
                this.endDate[i] = moment(this.endDate[i]).format('MM/DD/YYYY');
                this.changed[i] = true;
                this.dirty[i] = true;
                this.checkValidEntry[i] = false;
            }

        }
    }

    save(i: number) {
        var saveList: MemberPCPDTOList = new MemberPCPDTOList();
        var dtoList: MemberPCPDTO[] = [];
        saveList.pcps = dtoList;
        this.disabled = true;
        this.edit[i] = false;
        this.showInfoMessage("Saving ...");
        if (this.addedDto[i] != null || this.firstAdded[i] === true) {
            if (this.firstAdded[i] === true) {
                this.pcpList[i].startDate = moment(new Date()).format('MM/DD/YYYY hh:mm:ssa');
                dtoList.push(this.pcpList[i]);
            }
            else {
                var newDto: MemberPCPDTO = new MemberPCPDTO();
                newDto.providerId = this.addedDto[i].providerId;
                newDto.providerFirstName = this.addedDto[i].providerFirstName;
                newDto.providerLastName = this.addedDto[i].providerLastName;
                newDto.startDate = moment(new Date()).format('MM/DD/YYYY hh:mm:ssa');
                var pcpType = this.pcpList[i].pcpType;
                newDto.pcpType = pcpType;
                dtoList.push(newDto);

            }


            this._memberPCPService.createMemberPCP(this.memberId, saveList)
                .subscribe(
                memberPCPProfile => {
                    this.pcps = memberPCPProfile.pcps;
                    this.pcpList = [];
                    this.addMissing(this.pcps);
                    this.messages = [];
                    this.showSuccessMessage("Member PCP saved");
                    this.dirty[i] = false;
                    this.firstAdded[i] = false;
                    this.view[i] = true;
                    this.add[i] = false;
                    this.edit[i] = false;
                    this.changed[i] = false;
                    this.disabled = false;

                    if (saveList.pcps[0].pcpType === "ZGENERALPCP") {
                        var firstName = "";
                        if (saveList.pcps[0].providerFirstName !== undefined) {
                            firstName = saveList.pcps[0].providerFirstName;
                        }
                        this.setMemberPcpEmitter.emit(saveList.pcps[0].providerLastName + "," + firstName)
                    }
                    this.addedDto[i] = null;

                },
                err => {
                    this.showErrorMessage('An error occurred saving the member pcp.');
                    this.disabled = false;
                    console.error(err);

                },
                () => {
                });
        }
        else {
            this.pcpList[i].endDate = this.endDate[i];
            dtoList.push(this.pcpList[i]);
            this._memberPCPService.updateMemberPCP(this.memberId, saveList)
                .subscribe(
                memberPCPProfile => {
                    this.pcps = memberPCPProfile.pcps;
                    this.pcpList = [];
                    this.addMissing(this.pcps);
                    this.messages = [];
                    this.showSuccessMessage("Member PCP saved");
                    this.dirty[i] = false;
                    this.firstAdded[i] = false;
                    this.view[i] = true;
                    this.add[i] = false;
                    this.edit[i] = false;
                    this.changed[i] = false;
                    if (this.pcpList[i].pcpType === "ZGENERALPCP") {
                        this.setMemberPcpEmitter.emit("Not Available");
                    }
                    this.disabled = false;
                },
                err => {
                    this.showErrorMessage('An error occurred saving the member pcp.');
                    this.disabled = false;
                    console.error(err);

                },
                () => {
                });
        }
    }



    private onClose() {
        var dirty: boolean = false;
        for (var i = this.dirty.length - 1; i >= 0; i--) {
            if (this.dirty[i]) {
                dirty = true;
                break;
            }

        }
        if (dirty) {
            this.confirmDialog.show(" You have unsaved changes that will be lost upon closing. Are you sure you want to close?");
        }
        else {
            this.messages = [];
            this.display = false;
        }


    }

    private saveClose(accepted: boolean) {
        if (accepted) {
            this.messages = [];
            this.display = false;
        }


    }

    handleChange(e) {
        this.selected = e.index;
        this.messages = [];
    }

    providerSelect() {
        this.provDisabled = false;
    }
}

