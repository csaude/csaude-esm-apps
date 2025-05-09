import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  InlineLoading,
  StructuredListWrapper,
  StructuredListHead,
  StructuredListRow,
  StructuredListCell,
  StructuredListBody,
  Tag,
} from '@carbon/react';
import { formatDate, usePatient } from '@openmrs/esm-framework';
import styles from './step-display.scss';
import { Appointment } from '../../../dynamic-workflow/resources/patient-appointments.resource';
import { filterAppointmentsByUuids, searchAppointments } from './appointments-step-display.resource';

interface AppointmentsStepDisplayProps {
  step: {
    stepId: string;
    stepName: string;
    renderType: string;
    completed: boolean;
    dataReference: string | null;
    patientUuid: string;
  };
}

const AppointmentsStepDisplay: React.FC<AppointmentsStepDisplayProps> = ({ step }) => {
  const { t } = useTranslation();
  const { patientUuid } = usePatient();
  const [appointments, setAppointments] = useState<Array<Appointment>>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        setIsLoading(true);

        // Get today's date in ISO format for the API request
        const currentDate = new Date();
        const isoDate = currentDate.toISOString();

        // Fetch appointments data
        const appointmentsData = await searchAppointments(step.patientUuid || patientUuid, isoDate);

        // Parse dataReference to get specific appointment IDs if available
        let targetAppointmentIds: string[] = [];
        if (step.dataReference) {
          try {
            const parsed = JSON.parse(step.dataReference);
            targetAppointmentIds = Array.isArray(parsed) ? parsed : [step.dataReference];
          } catch (e) {
            targetAppointmentIds = [step.dataReference];
          }
        }

        // Filter appointments based on dataReference if IDs are specified
        const filteredAppointments = filterAppointmentsByUuids(appointmentsData, targetAppointmentIds);

        setAppointments(filteredAppointments);
        setIsLoading(false);
      } catch (err) {
        setError(err as Error);
        setIsLoading(false);
      }
    };

    fetchAppointments();
  }, [step.dataReference, step.patientUuid, patientUuid]);

  if (isLoading) {
    return <InlineLoading description={t('loadingAppointments', 'Loading appointments...')} />;
  }

  if (error) {
    return (
      <div className={styles.errorState}>
        {t('errorLoadingAppointments', 'Error loading appointments: {{message}}', { message: error.message })}
      </div>
    );
  }

  if (appointments.length === 0) {
    return (
      <div className={styles.emptyState}>
        {t('noAppointmentsRecorded', 'No appointments were recorded for this step.')}
      </div>
    );
  }

  // Helper function to determine tag type based on appointment status
  const getStatusTagType = (status: string): 'green' | 'red' | 'purple' | 'gray' | 'blue' => {
    const statusLower = status.toLowerCase();
    if (statusLower.includes('scheduled')) {
      return 'blue';
    }
    if (statusLower.includes('completed')) {
      return 'green';
    }
    if (statusLower.includes('cancelled')) {
      return 'red';
    }
    if (statusLower.includes('missed')) {
      return 'purple';
    }
    return 'gray';
  };

  return (
    <div className={styles.stepDisplayContainer}>
      <StructuredListWrapper className={styles.structuredList}>
        <StructuredListHead>
          <StructuredListRow head>
            <StructuredListCell head>{t('date', 'Data')}</StructuredListCell>
            <StructuredListCell head>{t('service', 'Serviço')}</StructuredListCell>
            <StructuredListCell head>{t('location', 'Local')}</StructuredListCell>
            <StructuredListCell head>{t('status', 'Estado')}</StructuredListCell>
            <StructuredListCell head>{t('comments', 'Comentários')}</StructuredListCell>
          </StructuredListRow>
        </StructuredListHead>
        <StructuredListBody>
          {appointments.map((appointment) => (
            <StructuredListRow key={appointment.uuid}>
              <StructuredListCell>{formatDate(new Date(appointment.startDateTime))}</StructuredListCell>
              <StructuredListCell>{appointment.service?.name || t('notSpecified', 'Not specified')}</StructuredListCell>
              <StructuredListCell>
                {appointment.location?.name || t('notSpecified', 'Not specified')}
              </StructuredListCell>
              <StructuredListCell>
                <Tag type={getStatusTagType(appointment.status)}>{appointment.status}</Tag>
              </StructuredListCell>
              <StructuredListCell>
                {appointment.comments ? (
                  <span>{appointment.comments}</span>
                ) : (
                  <span className={styles.noData}>{t('noneRecorded', 'None recorded')}</span>
                )}
              </StructuredListCell>
            </StructuredListRow>
          ))}
        </StructuredListBody>
      </StructuredListWrapper>
    </div>
  );
};

export default AppointmentsStepDisplay;
