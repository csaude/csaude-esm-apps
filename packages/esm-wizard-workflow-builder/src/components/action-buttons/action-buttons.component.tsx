import React, { useCallback, useState } from 'react';
import { Button, InlineLoading } from '@carbon/react';
import { useParams } from 'react-router-dom';
import { showModal, showSnackbar, useConfig } from '@openmrs/esm-framework';
import SaveWorkflowModal from '../interactive-builder/modals/save-workflow/save-workflow.modal';
import { handleFormValidation } from '../../resources/form-validator.resource';
// import { publishForm, unpublishForm } from '../../resources/forms.resource';
// import { useForm } from '../../hooks/useForm';
import type { IMarker } from 'react-ace';
import type { TFunction } from 'react-i18next';
import type { ConfigObject } from '../../config-schema';
import type { Schema } from '../../types';
import styles from './action-buttons.scss';
import { useConsultationWorkflow } from '../../hooks/useConsultationWorkflow';
import {
  publishConsultationWorkflow,
  unpublishConsultationWorkflow,
} from '../../resources/consultation-workflow.resource';

interface ActionButtonsProps {
  isValidating: boolean;
  onFormValidation: () => Promise<void>;
  schema: Schema;
  schemaErrors: Array<MarkerProps>;
  setPublishedWithErrors: (status: boolean) => void;
  setValidationComplete: (validationStatus: boolean) => void;
  setValidationResponse: (errors: Array<unknown>) => void;
  t: TFunction;
}

interface MarkerProps extends IMarker {
  text: string;
}

type Status =
  | 'error'
  | 'idle'
  | 'published'
  | 'publishing'
  | 'unpublished'
  | 'unpublishing'
  | 'validateBeforePublishing'
  | 'validated';

function ActionButtons({
  isValidating,
  onFormValidation,
  schema,
  schemaErrors,
  setPublishedWithErrors,
  setValidationComplete,
  setValidationResponse,
  t,
}: ActionButtonsProps) {
  const { formUuid } = useParams<{ formUuid?: string }>();
  const { consultationWorkflow, mutate } = useConsultationWorkflow(formUuid);
  const [status, setStatus] = useState<Status>('idle');
  const { dataTypeToRenderingMap, enableFormValidation } = useConfig<ConfigObject>();

  async function handlePublish() {
    try {
      setStatus('publishing');
      await publishConsultationWorkflow(consultationWorkflow.uuid);
      showSnackbar({
        title: t('consultationWorkflowPublished', 'Consultation workflow published'),
        kind: 'success',
        isLowContrast: true,
        subtitle:
          `${consultationWorkflow.name} ` +
          t('consultationWorkflowPublishedSuccessfully', 'Consultation workflow was published successfully'),
      });

      setStatus('published');
      await mutate();
    } catch (error) {
      if (error instanceof Error) {
        showSnackbar({
          title: t('errorPublishingConsultationWorkflow', 'Error publishing consultation workflow'),
          kind: 'error',
          subtitle: error?.message,
        });
        setStatus('error');
      }
    }
  }

  async function handleValidateAndPublish() {
    setStatus('validateBeforePublishing');
    const [errorsArray] = await handleFormValidation(schema, dataTypeToRenderingMap);
    setValidationResponse(errorsArray);
    if (errorsArray.length) {
      setStatus('validated');
      setValidationComplete(true);
      setPublishedWithErrors(true);
      return;
    }
    await handlePublish();
  }

  const handleUnpublish = useCallback(async () => {
    setStatus('unpublishing');

    try {
      await unpublishConsultationWorkflow(consultationWorkflow.uuid);
      setStatus('unpublished');

      showSnackbar({
        title: t('consultationWorkflowUnpublished', 'Consultation workflow unpublished'),
        kind: 'success',
        isLowContrast: true,
        subtitle:
          `${consultationWorkflow.name} ` +
          t('consultationWorkflowUnpublishedSuccessfully', 'Consultation Workflow was unpublished successfully'),
      });

      await mutate();
    } catch (error) {
      if (error instanceof Error) {
        showSnackbar({
          title: t('errorUnpublishingConsultationWorkflow', 'Error unpublishing consultation workflow'),
          kind: 'error',
          subtitle: error?.message,
        });
        setStatus('error');
      }
    }
  }, [consultationWorkflow?.name, consultationWorkflow?.uuid, mutate, t]);

  const launchUnpublishModal = useCallback(() => {
    const dispose = showModal('unpublish-workflow-modal', {
      closeModal: () => dispose(),
      onUnpublishWorkflow: handleUnpublish,
    });
  }, [handleUnpublish]);

  return (
    <div className={styles.actionButtons}>
      <SaveWorkflowModal consultationWorkflow={consultationWorkflow} schema={schema} />

      <>
        {consultationWorkflow && enableFormValidation && (
          <Button kind="tertiary" onClick={onFormValidation} disabled={isValidating}>
            {isValidating ? (
              <InlineLoading className={styles.spinner} description={t('validating', 'Validating') + '...'} />
            ) : (
              <span>{t('validateWorkflow', 'Validate workflow')}</span>
            )}
          </Button>
        )}
        {consultationWorkflow && !consultationWorkflow.published ? (
          enableFormValidation ? (
            <Button
              kind="secondary"
              onClick={handleValidateAndPublish}
              disabled={status === 'validateBeforePublishing' || schemaErrors.length > 0}>
              {status === 'validateBeforePublishing' ? (
                <InlineLoading className={styles.spinner} description={t('validating', 'Validating') + '...'} />
              ) : (
                <span>{t('validateAndPublishWorkflow', 'Validate and publish workflow')}</span>
              )}
            </Button>
          ) : (
            <Button
              kind="secondary"
              onClick={handlePublish}
              disabled={status === 'publishing' || schemaErrors.length > 0}>
              {status === 'publishing' && !consultationWorkflow?.published ? (
                <InlineLoading className={styles.spinner} description={t('publishing', 'Publishing') + '...'} />
              ) : (
                <span>{t('publishWorkflow', 'Publish workflow')}</span>
              )}
            </Button>
          )
        ) : null}

        {consultationWorkflow && consultationWorkflow.published ? (
          <Button kind="danger" onClick={launchUnpublishModal} disabled={status === 'unpublishing'}>
            {t('unpublishWorkflow', 'Unpublish workflow')}
          </Button>
        ) : null}
      </>
    </div>
  );
}

export default ActionButtons;
