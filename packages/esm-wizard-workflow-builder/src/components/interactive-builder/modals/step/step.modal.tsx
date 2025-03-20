import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  Button,
  Form,
  FormGroup,
  ModalBody,
  ModalFooter,
  ModalHeader,
  TextInput,
  Select,
  SelectItem,
  Stack,
  Toggle,
  ComboBox,
  SelectSkeleton,
  Tile,
} from '@carbon/react';
import { ErrorState, showSnackbar, ConfigurableLink } from '@openmrs/esm-framework';
import type { Form as TypedForm, Schema, StepRenderType } from '../../../../types';
import styles from '../modals.scss';
import { useForms } from '../../../../hooks/useForms';
// import { useForms } from '../../../../hooks/useForms';

interface StepModalProps {
  closeModal: () => void;
  schema: Schema;
  onSchemaChange: (schema: Schema) => void;
  stepIndex: number;
}

interface FormListProps {
  forms: Array<TypedForm>;
  error: Error;
  isLoading: boolean;
  formId: string;
  setFormId: (formId: string) => void;
  closeModal: () => void;
}

interface StepConditions {
  stepId: string;
  field: string;
  value: string;
  operator: string;
}

const renderTypes = ['form', 'conditions', 'orders', 'medications', 'allergies', 'diagnosis', 'form-workspace'];
const conditionOperators = ['equals', 'contains', 'gt', 'lt'];

function FormList({ forms, error, isLoading, formId, setFormId, closeModal }: FormListProps) {
  if (error) {
    return <ErrorState headerTitle="Error" error={error} />;
  }

  if (isLoading) {
    return <SelectSkeleton />;
  }

  if (forms.length === 0) {
    return (
      <Tile id="tile-1">
        There are no forms available. Please create a form first.
        <br />
        <ConfigurableLink to={'${openmrsSpaBase}/form-builder'} onClick={closeModal}>
          From builder
        </ConfigurableLink>
      </Tile>
    );
  }

  return (
    <ComboBox
      titleText="Select a form"
      id="formId"
      autoAlign={true}
      className={styles.transparentInput}
      initialSelectedItem={forms.find((form) => form.uuid === formId)}
      itemToString={(item) => (item ? item.name : '')}
      onChange={(item) => setFormId(item.selectedItem?.uuid)}
      items={forms}
    />
  );
}

