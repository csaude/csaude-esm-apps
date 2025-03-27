import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { WorkflowConfig } from '../dynamic-workflow/types';

export function useConsultationWorkflows(pateientUuid: string) {
  const url = `${restBaseUrl}/consultationworkflow/workflowconfig?v=full&patient=${pateientUuid}`;
  const { data, error, mutate } = useSWR<{ data: { results: Array<WorkflowConfig> } }, Error>(url, openmrsFetch);

  return {
    consultationWorkflows: data?.data?.results ?? [],
    error: error,
    isLoading: (!data && !error) || false,
    mutate,
  };
}
