import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './step-display.scss';
import useFormSchema from '../../../dynamic-workflow/hooks/useFormSchema';
import { FormEngine } from '@csaude/esm-form-engine-lib';
import { InlineLoading } from '@carbon/react';

interface FormStepDisplayProps {
  step: {
    stepId: string;
    stepName: string;
    renderType: string;
    completed: boolean;
    dataReference: { encounter: { uuid: string }; form: { uuid: string } };
    formUuid: string;
    patientUuid: string;
  };
}

const FormStepDisplay: React.FC<FormStepDisplayProps> = ({ step }) => {
  const { t } = useTranslation();

  const [isStepDisplayLoading, setIsStepDisplayLoading] = useState(true);
  const [stepDisplayError, setStepDisplayError] = useState<Error | null>(null);
  const { schema, error, isLoading } = useFormSchema(step.dataReference.form.uuid);

  if (isLoading) {
    return (
      <div className={styles.loaderContainer}>
        <InlineLoading className={styles.loading} data-testid="inline-loading" description={t('loading')} />
      </div>
    );
  }
  if (error) {
    return (
      <div className={styles.errorContainer}>
        <p className={styles.errorMessage}>{t('errorLoadingForm', { error: error.message })}</p>
      </div>
    );
  }

  return (
    <FormEngine
      key={step.dataReference.encounter.uuid}
      formJson={schema}
      patientUUID={step.patientUuid}
      mode="embedded-view"
      encounterUUID={step.dataReference.encounter.uuid}
    />
  );
};
export default FormStepDisplay;
