import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWRImmutable from 'swr/immutable';
import type { Schema, WorkflowConfig } from '../dynamic-workflow/types';

export const useClobdata = (consultationWorkflow?: WorkflowConfig) => {
  const valueReferenceUuid = consultationWorkflow?.resourceValueReference;
  const url = `${restBaseUrl}/clobdata/${valueReferenceUuid}`;

  const { data, error, isLoading, isValidating, mutate } = useSWRImmutable<{ data: Schema }, Error>(
    valueReferenceUuid ? url : null,
    openmrsFetch,
  );

  return {
    clobdata: data?.data,
    clobdataError: error,
    isLoadingClobdata: isLoading,
    isValidatingClobdata: isValidating,
    mutate: mutate,
  };
};
