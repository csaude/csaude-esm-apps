import { Drug, OrderBasketItem } from '@openmrs/esm-patient-common-lib';
import { DefaultPatientWorkspaceProps } from '@openmrs/esm-patient-common-lib/src/workspaces';
import { NullablePatient, Visit } from '@openmrs/esm-framework';

type RenderTypes =
  | 'form'
  | 'conditions'
  | 'orders'
  | 'medications'
  | 'allergies'
  | 'diagnosis'
  | 'form-workspace'
  | 'appointments'
  | 'regimen-drug-order';

export interface WorkflowStep {
  id: string;
  renderType: RenderTypes;
  title: string;
  description?: string;
  formId?: string;
  skippable?: boolean;
  initiallyOpen?: boolean;
  dependentOn?: string[];
  visibility?: { conditions: StepCondition[]; logicalOperator?: 'AND' | 'OR'; complexExpression?: string };
  weight?: number;
  validations?: StepValidation[];
}
export interface StepCondition {
  source: 'patient' | 'step';
  stepId?: string;
  field: string;
  value: any;
  operator: 'equals' | 'contains' | 'gt' | 'lt' | 'gte' | 'lte' | 'in' | 'not' | 'exists';
}
export interface StepValidation {
  type: 'required' | 'format' | 'range' | 'custom';
  message: string;
  field: string;
  params?: any;
}

export interface WorkflowConfig {
  uuid: string;
  name: string;
  steps?: WorkflowStep[];
  description: string;
  published?: boolean;
  version: string;
  resourceValueReference?: string;
  criteria?: Criteria[];
  syncPatient?: boolean;
}
export interface Criteria {
  criteriaType: string;
  condition: string;
}

export interface Schema {
  name: string;
  steps: WorkflowStep[];
}

export interface WorkflowState {
  currentStepIndex: number;
  completedSteps: Set<string>;
  progress: number;
  stepsData: Record<string, any>;
  config: WorkflowConfig;
  patientUuid: string;
  patient: NullablePatient;
  visit: Visit;
  visibleSteps: WorkflowStep[];
  isLastStep: boolean;
}

export const emptyState: WorkflowState = {
  currentStepIndex: 0,
  completedSteps: new Set(),
  progress: 0,
  stepsData: {},
  config: null,
  patientUuid: null,
  patient: null,
  visit: null,
  visibleSteps: [],
  isLastStep: false,
};

export interface WorkflowWorkspaceProps extends DefaultPatientWorkspaceProps {
  workflow: WorkflowConfig;
  workflowUuid: string;
  workflowsCount?: number;
}

export interface StepComponentProps {
  patientUuid: string;
  encounterUuid: string;
  encounterTypeUuid: string;
  onStepComplete: (data: any) => void;
  // Used to change existing step data without completing the step
  onStepDataChange?: (data: any) => void;
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
