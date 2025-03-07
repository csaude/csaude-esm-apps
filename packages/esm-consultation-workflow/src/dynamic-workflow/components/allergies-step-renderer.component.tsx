import { EmptyState, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib/src';
import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { StepComponentProps } from '../types';

const AllergiesStepRenderer: React.FC<StepComponentProps> = ({ patientUuid, onStepComplete }) => {
  const { t } = useTranslation();

  const launchAllergiesForm = useCallback(
    () =>
      launchPatientWorkspace('patient-allergy-form-workspace', {
        closeWorkspaceWithSavedChanges: (data: any) => {
          onStepComplete(data);
        },
      }),
    [onStepComplete],
  );

  return (
    <EmptyState displayText={t('allergies', 'Allergies')} headerTitle={''} launchForm={() => launchAllergiesForm()} />
  );
};

export default AllergiesStepRenderer;
