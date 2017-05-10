
import { Injectable } from '@angular/core';
import { Headers, RequestOptions } from '@angular/http';

@Injectable()
export class ConfigurationService {

    public static baseUrl: string = '';
    public static apiPath: string = 'axisWebServices/api/v8/';
    public static apiPathPreV8: string = 'axisWebServices/api/';
    public static fullUrlPath: string = '';
    public static fullUrlPathPreV8: string = '';

    public static userId: string = '';
    public static username: string = '';
    public static password: string = '';
    public static usertoken: string = '';

    public static windowDefinition: string = 'admin/{windowId}/ui_definition';
    public static tableDataRows: string = 'admin/{tenantId}/{tableName}/{column1FilterValue}/'
    + '{column2FilterValue}/{column3FilterValue}/'
    + 'filter_rule_domain_table_data';

    public static noteUserDefinedFields: string = 'members/{tenantId}/{memberId}/{noteSeq}/note_user_defined_fields';
    public static createNote: string = 'members/{tenantId}/create/note';
    public static updateNote: string = 'members/{tenantId}/update/note';
    public static linkMemberAssessmentToNote: string = 'members/{tenantId}/{memberId}/note/{noteSeq}/assessment/'
    + '{memberAssessmentId}/link/{link}/is_AP_Assessment/{isAPAssessment}';

    // Member Other Contact
    public static createMemberOtherContact: string = 'members/{tenantId}/create/other_contact';
    public static updateMemberOtherContact: string = 'members/{tenantId}/update/other_contact';
    public static retrieveMemberOtherContact: string = 'members/{tenantId}/{memberId}/{otherContactSeq}/other_contact';
    public static deleteMemberOtherContact: string = 'members/{tenantId}/{memberId}/{otherContactSeq}/delete/other_contact';
    public static getMemberCaregivers: string = 'members/{tenantId}/{memberId}/caregiver';
    public static getMemberPrimaryOtherContact: string = 'members/{tenantId}/{memberId}/primary_other_contact';

    // Member Demographics
    public static retrieveMemberDemographics: string = 'members/{tenantId}/{memberId}/assessment/demographics';
    public static saveMemberDemographics: string = 'members/{tenantId}/assessment/demographics';

    // Member PCP 
    public static retrieveMemberPCP: string = 'members/{tenantId}/{memberId}/member_pcp';
    public static updateMemberPCP: string = 'members/{tenantId}/{memberId}/update_member_pcp';
    public static createMemberPCP: string = 'members/{tenantId}/{memberId}/create_member_pcp';
    //this is an 'existing' web service, versus new, so doesn't yet support the tenant id
    public static searchProvider: string = 'providers/search.json;name={name}';

    // Member Banner APIs
    public static memberBannerApi: string = 'members/{memberId}/header.json';

    // AP Assessment APIs
    public static apAssessmentStartApi: string = 'assessments/start';
    public static apAssessmentContinueApi: string = 'assessments/continue';
    public static apAssessmentNextApi: string = 'assessments/next';
    public static apAssessmentPreviousApi: string = 'assessments/previous';
    public static apAssessmentSaveApi: string = 'assessments/save';
    public static apAssessmentSubmitApi: string = 'assessments/submit';
    public static apAssessmentListApi: string = 'assessments/list?memberId={memberId}&'
    + 'parentAssessmentAlgorithmId={parentAssessmentAlgorithmId}&parentMemberAssessmentId={parentMemberAssessmentId}';
    public static apAssessmentViewApi: string = 'assessments/get_read_only_view?memberId={memberId}&'
    + 'memberAssessmentId={memberAssessmentId}';
    public static apAssessmentGetMemberAssessmentIdApi: string = 'assessments/get_member_assessment_id?memberId={memberId}&'
    + 'assessmentAlgorithmId={assessmentAlgorithmId}';

