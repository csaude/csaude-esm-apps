import { openmrsFetch } from '@openmrs/esm-framework';
import { type Appointment } from '../../../dynamic-workflow/resources/patient-appointments.resource';

export interface AppointmentSearchResponse {
  [key: string]: Appointment;
}

export async function searchAppointments(patientUuid: string, startDate: string): Promise<Appointment[]> {
  try {
    const payload = {
      patientUuid,
      startDate,
    };

    const response = await openmrsFetch<AppointmentSearchResponse>('/ws/rest/v1/appointments/search', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: payload,
    });

    // Convert response object to array
    return Object.values(response.data);
  } catch (error) {
    console.error('Error fetching appointments:', error);
    throw error;
  }
}

export function filterAppointmentsByUuids(appointments: Array<Appointment>, uuids: Array<string>): Array<Appointment> {
  if (!uuids || uuids.length === 0) {
    return appointments;
  }

  return appointments.filter((appointment) => uuids.includes(appointment.uuid));
}
