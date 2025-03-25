import { Drug, OrderBasketItem } from '@openmrs/esm-patient-common-lib/src';
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
  //TODO: add this later stepsGroups?: Array<{
  //   name: string;
  //   steps: WorkflowStep[];
  // }>;
}

export interface Criteria {
  criteriaType: string;
  condition: string;
}

export interface ConsultationWorkflow {
  uuid: string;
  name: string;
  description: string;
  published?: boolean;
  version: string;
  resourceValueReference?: string;
  resourceVersion: string;
  criteria?: Criteria[];
}

export interface WorkflowState {
  currentStepIndex: number;
  completedSteps: Set<string>;
  progress: number;
  stepsData: Record<string, any>;
  config: WorkflowConfig;
  patientUuid: string;
}

export const initialState: WorkflowState = {
  currentStepIndex: 0,
  completedSteps: new Set(),
  progress: 0,
  stepsData: {},
  config: null,
  patientUuid: null,
};

export interface WorkflowWorkspaceProps extends DefaultPatientWorkspaceProps {
  workflow: WorkflowConfig;
  workflowUuid: string;
  workflowCount?: number;
}

export interface StepComponentProps {
  patientUuid: string;
  encounterUuid: string;
  encounterTypeUuid: string;
  onStepComplete: (data: any) => void;
}

interface CommonMedicationProps {
  value: string;
  default?: boolean;
}

// These are not available on the patient-commons-lib so we are copying them here, for now
export interface CommonMedicationValueCoded extends CommonMedicationProps {
  valueCoded: string;
  names?: string[];
}

export type MedicationFrequency = CommonMedicationValueCoded;

export type MedicationRoute = CommonMedicationValueCoded;

export type MedicationInstructions = CommonMedicationProps;

export type DosingUnit = CommonMedicationValueCoded;

export type QuantityUnit = CommonMedicationValueCoded;

export type DurationUnit = CommonMedicationValueCoded;

export interface OrderTemplate {
  type: string;
  dosingType: string;
  dosingInstructions: DosingInstructions;
}

export interface MedicationDosage extends Omit<CommonMedicationProps, 'value'> {
  value: number;
}

export interface DosingInstructions {
  dose: Array<MedicationDosage>;
  units: Array<DosingUnit>;
  route: Array<MedicationRoute>;
  frequency: Array<MedicationFrequency>;
  instructions?: Array<MedicationInstructions>;
  durationUnits?: Array<DurationUnit>;
  quantityUnits?: Array<QuantityUnit>;
  asNeeded?: boolean;
  asNeededCondition?: string;
}
export interface DrugOrderBasketItem extends OrderBasketItem {
  drug: Drug;
  unit: DosingUnit;
  commonMedicationName: string;
  dosage: number;
  frequency: MedicationFrequency;
  route: MedicationRoute;
  quantityUnits: QuantityUnit;
  patientInstructions: string;
  asNeeded: boolean;
  asNeededCondition: string;
  startDate: Date | string;
  durationUnit: DurationUnit;
  duration: number | null;
  pillsDispensed: number;
  numRefills: number;
  indication: string;
  isFreeTextDosage: boolean;
  freeTextDosage: string;
  previousOrder?: string;
  template?: OrderTemplate;
}
