import { FormLabel } from '@carbon/react';
import { formatDatetime, parseDate } from '@openmrs/esm-framework';
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Appointment } from '../resources/patient-appointments.resource';
import { ApppointmentsActionMenu } from './appointments-step-renderer.component';
import styles from './components.scss';

interface AppointmentsSummaryCardProps {
  appointments: Array<Appointment>;
  onEdit: (appointment: Appointment) => void;
  onDelete(appointmentId: string): void;
  patientUuid: string;
  isDesktop: boolean;
}

const AppointmentsSummaryCardComponent: React.FC<AppointmentsSummaryCardProps> = ({
  appointments,
  isDesktop,
  patientUuid,
  onEdit,
  onDelete,
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
            <ApppointmentsActionMenu
              appointment={appointment}
              patientUuid={patientUuid}
              onEdit={onEdit}
              onDelete={onDelete}
            />
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
