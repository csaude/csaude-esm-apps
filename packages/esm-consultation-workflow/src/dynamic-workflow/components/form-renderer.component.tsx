import React, { useCallback, useEffect, useState } from 'react';
import useFormSchema from '../hooks/useFormSchema';
import styles from './form-renderer.scss';
import { InlineLoading, Button } from '@carbon/react';
import FormError from './form-error.component';
import { useTranslation } from 'react-i18next';
import { FormEngine, OpenmrsEncounter } from '@openmrs/esm-form-engine-lib/src';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { closeWorkspace } from '@openmrs/esm-framework';
import { StepComponentProps, WorkflowState, WorkflowStep } from '../types';
import { useWorkflow } from '../workflow-context';

interface FormRenderProps extends StepComponentProps {
  formUuid: string;
}
const FormRenderer: React.FC<FormRenderProps> = ({ formUuid, patientUuid, encounterUuid, onStepComplete }) => {
  const { schema, error, isLoading } = useFormSchema(formUuid);
  const { getStepsByRenderType, state } = useWorkflow();
  const [existingEncounterUuid, setExistingEncounterUuid] = useState<string>('');
  const { t } = useTranslation();

  const getFirstFormData = useCallback(
    (encounterTypeName: string | OpenmrsEncounter) => {
      const targetName = typeof encounterTypeName === 'string' ? encounterTypeName : '';

      const completedFormSteps = getStepsByRenderType('form').filter((step) => state.completedSteps.has(step.id));
      const stepsData = { ...state.stepsData };

      const matchingSteps = completedFormSteps.filter((step) => {
        const stepData = stepsData[step.id][0];
        return stepData?.encounterType?.name === targetName;
      });

      const matchingStep = matchingSteps[0];
      return matchingStep ? stepsData[matchingStep.id][0] : null;
    },
    [getStepsByRenderType, state],
  );

  // Update existingEncounterUuid when schema or relevant state changes
  useEffect(() => {
    if (schema) {
      const encounterTypeName = schema.encounter;
      const firstFormData = getFirstFormData(encounterTypeName);
      if (firstFormData?.uuid) {
        setExistingEncounterUuid(firstFormData.uuid);
      }
    }
  }, [schema, getFirstFormData]);

  // Force FormEngine to remount when encounterUuid changes
  const formEngineKey = existingEncounterUuid || 'new';

  if (isLoading) {
    return (
      <div className={styles.loaderContainer}>
        <InlineLoading className={styles.loading} description={`${t('loading', 'Loading')} ...`} />
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <FormError closeWorkspace={() => {}} />
      </div>
    );
  }

  return (
    <div>
      <Button
        onClick={(e) => {
          e.preventDefault();
          launchPatientWorkspace('patient-form-entry-workspace', {
            workspaceTitle: schema.name,
            mutateForm: () => {},
            formInfo: {
              encounterUuid,
              formUuid: schema.name,
              patientUuid: patientUuid,
              additionalProps: {
                mode: 'enter',
                openClinicalFormsWorkspaceOnFormClose: false,
              },
            },
            closeWorkspaceWithSavedChanges: (data) => {
              onStepComplete(data);
              closeWorkspace('patient-form-entry-workspace', { ignoreChanges: true });
            },
          });
        }}>
        {'Fill form'}
      </Button>
      <FormEngine
        key={formEngineKey} // Add key to force remount
        formJson={schema}
        patientUUID={patientUuid}
        mode="embedded-view"
        encounterUUID={existingEncounterUuid}
      />
    </div>
  );
};

export default FormRenderer;