const StepModal: React.FC<StepModalProps> = ({ closeModal, schema, onSchemaChange, stepIndex }) => {
  const { t } = useTranslation();
  const { forms, error, isLoading } = useForms();
  const [stepTitle, setStepTitle] = useState(schema.steps[stepIndex]?.title || '');
  const [stepRenderType, setStepRenderType] = useState<StepRenderType>(
    schema.steps[stepIndex]?.renderType || undefined,
  );
  const [stepSkippable, setStepSkippable] = useState<boolean>(schema.steps[stepIndex]?.skippable);
  const [formId, setFormId] = useState(schema.steps[stepIndex]?.formId);
  const [stepConditions, setStepConditions] = useState<StepConditions>(schema.steps[stepIndex]?.condition || undefined);

  const handleUpdateStep = () => {
    updateSteps();
    closeModal();
  };

  const updateSteps = () => {
    try {
      if (stepTitle && stepRenderType) {
        let newStep = {
          id: `step-${stepIndex}`, // this will have to be changed later
          title: stepTitle,
          renderType: stepRenderType,
          skippable: stepSkippable,
        };
        if (stepRenderType == 'form') {
          newStep['formId'] = formId;
        }
        if (stepConditions) {
          newStep['condition'] = stepConditions;
        }
        if (schema.steps[stepIndex]) {
          schema.steps[stepIndex] = newStep;
        } else {
          schema.steps.push(newStep);
        }
        onSchemaChange({ ...schema });
        setStepTitle('');
        setStepRenderType(undefined);
      }
      showSnackbar({
        title: t('success', 'Success!'),
        kind: 'success',
        isLowContrast: true,
        subtitle: t('stepCreated', 'New step created'),
      });
    } catch (error) {
      if (error instanceof Error) {
        showSnackbar({
          title: t('errorCreatingStep', 'Error creating step'),
          kind: 'error',
          subtitle: error?.message,
        });
      }
    }
  };

  const filteredStepItems = schema.steps[stepIndex]?.id
    ? schema.steps.filter((step) => step.id != schema.steps[stepIndex].id)
    : schema.steps.length
      ? schema.steps
      : [];

  return (
    <>
      <ModalHeader
        className={styles.modalHeader}
        title={t('createStepPage', 'Create a new step Here')}
        closeModal={closeModal}
      />
      <ModalBody>
        <Form onSubmit={(event: React.SyntheticEvent) => event.preventDefault()}>
          <Stack gap={5}>
            <FormGroup legendText={''}>
              <TextInput
                id="stepTitle"
                labelText={t('enterStepTitle', 'Enter a title for your new step')}
                value={stepTitle}
                className={styles.transparentInput}
                onChange={(event: React.ChangeEvent<HTMLInputElement>) => setStepTitle(event.target.value)}
              />
            </FormGroup>
            <FormGroup legendText={''}>
              <Select
                id="stepRenderType"
                labelText="Select a render type"
                defaultValue={stepRenderType}
                className={styles.transparentInput}
                onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                  setStepRenderType(event.target.value as StepRenderType)
                }>
                <SelectItem value="" text="" />
                {renderTypes.map((renderType, index) => (
                  <SelectItem key={index} value={renderType} text={renderType} />
                ))}
              </Select>
            </FormGroup>
            {stepRenderType == 'form' && (
              <FormList
                error={error}
                forms={forms}
                formId={formId}
                isLoading={isLoading}
                setFormId={setFormId}
                closeModal={closeModal}
              />
            )}
            <Tile>
              <h6>Step Conditions</h6>

              <div className={styles.grid}>
                <FormGroup legendText={''}>
                  <Select
                    id="conditionStepId"
                    labelText="Select a step to depend on"
                    defaultValue={stepConditions ? stepConditions.stepId : ''}
                    onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                      setStepConditions({ ...stepConditions, stepId: event.target.value })
                    }>
                    <SelectItem value="" text="" />
                    {filteredStepItems.length ? (
                      filteredStepItems.map((step) => <SelectItem key={step.id} value={step.id} text={step.title} />)
                    ) : (
                      <SelectItem value="" disabled text="There is no step to select" />
                    )}
                  </Select>
                </FormGroup>
                <FormGroup legendText={''}>
                  <TextInput
                    id="conditionField"
                    labelText={'Condition field'}
                    value={stepConditions ? stepConditions.field : ''}
                    className={styles.transparentInput}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setStepConditions({ ...stepConditions, field: event.target.value })
                    }
                  />
                </FormGroup>
                <FormGroup legendText={''}>
                  <TextInput
                    id="conditionValue"
                    labelText={'Condition value'}
                    value={stepConditions ? stepConditions.value : ''}
                    className={styles.transparentInput}
                    onChange={(event: React.ChangeEvent<HTMLInputElement>) =>
                      setStepConditions({ ...stepConditions, value: event.target.value })
                    }
                  />
                </FormGroup>
                <FormGroup legendText={''}>
                  <Select
                    id="conditionOperator"
                    labelText="Condition operator"
                    defaultValue={stepConditions ? stepConditions.operator : ''}
                    onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                      setStepConditions({ ...stepConditions, operator: event.target.value })
                    }>
                    <SelectItem value="" text="" />
                    {conditionOperators.map((operator, index) => (
                      <SelectItem key={index} value={operator} text={operator} />
                    ))}
                  </Select>
                </FormGroup>
              </div>
            </Tile>
            <FormGroup legendText={''}>
              <Toggle
                id="stepSkippable"
                labelText="Make this step skippable"
                labelA="Off"
                labelB="On"
                toggled={stepSkippable}
                onToggle={(event: boolean) => setStepSkippable(event)}
              />
            </FormGroup>
          </Stack>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button onClick={closeModal} kind="secondary">
          {t('cancel', 'Cancel')}
        </Button>
        <Button
          disabled={!stepTitle || !stepRenderType || (stepRenderType == 'form' && !formId)}
          onClick={handleUpdateStep}>
          <span>{t('save', 'Save')}</span>
        </Button>
      </ModalFooter>
    </>
  );
};

export default StepModal;
