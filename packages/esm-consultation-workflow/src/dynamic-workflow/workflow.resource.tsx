import { openmrsFetch, restBaseUrl } from '@openmrs/esm-framework';
import { Allergy } from './hooks/useAllergies';
import { Condition } from './hooks/useConditions';
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
    case 'allergies':
      return JSON.stringify(data.allergies ? data.allergies.map((a: Allergy) => a.uuid) : []);
    case 'appointments':
      return JSON.stringify(data.appointments ? data.appointments.map((a: { uuid: string }) => a.uuid) : []);
    case 'conditions':
      return JSON.stringify(data.conditions ? data.conditions.map((c: Condition) => c.id) : []);
    case 'medications':
      return JSON.stringify({ encounter: data.encounter, orders: data.orders });
    case 'form':
      return JSON.stringify({ encounter: { uuid: data.uuid }, form: { uuid: data.form.uuid } });
    case 'regimen-drug-order':
      return JSON.stringify({
        encounter: { uuid: data.encounterUuid },
        orders: data.drugOrderUuids,
        prescriptionType: data.prescriptionType,
      });
    default:
      throw new Error(`Not implemented for renderType ${renderType}.`);
  }
}
