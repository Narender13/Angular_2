export class AppointmentDto {
    id: number;
    title: string;
    start: string;
    end: string;
    allDay: boolean = true;
}