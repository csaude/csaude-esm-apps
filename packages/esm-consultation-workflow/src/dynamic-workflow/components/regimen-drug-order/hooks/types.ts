import type { AllowedDurationUnitType } from '../constants';

export interface Regimen {
  uuid: string;
  display: string;
}

export interface TherapeuticLine {
  uuid: string;
  display: string;
  openMrsUuid?: string;
  sourceUuid?: string;
  sourceId?: string;
  sourceDisplay?: string;
}

export interface Justification {
  uuid: string;
  display: string;
}

export interface Drug {
  uuid: string;
  display: string;
  strength?: number;
}

export interface Prescription {
  drug: Drug | null;
  dose?: number;
  doseUnit?: string;
  route?: string;
  frequency?: string;
  patientInstructions?: string;
  asNeeded?: boolean;
  asNeededCondition?: string;
  duration?: number;
  durationUnit: AllowedDurationUnitType | null;
  quantity?: number;
  quantityUnit?: string;
  numRefills?: number;
  indication?: string;
  amtPerTime?: number;
}
