import React from 'react';
import FormRenderer from './components/form-renderer.component';
import WidgetExtension from './components/widget-extension.component';
import MedicationStepRenderer from './components/medication-step-renderer.component';
import { WorkflowStep } from './types';

interface StepProps {
  step: WorkflowStep;
  patientUuid: string;
  handleStepComplete: (stepId: string, data: any) => void;
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
    onStepComplete: (data: any) => handleStepComplete(step.id, data),
    step,
    encounterTypeUuid: '',
  });
});

registerStep('conditions', ({ step, patientUuid }: StepProps) => {
  return React.createElement(WidgetExtension, {
    patientUuid,
    stepId: step.id,
    extensionId: 'lab-order-panel',
  });
});

registerStep('medications', ({ step, patientUuid, handleStepComplete }: StepProps) => {
  return React.createElement(MedicationStepRenderer, {
    patientUuid,
    encounterUuid: '',
    step,
    onStepComplete: (data: any) => handleStepComplete(step.id, data),
    encounterTypeUuid: '',
  });
});

registerStep('form-workspace', ({ step, patientUuid }: StepProps) => {
  return React.createElement(WidgetExtension, {
    patientUuid,
    stepId: step.id,
    extensionId: 'drug-order-panel',
  });
});

export default stepRegistry;
