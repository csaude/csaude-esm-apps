import React, { type SyntheticEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Form, InlineLoading, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import styles from './delete-workflow.scss';

interface DeleteWorkflowModalProps {
  closeModal: () => void;
  isDeletingWorkflow: boolean;
  onDeleteWorkflow: () => void;
}

const DeleteWorkflowModal: React.FC<DeleteWorkflowModalProps> = ({
  closeModal,
  isDeletingWorkflow,
  onDeleteWorkflow,
}) => {
  const { t } = useTranslation();
  return (
    <>
      <ModalHeader
        className={styles.modalHeader}
        closeModal={closeModal}
        title={t('deleteWorkflow', 'Delete workflow')}
      />
      <Form onSubmit={(event: SyntheticEvent) => event.preventDefault()}>
        <ModalBody>
          <p>{t('deleteWorkflowConfirmation', 'Are you sure you want to delete this workflow?')}</p>
        </ModalBody>
      </Form>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button
          disabled={isDeletingWorkflow}
          kind="danger"
          onClick={() => {
            onDeleteWorkflow();
            closeModal();
          }}>
          {isDeletingWorkflow ? (
            <InlineLoading className={styles.spinner} description={t('deleting', 'Deleting') + '...'} />
          ) : (
            <span>{t('delete', 'Delete')}</span>
          )}
        </Button>
      </ModalFooter>
    </>
  );
};

export default DeleteWorkflowModal;
