import React, { ExoticComponent, ForwardedRef, forwardRef } from 'react';
import AllergiesStepRenderer from './components/allergies-step-renderer.component';
import AppointmentsStepRenderer from './components/appointments-step-renderer.component';
import ConditionsStepRenderer from './components/conditions-step-renderer.component';
import FormStepRenderer from './components/form-step-renderer.component';
import MedicationStepRenderer from './components/medication-step-renderer.component';
import RegimenDrugOrderStepRenderer from './components/regimen-drug-order/regimen-drug-order-step-renderer.component';
import WidgetExtension from './components/widget-extension.component';
import { WorkflowStep } from './types';

export interface StepComponentHandle {
  onStepComplete: () => any;
}
export interface StepProps {
  ref?: ForwardedRef<StepComponentHandle>;
  step: WorkflowStep;
  patientUuid: string;
  stepData: any;
}

const stepRegistry: Record<string, ExoticComponent<StepProps>> = {};

export const registerStep = (type: string, component: ExoticComponent<StepProps>) => {
  stepRegistry[type] = component;
};

// Register default steps
registerStep(
  'form',
  forwardRef(({ step, patientUuid, stepData }: StepProps, ref: ForwardedRef<StepComponentHandle>) => {
    return React.createElement(FormStepRenderer, {
      ref,
      formUuid: step.formId,
      encounter: stepData?.encounter,
      initiallyOpen: step.initiallyOpen,
      patientUuid,
      encounterUuid: '',
      encounterTypeUuid: '',
    });
  }),
);

registerStep(
  'conditions',
  forwardRef(({ patientUuid, step, stepData }: StepProps, ref: ForwardedRef<StepComponentHandle>) => {
    return React.createElement(ConditionsStepRenderer, {
      ref,
      patientUuid,
      encounterUuid: '',
      encounterTypeUuid: '',
      conditions: stepData?.conditions,
      initiallyOpen: step.initiallyOpen,
    });
  }),
);

registerStep(
  'medications',
  forwardRef(({ step, patientUuid }: StepProps, ref: ForwardedRef<StepComponentHandle>) => {
    return React.createElement(MedicationStepRenderer, {
      ref,
      patientUuid,
      encounterUuid: '',
      encounterTypeUuid: '',
    });
  }),
);

registerStep(
  'allergies',
  forwardRef(({ patientUuid, step, stepData }: StepProps, ref: ForwardedRef<StepComponentHandle>) => {
    return React.createElement(AllergiesStepRenderer, {
      ref,
      patientUuid,
      encounterUuid: '',
      encounterTypeUuid: '',
      allergies: stepData?.allergies,
      initiallyOpen: step.initiallyOpen,
    });
  }),
);

registerStep(
  'form-workspace',
  forwardRef(({ step, patientUuid }: StepProps) => {
    return React.createElement(WidgetExtension, {
      patientUuid,
      stepId: step.id,
      extensionId: 'drug-order-panel',
    });
  }),
);

registerStep(
  'appointments',
  forwardRef(({ step, patientUuid, stepData }: StepProps, ref: ForwardedRef<StepComponentHandle>) => {
    return React.createElement(AppointmentsStepRenderer, {
      ref,
      patientUuid,
      encounterUuid: '',
      encounterTypeUuid: '',
      appointments: stepData?.appointments,
      initiallyOpen: step.initiallyOpen,
    });
  }),
);

registerStep(
  'regimen-drug-order',
  forwardRef(({ step, patientUuid }: StepProps, ref: ForwardedRef<StepComponentHandle>) => {
    return React.createElement(RegimenDrugOrderStepRenderer, {
      ref,
      stepId: step.id,
      patientUuid,
      encounterUuid: '',
      encounterTypeUuid: '',
      visitUuid: '',
    });
  }),
);

export default stepRegistry;
