import useSWR from 'swr/immutable';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import type { ConsultationWorkflow } from '../types';

export const useConsultationWorkflow = (uuid: string) => {
  const url = `${restBaseUrl}/consultationworkflow/workflowconfig/${uuid}`;

  const { data, error, isLoading, isValidating, mutate } = useSWR<{ data: ConsultationWorkflow }, Error>(
    uuid ? url : null,
    openmrsFetch,
  );

  return {
    consultationWorkflow: data?.data,
    consultationWorkflowError: error,
    isLoadingConsultationWorkflow: isLoading,
    isValidatingConsultationWorkflow: isValidating,
    mutate,
  };
};
