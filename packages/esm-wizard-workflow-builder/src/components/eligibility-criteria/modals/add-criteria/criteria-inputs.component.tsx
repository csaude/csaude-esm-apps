import React from 'react';
import { Select, SelectItem, TextInput, NumberInput } from '@carbon/react';
import styles from './add-criteria.scss';
import { CurrentCriteria, inputTypesByCondition } from '../../../../resources/eligibility-criteria.resource';

interface Props {
  currentCriteria: CurrentCriteria;
  handleValueChange: (e: any) => void;
}

interface InputProps {
  value: string;
  handleChange: (e: any) => void;
  inputConfig?: any;
  min?: number;
  max?: number;
}

const CriteriaInputs = ({ currentCriteria, handleValueChange }: Props) => {
  if (!currentCriteria.condition || !currentCriteria.operator) {
    return null;
  }

  const inputConfig = inputTypesByCondition[currentCriteria.condition];

  if (!inputConfig) {
    return <Text value={currentCriteria.value} handleChange={handleValueChange} />;
  }

  switch (inputConfig.type) {
    case 'select':
      return <SelectInput value={currentCriteria.value} inputConfig={inputConfig} handleChange={handleValueChange} />;

    case 'number':
      return (
        <Number
          value={currentCriteria.value}
          min={inputConfig.min}
          max={inputConfig.max}
          handleChange={handleValueChange}
        />
      );

    case 'boolean':
      return (
        <div className="flex items-center">
          <input
            type="checkbox"
            checked={currentCriteria.value === 'true'}
            onChange={handleValueChange}
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label className="ml-2 block text-sm text-gray-900">{currentCriteria.value === 'true' ? 'Yes' : 'No'}</label>
        </div>
      );

    default:
      return <Text value={currentCriteria.value} handleChange={handleValueChange} />;
  }
};

const SelectInput = ({ value, handleChange, inputConfig }: InputProps) => {
  return (
    <Select className={styles.flexItem} id="condition-value" labelText="Valeu" value={value} onChange={handleChange}>
      <SelectItem text="Select a value" />
      {inputConfig.options.map((option, i) => (
        <SelectItem key={`${option}-${i}`} value={option} text={option} />
      ))}
    </Select>
  );
};

const Number = ({ value, handleChange, min, max }: InputProps) => {
  const onChange = (e, value) => {
    e.target.value = value;
    handleChange(e);
  };

  return (
    <NumberInput
      className={styles.flexItem}
      id="condition-value"
      label="Valeu"
      value={value ? value : min}
      min={min}
      max={max}
      onChange={(e, { value }) => onChange(e, value)}
    />
  );
};

const Text = ({ value, handleChange }: InputProps) => {
  return (
    <TextInput
      className={styles.flexItem}
      id="condition-value"
      labelText="Valeu"
      value={value}
      onChange={handleChange}
    />
  );
};

export default CriteriaInputs;
