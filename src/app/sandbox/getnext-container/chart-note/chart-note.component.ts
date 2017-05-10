
import { Component, Input, Output,
         EventEmitter,
         ViewEncapsulation }            from '@angular/core';
import { FormGroup, FormControl,
         Validators, FormBuilder,
         FormArray }                    from '@angular/forms';
import { ActivatedRoute }               from '@angular/router';
import { SelectItem, EditorModule,
         SharedModule, Message }        from 'primeng/primeng';
import * as moment from 'moment';

import { BaseComponent }                from './../../../common/base.component';
import { ConfigurationService }         from './../../../common/configuration.service';
import { ChartNoteService }             from './chart-note.service';
import { ChartNoteDto,
         ChartNoteUserDefinedFieldAnswerDto,
         ChartNoteUserDefinedFieldsListDto } from './chart-note.dtos';
import { UserDefinedFieldDto,
         UserDefinedFieldTypeRestrictionsDto,
         UserDefinedFieldTypeDto,
         UserDefinedFieldValueDto,
         ListItemDto }                  from './../../../common/user-defined-field.dtos';
import { WindowDefinitionService }      from './../../../common/window.definition/window.definition.service';
import { WindowDefinitionDto,
         RuleDomainTableDataRowsDto,
         DataRowDto }                   from './../../../common/window.definition/window.definition.dtos';

@Component({
    selector: 'chartNote',
    encapsulation: ViewEncapsulation.None,
    templateUrl: './chart-note.component.html',
    styleUrls: ['chart-note.component.css'],
    providers: [ChartNoteService, WindowDefinitionService]
})
export class ChartNoteComponent extends BaseComponent {

    @Output() onNoteError = new EventEmitter<String>();

    activityLogItems: string[] = [];
    userDefinedFieldList: UserDefinedFieldDto[];

    saveClicked: boolean = false;
    chartNoteForm: FormGroup;
    chartNoteDto: ChartNoteDto;

    noteTypeOptions: SelectItem[];
    selectedNoteTypeOption: string = '';

    noteTemplateOptions: SelectItem[];
    selectedNoteTemplateOption: string = '';
    selectedNoteTemplate: string = '';
    noteTemplateDataRows: DataRowDto[] = [];

    noteTypeControl;
    noteTemplateControl;
    noteTextControl;
    activityLogControl;

    noteTypeLabel;
    noteTemplateLabel;
    noteTextLabel;
    noteTabLabel;
    userDefinedFieldTabLabel;

    hideNoteTemplate: boolean = false;
    hideUserDefinedFieldTab: boolean = false;

    userDefinedFieldsInitialized: boolean = false;

    private baseLogItem: string = '***NoteAuditLog***';
    private uiDefinition: WindowDefinitionDto[] = [];
    private memberId: string;
    private idOfUser: string;
    private memberAssessmentId: string;
    private noteLinkedToAssessment: boolean;

    constructor(private _route: ActivatedRoute,
                private _chartNoteService: ChartNoteService,
                private _windowDefinitionService: WindowDefinitionService) {
        super(_route, _windowDefinitionService);
        this.initializeChartNoteForm();
    }

    initFormView(memberId: string, idOfUser: string, firstLogMessage: string) {

        this.memberId = memberId;
        this.idOfUser = idOfUser;
        this.saveClicked = false;
        this.chartNoteForm.reset();
        this.chartNoteDto = new ChartNoteDto;
        this.getNoteUIDefinition();
        this.saveInitialChartNote(firstLogMessage);
    }

    addActivityLog(activity: string) {
        this.activityLogItems[this.activityLogItems.length] = activity;
        this.getFormValues();
        this.persistNote();
    }

    linkAssessmentNote(memberAssessmentId: string) {

        this.memberAssessmentId = memberAssessmentId;

        if (this.chartNoteDto.noteSeq !== null && this.chartNoteDto.noteSeq !== undefined) {
            this.linkAssessmentToNote();
        }
    }

    isNoteDirty() {
        return (this.chartNoteForm !== null && this.chartNoteForm.dirty);
    }

    saveNote(): boolean {
        this.saveClicked = true;

        if (this.chartNoteForm.valid) {
            this.getFormValues();
            this.persistNote();

            return true;
        } else {
            if (this.selectedNoteTypeOption === null || this.selectedNoteTypeOption === undefined
                || this.selectedNoteTypeOption.trim() === '') {
                this.showErrorMessage(this.noteTypeLabel + ' is required.');
            }
            return false;
        }
    }

