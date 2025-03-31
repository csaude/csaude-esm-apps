import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { WorkflowState, WorkflowStep } from './types';

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
          dataReference: getDataReference(data, data.renderType),
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

function getDataReference(data: Record<string, any>, renderType: WorkflowStep['renderType']) {
  switch (renderType) {
    case 'conditions':
      return data.id;
    case 'medications':
      return JSON.stringify({ encounter: data.encounter, orders: data.orders });
    default:
      return data.uuid;
  }
}
