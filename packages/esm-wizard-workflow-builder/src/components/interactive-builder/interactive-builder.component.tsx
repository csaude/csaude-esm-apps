import React, { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { DndContext, KeyboardSensor, MouseSensor, closestCorners, useSensor, useSensors } from '@dnd-kit/core';
import { Button, IconButton, InlineLoading, AccordionItem, Accordion } from '@carbon/react';
import { Add, TrashCan, Edit } from '@carbon/react/icons';
import { useParams } from 'react-router-dom';
import { showModal } from '@openmrs/esm-framework';
import type { Criteria, Schema } from '../../types';
import styles from './interactive-builder.scss';
import StepCondition from '../step-condition/step-condition.component';

interface InteractiveBuilderProps {
  isLoading: boolean;
  onSchemaChange: (schema: Schema) => void;
  schema: Schema;
  criteria: Criteria[];
}

const InteractiveBuilder: React.FC<InteractiveBuilderProps> = ({ isLoading, onSchemaChange, schema }) => {
  const mouseSensor = useSensor(MouseSensor, {
    activationConstraint: {
      distance: 10, // Enable sort function when dragging 10px 💡 here!!!
    },
  });
  const keyboardSensor = useSensor(KeyboardSensor);
  const sensors = useSensors(mouseSensor, keyboardSensor);

  const { t } = useTranslation();
  const { formUuid } = useParams<{ formUuid: string }>();
  const isEditingExistingForm = Boolean(formUuid);

  const initializeSchema = useCallback(() => {
    const dummySchema: Schema = {
      name: '',
      syncPatient: false,
      steps: [],
    };

    if (!schema) {
      onSchemaChange({ ...dummySchema });
    }

    return schema || dummySchema;
  }, [onSchemaChange, schema]);

  const launchWorkflowModal = useCallback(() => {
    const schema = initializeSchema();
    const dispose = showModal('workflow-modal', {
      closeModal: () => dispose(),
      schema,
      onSchemaChange,
    });
  }, [onSchemaChange, initializeSchema]);

  const launchStepModal = useCallback(
    (stepIndex: number) => {
      const dispose = showModal('step-modal', {
        closeModal: () => dispose(),
        schema,
        onSchemaChange,
        stepIndex,
      });
    },
    [schema, onSchemaChange],
  );

  const launchDeleteStepModal = useCallback(
    (stepIndex: number) => {
      const dipose = showModal('delete-step-modal', {
        closeModal: () => dipose(),
        onSchemaChange,
        schema,
        stepIndex,
      });
    },
    [onSchemaChange, schema],
  );

  return (
    <div className={styles.container}>
      {isLoading ? <InlineLoading description={t('loadingSchema', 'Loading schema') + '...'} /> : null}

      {schema?.name && (
        <>
          <div className={styles.header}>
            <Button
              kind="ghost"
              renderIcon={Add}
              onClick={() => launchStepModal(schema.steps.length)}
              iconDescription={t('addStep', 'Add Step')}>
              {t('addStep', 'Add Step')}
            </Button>
          </div>
          <div className={styles.editorContainer}>
            <h1 className={styles.schemaLabel}>{schema.name}</h1>
            <IconButton
              enterDelayMs={300}
              kind="ghost"
              label={t('editSchema', 'Edit schema')}
              onClick={() => launchWorkflowModal()}
              size="md">
              <Edit />
            </IconButton>
          </div>
        </>
      )}

      {!isEditingExistingForm && !schema?.name && (
        <div className={styles.header}>
          <p className={styles.explainer}>
            {t(
              'interactiveBuilderHelperText',
              'The Interactive Builder lets you build your wizard workflow schema without writing JSON code. The Preview tab automatically updates as you build your form. When done, click Save Form to save your form.',
            )}
          </p>

          <Button onClick={launchWorkflowModal} className={styles.startButton} kind="ghost">
            {t('startBuilding', 'Start building')}
          </Button>
        </div>
      )}

      <DndContext collisionDetection={closestCorners} sensors={sensors}>
        <Accordion>
          {schema?.steps?.length
            ? schema.steps.map((step, stepIndex) => (
                <AccordionItem title={step.id} key={step.id}>
                  <div className={styles.flexContainer}>
                    <div className={styles.wrapperHeader}>
                      <h4>{step.title}</h4>
                    </div>
                    <div>
                      <IconButton
                        enterDelayMs={300}
                        kind="ghost"
                        label={t('editStep', 'Edit Step')}
                        onClick={() => launchStepModal(stepIndex)}
                        size="md">
                        <Edit />
                      </IconButton>
                      <IconButton
                        enterDelayMs={300}
                        kind="ghost"
                        label={t('deleteStep', 'Delete step')}
                        onClick={() => launchDeleteStepModal(stepIndex)}
                        size="md">
                        <TrashCan />
                      </IconButton>
                    </div>
                  </div>
                  <div className={styles.wrapperPadding}>
                    <strong>Render Type:</strong>
                    <span>{' ' + step.renderType}</span>
                    {step.formId && (
                      <div className={styles.marginTop}>
                        <strong>Form ID:</strong>
                        <span>{' ' + step.formId}</span>
                      </div>
                    )}
                    <StepCondition schema={schema} stepIndex={stepIndex} onSchemaChange={onSchemaChange} />
                  </div>
                </AccordionItem>
              ))
            : null}
        </Accordion>
      </DndContext>
    </div>
  );
};

export default InteractiveBuilder;
