import React, { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { closeWorkspace, useLayoutType, showModal } from '@openmrs/esm-framework';
import { EmptyState, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { StepComponentProps } from '../types';
import { useTranslation } from 'react-i18next';
import styles from './components.scss';
import { IconButton, Button } from '@carbon/react';
import { Add, Edit, TrashCan } from '@carbon/react/icons';
import { Appointment, useAppointments } from '../resources/patient-appointments.resource';
import AppointmentsSummaryTable from './appointments-summary-table.component';
import AppointmentsSummaryCardComponent from './appointments-card.component';
import { useWorkflow } from '../workflow-context';

interface AppointmentsActionMenuProps {
  appointment: Appointment;
  patientUuid?: string;
  mutate: () => void;
}

interface AppointmentsStepRendererProps extends StepComponentProps {
  stepId: string;
}

const AppointmentsStepRenderer: React.FC<AppointmentsStepRendererProps> = ({ patientUuid, onStepComplete, stepId }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const isTablet = layout === 'tablet';
  const isDesktop = layout === 'small-desktop' || layout === 'large-desktop';
  const startDate = dayjs(new Date().toISOString()).subtract(6, 'month').toISOString();
  const { mutate } = useAppointments(patientUuid, startDate, new AbortController());
  const { state, getCurrentStep } = useWorkflow();
  const appointments = useMemo<Appointment[]>(() => state.stepsData[stepId]?.allergies ?? [], [state, stepId]);

  const launchAppointmentsForm = useCallback(
    () =>
      launchPatientWorkspace('appointments-form-workspace', {
        closeWorkspaceWithSavedChanges: (data: any) => {
          closeWorkspace('appointments-form-workspace', {
            ignoreChanges: true,
            onWorkspaceClose: () => {
              mutate();
              onStepComplete(data);
            },
          });
        },
      }),
    [onStepComplete, mutate],
  );

  // if (appointments.length) {
  //   return (
  //     <div>
  //       <Button renderIcon={Add} onClick={() => launchAppointmentsForm()}>
  //         {t('adicionar', 'Adicionar')}
  //       </Button>
  //       {isTablet ? (
  //         <AppointmentsSummaryTable appointments={appointments} patientUuid={patientUuid} mutate={mutate} />
  //       ) : (
  //         <AppointmentsSummaryCardComponent
  //           appointments={appointments}
  //           patientUuid={patientUuid}
  //           isDesktop={isDesktop}
  //           mutate={mutate}
  //         />
  //       )}
  //     </div>
  //   );
  // }

  return (
    <EmptyState
      displayText={t('appointments', 'Appointments')}
      headerTitle={''}
      launchForm={() => launchAppointmentsForm()}
    />
  );
};

export const ApppointmentsActionMenu = ({ appointment, patientUuid, mutate }: AppointmentsActionMenuProps) => {
  const { t } = useTranslation();

  const handleLaunchEditAppointmentForm = () => {
    launchPatientWorkspace('appointments-form-workspace', {
      appointment,
      context: 'editing',
      workspaceTitle: t('editAppointment', 'Edit appointment'),
      closeWorkspace: () => {
        closeWorkspace('appointments-form-workspace', {
          ignoreChanges: true,
          onWorkspaceClose: () => {
            mutate();
          },
        });
      },
    });
  };

  const handleLaunchCancelAppointmentModal = (appointmentUuid: string) => {
    const dispose = showModal('cancel-appointment-modal', {
      closeCancelModal: () => {
        dispose();
        mutate();
      },
      appointmentUuid,
      patientUuid,
    });
  };

  return (
    <div className={styles.buttonWrapper}>
      <IconButton kind="ghost" label={t('edit', 'Editar')} align="left" onClick={handleLaunchEditAppointmentForm}>
        <Edit />
      </IconButton>
      <IconButton
        kind="ghost"
        label={t('cancel', 'Cancelar')}
        align="left"
        disabled={appointment.status === 'Completed'}
        onClick={() => handleLaunchCancelAppointmentModal(appointment.uuid)}>
        <TrashCan />
      </IconButton>
    </div>
  );
};

export default AppointmentsStepRenderer;
