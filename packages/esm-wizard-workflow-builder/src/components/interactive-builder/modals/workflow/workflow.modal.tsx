import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Form, FormGroup, ModalBody, ModalFooter, ModalHeader, Stack, TextInput, Toggle } from '@carbon/react';
import { showSnackbar } from '@openmrs/esm-framework';
import type { Schema } from '../../../../types';
import styles from '../modals.scss';

interface WorkflowModalProps {
  schema: Schema;
  onSchemaChange: (schema: Schema) => void;
  closeModal: () => void;
}

const WorkflowModal: React.FC<WorkflowModalProps> = ({ schema, onSchemaChange, closeModal }) => {
  const { t } = useTranslation();
  const [workflowTitle, setWorkFlowTitle] = useState(schema.name);
  const [syncPatient, setSyncPatient] = useState(schema.syncPatient);

  const updateSchema = (updates: Partial<Schema>) => {
    try {
      const updatedSchema = { ...schema, ...updates };
      onSchemaChange(updatedSchema);

      showSnackbar({
        title: t('success', 'Success!'),
        kind: 'success',
        isLowContrast: true,
        subtitle: t('workflowCreated', 'New workflow created'),
      });
    } catch (error) {
      if (error instanceof Error) {
        showSnackbar({
          title: t('errorCreatingWorkflow', 'Error creating workflow'),
          kind: 'error',
          subtitle: error?.message,
        });
      }
    }
  };

  const handleCreateForm = () => {
    if (workflowTitle) {
      updateSchema({
        name: workflowTitle,
        syncPatient: syncPatient,
      });

      closeModal();
    }
  };

  return (
    <>
      <ModalHeader
        className={styles.modalHeader}
        closeModal={closeModal}
        title={t('createNewWorkflow', 'Create a new workflow')}
      />
      <Form onSubmit={(event: React.SyntheticEvent) => event.preventDefault()}>
        <ModalBody>
          <Stack gap={5}>
            <FormGroup legendText={''}>
              <TextInput
                id="workflowName"
                labelText={t('workflowName', 'Workflow Name')}
                placeholder={t('namePlaceholder', 'What the workflow is called in the system')}
                value={workflowTitle}
                className={styles.transparentInput}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setWorkFlowTitle(event.target.value)}
              />
            </FormGroup>
            <FormGroup legendText={''}>
              <Toggle
                id="syncPatient"
                labelText={t('syncPatient', 'Sync Patient with idMed')}
                labelA="Off"
                labelB="On"
                toggled={syncPatient}
                onToggle={(event: boolean) => setSyncPatient(event)}
              />
            </FormGroup>
          </Stack>
        </ModalBody>
      </Form>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button disabled={!workflowTitle} onClick={handleCreateForm}>
          <span>{t('createWorkflow', 'Create Workflow')}</span>
        </Button>
      </ModalFooter>
    </>
  );
};

export default WorkflowModal;
