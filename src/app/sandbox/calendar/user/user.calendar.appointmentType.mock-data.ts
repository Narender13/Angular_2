import { AppointmentTypeDto } from './user.calendar.dtos.ts';

export const appointmentTypes: AppointmentTypeDto[] =/* [{
	"appointmentId": "SCHEDULEDCALL",
	"appointmentTypeDesc": "Scheduled Call",
	"active": true,
	"allowDoubleBooking": "Y",
	"appointmentAvailable": "Member",
	"duration": "15MINUTES",
	"appointmentTypeSubject": [{
		"subjectId": "COMPLETECARETRACKASSESSMENT",
		"subjectDesc": "Complete Care Track Assessment",
		"active": true
	}, {
		"subjectId": "COMPLETEGENERALASSESSMENT",
		"subjectDesc": "Complete General Assessment",
		"active": true
	}, {
		"subjectId": "FOLLOWUPONCAREPLAN",
		"subjectDesc": "Follow up on Care Plan",
		"active": true
	}, {
		"subjectId": "FOLLOWUPONINTERVENTION",
		"subjectDesc": "Follow up on Intervention",
		"active": true
	}]
}, {
	"appointmentId": "SCHEDULEDCALLWITHTRANSLATOR",
	"appointmentTypeDesc": "Scheduled Call with Translator",
	"active": true,
	"allowDoubleBooking": "Y",
	"appointmentAvailable": "Member",
	"duration": "30MINUTES",
	"appointmentTypeSubject": [{
		"subjectId": "COMPLETECARETRACKASSESSMENT",
		"subjectDesc": "Complete Care Track Assessment",
		"active": true
	}, {
		"subjectId": "COMPLETEGENERALASSESSMENT",
		"subjectDesc": "Complete General Assessment",
		"active": true
	}, {
		"subjectId": "FOLLOWUPONCAREPLAN",
		"subjectDesc": "Follow up on Care Plan",
		"active": true
	}, {
		"subjectId": "FOLLOWUPONINTERVENTION",
		"subjectDesc": "Follow up on Intervention",
		"active": true
	}]
}, {
	"appointmentId": "TRAVELTIMEUSER",
	"appointmentTypeDesc": "Travel Time",
	"active": true,
	"allowDoubleBooking": "Y",
	"appointmentAvailable": "Member",
	"duration": "30MINUTES",
	"appointmentTypeSubject": [{
		"subjectId": "TRAVELTIMEFORINPERSONMEETING",
		"subjectDesc": "Travel Time for In-Person Meeting",
		"active": true
	}]
}, {
	"appointmentId": "INPERSONMEETING",
	"appointmentTypeDesc": "In-Person Meeting",
	"active": true,
	"allowDoubleBooking": "N",
	"appointmentAvailable": "Member",
	"duration": "30MINUTES",
	"appointmentTypeSubject": [{
		"subjectId": "INPERSONMEETINGWITHMEMBER",
		"subjectDesc": "In-Person Meeting with Member",
		"active": true
	}]
}];*/
[{
	"appointmentId": "TRAVELTIMEUSER",
	"appointmentTypeDesc": "Travel Time",
	"active": true,
	"allowDoubleBooking": "Y",
	"appointmentAvailable": "User",
	"duration": "30 minutes",
	"appointmentTypeSubject": [{
		"subjectId": "TRAVELTIMEFORINPERSONMEETING",
		"subjectDesc": "Travel Time for In-Person Meeting",
		"active": true
	}]
}, {
	"appointmentId": "BLOCKEDTIMEUSER",
	"appointmentTypeDesc": "Blocked Time",
	"active": true,
	"allowDoubleBooking": "Y",
	"appointmentAvailable": "User",
	"duration": "30 minutes",
	"appointmentTypeSubject": [{
		"subjectId": "NONWORKRELATEDTIME",
		"subjectDesc": "Non-Work Related Time",
		"active": true
	}, {
		"subjectId": "WORKRELATEDACTIVITIES",
		"subjectDesc": "Work Related Activities",
		"active": true
	}]
}, {
	"appointmentId": "TEAMMEETINGUSER",
	"appointmentTypeDesc": "Team Meeting",
	"active": true,
	"allowDoubleBooking": "Y",
	"appointmentAvailable": "User",
	"duration": "60 minutes",
	"appointmentTypeSubject": [{
		"subjectId": "ALLEMPLOYEEMEETING",
		"subjectDesc": "All Employee Meeting",
		"active": true
	}, {
		"subjectId": "TEAMMEETING",
		"subjectDesc": "Team Meeting",
		"active": true
	}]
}, {
	"appointmentId": "TRAININGUSER",
	"appointmentTypeDesc": "Training",
	"active": true,
	"allowDoubleBooking": "Y",
	"appointmentAvailable": "User",
	"duration": "60 minutes",
	"appointmentTypeSubject": [{
		"subjectId": "PERSONALTRAINING",
		"subjectDesc": "Personal Training",
		"active": true
	}, {
		"subjectId": "PROFESSIONALTRAINING",
		"subjectDesc": "Professional Training",
		"active": true
	}]
}]