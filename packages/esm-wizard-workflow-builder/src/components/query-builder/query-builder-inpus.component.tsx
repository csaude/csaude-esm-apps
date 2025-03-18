import React from 'react';
import { Select, SelectItem, TextInput, NumberInput, Toggle } from '@carbon/react';
import styles from './query-builder.scss';
import { CurrentCriteria, inputTypesByCondition } from './query-builder.resource';

// interface Props {
//   name: string;
//   value: string[] | string;
//   renderType: string;
//   setValue: React.Dispatch<React.SetStateAction<string>>;
// }

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

const QueryBuilderInputs = ({ currentCriteria, handleValueChange }: Props) => {
  if (!currentCriteria.condition || !currentCriteria.operator) {
    return null;
  }

  const inputConfig = inputTypesByCondition[currentCriteria.condition];

  if (!inputConfig) {
    return (
      <Text value={currentCriteria.value} handleChange={handleValueChange} />
      // <input
      // type="text"
      // value={currentCriteria.value}
      // onChange={handleValueChange}
      // className="w-full p-2 border border-gray-300 rounded-md"
      // placeholder="Enter value"
      // />
    );
  }

  switch (inputConfig.type) {
    case 'select':
      return (
        <SelectInput value={currentCriteria.value} inputConfig={inputConfig} handleChange={handleValueChange} />
        // <select
        //   value={currentCriteria.value}
        //   onChange={handleValueChange}
        //   className="w-full p-2 border border-gray-300 rounded-md">
        //   <option value="">Select a value</option>
        //   {inputConfig.options.map((option) => (
        //     <option key={option} value={option}>
        //       {option}
        //     </option>
        //   ))}
        // </select>
      );

    case 'number':
      return (
        <Number
          value={currentCriteria.value}
          min={inputConfig.min}
          max={inputConfig.max}
          handleChange={handleValueChange}
        />
        // <input
        //   type="number"
        //   value={currentCriteria.value}
        //   onChange={handleValueChange}
        //   className="w-full p-2 border border-gray-300 rounded-md"
        //   min={inputConfig.min}
        //   max={inputConfig.max}
        //   placeholder={`Enter value (${inputConfig.min}-${inputConfig.max})`}
        // />
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
      return (
        <Text value={currentCriteria.value} handleChange={handleValueChange} />
        // <input
        //   type="text"
        //   value={currentCriteria.value}
        //   onChange={handleValueChange}
        //   className="w-full p-2 border border-gray-300 rounded-md"
        //   placeholder={inputConfig.placeholder || 'Enter value'}
        //   pattern={inputConfig.pattern}
        // />
      );
  }

  // switch (renderType) {
  //   case 'select':
  //     return <SelectInput name={name} value={value} renderType={renderType} setValue={setValue} />;
  //   case 'number':
  //     return <Number name={name} value={value} renderType={renderType} setValue={setValue} />;
  //   case 'boolean':
  //     return <Boolean name={name} value={value} renderType={renderType} setValue={setValue} />;
  //   default:
  //     return <Text name={name} value={value} renderType={renderType} setValue={setValue} />;
  // }
};

const SelectInput = ({ value, handleChange, inputConfig }: InputProps) => {
  return (
    <Select className={styles.flexItem} id="condition-value" labelText="Valeu" onChange={handleChange}>
      <SelectItem text="Select a value" />
      {inputConfig.options.map((option, i) => (
        <SelectItem key={`${option}-${i}`} value={option} text={option} />
      ))}
      {/* {Array.isArray(value) && value.map((v, i) => <SelectItem key={`${name}-${i}`} value={v} text={v} />)} */}
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

// const Boolean = ({ name }: Props) => {
//   return (
//     <Toggle className={styles.flexItem} id={`prop-${name}`} labelText={name} labelA="Off" labelB="On" defaultToggled />
//   );
// };

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

export default QueryBuilderInputs;
