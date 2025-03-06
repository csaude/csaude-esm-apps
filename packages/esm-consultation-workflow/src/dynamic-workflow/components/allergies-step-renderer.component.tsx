import React, { useCallback } from 'react';
import { StepComponentProps } from '../types';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib/src';
import { Button } from '@carbon/react';

const AllergiesStepRenderer: React.FC<StepComponentProps> = ({ patientUuid, onStepComplete }) => {
  const handleRecordAllergyClick = () => {};

  const launchAllergiesForm = useCallback(
    () =>
      launchPatientWorkspace('patient-allergy-form-workspace', {
        closeWorkspaceWithSavedChanges: (data: any) => {
          console.log('AllergiesDetailedSummarycloseWorkspaceWithSavedChanges', data);
        },
      }),
    [],
  );

  return <Button onClick={launchAllergiesForm}>{'Record Allergy'}</Button>;
};

export default AllergiesStepRenderer;
