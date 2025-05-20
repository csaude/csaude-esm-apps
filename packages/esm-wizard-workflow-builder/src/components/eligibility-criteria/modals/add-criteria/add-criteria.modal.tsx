import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { showSnackbar } from '@openmrs/esm-framework';
import type { Criteria } from '../../../../types';
import styles from '../modals.scss';
import { useCriteriaValues } from '../../../../hooks/useCriteriaValues';
import {
  type ConditionOption,
  criteriaDefinitions,
  getConditionByValue,
  getCriteriaByValue,
} from '../../../../resources/eligibility-criteria.resource';
import {
  Button,
  Form,
  FormGroup,
  ModalBody,
  ModalFooter,
  ModalHeader,
  Stack,
  Select,
  SelectItem,
  SelectSkeleton,
  NumberInput,
  TextInput,
  Toggle,
} from '@carbon/react';

interface AddCriteriaModalProps {
  closeModal: () => void;
  criteria: Criteria[];
  updateCriteria: (criteria: Criteria[]) => void;
}

interface CurrentCriteria {
  criteriaType: string;
  condition: string;
  operator: string;
  value: string | number | boolean;
}

const AddCriteriaModal: React.FC<AddCriteriaModalProps> = ({ closeModal, criteria, updateCriteria }) => {
  const { t } = useTranslation();

  const [currentCriteria, setCurrentCriteria] = useState<CurrentCriteria>({
    criteriaType: '',
    condition: '',
    operator: '',
    value: '',
  });

  const addCriteria = () => {
    const formattedCondition = `${currentCriteria.condition} ${currentCriteria.operator} ${currentCriteria.value}`;

    const newCriteria: Criteria = {
      criteriaType: currentCriteria.criteriaType,
      condition: formattedCondition,
    };

    updateCriteria([...criteria, newCriteria]);

    showSnackbar({
      title: t('success', 'Success!'),
      kind: 'success',
      isLowContrast: true,
      subtitle: t('criteriaAdded', 'Criteria Added'),
    });
    closeModal();
  };

  const selectedCondition = getConditionByValue(currentCriteria.criteriaType, currentCriteria.condition);

  return (
    <>
      <ModalHeader className={styles.modalHeader} closeModal={closeModal} title={t('addCriteria', 'Add Criteria')} />
      <Form onSubmit={(event: React.SyntheticEvent) => event.preventDefault()}>
        <ModalBody>
          <Stack gap={5}>
            <FormGroup legendText={''}>
              <CriteriaTypeSelector
                value={currentCriteria.criteriaType}
                onChange={(value) =>
                  setCurrentCriteria({ criteriaType: value, condition: '', operator: '', value: '' })
                }
              />
            </FormGroup>
            <div className={styles.grid3Container}>
              <FormGroup legendText={''}>
                {currentCriteria.criteriaType && (
                  <ConditionSelector
                    criteriaType={currentCriteria.criteriaType}
                    value={currentCriteria.condition}
                    onChange={(value) =>
                      setCurrentCriteria({ ...currentCriteria, condition: value, operator: '', value: '' })
                    }
                  />
                )}
              </FormGroup>
              <FormGroup legendText={''}>
                {selectedCondition && currentCriteria.condition && (
                  <OperatorSelector
                    operators={selectedCondition.operators}
                    value={currentCriteria.operator}
                    onChange={(value) => setCurrentCriteria({ ...currentCriteria, operator: value, value: '' })}
                  />
                )}
              </FormGroup>
              <FormGroup legendText={''}>
                {selectedCondition && currentCriteria.operator && (
                  <ValueInput
                    inputConfig={selectedCondition.input}
                    value={currentCriteria.value}
                    onChange={(value) => setCurrentCriteria({ ...currentCriteria, value })}
                  />
                )}
              </FormGroup>
            </div>
          </Stack>
        </ModalBody>
      </Form>
      <ModalFooter>
        <Button kind="secondary" onClick={closeModal}>
          {t('cancel', 'Cancel')}
        </Button>
        <Button
          onClick={addCriteria}
          disabled={
            !currentCriteria.criteriaType ||
            !currentCriteria.condition ||
            !currentCriteria.operator ||
            currentCriteria.value === undefined ||
            currentCriteria.value === null ||
            currentCriteria.value === ''
          }>
          <span>{t('addCriteria', 'Add Criteria')}</span>
        </Button>
      </ModalFooter>
    </>
  );
};

