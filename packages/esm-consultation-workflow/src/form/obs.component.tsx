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
import { ErrorState, FetchResponse, openmrsFetch } from '@openmrs/esm-framework';
import React, { useEffect } from 'react';
import { FieldValues, useController, UseControllerProps, useFormContext } from 'react-hook-form';
import { useTranslation } from 'react-i18next';
import useSWR from 'swr';

type Rendering = 'select' | 'text' | 'number' | 'checkbox' | 'date';

interface ObsProps<T extends FieldValues> extends UseControllerProps<T> {
  rendering: Rendering;
  conceptUuid: string;
  hide?: (values: unknown) => boolean;
}

interface ConceptAnswer {
  uuid: string;
  display: string;
}

interface Concept {
  display: string;
  answers: ConceptAnswer[];
}

function useConcept(uuid: string): { isLoading: boolean; error: Error; concept: Concept } {
  const { isLoading, data, error } = useSWR<FetchResponse<Concept>, Error>(`ws/rest/v1/concept/${uuid}`, openmrsFetch);

  return {
    isLoading,
    error,
    concept: data?.data,
  };
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

  return (
    <Select {...field} labelText={concept.display}>
      <SelectItem value="" text="" />
      {concept.answers.map((c, i) => (
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

  return (
    <MultiSelect {...field} titleText={concept.display} items={concept.answers} itemToString={(item) => item.display} />
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

  return <NumberInput {...field} label={concept.display} />;
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

  return <TextInput {...field} labelText={concept.display} />;
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