    getTemplateDataRowsForNoteType() {

        if (!this.hideNoteTemplate) {
            this.noteTemplateOptions = [];
            this.noteTemplateOptions.push({label: 'Loading...', value: null });

            this._windowDefinitionService.getDataRowsForDependentTable('zl_note_template',
                null, this.selectedNoteTypeOption, null)
                .subscribe(
                dataRows => {
                    this.noteTemplateDataRows = dataRows;
                    this.setTemplateDataRowOptions();
                },
                err => {
                    let message = 'An error occurred retrieving the note templates for the selected note type.';
                    this.handleError(err.toString(), message, 'Note Templates:');
                    this.onNoteError.emit(message);
                },
                () => {
                });
        }
    }

    setNoteTemplate() {

        if (this.selectedNoteTemplateOption !== null && this.selectedNoteTemplateOption !== undefined) {
            for (let row of this.noteTemplateDataRows) {
                if (row.idColumn1 === this.selectedNoteTemplateOption) {
                    this.selectedNoteTemplate = row.description2;
                    let note: string = (<FormControl>this.chartNoteForm.controls['noteText']).value;

                    if (note === null) {
                        note = row.description2;
                    } else {
                        note = note + '<br>' + row.description2;
                    }

                    (<FormControl>this.chartNoteForm.controls['noteText']).setValue(note);
                    break;
                }
            }
        }
    }

    isRequired(fieldId: string) {
        // note that there currently none of these fields (aside from note type) are present
        // in the data_dictionary table, so this method will never return true until that changes.
        // Note type has special handling, as it is required for a note save that is initiated by
        // the user selecting the Save button, and not required otherwise. (see CMP-23136)
        if (this._windowDefinitionService.isFieldRequired(this.uiDefinition, fieldId)) {

            (<FormControl>this.chartNoteForm.controls[fieldId]).setValidators(Validators.required);
            (<FormControl>this.chartNoteForm.controls[fieldId]).updateValueAndValidity();

            return true;
        }
        return false;
    }

    private getFormValues() {

        this.chartNoteDto.memberId = this.memberId;
        this.chartNoteDto.requestorId = this.idOfUser;
        this.chartNoteDto.noteType = this.selectedNoteTypeOption;

        let note: string = (<FormControl>this.chartNoteForm.controls['noteText']).value;

        if (note === null || note === undefined) {
            note = this.baseLogItem;
        } else {
            note = note + this.formatLine(this.baseLogItem);
        }

        for (let activity of this.activityLogItems) {
            note = note + this.formatLine(activity);
        }

        this.chartNoteDto.noteText = note;

        if (this.userDefinedFieldList !== null && this.userDefinedFieldList !== undefined) {

            this.chartNoteDto.userDefinedFieldList = [];

            let answer: string = null;
            let htmlFieldId: string = null;

            for (let udf of this.userDefinedFieldList) {

                let answerDto: ChartNoteUserDefinedFieldAnswerDto = new ChartNoteUserDefinedFieldAnswerDto();
                answerDto.fieldId = udf.fieldId;
                answer = null;
                htmlFieldId = null;

                if (udf.fieldType === 'LIST') {
                    htmlFieldId = 'udf_list_' + udf.fieldId;
                    answer = (<FormControl>this.chartNoteForm.controls[htmlFieldId]).value;
                    answerDto.listItemId = answer;
                    answerDto.answer = answer;
                } else if (udf.fieldType === 'DATE') {
                    htmlFieldId = 'udf_date_' + udf.fieldId;
                    answer = (<FormControl>this.chartNoteForm.controls[htmlFieldId]).value;
                    answerDto.answer = answer;
                } else if (udf.fieldType === 'NUMBER') {
                    htmlFieldId = 'udf_number_' + udf.fieldId;
                    answer = (<FormControl>this.chartNoteForm.controls[htmlFieldId]).value;
                    answerDto.answer = answer;
                } else if (udf.fieldType === 'BOOLEAN') {
                    htmlFieldId = 'udf_boolean_' + udf.fieldId;
                    answer = (<FormControl>this.chartNoteForm.controls[htmlFieldId]).value;
                    answerDto.answer = answer;
                } else if (udf.fieldType === 'TEXT') {
                    htmlFieldId = 'udf_text_' + udf.fieldId;
                    answer = (<FormControl>this.chartNoteForm.controls[htmlFieldId]).value;
                    answerDto.answer = answer;
                }

                this.chartNoteDto.userDefinedFieldList.push(answerDto);
            }
        }
    }

    private saveInitialChartNote(firstLogMessage: string) {

        this.chartNoteDto.memberId = this.memberId;
        this.chartNoteDto.requestorId = this.idOfUser;
        this.chartNoteDto.noteType = null;
        this.chartNoteDto.noteText = this.baseLogItem + this.formatFirstLine(firstLogMessage);

        this.addActivityLog(firstLogMessage);
    }

