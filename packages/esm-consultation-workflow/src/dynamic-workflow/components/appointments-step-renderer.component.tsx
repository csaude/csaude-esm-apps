import { Button, IconButton } from '@carbon/react';
import { Add, Edit, TrashCan } from '@carbon/react/icons';
import { closeWorkspace, showModal, useLayoutType } from '@openmrs/esm-framework';
import { EmptyState, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Appointment } from '../resources/patient-appointments.resource';
import { StepComponentProps } from '../types';
import { useWorkflow } from '../workflow-context';
import AppointmentsSummaryCardComponent from './appointments-card.component';
import AppointmentsSummaryTable from './appointments-summary-table.component';
import styles from './components.scss';

interface AppointmentsActionMenuProps {
  appointment: Appointment;
  onEdit: (appointment: Appointment) => void;
  onDelete: (appointmentId: string) => void;
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
  const [hasOpenedForm, setHasOpenedForm] = useState(false);

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

  const handleEdit = (appointment: Appointment) => {
    const index = appointments.findIndex((a) => a.uuid === appointment.uuid);
    if (index > -1) {
      appointments.splice(index, 1, appointment);
    }
    onStepDataChange(appointments);
  };

  const handleDelete = (appointmentId: string) => {
    const updatedAppointments = appointments.filter((appointment) => appointment.uuid !== appointmentId);
    onStepDataChange(updatedAppointments);
  };

  useEffect(() => {
    const stepInitiallyOpen = state.config.steps.find((step) => step.id === stepId)?.initiallyOpen;
    if (appointments.length < 1 && stepInitiallyOpen && !hasOpenedForm) {
      launchAppointmentsForm();
      setHasOpenedForm(true); // Set to true to prevent multiple openings (infinite re-render loop)
    }
  }, [state, stepId, hasOpenedForm, launchAppointmentsForm, appointments]);

  if (appointments.length) {
    return (
      <div>
        <Button renderIcon={Add} onClick={() => launchAppointmentsForm()}>
          {t('adicionar', 'Adicionar')}
        </Button>
        {isTablet ? (
          <AppointmentsSummaryTable
            appointments={appointments}
            isTablet={isTablet}
            patientUuid={patientUuid}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        ) : (
          <AppointmentsSummaryCardComponent
            appointments={appointments}
            patientUuid={patientUuid}
            isDesktop={isDesktop}
            onEdit={handleEdit}
            onDelete={handleDelete}
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

export const ApppointmentsActionMenu = ({
  appointment,
  patientUuid,
  onEdit,
  onDelete,
}: AppointmentsActionMenuProps) => {
  const { t } = useTranslation();

  const handleLaunchEditAppointmentForm = (appointment: Appointment) => {
    launchPatientWorkspace('appointments-form-workspace', {
      appointment,
      context: 'editing',
      workspaceTitle: t('editAppointment', 'Edit appointment'),
      closeWorkspaceWithSavedChanges: (appointment: Appointment) => {
        closeWorkspace('conditions-form-workspace', {
          ignoreChanges: true,
          onWorkspaceClose: () => {
            onEdit(appointment);
          },
        });
      },
    });
  };

  const handleLaunchCancelAppointmentModal = (appointmentUuid: string) => {
    const dispose = showModal('cancel-appointment-modal', {
      closeCancelModal: () => {
        onDelete(appointmentUuid);
        dispose();
      },
      appointmentUuid,
      patientUuid,
    });
  };

  return (
    <div className={styles.buttonWrapper}>
      <IconButton
        kind="ghost"
        label={t('edit', 'Editar')}
        align="left"
        onClick={() => {
          handleLaunchEditAppointmentForm(appointment);
        }}>
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