    // CarePlan APIs
    public static carePlanViewApi: string = 'careplan/view?memberId={memberId}';
    public static carePlanSaveApi: string = 'careplan/save';
    public static carePlanSaveNoteApi: string = 'careplan/save_intervention_note';
    public static carePlanInterventionNoteHistoryApi: string =
    'careplan/get_intervention_note_history?memberGoalBarrierInterventionId={memberGoalBarrierInterventionId}';
    public static carePlanInterventionViewEducationApi: string =
    'careplan/get_member_intervention_education?memberGoalBarrierInterventionId={memberGoalBarrierInterventionId}';
    public static carePlanInterventionSaveEducationApi: string = 'careplan/save_intervention_education';
    public static carePlanInterventionViewInstructionApi: string =
    'careplan/get_member_intervention_instruction?memberGoalBarrierInterventionId={memberGoalBarrierInterventionId}';
    public static carePlanInterventionSaveInstructionApi: string = 'careplan/save_intervention_instructions';
    public static carePlanEducationViewFileApi: string = 'careplan/get_html_file/{fileName}';



    // Calendar Appointment APIs
    public static appointmentListApi: string = 'appointments/list';
    public static appointmentTypes: string = 'calendar/appointment_types/User';
    public static appointmentMemberTypes: string = 'calendar/appointment_types/Member';
    public static searchUsers: string = 'admin/users/{userName}';
    public static searchUserGroups: string = 'admin/usergroups';
    public static searchUserTypes: string = 'admin/userTypes/{userTypeDesc}';
    // public static calendarAppointmentListApi: string = 'calendarAppointments/user/';
    public static calendarAppointmentListApi: string = 'calendar/appointments/user';
    public static calendarAppointmentListMemberApi: string = 'calendar/appointments/member';
    public static appointmentListMember: string = 'calendar/appointments/member';
    public static addAppointment: string = 'calendar/{userId}/create/appointment';
    public static getAvailibility: string = 'calendar/user_availability';
    public static postAvailibility: string = 'calendar/add_user_availability';

    public static getNextQueueItems: string = 'getnext/{tenantId}/{userId}/queue_items';
    public static resolveTaskDefinition: string = 'getnext/{tenantId}/{memberId}/resolve_task_definition/{taskDefinitionId}';
    public static getNextTaskHistory: string = 'getnext/{tenantId}/{getNextTaskId}/get_task_definition_history';
    public static getNextSetStatus: string = 'getnext/{tenantId}/{getNextTaskId}/set_status/{status}';

    private static initialized: boolean = false;

    private static tenantId: string = '';

    public static getHeaders() {
        const headers = new Headers();
        headers.append('Content-Type', 'application/json; charset=utf-8');
        headers.append('X-Requested-With', 'XMLHttpRequest');

        if (ConfigurationService.usertoken !== null) {
            headers.append('Authorization', 'Bearer ' + ConfigurationService.usertoken);
        } else {
            headers.append('Authorization', 'Basic ' + btoa(ConfigurationService.username + ':' + ConfigurationService.password));
        }

        return new RequestOptions({ headers: headers });
    }

    public static setTenantId(tenantId: string) {
        console.log('setting tenant id: ' + tenantId);
        ConfigurationService.tenantId = tenantId;
        ConfigurationService.setTenantToPaths();
    }

    public static isDevelopmentMode(): boolean {
        let devMode = false;
        if (process.env.ENV === 'development') {
            devMode = true;
        }
        return devMode;
    }

    public static initialize() {
        if (ConfigurationService.initialized === true) {
            return;
        }

        let finalUrl = '';

        if (process.env.ENV !== 'development') {

            let url = window.location.href;

            // Pull off any hash.
            let i = url.indexOf('#');
            if (i !== -1) {
                url = url.substring(0, i);
            }

            // Pull off any query string.
            i = url.indexOf('?');
            if (i !== -1) {
                url = url.substring(0, i);
                console.log('url after substring: ' + url);
            }

            // Rip off everything after the last slash.
            i = url.lastIndexOf('/');
            if (i !== -1) {
                url = url.substring(0, i);
            }

            // Ensure a final slash if non-empty.
            finalUrl = url.length > 0 ? url + '/' : '';
            finalUrl = finalUrl.replace('/axis/axisng', '');
            finalUrl = finalUrl.replace('/VITALPlatform/axisng', '');
        } else {

            // default to the axis web services url you intend to use for development
            finalUrl = 'http://localhost:8080/';
            ConfigurationService.tenantId = 'COLO_DEV';
            ConfigurationService.username = 'ccmsdba';
            ConfigurationService.password = 'ccmsdba';
            console.log('finalUrl: ' + finalUrl);
        }

        ConfigurationService.baseUrl = finalUrl;
        ConfigurationService.fullUrlPath = ConfigurationService.baseUrl + ConfigurationService.apiPath;
        ConfigurationService.fullUrlPathPreV8 = ConfigurationService.baseUrl + ConfigurationService.apiPathPreV8;

        console.log('fullUrlPath: ' + ConfigurationService.fullUrlPath);

        ConfigurationService.setTenantToPaths();
        ConfigurationService.setUrlPaths();

        ConfigurationService.initialized = true;
    }

