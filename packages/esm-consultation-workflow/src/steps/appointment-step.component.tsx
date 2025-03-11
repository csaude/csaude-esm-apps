import { InlineLoading } from '@carbon/react';
import { closeWorkspace, ErrorState } from '@openmrs/esm-framework';
import { EmptyState, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import React from 'react';
import { useTranslation } from 'react-i18next';

function useAppointments(patientUuid: string) {
  return {
    isLoading: false,
    error: null,
    appointments: [],
    mutate: () => {},
  };
}

function launchAppointmentsWorkspace({ onAppointmentSave }: { onAppointmentSave: () => void }): void {
  const name = 'appointments-form-workspace';
  launchPatientWorkspace(name, {
    closeWorkspaceWithSavedChanges: () => {
      closeWorkspace(name, { ignoreChanges: true, onWorkspaceClose: onAppointmentSave });
    },
  });
}

const AppointmentStep: React.FC<{ patientUuid: string }> = ({ patientUuid }) => {
  const { t } = useTranslation();
  const { isLoading, error, appointments, mutate } = useAppointments(patientUuid);

  if (isLoading) {
    return <InlineLoading />;
  }

  if (error) {
    return <ErrorState error={error} headerTitle="Erro!" />;
  }

  if (!appointments.length) {
    return (
      <EmptyState
        displayText={t('appointments', 'Agendamentos')}
        headerTitle={t('appointments', 'Agendamentos')}
        launchForm={() => launchAppointmentsWorkspace({ onAppointmentSave: mutate })}
      />
    );
  }
  return <h1>Agendamento próxima consulta + referencias</h1>;
};

export default AppointmentStep;
