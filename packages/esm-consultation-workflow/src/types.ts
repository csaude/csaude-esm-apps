type StepProps<T> = {
  values: T;
  setValues: (values: T) => unknown;
};

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

export type OpportunisticInfections = {
  otherDiagnistics: string;
  otherDiagnosticsNonCoded: string;
  currentWhoStage: string;
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