    private static setUrlPaths() {

        ConfigurationService.memberBannerApi = ConfigurationService.fullUrlPathPreV8 + ConfigurationService.memberBannerApi;

        ConfigurationService.noteUserDefinedFields = ConfigurationService.fullUrlPath + ConfigurationService.noteUserDefinedFields;
        ConfigurationService.createNote = ConfigurationService.fullUrlPath + ConfigurationService.createNote;
        ConfigurationService.updateNote = ConfigurationService.fullUrlPath + ConfigurationService.updateNote;
        ConfigurationService.windowDefinition = ConfigurationService.fullUrlPath + ConfigurationService.windowDefinition;
        ConfigurationService.tableDataRows = ConfigurationService.fullUrlPath + ConfigurationService.tableDataRows;
        ConfigurationService.apAssessmentStartApi = ConfigurationService.fullUrlPath + ConfigurationService.apAssessmentStartApi;
        ConfigurationService.apAssessmentContinueApi = ConfigurationService.fullUrlPath + ConfigurationService.apAssessmentContinueApi;
        ConfigurationService.apAssessmentNextApi = ConfigurationService.fullUrlPath + ConfigurationService.apAssessmentNextApi;
        ConfigurationService.apAssessmentPreviousApi = ConfigurationService.fullUrlPath + ConfigurationService.apAssessmentPreviousApi;
        ConfigurationService.apAssessmentSaveApi = ConfigurationService.fullUrlPath + ConfigurationService.apAssessmentSaveApi;
        ConfigurationService.apAssessmentSubmitApi = ConfigurationService.fullUrlPath + ConfigurationService.apAssessmentSubmitApi;
        ConfigurationService.apAssessmentListApi = ConfigurationService.fullUrlPath + ConfigurationService.apAssessmentListApi;
        ConfigurationService.apAssessmentViewApi = ConfigurationService.fullUrlPath + ConfigurationService.apAssessmentViewApi;
        ConfigurationService.apAssessmentGetMemberAssessmentIdApi =
            ConfigurationService.fullUrlPath + ConfigurationService.apAssessmentGetMemberAssessmentIdApi;
        ConfigurationService.appointmentListApi = ConfigurationService.fullUrlPath + ConfigurationService.appointmentListApi;
        ConfigurationService.carePlanViewApi = ConfigurationService.fullUrlPath + ConfigurationService.carePlanViewApi;
        ConfigurationService.carePlanSaveApi = ConfigurationService.fullUrlPath + ConfigurationService.carePlanSaveApi;
        ConfigurationService.carePlanSaveNoteApi = ConfigurationService.fullUrlPath + ConfigurationService.carePlanSaveNoteApi;
        ConfigurationService.carePlanInterventionNoteHistoryApi =
            ConfigurationService.fullUrlPath + ConfigurationService.carePlanInterventionNoteHistoryApi;
        ConfigurationService.carePlanInterventionViewEducationApi =
            ConfigurationService.fullUrlPath + ConfigurationService.carePlanInterventionViewEducationApi;
        ConfigurationService.carePlanInterventionSaveEducationApi =
            ConfigurationService.fullUrlPath + ConfigurationService.carePlanInterventionSaveEducationApi;
        ConfigurationService.carePlanInterventionViewInstructionApi =
            ConfigurationService.fullUrlPath + ConfigurationService.carePlanInterventionViewInstructionApi;
        ConfigurationService.carePlanInterventionSaveInstructionApi =
            ConfigurationService.fullUrlPath + ConfigurationService.carePlanInterventionSaveInstructionApi;
        ConfigurationService.carePlanEducationViewFileApi =
            ConfigurationService.fullUrlPath + ConfigurationService.carePlanEducationViewFileApi;
        ConfigurationService.appointmentTypes = ConfigurationService.fullUrlPath + ConfigurationService.appointmentTypes;
        ConfigurationService.appointmentMemberTypes = ConfigurationService.fullUrlPath + ConfigurationService.appointmentMemberTypes;
        ConfigurationService.searchUsers = ConfigurationService.fullUrlPath + ConfigurationService.searchUsers;
        ConfigurationService.searchUserGroups = ConfigurationService.fullUrlPath + ConfigurationService.searchUserGroups;
        ConfigurationService.searchUserTypes = ConfigurationService.fullUrlPath + ConfigurationService.searchUserTypes;
        ConfigurationService.calendarAppointmentListApi =
            ConfigurationService.fullUrlPath + ConfigurationService.calendarAppointmentListApi;
        ConfigurationService.calendarAppointmentListMemberApi =
            ConfigurationService.fullUrlPath + ConfigurationService.calendarAppointmentListMemberApi;
        ConfigurationService.appointmentListMember = ConfigurationService.fullUrlPath + ConfigurationService.appointmentListMember;
        ConfigurationService.getNextQueueItems = ConfigurationService.fullUrlPath + ConfigurationService.getNextQueueItems;
        ConfigurationService.resolveTaskDefinition = ConfigurationService.fullUrlPath + ConfigurationService.resolveTaskDefinition;
        ConfigurationService.getNextTaskHistory = ConfigurationService.fullUrlPath + ConfigurationService.getNextTaskHistory;
        ConfigurationService.getNextSetStatus = ConfigurationService.fullUrlPath + ConfigurationService.getNextSetStatus;
        ConfigurationService.addAppointment = ConfigurationService.fullUrlPath + ConfigurationService.addAppointment;
        ConfigurationService.getAvailibility = ConfigurationService.fullUrlPath + ConfigurationService.getAvailibility;
        ConfigurationService.postAvailibility = ConfigurationService.fullUrlPath + ConfigurationService.postAvailibility;
        ConfigurationService.createMemberOtherContact = ConfigurationService.fullUrlPath + ConfigurationService.createMemberOtherContact;
        ConfigurationService.updateMemberOtherContact = ConfigurationService.fullUrlPath + ConfigurationService.updateMemberOtherContact;
        ConfigurationService.retrieveMemberOtherContact =
            ConfigurationService.fullUrlPath + ConfigurationService.retrieveMemberOtherContact;
        ConfigurationService.getMemberCaregivers =
            ConfigurationService.fullUrlPath + ConfigurationService.getMemberCaregivers;
        ConfigurationService.getMemberPrimaryOtherContact =
            ConfigurationService.fullUrlPath + ConfigurationService.getMemberPrimaryOtherContact;
        ConfigurationService.linkMemberAssessmentToNote =
            ConfigurationService.fullUrlPath + ConfigurationService.linkMemberAssessmentToNote;
        ConfigurationService.deleteMemberOtherContact =
            ConfigurationService.fullUrlPath + ConfigurationService.deleteMemberOtherContact;
        ConfigurationService.retrieveMemberDemographics =
            ConfigurationService.fullUrlPath + ConfigurationService.retrieveMemberDemographics;
        ConfigurationService.saveMemberDemographics =
            ConfigurationService.fullUrlPath + ConfigurationService.saveMemberDemographics;
        ConfigurationService.retrieveMemberPCP = ConfigurationService.fullUrlPath + ConfigurationService.retrieveMemberPCP;
        ConfigurationService.updateMemberPCP = ConfigurationService.fullUrlPath + ConfigurationService.updateMemberPCP;
        ConfigurationService.createMemberPCP = ConfigurationService.fullUrlPath + ConfigurationService.createMemberPCP;
        ConfigurationService.searchProvider = ConfigurationService.fullUrlPathPreV8 + ConfigurationService.searchProvider;
    }

