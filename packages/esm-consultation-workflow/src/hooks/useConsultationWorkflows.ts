import useSWR from 'swr';
import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { ConsultationWorkflow } from '../dynamic-workflow/types';

export function useConsultationWorkflows() {
  const url = `${restBaseUrl}/consultationworkflow/workflowconfig?v=full`;
  const { data, error, mutate } = useSWR<{ data: { results: Array<ConsultationWorkflow> } }, Error>(url, openmrsFetch);

  return {
    consultationWorkflows: data?.data?.results ?? [],
    error: error,
    isLoading: (!data && !error) || false,
    mutate,
  };
}
