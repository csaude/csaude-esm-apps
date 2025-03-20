import React, { useEffect, useState } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { useTranslation } from 'react-i18next';
import { Button, InlineLoading, Tile } from '@carbon/react';
import { type FormSchema, FormEngine } from '@csaude/esm-form-engine-lib';
import styles from './form-renderer.scss';
import { Schema } from '../../types';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

interface FormRendererProps {
  isLoading: boolean;
  onSchemaChange?: (schema: FormSchema) => void;
  schema: Schema;
}

const FormRenderer: React.FC<FormRendererProps> = ({ isLoading, schema }) => {
  const { t } = useTranslation();

  const dummySchema: Schema = {
    name: 'Test Form',
    steps: [
      {
        id: 'firststep-1',
        title: 'First Page',
        renderType: 'form',
        formId: 'form-1',
        skippable: true,
      },
    ],
  };

  const [schemaToRender, setSchemaToRender] = useState<Schema>(dummySchema);

  useEffect(() => {
    if (schema) {
      setSchemaToRender(schema);
    }
  }, [schema]);

  if (isLoading) {
    return (
      <div className={styles.loadingContainer}>
        <InlineLoading className={styles.loader} description={t('loading', 'Loading') + '...'} />
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {!schema && (
        <Tile className={styles.emptyStateTile}>
          <h4 className={styles.heading}>{t('noSchemaLoaded', 'No schema loaded')}</h4>
          <p className={styles.helperText}>
            {t(
              'formRendererHelperText',
              'Load a form schema in the Schema Editor to the left to see it rendered here by the Workflow Engine.',
            )}
          </p>
        </Tile>
      )}
      {schema === schemaToRender && (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          {/* THIS WILL BE A PROBLEM */}
          {/* NO... */}
          {/* IT'S ALREADY A PROBLEM */}
          {/* <FormEngine formJson={schemaToRender} mode={'enter'} patientUUID={''} /> */}
        </ErrorBoundary>
      )}
    </div>
  );
};

function ErrorFallback({ error, resetErrorBoundary }: ErrorFallbackProps) {
  const { t } = useTranslation();
  return (
    <Tile className={styles.errorStateTile}>
      <h4 className={styles.heading}>{t('problemLoadingPreview', 'There was a problem loading the form preview')}</h4>
      <p className={styles.helperText}>
        <pre>{error.message}</pre>
      </p>
      <Button kind="primary" onClick={resetErrorBoundary}>
        {t('tryAgain', 'Try again')}
      </Button>
    </Tile>
  );
}

export default FormRenderer;
