export class AppointmentDto {
    id: number;
	OwnerCcmsId: number;
    member: memberDetailsDto;
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

export class CreateAppointmentDto {
    appointmentId: number;
    appointmentOwnerCCMSId: number;
    memberId: number;
    taskObjectiveId: string;
    appointmentDescription: string;
    appointmentTypeId: number;
    appointmentStartTime: string;
    appointmentEndTime: string;
    appointmentDuration: string;
    appointmentStatusId: number;
    appointmentActiveCode: boolean;
    appointmentAttendee: RequestAttendeesDto[];
}

export class memberDetailsDto {
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
    memberId: String;
}

export class AttendeesDto{
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

export class UserGroupSearchDto {
    userId: string;
    userName: string;
    active: string;
}

export class UserTypesSearchDto {
    userType: string;
    userTypeDescription: string;
    isActive: string;
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

export class MyEvent {
    id: number;
    title: string;
    start: string;
    end: string;
    allDay: boolean = true;
}

export class GetAvailabilityDTO {
    userId: number;
    startDate: string;
    startTime: string;
    endDate: string;
    endTime: string;
    active: boolean;
}

/* Add Availibility
export class PostGetDTO {
    userIds: number;
    startDateAsString: string;
    startTimeAsString: string;
    endDateAsString: string;
    endTimeAsString: string;
    active: boolean;

}
*/
export class UserAppointmentDetail {
    userId: number;
    userName: string;
    colorCode: string;
}
export class attendeeListIdType {
    id: any;
    type: string;
}



