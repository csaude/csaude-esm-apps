import React, { useCallback, useEffect, useState } from 'react';
import useFormSchema from '../hooks/useFormSchema';
import styles from './form-renderer.scss';
import { InlineLoading, Button } from '@carbon/react';
import FormError from './form-error.component';
import { useTranslation } from 'react-i18next';
import { FormEngine, OpenmrsEncounter } from '@csaude/esm-form-engine-lib';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { closeWorkspace } from '@openmrs/esm-framework';
import { StepComponentProps, WorkflowState, WorkflowStep } from '../types';
import { useWorkflow } from '../workflow-context';
import { set } from 'react-hook-form';

interface FormRenderProps extends StepComponentProps {
  formUuid: string;
}
const FormRenderer: React.FC<FormRenderProps> = ({ formUuid, patientUuid, encounterUuid, onStepComplete }) => {
  const { schema, error, isLoading } = useFormSchema(formUuid);
  const { getStepsByRenderType, state } = useWorkflow();
  const [existingEncounterUuid, setExistingEncounterUuid] = useState<string>('');
  const { t } = useTranslation();

  const getFirstFormData = useCallback(
    (encounterTypeUuid: string | OpenmrsEncounter) => {
      const targetUuid = typeof encounterTypeUuid === 'string' ? encounterTypeUuid : '';

      const completedFormSteps = getStepsByRenderType('form').filter((step) => state.completedSteps.has(step.id));
      const stepsData = { ...state.stepsData };

      const matchingSteps = completedFormSteps.filter((step) => {
        const stepData = stepsData[step.id][0];
        return stepData?.encounterType?.uuid === targetUuid;
      });

      const matchingStep = matchingSteps[0];
      return matchingStep ? stepsData[matchingStep.id][0] : null;
    },
    [getStepsByRenderType, state],
  );

  // Update existingEncounterUuid when schema or relevant state changes
  useEffect(() => {
    if (schema && !isLoading) {
      const encounterTypeUuid = schema?.encounterType;
      const firstFormData = getFirstFormData(encounterTypeUuid);
      if (firstFormData?.uuid) {
        setExistingEncounterUuid(firstFormData.uuid);
      }
    }
  }, [schema, getFirstFormData, isLoading]);

  // Force FormEngine to remount when encounterUuid changes
  const formEngineKey = existingEncounterUuid || 'new';

  if (isLoading) {
    return (
      <div className={styles.loaderContainer}>
        <InlineLoading
          className={styles.loading}
          data-testid="inline-loading"
          description={`${t('loading', 'A carregar')} ...`}
        />
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
          const formMode = existingEncounterUuid ? 'edit' : 'enter';
          launchPatientWorkspace('patient-form-entry-workspace', {
            workspaceTitle: schema.name,
            mutateForm: () => {},
            patientUuid,
            formInfo: {
              encounterUuid: existingEncounterUuid,
              formUuid: schema.name,
              patientUuid: patientUuid,
              visitTypeUuid: '',
              visitUuid: '',
              visitStartDatetime: '',
              visitStopDatetime: '',
              additionalProps: {
                mode: formMode,
                openClinicalFormsWorkspaceOnFormClose: false,
              },
            },
            closeWorkspaceWithSavedChanges: (data) => {
              // TODO handle more than one encounter
              onStepComplete(data[0]);
              closeWorkspace('patient-form-entry-workspace', { ignoreChanges: true });
              setExistingEncounterUuid(data[0].uuid);
            },
          });
        }}>
        {t('fillForm', 'Preencher formulário')}
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
