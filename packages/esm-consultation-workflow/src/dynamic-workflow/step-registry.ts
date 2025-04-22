import React from 'react';
import AllergiesStepRenderer from './components/allergies-step-renderer.component';
import ConditionsStepRenderer from './components/conditions-step-renderer.component';
import AppointmentsStepRenderer from './components/appointments-step-renderer.component';
import FormStepRenderer from './components/form-step-renderer.component';
import MedicationStepRenderer from './components/medication-step-renderer.component';
import RegimenDrugOrderStepRenderer from './components/regimen-drug-order/regimen-drug-order-step-renderer.component';
import WidgetExtension from './components/widget-extension.component';
import { WorkflowStep } from './types';
import { Encounter } from '@openmrs/esm-api';

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
  return React.createElement(FormStepRenderer, {
    formUuid: step.formId,
    patientUuid,
    encounterUuid: '',
    onStepComplete: (data: Encounter) =>
      handleStepComplete(step.id, { ...data, stepId: step.id, stepName: step.title, renderType: step.renderType }),
    encounterTypeUuid: '',
  });
});

registerStep('conditions', ({ step, patientUuid, handleStepComplete, onStepDataChange }: StepProps) => {
  return React.createElement(ConditionsStepRenderer, {
    stepId: step.id,
    patientUuid,
    encounterUuid: '',
    encounterTypeUuid: '',
    onStepDataChange: (conditions) =>
      onStepDataChange(step.id, { conditions, stepId: step.id, stepName: step.title, renderType: step.renderType }),
    onStepComplete: (data: any) =>
      handleStepComplete(step.id, { ...data, stepId: step.id, stepName: step.title, renderType: step.renderType }),
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
    encounterTypeUuid: '',
    onStepComplete: (appointments) =>
      handleStepComplete(step.id, { appointments, stepId: step.id, stepName: step.title, renderType: step.renderType }),
    onStepDataChange: (appointments) =>
      onStepDataChange(step.id, { appointments, stepId: step.id, stepName: step.title, renderType: step.renderType }),
  });
});

registerStep('regimen-drug-order', ({ step, patientUuid, handleStepComplete, onStepDataChange }: StepProps) => {
  return React.createElement(RegimenDrugOrderStepRenderer, {
    stepId: step.id,
    patientUuid,
    encounterUuid: '',
    encounterTypeUuid: '',
    visitUuid: '',
    onStepComplete: (regimenOrders) =>
      handleStepComplete(step.id, {
        regimenOrders,
        stepId: step.id,
        stepName: step.title,
        renderType: step.renderType,
      }),
    onStepDataChange: (regimenOrders) =>
      onStepDataChange(step.id, { regimenOrders, stepId: step.id, stepName: step.title, renderType: step.renderType }),
  });
});

export default stepRegistry;
