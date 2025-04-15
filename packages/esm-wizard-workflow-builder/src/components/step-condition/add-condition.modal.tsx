import React, { useState } from 'react';
import styles from './step-condition.scss';
import { useTranslation } from 'react-i18next';
import { showSnackbar } from '@openmrs/esm-framework';
import { ConditionOpertors, Schema, StepCondition } from '../../types';
import {
  ModalHeader,
  ModalBody,
  ModalFooter,
  Button,
  Form,
  FormGroup,
  Select,
  SelectItem,
  TextInput,
  Stack,
} from '@carbon/react';

interface ConditionModalProps {
  closeModal: () => void;
  schema: Schema;
  stepIndex: number;
  onSchemaChange: (schema: Schema) => void;
}

const conditionSources = ['patient', 'step'];
const conditionOperators = ['equals', 'contains', 'gt', 'lt'];

const AddConditionModal: React.FC<ConditionModalProps> = ({ closeModal, schema, stepIndex, onSchemaChange }) => {
  const { t } = useTranslation();
  const [condition, setCondition] = useState<StepCondition>({
    source: '',
    field: '',
    operator: 'equals',
    value: '',
  });

  const handleSourceChange = (source: string) => {
    setCondition({
      source: source,
      field: '',
      operator: 'equals',
      value: '',
    });
  };

  const handleStepIdChange = (stepId: string) => {
    setCondition({
      ...condition,
      stepId: stepId,
      value: '',
    });
  };

  const handleFieldChange = (field: string) => {
    setCondition({
      ...condition,
      field: field,
      value: '',
    });
  };

  const handleOperatorChange = (operator: ConditionOpertors) => {
    setCondition({
      ...condition,
      operator: operator,
      value: '',
    });
  };

  const handleValueChange = (value: string) => {
    setCondition({
      ...condition,
      value: value,
    });
  };

  const filteredStepItems =
    stepIndex >= 0 && stepIndex < schema.steps.length ? schema.steps.filter((step, index) => index < stepIndex) : [];

  const addCondition = () => {
    try {
      schema.steps[stepIndex].visibility = {
        ...schema.steps[stepIndex].visibility,
        conditions: [...(schema.steps[stepIndex].visibility?.conditions || []), condition],
      };
      onSchemaChange({ ...schema });
      showSnackbar({
        title: t('success', 'Success!'),
        kind: 'success',
        isLowContrast: true,
        subtitle: t('conditionAdded', 'Condition Added'),
      });
    } catch (error) {
      if (error instanceof Error) {
        showSnackbar({
          title: t('errorAddingCondition', 'Error adding condition'),
          kind: 'error',
          subtitle: error?.message,
        });
      }
    }
    closeModal();
  };

  return (
    <>
      <ModalHeader className={styles.modalHeader} closeModal={closeModal} title={t('addCondition', 'Add Condition')} />
      <ModalBody>
        <Form onSubmit={(event: React.SyntheticEvent) => event.preventDefault()}>
          <Stack gap={5}>
            <FormGroup legendText={''}>
              <Select
                id="source"
                labelText={t('selectSource', 'Select a source')}
                onChange={(event: React.ChangeEvent<HTMLSelectElement>) => handleSourceChange(event.target.value)}>
                <SelectItem value="" text="" />
                {conditionSources.map((source) => (
                  <SelectItem key={source} value={source} text={source.charAt(0).toUpperCase() + source.slice(1)} />
                ))}
              </Select>
            </FormGroup>
            {condition.source === 'step' && (
              <FormGroup legendText={''}>
                <Select
                  id="stepId"
                  labelText={t('selectStep', 'Select a step')}
                  onChange={(event: React.ChangeEvent<HTMLSelectElement>) => handleStepIdChange(event.target.value)}>
                  <SelectItem value="" text="" />
                  {filteredStepItems.length ? (
                    filteredStepItems.map((step) => <SelectItem key={step.id} value={step.id} text={step.id} />)
                  ) : (
                    <SelectItem
                      disabled
                      text={t('noStepToSelect', 'There is no step before the current step to select')}
                    />
                  )}
                </Select>
              </FormGroup>
            )}
            <FormGroup legendText={''}>
              <TextInput
                id="field"
                labelText={t('field', 'Field')}
                placeholder={t('field', 'Field')}
                type="text"
                value={condition.field}
                onChange={(event: React.ChangeEvent<HTMLSelectElement>) => handleFieldChange(event.target.value)}
              />
            </FormGroup>
            <FormGroup legendText={''}>
              <Select
                id="operator"
                labelText={t('selectOperator', 'Select an operator')}
                defaultValue={condition.operator}
                onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                  handleOperatorChange(event.target.value as ConditionOpertors)
                }>
                {conditionOperators.map((operator) => (
                  <SelectItem key={operator} value={operator} text={operator} />
                ))}
              </Select>
            </FormGroup>
            <FormGroup legendText={''}>
              <TextInput
                id="value"
                labelText={t('value', 'Value')}
                placeholder={t('value', 'Value')}
                type="text"
                value={condition.value}
                onChange={(event: React.ChangeEvent<HTMLSelectElement>) => handleValueChange(event.target.value)}
              />
            </FormGroup>
          </Stack>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button
          onClick={addCondition}
          disabled={!condition.source || !condition.field || !condition.operator || !condition.value}>
          <span>{t('addCondition', 'Add Condition')}</span>
        </Button>
      </ModalFooter>
    </>
  );
};

export default AddConditionModal;
