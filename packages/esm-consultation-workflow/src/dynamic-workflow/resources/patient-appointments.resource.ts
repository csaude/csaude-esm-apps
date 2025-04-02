import { type OpenmrsResource } from '@openmrs/esm-framework';

export interface Appointment {
  appointmentKind: AppointmentKind;
  appointmentNumber: string;
  comments: string;
  endDateTime: Date | number | any;
  location: AppointmentLocation;
  patient: {
    identifier: string;
    identifiers: Array<Identifier>;
    name: string;
    uuid: string;
    age?: string;
    gender?: string;
  };
  provider: OpenmrsResource;
  providers: Array<OpenmrsResource>;
  recurring: boolean;
  service: AppointmentService;
  startDateTime: string | any;
  dateAppointmentScheduled: string | any;
  status: AppointmentStatus;
  uuid: string;
  additionalInfo?: string | null;
  serviceTypes?: Array<ServiceTypes> | null;
  voided: boolean;
  extensions: {};
  teleconsultationLink: string | null;
}

export enum AppointmentKind {
  SCHEDULED = 'Scheduled',
  WALKIN = 'WalkIn',
  VIRTUAL = 'Virtual',
}

export enum AppointmentStatus {
  SCHEDULED = 'Scheduled',
  CANCELLED = 'Cancelled',
  MISSED = 'Missed',
  CHECKEDIN = 'CheckedIn',
  COMPLETED = 'Completed',
}

interface AppointmentLocation {
  uuid: string;
  name: string;
}

interface Identifier {
  identifier: string;
  identifierName?: string;
}

interface AppointmentService {
  appointmentServiceId: number;
  creatorName: string;
  description: string;
  durationMins?: number;
  endTime: string;
  initialAppointmentStatus: string;
  location?: OpenmrsResource;
  maxAppointmentsLimit: number | null;
  name: string;
  specialityUuid?: OpenmrsResource | {};
  startTime: string;
  uuid: string;
  serviceTypes?: Array<ServiceTypes>;
  color?: string;
  startTimeTimeFormat?: amPm;
  endTimeTimeFormat?: amPm;
}

type amPm = 'AM' | 'PM';

interface ServiceTypes {
  duration: number;
  name: string;
  uuid: string;
}
