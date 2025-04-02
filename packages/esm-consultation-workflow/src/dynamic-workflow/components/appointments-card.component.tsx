import React from 'react';
import { Appointment } from '../resources/patient-appointments.resource';
import styles from './components.scss';
import { ApppointmentsActionMenu } from './appointments-step-renderer.component';
import { formatDatetime, parseDate } from '@openmrs/esm-framework';
import { useTranslation } from 'react-i18next';
import { FormLabel } from '@carbon/react';

interface AppointmentsSummaryCardProps {
  appointments: Array<Appointment>;
  patientUuid: string;
  isDesktop: boolean;
}

const AppointmentsSummaryCardComponent: React.FC<AppointmentsSummaryCardProps> = ({
  appointments,
  isDesktop,
  patientUuid,
}) => {
  const { t } = useTranslation();

  return (
    <>
      {appointments.map((appointment, i) => (
        <div
          className={isDesktop ? styles.desktopContainer : styles.tabletContainer}
          key={appointment.uuid}
          style={{
            backgroundColor: i % 2 == 0 ? '#f4f4f4' : undefined,
          }}>
          <div className={styles.headingContainer}>
            <div className={styles.heading}>
              <div className={styles.notes}>{appointment.location.name}</div>
              <FormLabel>{appointment.status.toUpperCase()}</FormLabel>
            </div>
            <ApppointmentsActionMenu appointment={appointment} patientUuid={patientUuid} />
          </div>
          <div className={styles.cardBody}>
            <div>
              <FormLabel>{t('service', 'Serviço')}:</FormLabel>
              <div className={styles.notes}>{appointment.service?.name ? appointment.service.name : '——'}</div>
            </div>
            <div>
              <FormLabel>{t('type', 'Tipo')}:</FormLabel>
              <div className={styles.notes}>{appointment.appointmentKind ? appointment.appointmentKind : '——'}</div>
            </div>
            <div>
              <FormLabel>{t('notes', 'Notas')}:</FormLabel>
              <div className={styles.notes}>{appointment.comments ? appointment.comments : '——'}</div>
            </div>
            <div>
              <FormLabel>{t('date', 'Data')}:</FormLabel>
              <div className={styles.notes}>{formatDatetime(parseDate(appointment.endDateTime))}</div>
            </div>
          </div>
        </div>
      ))}
    </>
  );
};

export default AppointmentsSummaryCardComponent;
