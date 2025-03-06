import { Button } from '@carbon/react';
import { closeWorkspace } from '@openmrs/esm-framework';
import { EmptyState, launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import React, { useCallback } from 'react';
import { type StepComponentProps } from '../types';

const ConditionsStepRenderer: React.FC<StepComponentProps> = ({ patientUuid, onStepComplete }) => {
  const launchAllergiesForm = useCallback(
    () =>
      launchPatientWorkspace('conditions-form-workspace', {
        closeWorkspaceWithSavedChanges: (data: any) => {
          closeWorkspace('conditions-form-workspace', {
            ignoreChanges: true,
            onWorkspaceClose: () => onStepComplete(data),
          });
        },
      }),
    [onStepComplete],
  );

  return <EmptyState displayText={'Condições médicas'} headerTitle={''} launchForm={() => launchAllergiesForm()} />;
};

export default ConditionsStepRenderer;
