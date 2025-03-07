import {
  CheckboxSkeleton,
  DatePicker,
  DatePickerInput,
  DatePickerSkeleton,
  MultiSelect,
  NumberInput,
  NumberInputSkeleton,
  Select,
  SelectItem,
  SelectSkeleton,
  TextInput,
  TextInputSkeleton,
} from '@carbon/react';
import { ErrorState } from '@openmrs/esm-framework';
import React, { useEffect } from 'react';
import { FieldValues, useController, UseControllerProps, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import { useConcept } from './form-hooks';

type Rendering = 'select' | 'text' | 'number' | 'checkbox' | 'date';

interface ObsProps<T extends FieldValues> extends UseControllerProps<T> {
  rendering: Rendering;
  conceptUuid: string;
  filterConceptUuid?: string[];
  /**
   * @param values current form values
   * @returns weather to hide the field or not
   */
  hide?: (values: unknown) => boolean;
}

const Obs = <T,>(props: ObsProps<T>) => {
  const { watch, resetField } = useFormContext();
  const values = watch();
  const hide = props.hide && props.hide(values);
  const { name } = props;
  useEffect(() => {
    if (hide) {
      resetField(name, { defaultValue: null });
    }
  }, [hide, name, resetField]);
  if (hide) {
    return null;
  }
  if (props.rendering === 'select') {
    return <SelectObs {...props} />;
  } else if (props.rendering === 'number') {
    return <NumberObs {...props} />;
  } else if (props.rendering === 'checkbox') {
    return <CheckboxObs {...props} />;
  } else if (props.rendering === 'date') {
    return <DateObs {...props} />;
  } else {
    return <TextObs {...props} />;
  }
};

const SelectObs = <T,>(props: ObsProps<T>) => {
  const { field, fieldState } = useController(props);
  const { isLoading, error, concept } = useConcept(props.conceptUuid);
  const { t } = useTranslation();

  if (isLoading) {
    return <SelectSkeleton />;
  }

  if (error) {
    return <ErrorState headerTitle={t('errorLoadingConcept', { uuid: props.conceptUuid })} error={error} />;
  }

  const filteredAnswers = props.filterConceptUuid?.length
    ? concept.answers.filter((c) => props.filterConceptUuid.includes(c.uuid))
    : concept.answers;

  return (
    <Select {...field} id={`select-${props.conceptUuid}`} labelText={concept.display}>
      <SelectItem value="" text="" />
      {filteredAnswers.map((c, i) => (
        <SelectItem key={c.uuid} id={i} value={c.uuid} text={c.display} />
      ))}
    </Select>
  );
};

const CheckboxObs = <T,>(props: ObsProps<T>) => {
  const { field, fieldState } = useController(props);
  const { isLoading, error, concept } = useConcept(props.conceptUuid);
  const { t } = useTranslation();

  if (isLoading) {
    return <CheckboxSkeleton />;
  }

  if (error) {
    return <ErrorState headerTitle={t('errorLoadingConcept', { uuid: props.conceptUuid })} error={error} />;
  }

  const filteredAnswers = props.filterConceptUuid?.length
    ? concept.answers.filter((c) => props.filterConceptUuid.includes(c.uuid))
    : concept.answers;

  const selectedItems = concept.answers.filter(
    (conceptAnswer) => Array.isArray(field.value) && (field.value as string[]).includes(conceptAnswer.uuid),
  );

  return (
    <MultiSelect
      {...field}
      titleText={concept.display}
      items={filteredAnswers}
      itemToString={(item) => item.display}
      initialSelectedItems={selectedItems}
      onChange={({ selectedItems }) => field.onChange(selectedItems.map((item) => item.uuid))}
    />
  );
};

const NumberObs = <T,>(props: ObsProps<T>) => {
  const { field, fieldState } = useController(props);
  const { isLoading, error, concept } = useConcept(props.conceptUuid);
  const { t } = useTranslation();

  if (isLoading) {
    return <NumberInputSkeleton />;
  }

  if (error) {
    return <ErrorState headerTitle={t('errorLoadingConcept', { uuid: props.conceptUuid })} error={error} />;
  }

  return <NumberInput {...field} id={`numberinput-${props.conceptUuid}`} label={concept.display} />;
};

const TextObs = <T,>(props: ObsProps<T>) => {
  const { field, fieldState } = useController(props);
  const { isLoading, error, concept } = useConcept(props.conceptUuid);
  const { t } = useTranslation();

  if (isLoading) {
    return <TextInputSkeleton />;
  }

  if (error) {
    return <ErrorState headerTitle={t('errorLoadingConcept', { uuid: props.conceptUuid })} error={error} />;
  }

  return <TextInput {...field} id={field.name} labelText={concept.display} />;
};

const DateObs = <T,>(props: ObsProps<T>) => {
  const { field, fieldState } = useController(props);
  const { isLoading, error, concept } = useConcept(props.conceptUuid);
  const { t } = useTranslation();

  if (isLoading) {
    return <DatePickerSkeleton />;
  }

  if (error) {
    return <ErrorState headerTitle={t('errorLoadingConcept', { uuid: props.conceptUuid })} error={error} />;
  }

  return (
    <DatePicker datePickerType="single">
      <DatePickerInput {...field} labelText={concept.display} />
    </DatePicker>
  );
};

export default Obs;
