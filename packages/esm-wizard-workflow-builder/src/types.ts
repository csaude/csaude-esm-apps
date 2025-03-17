import type { OpenmrsResource } from '@openmrs/esm-framework';
import type {
  OpenmrsFormResource,
  ProgramState,
  ReferencedForm,
  RenderType,
  RequiredFieldProps,
} from '@openmrs/esm-form-engine-lib';
import type { AuditInfo } from './components/audit-details/audit-details.component';
import type { questionTypes } from './constants';

export interface Criteria {
  type: CriteriaType;
  criteria?: { name?: string; value: string; operator?: string; status?: boolean };
}

export type CriteriaType = 'demographics' | 'patient-attributes' | 'provider' | 'patient-program' | 'visit-type';

// remore this later
export interface Form {
  uuid: string;
  name: string;
  encounterType: EncounterType;
  version: string;
  resources: Array<Resource>;
  description: string;
  published?: boolean;
  retired?: boolean;
  formFields?: Array<string>;
  display?: string;
  auditInfo: AuditInfo;
}

export interface ConsultationWorkflow {
  uuid: string;
  name: string;
  description: string;
  published?: boolean;
  version: string;
  resourceValueReference?: string;
  resourceVersion: string;
}

export interface FilterProps {
  rowIds: Array<string>;
  headers: Array<Record<string, string>>;
  cellsById: Record<string, Record<string, boolean | string | null | Record<string, unknown>>>;
  inputValue: string;
  getCellId: (row, key) => string;
}

export interface EncounterType {
  uuid: string;
  name: string;
  display: string;
}

export interface Resource {
  uuid: string;
  name: string;
  dataType: string;
  valueReference: string;
}

export type QuestionType = (typeof questionTypes)[number];

export type DatePickerType = 'both' | 'calendar' | 'timer';

export type StepRenderType =
  | 'form'
  | 'conditions'
  | 'orders'
  | 'medications'
  | 'allergies'
  | 'diagnosis'
  | 'form-workspace';

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

export interface Schema {
  name: string;
  steps: WorkflowStep[];
}

export interface SchemaContextType {
  schema: Schema;
  setSchema: (schema: Schema) => void;
}

export interface Answer {
  concept: string;
  label: string;
}

export type ConceptMapping = Record<string, string>;

export interface Concept {
  uuid: string;
  display: string;
  mappings: Array<Mapping>;
  datatype: OpenmrsResource;
  answers?: Array<ConceptAnswer>;
  allowDecimal?: boolean;
}

export interface ConceptAnswer {
  uuid: string;
  display: string;
}

export interface Mapping {
  display: string;
  conceptMapType: {
    display: string;
  };
}

export interface PatientIdentifierType {
  display: string;
  name: string;
  description: string;
  uuid: string;
}

export interface PersonAttributeType {
  display: string;
  format: string;
  uuid: string;
  concept: {
    uuid: string;
    display: string;
    answers: Array<ConceptAnswer>;
  };
}

export interface OpenmrsEncounter {
  uuid?: string;
  encounterDatetime?: string | Date;
  patient?: OpenmrsResource | string;
  location?: OpenmrsResource | string;
  encounterType?: OpenmrsResource | string;
  obs?: Array<OpenmrsObs>;
  orders?: Array<OpenmrsResource>;
  voided?: boolean;
  visit?: OpenmrsResource | string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  encounterProviders?: Array<Record<string, any>>;
  form?: OpenmrsFormResource;
}

export type SessionMode = 'edit' | 'enter' | 'view' | 'embedded-view';

export interface PostSubmissionAction {
  applyAction(
    formSession: {
      patient: fhir.Patient;
      encounters: Array<OpenmrsEncounter>;
      sessionMode: SessionMode;
    },
    config?: Record<string, unknown>,
    enabled?: string,
  ): void;
}

export interface OpenmrsObs extends OpenmrsResource {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  concept?: any;
  obsDatetime?: string | Date;
  obsGroup?: OpenmrsObs;
  groupMembers?: Array<OpenmrsObs>;
  comment?: string;
  location?: OpenmrsResource;
  order?: OpenmrsResource;
  encounter?: OpenmrsResource;
  voided?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  value?: any;
  formFieldPath?: string;
  formFieldNamespace?: string;
  status?: string;
  interpretation?: string;
}

export interface Program {
  uuid: string;
  name: string;
  allWorkflows: Array<ProgramWorkflow>;
}

export interface ProgramWorkflow {
  uuid: string;
  states: Array<ProgramState>;
  concept: {
    display: string;
    uuid: string;
  };
}

export interface DatePickerTypeOption {
  value: DatePickerType;
  label: string;
  defaultChecked: boolean;
}
