import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, ModalBody, ModalFooter, ModalHeader } from '@carbon/react';
import { showSnackbar } from '@openmrs/esm-framework';
import type { Schema } from '../../../../types';
import styles from '../modals.scss';

interface DeleteStepModalProps {
  closeModal: () => void;
  onSchemaChange: (schema: Schema) => void;
  stepIndex: number;
  schema: Schema;
}

const DeleteStepModal: React.FC<DeleteStepModalProps> = ({ onSchemaChange, stepIndex, schema, closeModal }) => {
  const { t } = useTranslation();

  const deletePage = (stepIndex: number) => {
    try {
      schema.steps.splice(stepIndex, 1);

      onSchemaChange({ ...schema });

      showSnackbar({
        title: t('success', 'Success!'),
        kind: 'success',
        isLowContrast: true,
        subtitle: t('pageDeleted', 'Page deleted'),
      });
    } catch (error) {
      if (error instanceof Error) {
        showSnackbar({
          title: t('errorDeletingPage', 'Error deleting page'),
          kind: 'error',
          subtitle: error?.message,
        });
      }
    }
  };

  return (
    <>
      <ModalHeader
        className={styles.modalHeader}
        title={t('deleteStepConfirmation', 'Are you sure you want to delete this step?')}
        closeModal={closeModal}
      />
      <ModalBody>
        <p>
          {t(
            'deleteStepExplainerText',
            'Deleting this step will delete all the sections and questions associated with it. This action cannot be undone.',
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
            deletePage(stepIndex);
            closeModal();
          }}>
          <span>{t('deleteStep', 'Delete step')}</span>
        </Button>
      </ModalFooter>
    </>
  );
};

export default DeleteStepModal;
