import { type NullablePatient } from '@openmrs/esm-react-utils';
import { type StepCondition, type WorkflowState, type WorkflowStep } from '../types';

export function evaluateCondition(condition: StepCondition, workflowState: WorkflowState): boolean {
  const { stepId, field, value, operator, source } = condition;

  const isPatientSource = source === 'patient';

  const dataSource = isPatientSource ? workflowState.patient : workflowState.stepsData[stepId];

  if (!dataSource) {
    return false;
  }

  const stepConfig = !isPatientSource ? workflowState.config.steps.find((step) => step.id === stepId) : undefined;

  const fieldValue = isPatientSource
    ? getValueForPatientField(dataSource, field)
    : stepConfig
      ? getValueForStepField(stepConfig, dataSource, field)
      : undefined;

  // Return false if no value was found
  if (fieldValue === undefined || fieldValue === null) {
    return false;
  }
  switch (operator) {
    case 'equals':
      return fieldValue === value;
    case 'contains':
      return Array.isArray(fieldValue) ? fieldValue.includes(value) : String(fieldValue).includes(String(value));
    case 'gt':
      return fieldValue > value;
    case 'lt':
      return fieldValue < value;
    case 'gte':
      return fieldValue >= value;
    case 'lte':
      return fieldValue <= value;
    case 'in':
      return Array.isArray(value) ? value.includes(fieldValue) : false;
    case 'not':
      return fieldValue !== value;
    case 'exists':
      return fieldValue !== undefined && fieldValue !== null;
    default:
      return false;
  }
}

// Support for nested field paths like "patient.attributes.hivStatus"
function getNestedValue(obj: any, path: string): any {
  return path.split('.').reduce((prev, curr) => prev && prev[curr], obj);
}

function getValueForPatientField(patient: NullablePatient, field: string): any {
  // TODO: we are doing this because the OMRS fhir.Patient doesn't return the age
  if (field === 'age') {
    return patient.birthDate ? new Date().getFullYear() - new Date(patient.birthDate).getFullYear() : null;
  }
  return getNestedValue(patient, field);
}

function getValueForStepField(stepConfig: WorkflowStep, stepData: Record<string, any>, field: string): any {
  if (stepConfig.renderType === 'form') {
    return getFormValue(stepData, field);
  }

  if (!stepData) {
    return undefined;
  }
  return getNestedValue(stepData, field);
}

function getFormValue(formData: Record<string, any>, field: string): any {
  // Implement this method
  const targetPath = 'rfe-forms-' + field;
  const match = formData.obs.find((obs) => obs.formFieldPath === targetPath);
  if (!match) {
    return null;
  }

  const val = match.value;
  if (val && typeof val === 'object') {
    return val.name && val.uuid ? val.uuid : val;
  }
  return val;
}
