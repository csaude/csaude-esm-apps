import React, { useCallback, useEffect, useState } from 'react';
import useFormSchema from '../hooks/useFormSchema';
import styles from './form-renderer.scss';
import { InlineLoading, Button } from '@carbon/react';
import FormError from './form-error.component';
import { useTranslation } from 'react-i18next';
import { FormEngine, OpenmrsEncounter } from '@csaude/esm-form-engine-lib';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { closeWorkspace, Encounter } from '@openmrs/esm-framework';
import { StepComponentProps } from '../types';
import { useWorkflow } from '../workflow-context';

interface FormRenderProps extends StepComponentProps {
  formUuid: string;
  stepId: string;
}
const FormStepRenderer: React.FC<FormRenderProps> = ({ formUuid, patientUuid, stepId, onStepDataChange }) => {
  const { schema, error, isLoading } = useFormSchema(formUuid);
  const { getStepsByRenderType, state } = useWorkflow();
  const [existingEncounterUuid, setExistingEncounterUuid] = useState<string>();
  const { t } = useTranslation();
  const [hasOpenedForm, setHasOpenedForm] = useState(false);

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

  const openFormWorkspace = useCallback(
    (encounterUuid?: string) => {
      const formMode = encounterUuid ? 'edit' : 'enter';
      launchPatientWorkspace('patient-form-entry-workspace', {
        workspaceTitle: schema.name,
        mutateForm: () => {},
        patientUuid,
        formInfo: {
          encounterUuid,
          formUuid: schema.name,
          patientUuid,
          visitTypeUuid: '',
          visitUuid: '',
          visitStartDatetime: '',
          visitStopDatetime: '',
          additionalProps: {
            formMode,
            openClinicalFormsWorkspaceOnFormClose: false,
          },
        },
        closeWorkspaceWithSavedChanges: (data) => {
          onStepDataChange({ ...data[0], form: { uuid: formUuid } });
          closeWorkspace('patient-form-entry-workspace', { ignoreChanges: true });
          setExistingEncounterUuid(data.uuid);
        },
      });
    },
    [schema.name, patientUuid, onStepDataChange, formUuid],
  );

  // Update existingEncounterUuid when schema or relevant state changes
  useEffect(() => {
    if (schema && !isLoading) {
      const encounterTypeUuid = schema?.encounterType;
      const firstFormData = getFirstFormData(encounterTypeUuid);
      const stepInitiallyOpen = state.config.steps.find((step) => step.id === stepId)?.initiallyOpen;
      if (firstFormData?.uuid) {
        setExistingEncounterUuid(firstFormData.uuid);
      }
      if (!state.completedSteps.has(stepId) && stepInitiallyOpen && !hasOpenedForm) {
        openFormWorkspace(firstFormData?.uuid);
        setHasOpenedForm(true); // Set to true to prevent multiple openings (infinite re-render loop)
      }
    }
  }, [schema, isLoading, getFirstFormData, state, openFormWorkspace, hasOpenedForm, stepId]);

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
          openFormWorkspace(existingEncounterUuid);
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

export default FormStepRenderer;
