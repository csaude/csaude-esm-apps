import { DefaultPatientWorkspaceProps } from '@openmrs/esm-patient-common-lib/src/workspaces';

export interface WorkflowStep {
  id: string;
  renderType: 'form' | 'conditions' | 'orders' | 'medications' | 'allergies' | 'diagnosis' | 'form-workspace';
  title: string;
  formId?: string;
  skippable?: boolean;
  dependentOn?: string;
  condition?: {
    stepId: string;
    field: string;
    value: any;
    operator: 'equals' | 'contains' | 'gt' | 'lt';
  };
  weight?: number;
}

export interface WorkflowConfig {
  name: string;
  steps: WorkflowStep[];
}

export interface WorkflowState {
  currentStep: string;
  completedSteps: Set<string>;
  stepData: Record<string, any>;
  progress: number;
}

export interface WorkflowWorkspaceProps extends DefaultPatientWorkspaceProps {
  workflow: WorkflowConfig;
}

export interface StepComponentProps {
  step: WorkflowStep;
  patientUuid: string;
  encounterUuid: string;
  encounterTypeUuid: string;
  onStepComplete: (data: any) => void;
}
