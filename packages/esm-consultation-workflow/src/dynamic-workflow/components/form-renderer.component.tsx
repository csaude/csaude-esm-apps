import React from 'react';
import useFormSchema from '../hooks/useFormSchema';
import styles from './form-renderer.scss';
import { InlineLoading, Button } from '@carbon/react';
import FormError from './form-error.component';
import { useTranslation } from 'react-i18next';
import { FormEngine } from '@openmrs/esm-form-engine-lib/src';
import {
  clinicalFormsWorkspace,
  formEntryWorkspace,
  htmlFormEntryWorkspace,
  launchPatientWorkspace,
  useLaunchWorkspaceRequiringVisit,
} from '@openmrs/esm-patient-common-lib';
import { closeWorkspace } from '@openmrs/esm-framework';
import { StepComponentProps } from '../types';

interface FormRenderProps extends StepComponentProps {
  formUuid: string;
}
const FormRenderer: React.FC<FormRenderProps> = ({ formUuid, patientUuid, encounterUuid, step, onStepComplete }) => {
  const { schema, error, isLoading } = useFormSchema(formUuid);
  const { t } = useTranslation();

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
              console.log('close workspace with saved changes Eudson', data);
              onStepComplete(data);
              closeWorkspace('patient-form-entry-workspace', { ignoreChanges: true });
            },
          });
        }}>
        {'Fill form'}
      </Button>
      <FormEngine formJson={schema} patientUUID={patientUuid} mode="embedded-view" />
    </div>
  );
};

export default FormRenderer;
