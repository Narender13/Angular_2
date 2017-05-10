export class AppointmentDto {
    id: number;
    ownerCcmsId: number;
    member: MemberDetailsDto;
    description: string;
    type: string;
    taskObjective: string;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    duration: number;
    attendees: AttendeesDto;
    backgroundColor: string;
    tip: string;
}

export class MemberDetailsDto {
    id: string;
    name: string;
    dateOfBirth: string;
    age: number;
    gender: string;
    primaryPhone: string;
    preferredContactType: string;
    preferredContactValue: string;
}

export class RequestAttendeesDto {
    appointmentAttendeeId: number;
    appointmentId: string;
    appointmentAttendeeCCMSId: string;
    memberId: string;
}

export class AttendeesDto {
    attendee: AttendeeDto[];
}

export class AttendeeDto {
    id: number;
    name: string;
    attendeeId: number;
    phone1: string;
    email: string;
}

export class UserSearchDto {
    userId: number;
    userName: string;
    active: string;
}

export class UserTypesSearchDto {
    userType: string;
    userTypeDescription: string;
    isActive: string;
}

export class OpenedTabUserInfoDto {
    userId: number;
    colorCode: string;
    userName: string;
    isMember: boolean;
}

export class AttendeeListDto {
    userId: number;
}

export class AppointmentTypeDto {
    appointmentId: string;
    appointmentTypeDesc: string;
    active: boolean;
    allowDoubleBooking: string;
    appointmentAvailable: string;
    duration: string;
    appointmentTypeSubject: AppointmentSubjectDto[];
}

export class AppointmentSubjectDto {
    subjectId: string;
    subjectDesc: string;
    active: boolean;
}

export interface User {
    appointmenttype: string;
    subjecttype: string;
    description: string;
    appointmentStartDate: string;
    appointmentStartTime: string;
    appointmentEndDate: string;
    appointmentEndTime: string;
}

export class CreateAppointmentDto {
    appointmentId: number;
    appointmentOwnerCCMSId: string;
    memberId: string;
    taskObjectiveId: string;
    appointmentDescription: string;
    appointmentTypeId: number;
    appointmentStartTime: string;
    appointmentEndTime: string;
    appointmentDuration: string;
    appointmentStatusId: number;
    appointmentActiveCode: boolean;
    appointmentAttendee: any;
}