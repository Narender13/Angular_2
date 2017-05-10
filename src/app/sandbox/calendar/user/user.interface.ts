  export interface AppointmentDetail {
    appointmentTypeId: string;
    subjecttype: string;
    description: string;
    appointmentdatetime?: {
      appointmentstartdate?: string;
      appointmentstarttime?: string;
      appointmentenddate?: string;
      appointmentendtime?: string;
    };
  }

  export interface AvailabilityUser {
    userId: number;
    active: boolean;
    availabilitydatetime?: {
      availabilitystartdate?: string;
      availabilitystarttime?: string;
      availabilityenddate?: string;
      availabilityendtime?: string;
    };
  }
