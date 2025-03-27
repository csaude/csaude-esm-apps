import dayjs from 'dayjs';
import useSWR from 'swr';
import { openmrsFetch, restBaseUrl, type OpenmrsResource } from '@openmrs/esm-framework';
import isToday from 'dayjs/plugin/isToday';

interface AppointmentsFetchResponse {
  data: Array<Appointment>;
}

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

enum AppointmentKind {
  SCHEDULED = 'Scheduled',
  WALKIN = 'WalkIn',
  VIRTUAL = 'Virtual',
}

enum AppointmentStatus {
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

dayjs.extend(isToday);
const appointmentsSearchUrl = `${restBaseUrl}/appointments/search`;

export function useAppointments(patientUuid: string, startDate: string, abortController: AbortController) {
  /*
    SWR isn't meant to make POST requests for data fetching. This is a consequence of the API only exposing this resource via POST.
    This works but likely isn't recommended.
  */
  const fetcher = () =>
    openmrsFetch(appointmentsSearchUrl, {
      method: 'POST',
      signal: abortController.signal,
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        patientUuid: patientUuid,
        startDate: startDate,
      },
    });

  const { data, error, isLoading, isValidating, mutate } = useSWR<AppointmentsFetchResponse, Error>(
    appointmentsSearchUrl,
    fetcher,
  );

  const appointments = data?.data?.length ? data.data : null;

  const pastAppointments = appointments
    ?.sort((a, b) => (b.startDateTime > a.startDateTime ? 1 : -1))
    ?.filter(({ status }) => status !== 'Cancelled')
    ?.filter(({ startDateTime }) =>
      dayjs(new Date(startDateTime).toISOString()).isBefore(new Date().setHours(0, 0, 0, 0)),
    );

  const upcomingAppointments = appointments
    ?.sort((a, b) => (a.startDateTime > b.startDateTime ? 1 : -1))
    ?.filter(({ status }) => status !== 'Cancelled')
    ?.filter(({ startDateTime }) => dayjs(new Date(startDateTime).toISOString()).isAfter(new Date()));

  const todaysAppointments = appointments
    ?.sort((a, b) => (a.startDateTime > b.startDateTime ? 1 : -1))
    ?.filter(({ status }) => status !== 'Cancelled')
    ?.filter(({ startDateTime }) => dayjs(new Date(startDateTime).toISOString()).isToday());

  return {
    appointments: data ? { pastAppointments, upcomingAppointments, todaysAppointments } : null,
    error,
    isLoading,
    isValidating,
    mutate,
  };
}

// TODO: move?
export const changeAppointmentStatus = async (toStatus: string, appointmentUuid: string) => {
  const omrsDateFormat = 'YYYY-MM-DDTHH:mm:ss.SSSZZ';
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const statusChangeTime = dayjs(new Date()).format(omrsDateFormat);
  const url = `${restBaseUrl}/appointments/${appointmentUuid}/status-change`;
  return await openmrsFetch(url, {
    body: { toStatus, onDate: statusChangeTime, timeZone: timeZone },
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
};
