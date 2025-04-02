import React from 'react';
import AllergiesStepRenderer from './components/allergies-step-renderer.component';
import ConditionsStepRenderer from './components/conditions-step-renderer.component';
import AppointmentsStepRenderer from './components/appointments-step-renderer.component';
import FormRenderer from './components/form-renderer.component';
import MedicationStepRenderer from './components/medication-step-renderer.component';
import WidgetExtension from './components/widget-extension.component';
import { WorkflowStep } from './types';

interface StepProps {
  step: WorkflowStep;
  patientUuid: string;
  handleStepComplete: (stepId: string, data: any) => void;
  onStepDataChange?: (stepId: string, data: any) => void;
}

const stepRegistry: Record<string, React.FC<StepProps>> = {};

export const registerStep = (type: string, component: React.FC<StepProps>) => {
  stepRegistry[type] = component;
};

// Register default steps
registerStep('form', ({ step, patientUuid, handleStepComplete }: StepProps) => {
  return React.createElement(FormRenderer, {
    formUuid: step.formId,
    patientUuid,
    encounterUuid: '',
    onStepComplete: (data: any) =>
      handleStepComplete(step.id, { ...data, stepId: step.id, stepName: step.title, renderType: step.renderType }),
    encounterTypeUuid: '',
  });
});

registerStep('conditions', ({ step, patientUuid, handleStepComplete, onStepDataChange }: StepProps) => {
  return React.createElement(ConditionsStepRenderer, {
    patientUuid,
    encounterUuid: '',
    onStepComplete: (data: any) =>
      handleStepComplete(step.id, { ...data, stepId: step.id, stepName: step.title, renderType: step.renderType }),
    encounterTypeUuid: '',
  });
});

registerStep('medications', ({ step, patientUuid, handleStepComplete, onStepDataChange }: StepProps) => {
  return React.createElement(MedicationStepRenderer, {
    patientUuid,
    encounterUuid: '',

    onStepComplete: () => {}, // Handled in WorkflowContainer
    encounterTypeUuid: '',
    onOrdersChange: (orders) => onStepDataChange?.(step.id, orders),
  });
});

registerStep('allergies', ({ patientUuid, step, handleStepComplete, onStepDataChange }: StepProps) => {
  return React.createElement(AllergiesStepRenderer, {
    stepId: step.id,
    patientUuid,
    encounterUuid: '',
    encounterTypeUuid: '',
    onStepComplete: (allergies) =>
      handleStepComplete(step.id, { allergies, stepId: step.id, stepName: step.title, renderType: step.renderType }),
    onStepDataChange: (allergies) =>
      onStepDataChange(step.id, { allergies, stepId: step.id, stepName: step.title, renderType: step.renderType }),
  });
});

registerStep('form-workspace', ({ step, patientUuid }: StepProps) => {
  return React.createElement(WidgetExtension, {
    patientUuid,
    stepId: step.id,
    extensionId: 'drug-order-panel',
  });
});

registerStep('appointments', ({ step, patientUuid, handleStepComplete, onStepDataChange }: StepProps) => {
  return React.createElement(AppointmentsStepRenderer, {
    stepId: step.id,
    patientUuid,
    encounterUuid: '',
    onStepComplete: (data: any) => handleStepComplete(step.id, data),
    encounterTypeUuid: '',
  });
});

export default stepRegistry;
