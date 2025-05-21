import type { OrderBasketItem } from '@openmrs/esm-patient-common-lib';

export interface RegimenDrugOrderStepRendererProps {
  patientUuid: string;
  stepId: string;
  encounterTypeUuid: string;
  metadata?: Record<string, any>;
}
export interface DrugOrderTemplate {
  uuid: string;
  name: string;
  drug: Drug;
  template: OrderTemplate;
}

export interface DispenseType {
  uuid: string;
  code?: string;
  display: string;
}

export interface OrderTemplate {
  type: string;
  dosingType: string;
  dosingInstructions: DosingInstructions;
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

export interface MedicationDosage extends Omit<CommonMedicationProps, 'value'> {
  value: number;
}

export type MedicationFrequency = CommonMedicationValueCoded;

export type MedicationRoute = CommonMedicationValueCoded;

export type MedicationInstructions = CommonMedicationProps;

export type DosingUnit = CommonMedicationValueCoded;

export type QuantityUnit = CommonMedicationValueCoded;

interface CommonMedicationProps {
  value: string;
  default?: boolean;
}

export interface CommonMedicationValueCoded extends CommonMedicationProps {
  valueCoded: string;
  names?: string[];
}

export interface Regimen {
  uuid: string;
  display: string;
}

export interface TherapeuticLine {
  openMrsUuid: string | null;
  sourceUuid?: string;
  sourceId?: string;
  sourceDisplay?: string;
  display?: string;
}

export interface Justification {
  uuid: string;
  display: string;
}

export interface Drug {
  uuid: string;
  display: string;
  dosageForms?: Array<{
    uuid: string;
    display: string;
  }>;
  strength?: string;
}

export interface DurationUnit {
  uuid: string;
  display: string;
  mapsTo: {
    uuid: string;
    duration: number;
  };
}
export interface Prescription {
  drug: Drug | null;
  dose: number;
  doseUnit: string;
  route: string;
  frequency: string;
  patientInstructions: string;
  asNeeded: boolean;
  asNeededCondition: string;
  duration: number;
  durationUnit: DurationUnit | null;
  quantity: number;
  quantityUnit: string;
  numRefills: number;
  indication: string;
  amtPerTime: number;
}

export interface AllowedDurationUnitType {
  uuid: string;
  display: string;
  duration: number;
  allowedDispenseTypes?: string[];
  mapsTo?: {
    uuid: string;
    duration: number;
  };
}

export interface DispenseType {
  uuid: string;
  display: string;
}
