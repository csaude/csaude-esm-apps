import React, { useCallback, useState } from 'react';
import dayjs from 'dayjs';
import { closeWorkspace, useLayoutType, showModal } from '@openmrs/esm-framework';
import { EmptyState, launchPatientWorkspace, ErrorState, EmptyDataIllustration } from '@openmrs/esm-patient-common-lib';
import { StepComponentProps } from '../types';
import { useTranslation } from 'react-i18next';
import styles from './components.scss';
import { Button, DataTableSkeleton, IconButton, ContentSwitcher, Switch, Layer, Tile } from '@carbon/react';
import { Add, Edit, TrashCan } from '@carbon/react/icons';
import { Appointment, useAppointments } from '../resources/patient-appointments.resource';
import AppointmentsSummaryTable from './appointments-summary-table.component';
import AppointmentsSummaryCardComponent from './appointments-card.component';

interface AppointmentsActionMenuProps {
  appointment: Appointment;
  patientUuid?: string;
  mutate: () => void;
}

enum AppointmentTypes {
  UPCOMING = 0,
  TODAY = 1,
  PAST = 2,
}

const AppointmentsStepRenderer: React.FC<StepComponentProps> = ({ patientUuid, onStepComplete }) => {
  const { t } = useTranslation();
  const layout = useLayoutType();
  const isTablet = layout === 'tablet';
  const isDesktop = layout === 'small-desktop' || layout === 'large-desktop';
  const startDate = dayjs(new Date().toISOString()).subtract(6, 'month').toISOString();
  const [switchedView, setSwitchedView] = useState(false);
  const [contentSwitcherValue, setContentSwitcherValue] = useState(0);
  const { appointments, error, isLoading, mutate } = useAppointments(patientUuid, startDate, new AbortController());

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

  if (isLoading) {
    return <DataTableSkeleton role="progressbar" compact={isDesktop} zebra />;
  }
  if (error) {
    return <ErrorState error={error} headerTitle={t('appointments', 'Appointments')} />;
  }

  if (appointments) {
    return (
      <div>
        <Button renderIcon={Add} onClick={() => launchAppointmentsForm()}>
          {t('adicionar', 'Adicionar')}
        </Button>
        <div className={styles.appointmentsContainer}>
          <div className={styles.contentSwitcher}>
            <ContentSwitcher
              size={isTablet ? 'md' : 'sm'}
              onChange={({ index }) => {
                setContentSwitcherValue(index);
                setSwitchedView(true);
              }}>
              <Switch name={'upcoming'} text={t('upcoming', 'Upcoming')} />
              <Switch name={'today'} text={t('today', 'Today')} />
              <Switch name={'past'} text={t('past', 'Past')} />
            </ContentSwitcher>
          </div>
          {(() => {
            if (contentSwitcherValue === AppointmentTypes.UPCOMING) {
              if (appointments.upcomingAppointments?.length) {
                if (isTablet) {
                  return (
                    <AppointmentsSummaryTable
                      appointments={appointments?.upcomingAppointments}
                      switchedView={switchedView}
                      setSwitchedView={setSwitchedView}
                      patientUuid={patientUuid}
                      mutate={mutate}
                    />
                  );
                }
                return (
                  <AppointmentsSummaryCardComponent
                    appointments={appointments?.upcomingAppointments}
                    patientUuid={patientUuid}
                    isDesktop={isDesktop}
                    mutate={mutate}
                  />
                );
              }
              return (
                <Layer>
                  <Tile className={styles.tile}>
                    <EmptyDataIllustration />
                    <p className={styles.content}>
                      {t(
                        'noUpcomingAppointmentsForPatient',
                        'There are no upcoming appointments to display for this patient',
                      )}
                    </p>
                  </Tile>
                </Layer>
              );
            }
            if (contentSwitcherValue === AppointmentTypes.TODAY) {
              if (appointments.todaysAppointments?.length) {
                if (isTablet) {
                  return (
                    <AppointmentsSummaryTable
                      appointments={appointments?.todaysAppointments}
                      switchedView={switchedView}
                      setSwitchedView={setSwitchedView}
                      patientUuid={patientUuid}
                      mutate={mutate}
                    />
                  );
                }
                return (
                  <AppointmentsSummaryCardComponent
                    appointments={appointments?.todaysAppointments}
                    patientUuid={patientUuid}
                    isDesktop={isDesktop}
                    mutate={mutate}
                  />
                );
              }
              return (
                <Layer>
                  <Tile className={styles.tile}>
                    <EmptyDataIllustration />
                    <p className={styles.content}>
                      {t(
                        'noCurrentAppointments',
                        'There are no appointments scheduled for today to display for this patient',
                      )}
                    </p>
                  </Tile>
                </Layer>
              );
            }

            if (contentSwitcherValue === AppointmentTypes.PAST) {
              if (appointments.pastAppointments?.length) {
                if (isTablet) {
                  return (
                    <AppointmentsSummaryTable
                      appointments={appointments?.pastAppointments}
                      switchedView={switchedView}
                      setSwitchedView={setSwitchedView}
                      patientUuid={patientUuid}
                      mutate={mutate}
                    />
                  );
                }
                return (
                  <AppointmentsSummaryCardComponent
                    appointments={appointments?.pastAppointments}
                    patientUuid={patientUuid}
                    isDesktop={isDesktop}
                    mutate={mutate}
                  />
                );
              }
              return (
                <Layer>
                  <Tile className={styles.tile}>
                    <EmptyDataIllustration />
                    <p className={styles.content}>
                      {t('noPastAppointments', 'There are no past appointments to display for this patient')}
                    </p>
                  </Tile>
                </Layer>
              );
            }
          })()}
        </div>
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