    private formatFirstLine(line: string): string {
        return '<p>' + line + '</p>';
    }

    private formatLine(line: string): string {
        return '<br><p>' + line + '</p>';
    }

    private persistNote() {

        this._chartNoteService.saveNote(this.chartNoteDto)
            .subscribe( result => {
                if (result.statusCode === '200') {

                    this.chartNoteForm.markAsPristine();

                    if (this.saveClicked) {
                        this.showSuccessMessage('Note saved.');
                    }

                    this.chartNoteDto.noteSeq = result.resultInformation;
                    this.log('returned note_seq:' + result.resultInformation);

                    this.linkAssessmentToNote();

                    if (!this.hideUserDefinedFieldTab && !this.userDefinedFieldsInitialized) {
                        this.getNoteUserDefinedFields();
                    }

                    this.saveClicked = false;
                } else {
                    let message = 'An error occurred saving the note.';
                    this.handleError(result.errorMessage, message, 'Save Note:');
                    this.onNoteError.emit(message);

                    try {
                        throw new TypeError('Save Note Failure');
                    } catch (e) {
                        console.log((<Error>e).message); // conversion to Error type
                    }
                }
                },
            err => {
                let message = 'An error occurred saving the note.';
                this.handleError(err.toString(), message, 'Save Note:');
                this.onNoteError.emit(message);

                try {
                    throw new TypeError('Save Note Failure');
                } catch (e) {
                    console.log((<Error>e).message); // conversion to Error type
                }
            },
            () => {
                this.saveClicked = false;
             });
    }

    private linkAssessmentToNote() {

        if (!this.noteLinkedToAssessment && this.memberAssessmentId !== null
            && this.memberAssessmentId !== undefined && this.chartNoteDto.noteSeq !== null
            && this.chartNoteDto.noteSeq !== undefined) {
            this._chartNoteService.linkAssessmentToNote(this.memberAssessmentId, this.chartNoteDto.noteSeq,
                this.chartNoteDto.memberId, true)
                .subscribe(
                    result => {
                        if (result.statusCode !== '200') {
                            let message = 'An error occurred linking the note to the assessment';
                            this.handleError(result.errorMessage, message, 'Link Note to Assessment:');
                            this.onNoteError.emit(message + ': ' + result.errorMessage);
                        } else {
                            this.noteLinkedToAssessment = true;
                        }
                },
                err => {
                    let message = 'An error occurred linking the note to the assessment';
                    this.handleError(err.toString(), message, 'Link Note to Assessment:');
                    this.onNoteError.emit(message + ': ' + err.toString());
                },
                () => {
                });
        }
    }

    private getNoteUserDefinedFields() {
        this._chartNoteService.getNoteUserDefinedFields(this.chartNoteDto)
            .subscribe( result => {
                    if (result.apiStatus.statusCode === '200') {

                        this.userDefinedFieldList = result.userDefinedFieldList;
                        this.userDefinedFieldsInitialized = true;
                        this.setupListItems();
                        this.initializeUserDefinedFieldControls();

                    } else {
                        let message = 'An error occurred retrieving the note user defined fields.';
                        this.handleError(result.apiStatus.errorMessage, message, 'Note User Defined Fields:');
                        this.onNoteError.emit(message);
                    }
                },
            err => {
                let message = 'An error occurred retrieving the note user defined fields.';
                this.handleError(err.toString(), message, 'Note User Defined Fields:');
                this.onNoteError.emit(message);
            },
            () => { });
    }

    private setupListItems() {

        for (let udf of this.userDefinedFieldList) {
            if (udf.fieldType === 'LIST') {
                udf.convertedListItemsList = [];
                udf.convertedListItemsList.push({label: 'Select...', value: null });

                for (let listItem of udf.listItemsList) {
                    let description: string = listItem.listItemName;
                    if (!listItem.active) {
                        description = description + ' (Inactive)';
                    }

                    udf.convertedListItemsList.push({label: description, value: listItem.listItemId });
                }
            }
        }
    }

