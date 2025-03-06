import React from 'react';
import FormRenderer from './components/form-renderer.component';
import WidgetExtension from './components/widget-extension.component';
import MedicationStepRenderer from './components/medication-step-renderer.component';
import { WorkflowState, WorkflowStep } from './types';
import AllergiesStepRenderer from './components/allergies-step-renderer.component';

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
    onStepComplete: (data: any) => handleStepComplete(step.id, data),
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

registerStep('medications', ({ step, patientUuid, handleStepComplete, onStepDataChange }: StepProps) => {
  return React.createElement(MedicationStepRenderer, {
    patientUuid,
    encounterUuid: '',

    onStepComplete: (data: any) => handleStepComplete(step.id, data),
    encounterTypeUuid: '',
    onOrdersChange: (orders) => onStepDataChange?.(step.id, orders),
  });
});

registerStep('allergies', ({ patientUuid, step, handleStepComplete }: StepProps) => {
  return React.createElement(AllergiesStepRenderer, {
    patientUuid,
    encounterUuid: '',
    encounterTypeUuid: '',
    onStepComplete: (allergies) => handleStepComplete(step.id, allergies),
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
