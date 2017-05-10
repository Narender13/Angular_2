import {
    Component, Input, Output,
    EventEmitter, HostListener,
    ViewEncapsulation,
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
import * as moment from 'moment';

import { BaseComponent } from './../../../common/base.component';
import { ConfigurationService } from './../../../common/configuration.service';
import { MemberOtherContactService } from './member-other-contact.service';
import { MemberOtherContactDto, MemberOtherContactPhoneDto } from './member-other-contact.dtos';
import { MessageService } from './../../../common/message.service';
import { WindowDefinitionService } from './../../../common/window.definition/window.definition.service';

import {
    WindowDefinitionDto,
    RuleDomainTableDataRowsDto,
    DataRowDto
} from './../../../common/window.definition/window.definition.dtos';

declare function closeParentWindow(): void;

@Component({
    selector: 'memberOtherContact',
    encapsulation: ViewEncapsulation.None,
    templateUrl: './member-other-contact.html',
    styleUrls: ['member-other-contact.css'],
    providers: [MemberOtherContactService, WindowDefinitionService, MessageService]
})
export class MemberOtherContactComponent extends BaseComponent implements OnInit {

    dto: MemberOtherContactDto;
    phones: MemberOtherContactPhoneDto[];
    aPhone: MemberOtherContactPhoneDto;
    relationshipTypeOptions: SelectItem[];
    selectedRelationshipTypeOption: string;
    relationshipLabel: string;
    contactMethodTypeOptions: SelectItem[];
    selectedContactMethodOption: string;
    contactMethodLabel: string;
    spokenLanguageTypeOptions: SelectItem[];
    selectedSpokenLanguageOption: string;
    spokenLanguageLabel: string;
    phoneTypeOptions: SelectItem[];
    selectedPhoneTypeOption: string;
    phoneTypeLabel: string;
    stateTypeOptions: SelectItem[];
    selectedStateTypeOption: string;
    stateLabel: string;
    prefixTypeOptions: SelectItem[];
    selectedPrefixTypeOption: string;
    prefixLabel: string;
    firstNameLabel: string;
    lastNameLabel: string;
    phoneNumberLabel: string;
    primaryLabel: string;
    caregiverLabel: string;

    private memberId: string;
    private memberOtherContactSeq: string;
    private uiDefinition: WindowDefinitionDto[] = [];
    private idOfUser: string;
    private update: boolean;
    private phonePrimary: string;
    private display: boolean = false;
    private title: string;
    private isLoading: boolean = true;
    private isError = false;
    private methodTypeOptions = new Map<string, string>();

    constructor(private _route: ActivatedRoute,
        private _configuration: ConfigurationService,
        private _memberOtherContactService: MemberOtherContactService,
        private _windowDefinitionService: WindowDefinitionService,
        private _messageService: MessageService) {
        super(_route, _windowDefinitionService);
    }

    ngOnInit() {
        this._route.queryParams.subscribe(
            (param: String) => {

                this.memberId = param['memberId'];
                this.memberOtherContactSeq = param['memberOherContactSeq'];
            });
        this.initFormView(this.memberId, this.idOfUser, this.memberOtherContactSeq);
    }

    ngOnDestroy() {
    }

    initFormView(memberId: string, idOfUser: string, memberOtherContactSeq: string) {
        this.memberId = memberId;
        this.idOfUser = idOfUser;
        this.memberOtherContactSeq = memberOtherContactSeq;
        this.dto = new MemberOtherContactDto();
        this.dto.active = true;
        this.dto.primary = false;
        this.dto.memberId = memberId;
        this.dto.phones = null;
        this.getMemberOtherContactUIDefinition();

        if (this.memberOtherContactSeq === null || this.memberOtherContactSeq.length === 0) {
            this.update = false;
            this.title = 'Add Member Other Contact Information';
            this.phones = new Array<MemberOtherContactPhoneDto>();
            let newPhone = new MemberOtherContactPhoneDto();
            newPhone.primary = true;
            newPhone.active = true;
            this.phonePrimary = '';
            this.phones.push(newPhone);
        } else {
            this.title = 'Edit Member Other Contact Information';
            this.getMemberOtherContact(this.memberId, this.memberOtherContactSeq);
        }
    }

    private getMemberOtherContactUIDefinition() {
        if (this.uiDefinition.length === 0) {
            this._windowDefinitionService.getWindowDefinition('w_add_other_contact')
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
                    this.showErrorMessage('An error occurred retrieving the add member other contact window definition.');
                },
                () => {
                });
        }
    }

    private getMemberOtherContact(memberId: string, memberOtherContactSeq: string) {
        this._memberOtherContactService.getMemberOtherContact(memberId, memberOtherContactSeq)
            .subscribe(
            otherContact => {
                this.dto = otherContact;
                this.phones = this.dto.phones;
                if (this.phones === null || (this.phones !== null && this.hasNoActivePhones())) {
                    this.phones = new Array<MemberOtherContactPhoneDto>();
                    let newPhone = new MemberOtherContactPhoneDto();
                    newPhone.primary = true;
                    newPhone.active = true;
                    this.phonePrimary = '';
                    this.phones.push(newPhone);
                } else {
                    for (let i = this.phones.length - 1; i >= 0; i--) {
                        if (this.phones[i].primary !== null && this.phones[i].primary === true && this.phones[i].active) {
                            this.phonePrimary = this.phones[i].phoneNumber;
                        }
                    }
                }
                this.display = true;
                this.isLoading = false;
                console.log(' Contact' + this.dto.preferedContactMethod);
            },
            err => {
                this.showErrorMessage('An error occurred retrieving the member other contact.');
                console.error(err);
            },
            () => {
            });
    }

    private setDropdownItemsToArray(soughtListId: string, windowFields: WindowDefinitionDto[], options: SelectItem[],
        activeOnly: boolean, selectValue: string) {

        if (windowFields !== null && options !== null && soughtListId !== null) {

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

    private setRelationshipTypeOptions() {
        this.relationshipTypeOptions = [];

        this.setDropdownItemsToArray('relationship_type', this.uiDefinition, this.relationshipTypeOptions, true, 'Select...');
    }

    private setContactMethodTypeOptions() {
        this.contactMethodTypeOptions = [];

        this.setDropdownItemsToArray('prefer_contact_method', this.uiDefinition, this.contactMethodTypeOptions, true, 'Select...');
        this.setPreferredContactMethod('prefer_contact_method', this.uiDefinition, this.methodTypeOptions);
    }

    private setSpokenLanguageTypeOptions() {
        this.spokenLanguageTypeOptions = [];
        this.setDropdownItemsToArray('contact_spoken_language', this.uiDefinition, this.spokenLanguageTypeOptions, true, 'Select...');
    }

    private setStateTypeOptions() {
        this.stateTypeOptions = [];
        this.setDropdownItemsToArray('contact_state', this.uiDefinition, this.stateTypeOptions, true, 'State...');
    }

    private setPhoneTypeOptions() {
        this.phoneTypeOptions = [];
        this.selectedPhoneTypeOption = null;
        this.setDropdownItemsToArray('member_phone_type', this.uiDefinition, this.phoneTypeOptions, true, ' Phone Type...');
    }

    private setPrefixOptions() {
        this.prefixTypeOptions = [];
        this.prefixTypeOptions.push({ label: 'Prefix...', value: null });
        this.prefixTypeOptions.push({ label: 'Miss', value: 'Miss' });
        this.prefixTypeOptions.push({ label: 'Mrs.', value: 'Mrs.' });
        this.prefixTypeOptions.push({ label: 'Mr.', value: 'Mr.' });
        this.prefixTypeOptions.push({ label: 'Ms.', value: 'Ms.' });
        this.prefixTypeOptions.push({ label: 'Dr.', value: 'Dr.' });
        this.prefixTypeOptions.push({ label: 'Sister', value: 'Sister' });
        this.prefixTypeOptions.push({ label: 'Father', value: 'Father' });
        this.prefixTypeOptions.push({ label: 'Prof.', value: 'Prof.' });
    }

    private setDropDownOptions() {
        this.setStateTypeOptions();
        this.setRelationshipTypeOptions();
        this.setSpokenLanguageTypeOptions();
        this.setPhoneTypeOptions();
        this.setContactMethodTypeOptions();
        this.setPrefixOptions();
    }

    private setLabels() {

        this.stateLabel = this._windowDefinitionService
            .getFieldLabel(this.uiDefinition, 'contact_state', 'State');
        this.relationshipLabel = this._windowDefinitionService
            .getFieldLabel(this.uiDefinition, 'relationship_type', 'Relationship');
        this.contactMethodLabel = this._windowDefinitionService
            .getFieldLabel(this.uiDefinition, 'prefer_contact_method', 'Prefered Contact Method');
        this.spokenLanguageLabel = this._windowDefinitionService
            .getFieldLabel(this.uiDefinition, 'contact_spoken_language', 'Spoken Language');
        this.phoneTypeLabel = this._windowDefinitionService
            .getFieldLabel(this.uiDefinition, 'member_phone_type', 'Phone Type');
        this.prefixLabel = this._windowDefinitionService
            .getFieldLabel(this.uiDefinition, 'contact_salutation', 'Prefix');
        this.phoneNumberLabel = this._windowDefinitionService
            .getFieldLabel(this.uiDefinition, 'member_phone', 'Phone');
        this.firstNameLabel = this._windowDefinitionService
            .getFieldLabel(this.uiDefinition, 'member_contact_first_name', 'First Name');
        this.lastNameLabel = this._windowDefinitionService
            .getFieldLabel(this.uiDefinition, 'member_contact_last_name', 'Last Name');
        this.caregiverLabel = this._windowDefinitionService
            .getFieldLabel(this.uiDefinition, 'contact_caregiver', 'Caregiver');
        this.primaryLabel = this._windowDefinitionService
            .getFieldLabel(this.uiDefinition, 'contact_primary', 'Primary');
    }

    private addPhone() {
        let newPhone = new MemberOtherContactPhoneDto();
        newPhone.contactSeq = this.dto.memberContactSeq;
        newPhone.active = true;
        if (this.phones === null) {
            this.phones = new Array<MemberOtherContactPhoneDto>();
            newPhone.primary = true;
            this.phonePrimary = '';
        }
        this.phones.push(newPhone);
    }

    private deletePhone(phone: MemberOtherContactPhoneDto) {
        phone.active = false;
        if (phone.primary === true) {
            this.getNextActivePhone();
        }
    }

    private saveMemberOtherContact() {
        if (this.phones !== null) {
            let primaryPhone = this.phonePrimary;

            for (let i = this.phones.length - 1; i >= 0; i--) {
                if (this.phones[i].phoneNumber !== null && this.phones[i].phoneNumber !== undefined && this.phones[i].phoneNumber !== '') {
                    console.log(' Phone Number ' + this.phones[i].phoneNumber);
                    if (primaryPhone === this.phones[i].phoneNumber) {
                        this.phones[i].primary = true;
                    } else {
                        this.phones[i].primary = false;
                    }
                }
                if (this.phones[i].phoneNumber === null || this.phones[i].phoneNumber === undefined || this.phones[i].phoneNumber === '') {
                    this.phones.splice(i, 1);
                } else if (this.phones[i].phoneSeq === null && !this.phones[i].active) {
                    this.phones.splice(i, 1);
                }
            }

            this.dto.phones = this.phones;
        }

        let firstName: boolean = this.dto.firstName === null || this.dto.firstName === undefined || this.dto.firstName === '';
        let lastName: boolean = this.dto.lastName === null || this.dto.lastName === undefined || this.dto.lastName === '';
        let address: boolean = this.dto.addressLine1 === null || this.dto.addressLine1 === undefined || this.dto.addressLine1 === '';
        let email: boolean = this.dto.email === null || this.dto.email === undefined || this.dto.email === '';
        let phones: boolean = this.phones === null || this.phones.length === 0 || this.hasNoActivePhones();
        let cMethod: boolean = this.dto.preferedContactMethod === null || this.dto.preferedContactMethod === undefined;

        let error: string = '';
        if (firstName && lastName || address || email || phones || cMethod) {

            if (firstName && lastName) {
                error = 'First Name or Last Name ';
            }
            if (cMethod) {
                if (error !== '') {
                    error = error + ',';
                }
                error = error + ' Preferred Contact Method';

            }
            if (!cMethod) {
                for (let j = this.contactMethodTypeOptions.length - 1; j >= 0; j--) {
                    if (this.contactMethodTypeOptions[j].value === this.dto.preferedContactMethod) {
                        if (this.methodTypeOptions.get(this.contactMethodTypeOptions[j].value) === 'Email') {
                            if (email) {
                                if (error === '') {
                                    error = ' Email';

                                } else {
                                    error = error + ', Email';
                                    break;
                                }
                            }
                        } else if (this.methodTypeOptions.get(this.contactMethodTypeOptions[j].value) === 'Mail') {
                            if (address) {
                                if (error === '') {
                                    error = ' Address';
                                } else {
                                    error = error + ', Address';
                                    break;
                                }

                            }
                        } else if (this.methodTypeOptions.get(this.contactMethodTypeOptions[j].value) === 'Phone' ) {
                            if (phones) {
                                if (error === '') {
                                    error = ' Phone';
                                } else {
                                    error = error + ' ,Phone ';
                                    break;
                                }
                            }
                        }
                    }
                }
            }

        }
        if (error === '') {
            this._memberOtherContactService.saveMemberOtherContact(this.dto)
                .subscribe(result => {
                    if (result.apiStatus.statusCode === '200') {
                        this.showSuccessMessage('Member Other Contact saved.');
                        this.dto = result;
                        this.phones = this.dto.phones;
                        if (this.phones === null || this.phones.length === 0) {
                            this.addPhone();
                        }
                    } else {
                        this.handleError(result.apiStatus.errorMessage, 'An error occurred saving the member other contact.');
                    }
                },
                err => {
                    this.handleError(err.toString(), 'An error occurred saving the member other contact.');
                });

        } else {
            this.showErrorMessage('The following is required:' + error);
            if (this.phones === null || this.phones.length === 0) {
                this.addPhone();
            }
        }

    };

    private hasNoActivePhones(): boolean {
        let hasActive: boolean = true;
        for (let i = this.phones.length - 1; i >= 0; i--) {
            if (this.phones[i].active === true) {
                hasActive = false;
                break;
            }
        }
        return hasActive;
    }

    private closeWindow() {
        this.display = false;
        if (process.env.ENV !== 'development') {
            closeParentWindow();
        }
    }

    private getNextActivePhone() {
        let found: boolean = false;
        for (let i = this.phones.length - 1; i >= 0; i--) {
            if (this.phones[i].active === true) {
                found = true;
                this.phonePrimary = this.phones[i].phoneNumber;
            }
        }
        if (!found) {
            this.phonePrimary = '';
        }
    }

    private onChangedPhone(phone: MemberOtherContactPhoneDto) {
        if (phone.primary === true) {
            this.phonePrimary = phone.phoneNumber;
        }
    }

    private onBeforeDialogHide() {
        if (process.env.ENV !== 'development') {
            closeParentWindow();
        }
    }


    private setPreferredContactMethod(soughtListId: string, windowFields: WindowDefinitionDto[], options: Map<string, string>) {

        if (windowFields !== null && options !== null && soughtListId !== null) {

            for (let fieldDef of windowFields) {
                if (fieldDef.fieldId === soughtListId) {
                    for (let dataRow of fieldDef.fkTableData[0].dataRows) {
                        if (dataRow.idColumn2 !== null && dataRow.idColumn2 !== undefined && dataRow.idColumn2.trim() === 'Y') {
                            options.set(dataRow.idColumn1, 'Phone');
                        } else if (dataRow.idColumn3 !== null && dataRow.idColumn3 !== undefined && dataRow.idColumn3.trim() === 'Y') {
                            options.set(dataRow.idColumn1, 'Mail');
                        } else {
                           options.set(dataRow.idColumn1, 'Email');
                        }
                    }
                }
            }
        }
    }
}
