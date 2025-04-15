import React, { useEffect, useMemo, useState } from 'react';
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

const renderTypes = [
  'form',
  'conditions',
  'orders',
  'medications',
  'allergies',
  'diagnosis',
  'form-workspace',
  'appointments',
];

function FormList({ forms, error, isLoading, formId, setFormId, closeModal }: FormListProps) {
  const { t } = useTranslation();
  if (error) {
    return <ErrorState headerTitle="Error" error={error} />;
  }

  if (isLoading) {
    return <SelectSkeleton />;
  }

  if (forms.length === 0) {
    return (
      <Tile id="tile-1">
        {t('noFormsAvailable', 'There are no forms available. Please create a form first.')}
        <br />
        <ConfigurableLink to={'${openmrsSpaBase}/form-builder'} onClick={closeModal}>
          {t('formBuilder', 'From builder')}
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
  const usedIds = useMemo(() => new Set(), []);

  const handleUpdateStep = () => {
    updateSteps();
    closeModal();
  };

  useEffect(() => {
    schema.steps?.forEach((step) => {
      if (step.id) {
        usedIds.add(step.id);
      }
    });
  }, [schema, usedIds]);

  const generateUniqueId = (title: string) => {
    title = title.toLowerCase().replace(/\s+/g, '-');
    let uniqueId = '';
    do {
      uniqueId = `step-${title}-${Math.floor(Math.random() * 1000)}`;
    } while (usedIds.has(uniqueId));
    return uniqueId;
  };

  const updateSteps = () => {
    try {
      if (stepTitle && stepRenderType) {
        let newStep = {
          id: schema.steps[stepIndex]?.id ? schema.steps[stepIndex].id : generateUniqueId(stepTitle),
          title: stepTitle,
          renderType: stepRenderType,
          skippable: stepSkippable,
        };
        if (stepRenderType == 'form') {
          newStep['formId'] = formId;
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
                labelText={t('renderType', 'Render type')}
                defaultValue={stepRenderType}
                className={styles.transparentInput}
                onChange={(event: React.ChangeEvent<HTMLSelectElement>) =>
                  setStepRenderType(event.target.value as StepRenderType)
                }>
                <SelectItem value="" text={t('selectRenderType', 'Select a render type')} />
                {renderTypes.map((renderType) => (
                  <SelectItem key={renderType} value={renderType} text={renderType} />
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
            <FormGroup legendText={''}>
              <Toggle
                id="stepSkippable"
                labelText={t('makeStepSkippable', 'Make this step skippable')}
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
