import { Button, IconButton } from '@carbon/react';
import { Add, Edit, TrashCan } from '@carbon/react/icons';
import { closeWorkspace, showModal, useLayoutType } from '@openmrs/esm-framework';
import { EmptyState, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import React, { useCallback, useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { useTranslation } from 'react-i18next';
import { Appointment } from '../resources/patient-appointments.resource';
import { StepComponentProps } from '../types';
import AppointmentsSummaryCardComponent from './appointments-card.component';
import AppointmentsSummaryTable from './appointments-summary-table.component';
import styles from './components.scss';
import { StepComponentHandle } from '../step-registry';

interface AppointmentsActionMenuProps {
  appointment: Appointment;
  onEdit: (appointment: Appointment) => void;
  onDelete: (appointmentId: string) => void;
  patientUuid?: string;
}

interface AppointmentsStepRendererProps extends StepComponentProps {
  appointments: Appointment[];
  initiallyOpen: boolean;
}

const AppointmentsStepRenderer = forwardRef<StepComponentHandle, AppointmentsStepRendererProps>(
  ({ appointments, patientUuid, initiallyOpen }, ref) => {
    const { t } = useTranslation();
    const layout = useLayoutType();
    const isTablet = layout === 'tablet';
    const isDesktop = layout === 'small-desktop' || layout === 'large-desktop';
    const [currentAppointments, setCurrentAppointments] = useState(appointments ?? []);
    const [hasOpenedForm, setHasOpenedForm] = useState(false);

    useImperativeHandle(
      ref,
      () => ({
        onStepComplete() {
          return currentAppointments;
        },
      }),
      [currentAppointments],
    );

    const launchAppointmentsForm = useCallback(
      () =>
        launchPatientWorkspace('appointments-form-workspace', {
          closeWorkspaceWithSavedChanges: (data: Appointment) => {
            closeWorkspace('appointments-form-workspace', {
              ignoreChanges: true,
              onWorkspaceClose: () => {
                setCurrentAppointments((prev) => [...prev, data]);
              },
            });
          },
        }),
      [],
    );

    const handleEdit = (appointment: Appointment) => {
      const index = currentAppointments.findIndex((a) => a.uuid === appointment.uuid);
      if (index > -1) {
        currentAppointments.splice(index, 1, appointment);
      }
      setCurrentAppointments(currentAppointments);
    };

    const handleDelete = (appointmentId: string) => {
      const updatedAppointments = currentAppointments.filter((appointment) => appointment.uuid !== appointmentId);
      setCurrentAppointments(updatedAppointments);
    };

    useEffect(() => {
      if (currentAppointments.length < 1 && initiallyOpen && !hasOpenedForm) {
        launchAppointmentsForm();
        setHasOpenedForm(true); // Set to true to prevent multiple openings (infinite re-render loop)
      }
    }, [currentAppointments, hasOpenedForm, launchAppointmentsForm, initiallyOpen]);

    if (currentAppointments.length > 0) {
      return (
        <div>
          <Button renderIcon={Add} onClick={() => launchAppointmentsForm()}>
            {t('adicionar', 'Adicionar')}
          </Button>
          {isTablet ? (
            <AppointmentsSummaryTable
              appointments={currentAppointments}
              isTablet={isTablet}
              patientUuid={patientUuid}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ) : (
            <AppointmentsSummaryCardComponent
              appointments={currentAppointments}
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
  },
);

export const ApppointmentsActionMenu = ({
  appointment,
  patientUuid,
  onEdit,
  onDelete,
}: AppointmentsActionMenuProps) => {
  const { t } = useTranslation();

  const handleLaunchEditAppointmentForm = useCallback(
    () =>
      launchPatientWorkspace('appointments-form-workspace', {
        workspaceTitle: t('editAppointment', 'Edit appointment'),
        appointment,
        context: 'editing',
        closeWorkspaceWithSavedChanges: (data: Appointment) => {
          closeWorkspace('appointments-form-workspace', {
            ignoreChanges: true,
            onWorkspaceClose: () => {
              onEdit(data);
            },
          });
        },
      }),
    [t, appointment, onEdit],
  );

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
