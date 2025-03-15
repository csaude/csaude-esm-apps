import React from 'react';
import { Select, SelectItem, TextInput, NumberInput, Toggle } from '@carbon/react';
import styles from './query-builder.scss';

interface Props {
  name: string;
  value: string[] | string;
  renderType: string;
}

const QueryBuilderInputs = ({ name, value, renderType }: Props) => {
  switch (renderType) {
    case 'select':
      return <SelectInput name={name} value={value} renderType={renderType} />;
    case 'number':
      return <Number name={name} value={value} renderType={renderType} />;
    case 'boolean':
      return <Boolean name={name} value={value} renderType={renderType} />;
    default:
      return <Text name={name} value={value} renderType={renderType} />;
  }
};

const SelectInput = ({ name, value }: Props) => {
  return (
    <Select className={styles.flexItem} id={`prop-${name}`} labelText={name}>
      {Array.isArray(value) && value.map((v, i) => <SelectItem key={`${name}-${i}`} value={v} text={v} />)}
    </Select>
  );
};

const Number = ({ name }: Props) => {
  return <NumberInput className={styles.flexItem} id={`prop-${name}`} label={name} />;
};

const Boolean = ({ name }: Props) => {
  return (
    <Toggle className={styles.flexItem} id={`prop-${name}`} labelText={name} labelA="Off" labelB="On" defaultToggled />
  );
};

const Text = ({ name }: Props) => {
  return <TextInput className={styles.flexItem} id={`prop-${name}`} labelText={name} />;
};

export default QueryBuilderInputs;
