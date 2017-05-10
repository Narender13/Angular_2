
import {
    Component, ViewEncapsulation,
    ViewChild, OnInit, OnDestroy
} from '@angular/core';
import {
    FormGroup, FormControl,
    Validators, FormBuilder
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { ConfirmDialogComponent } from './../confirm-dialog/confirm-dialog.component';

// the dropdown list items have to be setup as SelectItems
import { SelectItem, TabPanel, TabView, TabViewNav, TabViewModule } from 'primeng/primeng';


import { BaseComponent } from './../../../common/base.component';
import { ConfigurationService } from './../../../common/configuration.service';
import { MemberOtherContactComponent } from './../member-other-contact/member-other-contact.component';
import { MemberOtherContactService } from './../member-other-contact/member-other-contact.service';
import { MemberCaregiverService } from './member-caregiver.service';
import { MemberOtherContactDto, MemberOtherContactPhoneDto } from './../member-other-contact/member-other-contact.dtos'
import { MemberCaregiverDto } from './member-caregiver.dtos';
import { CaregiverAddEditComponent } from './caregiver-add-edit/caregiver-add-edit.component';
import { MessageService } from './../../../common/message.service';
import { WindowDefinitionService } from './../../../common/window.definition/window.definition.service';

import {
    WindowDefinitionDto,
    RuleDomainTableDataRowsDto,
    DataRowDto
} from './../../../common/window.definition/window.definition.dtos';


@Component({
    selector: 'memberCaregiver',
    encapsulation: ViewEncapsulation.None,
    templateUrl: './member-caregiver.component.html',
    styleUrls: ['member-caregiver.component.css'],
    providers: [MemberCaregiverService, WindowDefinitionService]
})
export class MemberCaregiverComponent extends BaseComponent implements OnInit, OnDestroy {
    private caregiverList: MemberCaregiverDto = null;;
    private caregivers: MemberOtherContactDto[] = [];
    private display: boolean = false;
    private memberId: string;
    private memberCaregiversForm: FormGroup = null;
    private dtoLoading = true;
    private uiLoading = false;
    private loading = true;
    private dialogTitle = " Caregiver Information";
    private displayEdit: boolean = false;
    private primaryDto = null;
    private content = new Map<TabPanel, MemberOtherContactDto>();
    private tabs: TabPanel[];
    private deletePanel: TabPanel;
    private deleteIndex: number;



    @ViewChild(CaregiverAddEditComponent) addEditDialog: CaregiverAddEditComponent;
    @ViewChild(ConfirmDialogComponent) confirmDialog: ConfirmDialogComponent;



    constructor(private _route: ActivatedRoute,
        private _memberOtherContactService: MemberOtherContactService,
        private _memberCaregiverService: MemberCaregiverService,
        private _windowDefinitionService: WindowDefinitionService,
        private _messageService: MessageService,
        private _formBuilder: FormBuilder) {
        super(_route, _windowDefinitionService);
    }



    ngOnInit() {

    }

    initFormView(memberId: string) {
        this.display = true;
        this.memberId = memberId;
        this.getMemberCaregivers();


    }

    changedCaregiver(dto): void {
        var index = -2;
        for (var i = this.caregivers.length - 1; i >= 0; i--) {
            if (this.caregivers[i].memberContactSeq === dto.memberContactSeq) {
                this.caregivers[i] = dto;
                index = i;
            }
            else {
                if (dto.primary) {
                    this.caregivers[i].primary = false;
                }
            }
        }
        this.refreshTabs(index, dto.primary);

    }

    private addCaregiver(dto: MemberOtherContactDto) {
        if (this.caregivers === null) {
            this.caregivers = new Array<MemberOtherContactDto>();
        }
        if (dto.primary) {
            for (var i = this.caregivers.length - 1; i >= 0; i--) {
                this.caregivers[i].primary = false;
            }
        }
        this.caregivers.push(dto);
        var index = this.caregivers.length;

        this.refreshTabs(index - 1, true);
    }


    private getMemberCaregivers() {
        this._memberCaregiverService.getMemberCaregivers(this.memberId).subscribe(
            caregiver => {
                this.caregiverList = caregiver;
                this.caregivers = this.caregiverList.caregivers;

                this.refreshTabs(null, true);
            },

            err => {
                this.showErrorMessage('An error occurred retrieving the caregiver list.');
            },
            () => {
            });
    }

    private delete(tab: TabPanel, index: number) {
        var contactSeq = this.content.get(tab).memberContactSeq;
        this.deletePanel = tab;
        this.deleteIndex = index;
        this.confirmDialog.show("Are you sure you want to delete this Caregiver?");

    }


    private getPrimaryMemberOtherContact(memberId: string) {
        this._memberCaregiverService.getMemberPrimaryOtherContact(this.memberId).subscribe(
            response => {
                if (response.apiStatus.statusCode === '200') {

                    if (response.memberContactSeq !== null) {
                        this.primaryDto = response;
                    }
                    this.loading = false;

                } else {
                    this.handleError(response.apiStatus.errorMessage, 'An error occurred retrieving the primary contact.');
                    this.loading = false;
                }
            },
            err => {
                this.handleError(err.toString(), 'An error occurred retrieving the primary contact.');
                this.loading = false;
            });

    }


    private close() {
        this.display = false;
        this.messages = [];
        this.tabs = [];
        this.loading = true;
    }

    private addEdit(contactSeq: string) {
        this.displayEdit = true;
         this.messages = [];
        this.addEditDialog.initFormView(this.memberId, this.userId, contactSeq, this.primaryDto);

    }


    ngOnDestroy() {

    }

    setPanelHeader(panel: TabPanel, dto: MemberOtherContactDto): string {
        var title = "";
        if (dto.prefix !== null) {
            title = title + dto.prefix + " ";
        }
        if (dto.firstName !== null) {
            title = title + dto.firstName + " ";
        }
        if (dto.lastName !== null) {
            title = title + dto.lastName;
        }
        return title
    }

    private refreshTabs(index: number, added: boolean) {

        this.tabs = [];
        this.primaryDto = null;
        var haveSelected = false;

        if (this.caregivers !== null && this.caregivers.length !== 0) {

            for (var i = this.caregivers.length - 1; i >= 0; i--) {
                var panel = new TabPanel();
                panel.header = this.setPanelHeader(panel, this.caregivers[i]);
                if (this.caregivers[i].phones != null) {
                    for (var j = this.caregivers[i].phones.length - 1; j >= 0; j--) {

                        this.caregivers[i].phones[j].phoneNumber = this.formatPhone(this.caregivers[i].phones[j].phoneNumber);
                    }
                }
                this.tabs.push(panel);
                this.content.set(panel, this.caregivers[i]);

                if (this.caregivers[i].primary) {
                    this.primaryDto = this.caregivers[i];
                }
                if (index !== null && index === i) {
                    panel.selected = true;
                    haveSelected = true;
                }
                else if (index === null) {
                    panel.selected = this.caregivers[i].primary;
                    
                }
                else {
                    panel.selected = false;
                }


            }
        }


        this.tabs.reverse();

        if (this.tabs.length >= 1 && this.primaryDto === null) {
            if ( !haveSelected)
            {
                this.tabs[0].selected = true;
            }
            
            this.getPrimaryMemberOtherContact(this.memberId);
        }
        else {
            this.loading = false;
        }

    }

    deleteHandler(accepted: boolean) {
        if (accepted) {
            var contactSeq = this.content.get(this.deletePanel).memberContactSeq;

            this._memberCaregiverService.deleteMemberCareviver(this.memberId, contactSeq).subscribe(
                response => {
                    if (response.apiStatus.statusCode === '200') {

                        this.caregivers.splice(this.deleteIndex, 1);
                        this.refreshTabs(null, true);
                        this.showSuccessMessage('Caregiver deleted.');
                    }

                    else {
                        this.handleError(response.apiStatus.errorMessage, 'An error occurred deleting the caregviver.');
                    }
                },
                err => {
                    this.handleError(err.toString(), 'An error occurred deleting the caregiver.');
                });
        }

    }


    formatPhone(obj: string): string {
        var numbers = obj.replace(/\D/g, ''),
            char = { 0: '(', 3: ') ', 6: ' - ' };
        obj = '';
        for (var i = 0; i < numbers.length; i++) {
            obj += (char[i] || '') + numbers[i];
        }
        return obj;
    }



}