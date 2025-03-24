import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Form, FormGroup, ModalBody, ModalFooter, ModalHeader, Stack, Select, SelectItem } from '@carbon/react';
import { showSnackbar } from '@openmrs/esm-framework';
import type { Criteria } from '../../../../types';
import styles from '../modals.scss';
import {
  conditionsByType,
  criteriaTypes,
  operatorsByCondition,
} from '../../../../resources/eligibility-criteria.resource';
import CriteriaInputs from './criteria-inputs.component';

interface AddCriteriaModalProps {
  closeModal: () => void;
  criteria: Criteria[];
  updateCriteria: (criteria: Criteria[]) => void;
}

interface SelectProps {
  value: string;
  options: any[];
  onChange: (e: any) => void;
  placeholder: string;
  label: string;
  id: string;
}

const AddCriteriaModal: React.FC<AddCriteriaModalProps> = ({ closeModal, criteria, updateCriteria }) => {
  const { t } = useTranslation();

  const [currentCriteria, setCurrentCriteria] = useState({
    criteriaType: '',
    condition: '',
    operator: '',
    value: '',
  });

  const handleCriteriaTypeChange = (e) => {
    const type = e.target.value;
    setCurrentCriteria({
      criteriaType: type,
      condition: '',
      operator: '',
      value: '',
    });
  };

  const handleConditionChange = (e) => {
    const condition = e.target.value;
    setCurrentCriteria({
      ...currentCriteria,
      condition,
      operator: '',
      value: '',
    });
  };

  const handleOperatorChange = (e) => {
    setCurrentCriteria({
      ...currentCriteria,
      operator: e.target.value,
      value: '',
    });
  };

  const handleValueChange = (e) => {
    let value;

    if (e.target.type === 'checkbox') {
      value = e.target.checked.toString();
    } else {
      value = e.target.value;
    }

    setCurrentCriteria({
      ...currentCriteria,
      value,
    });
  };

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

  return (
    <>
      <ModalHeader className={styles.modalHeader} closeModal={closeModal} title={t('addCriteria', 'Add Criteria')} />
      <Form onSubmit={(event: React.SyntheticEvent) => event.preventDefault()}>
        <ModalBody>
          <Stack gap={5}>
            <FormGroup legendText={''}>
              <SelectInput
                label="Criteria Type"
                id="criteria-type"
                value={currentCriteria.criteriaType}
                options={criteriaTypes}
                onChange={handleCriteriaTypeChange}
                placeholder="Select Criteria Type"
              />
            </FormGroup>
            <div className={styles.grid3Container}>
              <FormGroup legendText={''}>
                {currentCriteria.criteriaType && (
                  <div>
                    <SelectInput
                      label="Condition"
                      id="condition"
                      value={currentCriteria.condition}
                      options={conditionsByType[currentCriteria.criteriaType]}
                      onChange={handleConditionChange}
                      placeholder="Select Condition"
                    />
                  </div>
                )}
              </FormGroup>
              <FormGroup legendText={''}>
                {currentCriteria.condition && (
                  <div>
                    <SelectInput
                      label="Operator"
                      id="opetator"
                      value={currentCriteria.operator}
                      options={operatorsByCondition[currentCriteria.condition]}
                      onChange={handleOperatorChange}
                      placeholder="Select Operator"
                    />
                  </div>
                )}
              </FormGroup>
              <FormGroup legendText={''}>
                <CriteriaInputs currentCriteria={currentCriteria} handleValueChange={handleValueChange} />
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
            !currentCriteria.value
          }>
          <span>{t('addCriteria', 'Add Criteria')}</span>
        </Button>
      </ModalFooter>
    </>
  );
};

const SelectInput = ({ value, options, onChange, placeholder, label, id }: SelectProps) => {
  return (
    <Select className={styles.flexItem} id={id} labelText={label} value={value} onChange={onChange}>
      <SelectItem text={placeholder} />
      {options.map((option, i) => (
        <SelectItem key={`${option}-${i}`} value={option} text={option.replace(/_/g, ' ')} />
      ))}
    </Select>
  );
};

export default AddCriteriaModal;
