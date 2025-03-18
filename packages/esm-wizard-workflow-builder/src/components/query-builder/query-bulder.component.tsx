import React, { useState } from 'react';
import { conditionsByType, criteriaTypes, operatorsByCondition } from './query-builder.resource';
import QueryBuilderInputs from './query-builder-inpus.component';
import { SelectItem, Select, Button, Tile } from '@carbon/react';
import styles from './query-builder.scss';
import { Add, TrashCan } from '@carbon/react/icons';
import { Criteria } from '../../types';

interface Props {
  onCriteriaChange: (criteria: Criteria[]) => void;
}

const QueryBuilder = ({ onCriteriaChange }: Props) => {
  const [criteria, setCriteria] = useState<Criteria[]>([]);
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

    setCriteria([...criteria, newCriteria]);
    onCriteriaChange([...criteria, newCriteria]);

    setCurrentCriteria({
      criteriaType: '',
      condition: '',
      operator: '',
      value: '',
    });
  };

  const removeCriteria = (index) => {
    const updatedCriteria = [...criteria];
    updatedCriteria.splice(index, 1);
    setCriteria(updatedCriteria);
    onCriteriaChange(updatedCriteria);
  };

  return (
    <>
      <Tile className={styles.tileContainer}>
        <h5>Criterios de elegibilidade</h5>
        {!criteria.length && <div>Nenhum criterio adicionado</div>}
        {criteria.length > 0 && (
          <div>
            <h6>Criterios Adicionados</h6>
            <div className={styles.criteriaListContainer}>
              {criteria.map((item, index) => (
                <div className={styles.addedCriteriasContainer}>
                  <div className={styles.conditionString}>{item.criteriaType}</div>
                  <div className={styles.conditionString}>{item.condition}</div>
                  <Button
                    hasIconOnly
                    renderIcon={TrashCan}
                    kind="danger"
                    size="md"
                    iconDescription="remover"
                    onClick={() => removeCriteria(index)}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </Tile>

      <div className={styles.tileContainer}>
        <SelectInput
          label="Criteria Type"
          id="criteria-type"
          value={currentCriteria.criteriaType}
          options={criteriaTypes}
          onChange={handleCriteriaTypeChange}
          placeholder="Select Criteria Type"
        />

        <div className={styles.grid3Container}>
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

          {currentCriteria.operator && (
            <QueryBuilderInputs currentCriteria={currentCriteria} handleValueChange={handleValueChange} />
          )}
        </div>

        <Button
          onClick={addCriteria}
          size="sm"
          renderIcon={Add}
          disabled={
            !currentCriteria.criteriaType ||
            !currentCriteria.condition ||
            !currentCriteria.operator ||
            !currentCriteria.value
          }>
          Add Criteria
        </Button>
      </div>
    </>
  );
};

interface SelectProps {
  value: string;
  options: any[];
  onChange: (e: any) => void;
  placeholder: string;
  label: string;
  id: string;
}

const SelectInput = ({ value, options, onChange, placeholder, label, id }: SelectProps) => {
  return (
    <Select className={styles.flexItem} id={id} labelText={label} onChange={onChange}>
      <SelectItem text={placeholder} />
      {options.map((option, i) => (
        <SelectItem key={`${option}-${i}`} value={option} text={option.replace(/_/g, ' ')} />
      ))}
    </Select>
  );
};

export default QueryBuilder;
