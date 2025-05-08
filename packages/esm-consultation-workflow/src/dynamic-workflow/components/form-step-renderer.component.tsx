import React, { forwardRef, useCallback, useEffect, useImperativeHandle, useState } from 'react';
import useFormSchema from '../hooks/useFormSchema';
import styles from './form-renderer.scss';
import { InlineLoading, Button } from '@carbon/react';
import FormError from './form-error.component';
import { useTranslation } from 'react-i18next';
import { FormEngine } from '@csaude/esm-form-engine-lib';
import { launchPatientWorkspace } from '@openmrs/esm-patient-common-lib';
import { closeWorkspace, Encounter } from '@openmrs/esm-framework';
import { StepComponentProps } from '../types';
import { StepComponentHandle } from '../step-registry';

interface FormRenderProps extends StepComponentProps {
  encounter?: Encounter;
  initiallyOpen: boolean;
  formUuid: string;
}
const FormStepRenderer = forwardRef<StepComponentHandle, FormRenderProps>(
  ({ formUuid, patientUuid, encounter, initiallyOpen }, ref) => {
    const { schema, error, isLoading } = useFormSchema(formUuid);
    const [existingEncounter, setExistingEncounter] = useState(encounter);
    const { t } = useTranslation();
    const [hasOpenedForm, setHasOpenedForm] = useState(encounter ? true : false);
    const [remountOnCloseWorkspace, setRemountOnCloseWorkspace] = useState(0);

    useImperativeHandle(
      ref,
      () => ({
        onStepComplete() {
          return existingEncounter;
        },
      }),
      [existingEncounter],
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
            closeWorkspace('patient-form-entry-workspace', { ignoreChanges: true });
            setExistingEncounter(data[0]);
            setRemountOnCloseWorkspace((prev) => prev + 1); // Increment to force remount
          },
        });
      },
      [schema, patientUuid],
    );

    // Update existingEncounterUuid when schema or relevant state changes
    useEffect(() => {
      if (schema && !isLoading && initiallyOpen && !hasOpenedForm) {
        openFormWorkspace(existingEncounter?.uuid);
        setHasOpenedForm(true); // Set to true to prevent multiple openings (infinite re-render loop)
      }
    }, [existingEncounter, schema, isLoading, openFormWorkspace, hasOpenedForm, initiallyOpen]);

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
            openFormWorkspace(existingEncounter?.uuid);
          }}>
          {t('fillForm', 'Preencher formulário')}
        </Button>

        <FormEngine
          key={remountOnCloseWorkspace} // Add key to force remount
          formJson={schema}
          patientUUID={patientUuid}
          mode="embedded-view"
          encounterUUID={existingEncounter?.uuid}
        />
      </div>
    );
  },
);

export default FormStepRenderer;
