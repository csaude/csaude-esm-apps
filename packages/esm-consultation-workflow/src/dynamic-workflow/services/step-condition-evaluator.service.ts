import { NullablePatient } from '@openmrs/esm-react-utils';
import { StepCondition, WorkflowState, WorkflowStep } from '../types';

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

// Evaluate multiple conditions with a logical operator
function evaluateConditions(
  conditions: StepCondition[],
  logicalOperator: 'AND' | 'OR' = 'AND',
  workflowState: WorkflowState,
): boolean {
  if (conditions.length === 0) {
    return true;
  }

  if (logicalOperator === 'AND') {
    return conditions.every((condition) => evaluateCondition(condition, workflowState));
  } else {
    return conditions.some((condition) => evaluateCondition(condition, workflowState));
  }
}

// Evaluate complex expressions like "(0) AND ((1) OR (2))"
function evaluateComplexExpression(
  conditions: StepCondition[],
  expression: string,
  workflowState: WorkflowState,
): boolean {
  if (!expression) {
    return evaluateConditions(conditions, 'AND', workflowState);
  }

  // Replace condition indices with their boolean results
  let evaluatedExpression = expression;
  for (let i = 0; i < conditions.length; i++) {
    const result = evaluateCondition(conditions[i], workflowState);
    evaluatedExpression = evaluatedExpression.replace(new RegExp(`\\(${i}\\)`, 'g'), result.toString());
  }

  // Safely evaluate the expression
  try {
    // Convert the expression to a JavaScript-friendly boolean expression
    evaluatedExpression = evaluatedExpression.replace(/AND/g, '&&').replace(/OR/g, '||');

    // Use Function constructor to evaluate the expression safely
    return new Function(`return ${evaluatedExpression}`)();
  } catch (error) {
    console.error('Error evaluating complex expression:', error);
    return false;
  }
}

// Main visibility check method that determines whether a step should be visible
function isStepVisible(step: WorkflowStep, workflowState: WorkflowState): boolean {
  // If there's no visibility condition, the step is visible
  if (!step.visibility || !step.visibility.conditions || step.visibility.conditions.length === 0) {
    return true;
  }

  // Check dependencies first - if dependent steps aren't completed, step shouldn't be visible
  if (step.dependentOn && step.dependentOn.length > 0) {
    const dependenciesMet = step.dependentOn.every((depStepId) => workflowState.stepsData[depStepId]?.completed);
    if (!dependenciesMet) {
      return false;
    }
  }

  // Evaluate visibility based on the expression or logical operator
  if (step.visibility.complexExpression) {
    return evaluateComplexExpression(step.visibility.conditions, step.visibility.complexExpression, workflowState);
  } else {
    return evaluateConditions(step.visibility.conditions, step.visibility.logicalOperator || 'AND', workflowState);
  }
}
