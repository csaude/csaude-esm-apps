import React, { useCallback, useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { closeWorkspace, useLayoutType, showModal } from '@openmrs/esm-framework';
import { EmptyState, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { StepComponentProps } from '../types';
import { useTranslation } from 'react-i18next';
import styles from './components.scss';
import { IconButton, Button } from '@carbon/react';
import { Add, Edit, TrashCan } from '@carbon/react/icons';
import { Appointment } from '../resources/patient-appointments.resource';
import AppointmentsSummaryTable from './appointments-summary-table.component';
import AppointmentsSummaryCardComponent from './appointments-card.component';
import { useWorkflow } from '../workflow-context';

interface AppointmentsActionMenuProps {
  appointment: Appointment;
  patientUuid?: string;
}

interface AppointmentsStepRendererProps extends StepComponentProps {
  stepId: string;
}

const AppointmentsStepRenderer: React.FC<AppointmentsStepRendererProps> = ({
  patientUuid,
  stepId,
  onStepComplete,
  onStepDataChange,
}) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const isTablet = layout === 'tablet';
  const isDesktop = layout === 'small-desktop' || layout === 'large-desktop';
  const { state } = useWorkflow();
  const appointments = useMemo<Appointment[]>(() => state.stepsData[stepId]?.appointments ?? [], [state, stepId]);

  const launchAppointmentsForm = useCallback(
    () =>
      launchPatientWorkspace('appointments-form-workspace', {
        closeWorkspaceWithSavedChanges: (data: any) => {
          closeWorkspace('appointments-form-workspace', {
            ignoreChanges: true,
            onWorkspaceClose: () => {
              appointments.push(data);
              onStepDataChange(appointments);
            },
          });
        },
      }),
    [onStepDataChange, appointments],
  );

  if (appointments.length) {
    return (
      <div>
        <Button renderIcon={Add} onClick={() => launchAppointmentsForm()}>
          {t('adicionar', 'Adicionar')}
        </Button>
        {isTablet ? (
          <AppointmentsSummaryTable appointments={appointments} isTablet={isTablet} patientUuid={patientUuid} />
        ) : (
          <AppointmentsSummaryCardComponent
            appointments={appointments}
            patientUuid={patientUuid}
            isDesktop={isDesktop}
          />
        )}
      </div>
    );
  }

  return (
    <EmptyState
      displayText={t('appointments', 'Appointments')}
      headerTitle={''}
      launchForm={() => launchAppointmentsForm()}
    />
  );
};

export const ApppointmentsActionMenu = ({ appointment, patientUuid }: AppointmentsActionMenuProps) => {
  const { t } = useTranslation();

  const handleLaunchEditAppointmentForm = () => {
    launchPatientWorkspace('appointments-form-workspace', {
      appointment,
      context: 'editing',
      workspaceTitle: t('editAppointment', 'Edit appointment'),
      closeWorkspace: () => {
        closeWorkspace('appointments-form-workspace', {
          ignoreChanges: true,
        });
      },
    });
  };

  const handleLaunchCancelAppointmentModal = (appointmentUuid: string) => {
    const dispose = showModal('cancel-appointment-modal', {
      closeCancelModal: () => {
        dispose();
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