    private static setTenantToPaths() {

        if (ConfigurationService.tenantId !== null && ConfigurationService.tenantId !== undefined && ConfigurationService.tenantId !== '') {

            ConfigurationService.memberBannerApi =
                ConfigurationService.memberBannerApi.replace('{tenantId}', ConfigurationService.tenantId);
            ConfigurationService.noteUserDefinedFields =
                ConfigurationService.noteUserDefinedFields.replace('{tenantId}', ConfigurationService.tenantId);
            ConfigurationService.apAssessmentStartApi =
                ConfigurationService.apAssessmentStartApi.replace('{tenantId}', ConfigurationService.tenantId);
            ConfigurationService.apAssessmentContinueApi =
                ConfigurationService.apAssessmentContinueApi.replace('{tenantId}', ConfigurationService.tenantId);
            ConfigurationService.apAssessmentNextApi =
                ConfigurationService.apAssessmentNextApi.replace('{tenantId}', ConfigurationService.tenantId);
            ConfigurationService.apAssessmentPreviousApi =
                ConfigurationService.apAssessmentPreviousApi.replace('{tenantId}', ConfigurationService.tenantId);
            ConfigurationService.apAssessmentSaveApi =
                ConfigurationService.apAssessmentSaveApi.replace('{tenantId}', ConfigurationService.tenantId);
            ConfigurationService.apAssessmentSubmitApi =
                ConfigurationService.apAssessmentSubmitApi.replace('{tenantId}', ConfigurationService.tenantId);
            ConfigurationService.apAssessmentListApi =
                ConfigurationService.apAssessmentListApi.replace('{tenantId}', ConfigurationService.tenantId);
            ConfigurationService.apAssessmentViewApi =
                ConfigurationService.apAssessmentViewApi.replace('{tenantId}', ConfigurationService.tenantId);
            ConfigurationService.apAssessmentGetMemberAssessmentIdApi =
                ConfigurationService.apAssessmentGetMemberAssessmentIdApi.replace('{tenantId}', ConfigurationService.tenantId);
            ConfigurationService.carePlanViewApi =
                ConfigurationService.carePlanViewApi.replace('{tenantId}', ConfigurationService.tenantId);

            ConfigurationService.carePlanSaveApi =
                ConfigurationService.carePlanSaveApi.replace('{tenantId}', ConfigurationService.tenantId);
            ConfigurationService.carePlanSaveNoteApi =
                ConfigurationService.carePlanSaveNoteApi.replace('{tenantId}', ConfigurationService.tenantId);
            ConfigurationService.carePlanInterventionNoteHistoryApi =
                ConfigurationService.carePlanInterventionNoteHistoryApi.replace('{tenantId}', ConfigurationService.tenantId);
            ConfigurationService.carePlanInterventionViewEducationApi =
                ConfigurationService.carePlanInterventionViewEducationApi.replace('{tenantId}', ConfigurationService.tenantId);
            ConfigurationService.carePlanInterventionSaveEducationApi =
                ConfigurationService.carePlanInterventionSaveEducationApi.replace('{tenantId}', ConfigurationService.tenantId);
            ConfigurationService.carePlanInterventionViewInstructionApi =
                ConfigurationService.carePlanInterventionViewInstructionApi.replace('{tenantId}', ConfigurationService.tenantId);
            ConfigurationService.carePlanInterventionSaveInstructionApi =
                ConfigurationService.carePlanInterventionSaveInstructionApi.replace('{tenantId}', ConfigurationService.tenantId);
            ConfigurationService.carePlanEducationViewFileApi =
                ConfigurationService.carePlanEducationViewFileApi.replace('{tenantId}', ConfigurationService.tenantId);

            ConfigurationService.appointmentListApi =
                ConfigurationService.appointmentListApi.replace('{tenantId}', ConfigurationService.tenantId);
            ConfigurationService.appointmentTypes =
                ConfigurationService.appointmentTypes.replace('{tenantId}', ConfigurationService.tenantId);
            ConfigurationService.appointmentMemberTypes =
                ConfigurationService.appointmentMemberTypes.replace('{tenantId}', ConfigurationService.tenantId);
            ConfigurationService.searchUsers =
                ConfigurationService.searchUsers.replace('{tenantId}', ConfigurationService.tenantId);
            ConfigurationService.searchUserGroups =
                ConfigurationService.searchUserGroups.replace('{tenantId}', ConfigurationService.tenantId);
            ConfigurationService.searchUserTypes =
                ConfigurationService.searchUserTypes.replace('{tenantId}', ConfigurationService.tenantId);
            ConfigurationService.calendarAppointmentListApi =
                ConfigurationService.calendarAppointmentListApi.replace('{tenantId}', ConfigurationService.tenantId);
            ConfigurationService.getNextQueueItems =
                ConfigurationService.getNextQueueItems.replace('{tenantId}', ConfigurationService.tenantId);
            ConfigurationService.resolveTaskDefinition =
                ConfigurationService.resolveTaskDefinition.replace('{tenantId}', ConfigurationService.tenantId);
            ConfigurationService.getNextTaskHistory =
                ConfigurationService.getNextTaskHistory.replace('{tenantId}', ConfigurationService.tenantId);
            ConfigurationService.getNextSetStatus =
                ConfigurationService.getNextSetStatus.replace('{tenantId}', ConfigurationService.tenantId);
            ConfigurationService.addAppointment =
                ConfigurationService.addAppointment.replace('{tenantId}', ConfigurationService.tenantId);
            ConfigurationService.getAvailibility =
                ConfigurationService.getAvailibility.replace('{tenantId}', ConfigurationService.tenantId);
            ConfigurationService.postAvailibility =
                ConfigurationService.postAvailibility.replace('{tenantId}', ConfigurationService.tenantId);
            ConfigurationService.tableDataRows =
                ConfigurationService.tableDataRows.replace('{tenantId}', ConfigurationService.tenantId);
            ConfigurationService.createNote =
                ConfigurationService.createNote.replace('{tenantId}', ConfigurationService.tenantId);
            ConfigurationService.updateNote =
                ConfigurationService.updateNote.replace('{tenantId}', ConfigurationService.tenantId);
            ConfigurationService.createMemberOtherContact =
                ConfigurationService.createMemberOtherContact.replace('{tenantId}', ConfigurationService.tenantId);
            ConfigurationService.updateMemberOtherContact =
                ConfigurationService.updateMemberOtherContact.replace('{tenantId}', ConfigurationService.tenantId);
            ConfigurationService.retrieveMemberOtherContact =
                ConfigurationService.retrieveMemberOtherContact.replace('{tenantId}', ConfigurationService.tenantId);
            ConfigurationService.deleteMemberOtherContact =
                ConfigurationService.deleteMemberOtherContact.replace('{tenantId}', ConfigurationService.tenantId);
            ConfigurationService.getMemberCaregivers =
                ConfigurationService.getMemberCaregivers.replace('{tenantId}', ConfigurationService.tenantId);
            ConfigurationService.getMemberPrimaryOtherContact =
                ConfigurationService.getMemberPrimaryOtherContact.replace('{tenantId}', ConfigurationService.tenantId);
            ConfigurationService.linkMemberAssessmentToNote =
                ConfigurationService.linkMemberAssessmentToNote.replace('{tenantId}', ConfigurationService.tenantId);
            ConfigurationService.retrieveMemberDemographics =
                ConfigurationService.retrieveMemberDemographics.replace('{tenantId}', ConfigurationService.tenantId);
            ConfigurationService.saveMemberDemographics =
                ConfigurationService.saveMemberDemographics.replace('{tenantId}', ConfigurationService.tenantId);
            ConfigurationService.updateMemberPCP =
                ConfigurationService.updateMemberPCP.replace('{tenantId}', ConfigurationService.tenantId);
            ConfigurationService.createMemberPCP =
                ConfigurationService.createMemberPCP.replace('{tenantId}', ConfigurationService.tenantId);
            ConfigurationService.retrieveMemberPCP =
                ConfigurationService.retrieveMemberPCP.replace('{tenantId}', ConfigurationService.tenantId);
        }
    }
}
