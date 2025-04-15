import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import useSWR from 'swr';

// Define the specific structure for workflow steps
interface WorkflowStep {
  stepId: string;
  stepName: string;
  renderType: string;
  completed: boolean;
  dataReference: string | null;
}

// Define the structure for workflow config
interface WorkflowConfigInfo {
  uuid: string;
  name: string;
}

// Define the structure for visit info
interface VisitInfo {
  uuid: string;
  display: string;
}

// Define the structure for a single workflow data item
export interface ConsultationWorkflowData {
  uuid: string;
  workflowConfig: WorkflowConfigInfo;
  visit: VisitInfo;
  steps: WorkflowStep[];
  patientUuid: string;
}

// Define the API response type
interface ConsultationWorkflowDataResponse {
  results: Array<ConsultationWorkflowData>;
}

export function useConsultationWorkflowData(patientUuid: string) {
  const url = `${restBaseUrl}/consultationworkflow/workflowdata?v=full&patient=${patientUuid}`;
  const { data, error, mutate } = useSWR<{ data: ConsultationWorkflowDataResponse }, Error>(url, openmrsFetch);

  return {
    consultationWorkflows:
      data?.data?.results.map((result) => ({
        uuid: result.uuid,
        workflowConfig: {
          uuid: result.workflowConfig.uuid,
          name: result.workflowConfig.name,
        },
        steps: result.steps,
        visit: {
          uuid: result.visit.uuid,
          display: result.visit.display,
        },
        patientUuid: patientUuid,
      })) ?? [],
    error: error,
    isLoading: (!data && !error) || false,
    mutate,
  };
}
