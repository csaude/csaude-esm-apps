import { NullablePatient } from '@openmrs/esm-react-utils/src';
import { StepCondition, WorkflowState, WorkflowStep } from '../types';

export class StepConditionEvaluatorService {
  evaluateCondition(condition: StepCondition, workflowState: WorkflowState): boolean {
    const { stepId, field, value, operator, source } = condition;

    const isPatientSource = source === 'patient';

    const dataSource = isPatientSource ? workflowState.patient : workflowState.stepsData[stepId];

    if (!dataSource) {
      return false;
    }

    const stepConfig = !isPatientSource ? workflowState.config.steps.find((step) => step.id === stepId) : undefined;

    const fieldValue = isPatientSource
      ? this.getValueForPatientField(dataSource, field)
      : stepConfig
        ? this.getValueForStepField(stepConfig, dataSource, field)
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
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((prev, curr) => prev && prev[curr], obj);
  }

  private getValueForPatientField(patient: NullablePatient, field: string): any {
    // TODO: we are doing this because the OMRS fhir.Patient doesn't return the age
    if (field === 'age') {
      return patient.birthDate ? new Date().getFullYear() - new Date(patient.birthDate).getFullYear() : null;
    }
    return this.getNestedValue(patient, field);
  }

  private getValueForStepField(stepConfig: WorkflowStep, stepData: Record<string, any>, field: string): any {
    if (stepConfig.renderType === 'form') {
      return this.getFormValue(stepData, field);
    }

    if (!stepData) {
      return undefined;
    }
    return this.getNestedValue(stepData, field);
  }

  private getFormValue(formData: Record<string, any>, field: string): any {
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
  evaluateConditions(
    conditions: StepCondition[],
    logicalOperator: 'AND' | 'OR' = 'AND',
    workflowState: WorkflowState,
  ): boolean {
    if (conditions.length === 0) {
      return true;
    }

    if (logicalOperator === 'AND') {
      return conditions.every((condition) => this.evaluateCondition(condition, workflowState));
    } else {
      return conditions.some((condition) => this.evaluateCondition(condition, workflowState));
    }
  }

  // Evaluate complex expressions like "(0) AND ((1) OR (2))"
  evaluateComplexExpression(conditions: StepCondition[], expression: string, workflowState: WorkflowState): boolean {
    if (!expression) {
      return this.evaluateConditions(conditions, 'AND', workflowState);
    }

    // Replace condition indices with their boolean results
    let evaluatedExpression = expression;
    for (let i = 0; i < conditions.length; i++) {
      const result = this.evaluateCondition(conditions[i], workflowState);
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
  isStepVisible(step: WorkflowStep, workflowState: WorkflowState): boolean {
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
      return this.evaluateComplexExpression(
        step.visibility.conditions,
        step.visibility.complexExpression,
        workflowState,
      );
    } else {
      return this.evaluateConditions(
        step.visibility.conditions,
        step.visibility.logicalOperator || 'AND',
        workflowState,
      );
    }
  }
}
