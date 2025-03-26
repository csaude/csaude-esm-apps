import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { WorkflowState } from './types';

export function saveWorkflowData(state: WorkflowState, abortController: AbortController) {
  try {
    return openmrsFetch(`${restBaseUrl}/consultationworkflow/workflowdata`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: {
        workflowConfig: state.config.uuid,
        patient: state.patientUuid,
        visit: state.visit.uuid,
        steps: Object.entries(state.stepsData).map(([stepId, data]) => ({
          stepName: data.stepName,
          renderType: data.renderType,
          stepId: stepId,
          dataReference: data.uuid ?? data.id, // Conditions returns id instead of uuid
          completed: true,
        })),
      },
      signal: abortController.signal,
    });
  } catch (error) {
    const message = error?.responseBody?.error?.message;
    throw message ? new Error(message) : error;
  }
}
