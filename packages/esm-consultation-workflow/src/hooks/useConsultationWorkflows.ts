import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';
import { type WorkflowConfig } from '../dynamic-workflow/types';

export function useConsultationWorkflows(patientUuid: string) {
  const url = `${restBaseUrl}/consultationworkflow/workflowconfig?v=full&patient=${patientUuid}`;
  const { data, error, mutate } = useSWR<{ data: { results: Array<WorkflowConfig> } }, Error>(url, openmrsFetch);

  return {
    consultationWorkflows: data?.data?.results ?? [],
    error: error,
    isLoading: (!data && !error) || false,
    mutate,
  };
}
