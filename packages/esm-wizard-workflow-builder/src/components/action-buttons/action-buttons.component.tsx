import React, { useCallback, useState } from 'react';
import { Button, InlineLoading } from '@carbon/react';
import { useParams } from 'react-router-dom';
import { showModal, showSnackbar } from '@openmrs/esm-framework';
import SaveWorkflowModal from '../interactive-builder/modals/save-workflow/save-workflow.modal';
import type { IMarker } from 'react-ace';
import type { TFunction } from 'react-i18next';
import type { Criteria, Schema } from '../../types';
import styles from './action-buttons.scss';
import { useConsultationWorkflow } from '../../hooks/useConsultationWorkflow';
import {
  publishConsultationWorkflow,
  unpublishConsultationWorkflow,
} from '../../resources/consultation-workflow.resource';

interface ActionButtonsProps {
  schema: Schema;
  schemaErrors: Array<MarkerProps>;
  t: TFunction;
  criteria: Criteria[];
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

function ActionButtons({ schema, schemaErrors, t, criteria }: ActionButtonsProps) {
  const { formUuid } = useParams<{ formUuid?: string }>();
  const { consultationWorkflow, mutate } = useConsultationWorkflow(formUuid);
  const [status, setStatus] = useState<Status>('idle');

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
      <SaveWorkflowModal consultationWorkflow={consultationWorkflow} schema={schema} criteria={criteria} />

      <>
        {consultationWorkflow && !consultationWorkflow.published ? (
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
