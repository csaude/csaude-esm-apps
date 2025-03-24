type StepProps<T> = {
  values: T;
  setValues: (values: T) => unknown;
};

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

/**
 * Represents a wizard step with form fields to be filled by the user.
 */
export type StepFormComponent<T> = React.FC<StepProps<T>>;

export type ConceptAnswer = {
  uuid: string;
  display: string;
};

export type Concept = {
  display: string;
  answers: ConceptAnswer[];
};

export type AvaliacaoDeAdesao = {
  adherence: string;
  arvSideEffects: string[];
  inhSideEffect: string;
  ctzSideEffect: string;
};

export type AvaliacaoNutricional = {
  indicator: string;
  classificationOfMalnutrition: string;
};

export type RastreioIts = {
  stiScreening: string;
  sti: string;
};

export type Pregnancy = {
  pregnancy: string;
  lastMenstruationDate: Date;
  lactating: string;
  birthControl: string[];
  otherBirthControl: string;
};

export type RastreioTb = {
  tbObservations: string[];
  tbSymptoms: string;
};

export type Profilaxia = {
  regimen: string;
  dispensationMode: string;
  treatmentStatus: string;
  nextPickupDate: Date;
};

export type Mds = {
  eligible: string;
  mds: string;
  mdsStage: string;
  otherModel: string;
};

export type Referencias = {
  referralsOrdered: string;
  otherReferral: string;
  eligibleSupportGroup: string;
  reveletedChildren: string;
  fathersAndCaregivers: string;
  reveletedAdolescents: string;
  motherToMother: string;
  mentoringMother: string;
  youthAndTeenageMenthor: string;
  championMan: string;
  otherSupportGroup: string;
};