const CriteriaTypeSelector = ({ value, onChange }: { value: string; onChange: (value: string) => void }) => {
  const { t } = useTranslation();
  return (
    <Select
      className={styles.flexItem}
      id="criteria-selector"
      labelText={t('criteriaType', 'Criteria Type')}
      value={value}
      onChange={(e) => onChange(e.target.value)}>
      <SelectItem text={t('selectCriteriaType', 'Select Criteria Type')} />
      {criteriaDefinitions.map((option, i) => (
        <SelectItem key={`${option.label}-${i}`} value={option.value} text={option.label} />
      ))}
    </Select>
  );
};

const ConditionSelector = ({
  criteriaType,
  value,
  onChange,
}: {
  criteriaType: string;
  value: string;
  onChange: (value: string) => void;
}) => {
  const { t } = useTranslation();
  const selected = getCriteriaByValue(criteriaType);
  const isDynamic = !!selected?.uri;

  const { data, error, isLoading } = useCriteriaValues(selected?.uri);
  const staticConditions = selected?.conditions;

  const options = isDynamic ? data : staticConditions;

  if (isDynamic && isLoading) {
    return <SelectSkeleton />;
  }

  if (isDynamic && error) {
    return (
      <div className={styles.error}>
        <div>{t('errorLoadingConditions', 'Error loading conditions')}</div>
        <div>{error.message}</div>
      </div>
    );
  }

  return (
    <Select
      className={styles.flexItem}
      id="condition-selector"
      labelText={t('condition', 'Condition')}
      value={value}
      onChange={(e) => onChange(e.target.value)}>
      <SelectItem text={t('selectCondition', 'Select Condition')} />
      {options?.map((option, i) => (
        <SelectItem key={`${option.label}-${i}`} value={option.value} text={option.label} />
      ))}
    </Select>
  );
};

const OperatorSelector = ({
  operators,
  value,
  onChange,
}: {
  operators: string[];
  value: string;
  onChange: (value: string) => void;
}) => {
  const { t } = useTranslation();
  return (
    <Select
      className={styles.flexItem}
      id="operator-selector"
      labelText={t('operator', 'Operator')}
      value={value}
      onChange={(e) => onChange(e.target.value)}>
      <SelectItem text={t('selectOperator', 'Select Operator')} />
      {operators.map((option, i) => (
        <SelectItem key={`${option}-${i}`} value={option} text={option} />
      ))}
    </Select>
  );
};

const ValueInput = ({
  inputConfig,
  value,
  onChange,
}: {
  inputConfig: ConditionOption['input'];
  value: string | number | boolean;
  onChange: (value: string | number | boolean) => void;
}) => {
  const { data, error, isLoading } = useCriteriaValues(inputConfig.uri);
  const { t } = useTranslation();

  if (!inputConfig) {
    return null;
  }

  switch (inputConfig.type) {
    case 'number':
      if (value === '') {
        onChange(inputConfig.min);
      }
      return (
        <NumberInput
          className={styles.flexItem}
          id="condition-value"
          label={t('value', 'Value')}
          value={value ? value : inputConfig.min}
          min={inputConfig.min}
          max={inputConfig.max}
          onChange={(e, { value }) => onChange(value)}
        />
      );

    case 'select': {
      if (inputConfig.uri) {
        if (isLoading) {
          return <div>Loading options...</div>;
        }
        if (error) {
          return <div>Error: {error.message}</div>;
        }
        return (
          <Select value={value} onChange={(e) => onChange(e.target.value)} labelText={t('value', 'Value')}>
            <SelectItem value="" text="Select an option" />
            {data?.map((opt, idx) => <SelectItem key={`${opt.label}-${idx}`} value={opt.value} text={opt.label} />)}
          </Select>
        );
      }

      if (inputConfig.options) {
        return (
          <Select value={value} onChange={(e) => onChange(e.target.value)} labelText={t('value', 'Value')}>
            <SelectItem value="" text="Select an option" />
            {inputConfig.options?.map((opt, idx) => (
              <SelectItem key={`${opt.label}-${idx}`} value={opt.value} text={opt.label} />
            ))}
          </Select>
        );
      }

      return null;
    }

    case 'boolean':
      if (value === '') {
        onChange(false);
      }
      return (
        <Toggle
          toggled={value}
          id="condition-value"
          labelText={t('value', 'Value')}
          labelA={t('off', 'False')}
          labelB={t('on', 'True')}
          onToggle={onChange}
        />
      );

    default:
      return (
        <TextInput
          className={styles.flexItem}
          id="condition-value"
          labelText={t('value', 'Value')}
          value={value}
          onChange={(e) => onChange(e.target.value)}
        />
      );
  }
};

export default AddCriteriaModal;