    private initializeUserDefinedFieldControls() {

        let fieldDefinitionGroup: any = {};

        for (let udf of this.userDefinedFieldList) {
            let control: FormControl = new FormControl();

            if (udf.fieldType === 'LIST') {
                // fieldDefinitionGroup['udf_list_' + udf.fieldId]  = new FormControl('');
                this.chartNoteForm.addControl('udf_list_' + udf.fieldId, control);
            } else if (udf.fieldType === 'NUMBER') {
                // fieldDefinitionGroup['udf_number_' + udf.fieldId]  = new FormControl('');
                this.chartNoteForm.addControl('udf_number_' + udf.fieldId, control);
            } else if (udf.fieldType === 'DATE') {
                // fieldDefinitionGroup['udf_date_' + udf.fieldId]  = new FormControl('');
                this.chartNoteForm.addControl('udf_date_' + udf.fieldId, control);
            } else if (udf.fieldType === 'BOOLEAN') {
                // fieldDefinitionGroup['udf_boolean_' + udf.fieldId]  = new FormControl('');
                this.chartNoteForm.addControl('udf_boolean_' + udf.fieldId, control);
            } else if (udf.fieldType === 'TEXT') {
                // fieldDefinitionGroup['udf_text_' + udf.fieldId]  = new FormControl('');
                this.chartNoteForm.addControl('udf_text_' + udf.fieldId, control);
            }
        }
    }

    private initializeChartNoteForm() {

        this.chartNoteForm = null;

        let fieldDefinitionGroup: any = {};

        fieldDefinitionGroup['noteType']     = new FormControl('', Validators.required);
        fieldDefinitionGroup['noteTemplate'] = new FormControl('');
        fieldDefinitionGroup['noteText']     = new FormControl('');
        fieldDefinitionGroup['activityLog']  = new FormControl('');

        this.chartNoteForm = new FormGroup(fieldDefinitionGroup);

        this.noteTypeControl =      this.chartNoteForm.get('noteType');
        this.noteTemplateControl =  this.chartNoteForm.get('noteTemplate');
        this.noteTextControl =      this.chartNoteForm.get('noteText');
        this.activityLogControl =   this.chartNoteForm.get('activityLog');
    }

    private setNoteTypeOptions() {

        this.noteTypeOptions = [];
        this.selectedNoteTypeOption = '';
        this.setDropdownItemsToArray('note_type', this.uiDefinition, this.noteTypeOptions, true);
    }

    private setTemplateDataRowOptions() {

        this.noteTemplateOptions = [];
        this.selectedNoteTemplateOption = '';

        this.noteTemplateOptions.push({label: 'Select...', value: null });

        if (this.noteTemplateDataRows != null && this.noteTemplateDataRows.length > 0) {
            for (let row of this.noteTemplateDataRows) {
                this.noteTemplateOptions.push({label: row.description, value: row.idColumn1 });
            }
        }
    }

    private setDropdownItemsToArray(soughtListId: string, windowFields: WindowDefinitionDto[], options: SelectItem[],
        activeOnly: boolean) {

        if ( windowFields != null && options != null && soughtListId != null ) {

            options.push({label: 'Select...', value: null });

            for (let fieldDef of windowFields) {
                if (fieldDef.fieldId === soughtListId) {
                    for (let dataRow of fieldDef.fkTableData[0].dataRows) {
                        if (dataRow.description !== null && dataRow.description !== undefined) {
                            if (activeOnly) {
                                if (dataRow.active) {
                                    options.push({label: dataRow.description, value: dataRow.idColumn1 });
                                }
                            } else {
                                options.push({label: dataRow.description, value: dataRow.idColumn1 });
                            }
                        }
                    }
                }
            }
        }
    }

    private setLabels() {

        this.noteTypeLabel = this._windowDefinitionService
            .getFieldLabel(this.uiDefinition, 'note_type', 'Note Type');
        this.noteTemplateLabel = this._windowDefinitionService
            .getFieldLabel(this.uiDefinition, 'note_template', 'Note Template');
        this.noteTextLabel = this._windowDefinitionService
            .getFieldLabel(this.uiDefinition, 'member_note', 'Note Text');
        this.noteTabLabel = this._windowDefinitionService
            .getFieldLabel(this.uiDefinition, 'note_tab', 'Note');
        this.userDefinedFieldTabLabel = this._windowDefinitionService
            .getFieldLabel(this.uiDefinition, 'udf_tab', 'Additional Details');
    }

    private setHiddenItems() {

        this.hideNoteTemplate = this._windowDefinitionService
            .isFieldHidden(this.uiDefinition, 'note_template');
        this.hideUserDefinedFieldTab = this._windowDefinitionService
            .isFieldHidden(this.uiDefinition, 'udf_tab');
    }

    private getNoteUIDefinition() {

        if (this.uiDefinition.length === 0) {
            this._windowDefinitionService.getWindowDefinition('w_member_chart_note')
                .subscribe(
                windowDefinition => {
                    this.uiDefinition = windowDefinition;
                    this.setLabels();
                    this.setNoteTypeOptions();
                    this.setHiddenItems();
                },
                err => {
                    let message = 'An error occurred retrieving the chart note window definition.';
                    this.handleError(err.toString(), message, 'Window Definition:');
                    this.onNoteError.emit(message);
                },
                () => {
                });
        }
    }
}
