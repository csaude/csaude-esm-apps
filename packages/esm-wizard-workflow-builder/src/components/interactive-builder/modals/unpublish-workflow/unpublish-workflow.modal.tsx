import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalBody, ModalHeader, ModalFooter } from '@carbon/react';
import styles from '../modals.scss';

interface UnpublishModalProps {
  closeModal: () => void;
  onUnpublishWorkflow: () => void;
}

const UnpublishWorkflowModal: React.FC<UnpublishModalProps> = ({ closeModal, onUnpublishWorkflow }) => {
  const { t } = useTranslation();

  return (
    <>
      <ModalHeader
        className={styles.modalHeader}
        closeModal={closeModal}
        title={t('unpublishConfirmation', 'Are you sure you want to unpublish this workflow?')}
      />
      <ModalBody>
        <p>
          {t(
            'unpublishExplainerText',
            'Unpublishing a workflow means you can no longer access it from your frontend. Unpublishing workflows does not delete their associated schemas, it only affects whether or not you can access them in your frontend.',
          )}
        </p>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button
          kind="danger"
          onClick={() => {
            onUnpublishWorkflow();
            closeModal();
          }}>
          <span>{t('unpublish', 'Unpublish')}</span>
        </Button>
      </ModalFooter>
    </>
  );
};

export default UnpublishWorkflowModal;
