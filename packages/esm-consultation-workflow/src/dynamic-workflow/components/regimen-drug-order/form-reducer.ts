import { ALLOWED_DURATIONS } from './constants';
import { Drug, Justification, Prescription, Regimen, TherapeuticLine, DurationUnit } from './types';

// Form state interface
export interface FormState {
  // Main form fields
  selectedRegimen: Regimen | null;
  selectedLine: TherapeuticLine | null;
  changeLine: string;
  selectedJustification: Justification | null;
  prescriptions: Prescription[];
  currentDrugIndex: number | null;
  finalDuration: any; // Using 'any' for now, will type more specifically later
  selectedDispenseType: string;
  emptyPrescription: Prescription;

  // Error states
  regimenError: string;
  lineError: string;
  justificationError: string;
  dispenseTypeError: string;
  prescriptionError: string;

  // API state
  isSaving: boolean;
  stepData: any;
}

// Action types
export enum ActionTypes {
  SET_REGIMEN = 'SET_REGIMEN',
  SET_LINE = 'SET_LINE',
  SET_CHANGE_LINE = 'SET_CHANGE_LINE',
  SET_JUSTIFICATION = 'SET_JUSTIFICATION',
  ADD_PRESCRIPTION = 'ADD_PRESCRIPTION',
  REMOVE_PRESCRIPTION = 'REMOVE_PRESCRIPTION',
  UPDATE_PRESCRIPTION = 'UPDATE_PRESCRIPTION',
  SET_DISPENSE_TYPE = 'SET_DISPENSE_TYPE',
  SET_FINAL_DURATION = 'SET_FINAL_DURATION',
  SET_CURRENT_DRUG_INDEX = 'SET_CURRENT_DRUG_INDEX',
  SET_SAVING = 'SET_SAVING',
  CLEAR_ERRORS = 'CLEAR_ERRORS',
  SET_ERROR = 'SET_ERROR',
  SET_STEP_DATA = 'SET_STEP_DATA',
}

// Action interfaces
export type FormAction =
  | { type: ActionTypes.SET_REGIMEN; payload: Regimen | null }
  | { type: ActionTypes.SET_LINE; payload: TherapeuticLine | null }
  | { type: ActionTypes.SET_CHANGE_LINE; payload: string }
  | { type: ActionTypes.SET_JUSTIFICATION; payload: Justification | null }
  | { type: ActionTypes.ADD_PRESCRIPTION }
  | { type: ActionTypes.REMOVE_PRESCRIPTION; payload: number }
  | { type: ActionTypes.UPDATE_PRESCRIPTION; payload: { index: number; field: string; value: any } }
  | { type: ActionTypes.SET_DISPENSE_TYPE; payload: string }
  | { type: ActionTypes.SET_FINAL_DURATION; payload: any }
  | { type: ActionTypes.SET_CURRENT_DRUG_INDEX; payload: number | null }
  | { type: ActionTypes.SET_SAVING; payload: boolean }
  | { type: ActionTypes.CLEAR_ERRORS }
  | { type: ActionTypes.SET_ERROR; payload: { field: string; message: string } }
  | { type: ActionTypes.SET_STEP_DATA; payload: any };

// Initial form state
export const initialFormState: FormState = {
  selectedRegimen: null,
  selectedLine: null,
  changeLine: 'false',
  selectedJustification: null,
  prescriptions: [],
  currentDrugIndex: null,
  finalDuration: null,
  selectedDispenseType: '',
  emptyPrescription: {
    drug: null,
    dose: 0,
    doseUnit: '',
    route: '',
    frequency: '',
    patientInstructions: '',
    asNeeded: false,
    asNeededCondition: '',
    duration: 0,
    durationUnit: null,
    quantity: 0,
    quantityUnit: '',
    numRefills: 0,
    indication: '',
    amtPerTime: 0,
  },

  // Error states
  regimenError: '',
  lineError: '',
  justificationError: '',
  dispenseTypeError: '',
  prescriptionError: '',

  // API state
  isSaving: false,
  stepData: null,
};

// Helper function to convert AllowedDurationUnitType to DurationUnit
function convertToDurationUnit(durationUnit: any): DurationUnit | null {
  if (!durationUnit || !durationUnit.mapsTo) {
    return null;
  }

  return {
    uuid: durationUnit.uuid,
    display: durationUnit.display,
    mapsTo: durationUnit.mapsTo,
  };
}

// Reducer function
export function formReducer(state: FormState, action: FormAction): FormState {
  switch (action.type) {
    case ActionTypes.SET_REGIMEN:
      return {
        ...state,
        selectedRegimen: action.payload,
        selectedLine: null,
        prescriptions: [],
        regimenError: '',
      };

    case ActionTypes.SET_LINE:
      return {
        ...state,
        selectedLine: action.payload,
        lineError: '',
      };

    case ActionTypes.SET_CHANGE_LINE:
      return {
        ...state,
        changeLine: action.payload,
      };

    case ActionTypes.SET_JUSTIFICATION:
      return {
        ...state,
        selectedJustification: action.payload,
        justificationError: '',
      };

    case ActionTypes.ADD_PRESCRIPTION: {
      const defaultDuration = ALLOWED_DURATIONS.find((unit) => unit.display === 'Um Mês');
      const durationUnitWithMapsTo = convertToDurationUnit(defaultDuration);

      return {
        ...state,
        prescriptions: [
          ...state.prescriptions,
          {
            ...state.emptyPrescription,
            durationUnit: durationUnitWithMapsTo,
          },
        ],
        prescriptionError: '',
      };
    }

    case ActionTypes.REMOVE_PRESCRIPTION: {
      const updatedPrescriptions = [...state.prescriptions];
      updatedPrescriptions.splice(action.payload, 1);

      return {
        ...state,
        prescriptions: updatedPrescriptions,
      };
    }

    case ActionTypes.UPDATE_PRESCRIPTION: {
      const { index, field, value } = action.payload;
      const updatedPrescriptions = [...state.prescriptions];

      if (field === 'drug') {
        const selectedDrug = value as Drug;
        if (selectedDrug) {
          const defaultDuration = ALLOWED_DURATIONS.find((unit) => unit.display === 'Um Mês');
          const durationUnitWithMapsTo = convertToDurationUnit(defaultDuration);

          updatedPrescriptions[index] = {
            ...updatedPrescriptions[index],
            drug: selectedDrug,
            durationUnit: updatedPrescriptions[index].durationUnit || durationUnitWithMapsTo,
          };
        }
      } else if (field === 'amtPerTime') {
        const numValue = value === '' || isNaN(Number(value)) ? 0 : Number(value);
        updatedPrescriptions[index] = {
          ...updatedPrescriptions[index],
          amtPerTime: numValue,
        };
      } else {
        updatedPrescriptions[index] = {
          ...updatedPrescriptions[index],
          [field]: value,
        };
      }

      return {
        ...state,
        prescriptions: updatedPrescriptions,
        prescriptionError: '',
      };
    }

    case ActionTypes.SET_DISPENSE_TYPE:
      return {
        ...state,
        selectedDispenseType: action.payload,
        dispenseTypeError: '',
      };

    case ActionTypes.SET_FINAL_DURATION:
      return {
        ...state,
        finalDuration: action.payload,
      };

    case ActionTypes.SET_CURRENT_DRUG_INDEX:
      return {
        ...state,
        currentDrugIndex: action.payload,
      };

    case ActionTypes.SET_SAVING:
      return {
        ...state,
        isSaving: action.payload,
      };

    case ActionTypes.CLEAR_ERRORS:
      return {
        ...state,
        regimenError: '',
        lineError: '',
        justificationError: '',
        dispenseTypeError: '',
        prescriptionError: '',
      };

    case ActionTypes.SET_ERROR:
      return {
        ...state,
        [action.payload.field]: action.payload.message,
      };

    case ActionTypes.SET_STEP_DATA:
      return {
        ...state,
        stepData: action.payload,
      };

    default:
      return state;
  }
}

// Helper function to recalculate finalDuration based on prescriptions
export function calculateFinalDuration(prescriptions: Prescription[]) {
  if (prescriptions.length === 0) {
    return null;
  }

  let maxDuration = 0;
  for (const prescription of prescriptions) {
    if (prescription.durationUnit?.uuid) {
      const currentDuration = ALLOWED_DURATIONS.find((unit) => unit.uuid === prescription.durationUnit.uuid);
      if (currentDuration) {
        maxDuration = Math.max(maxDuration, currentDuration.duration);
      }
    }
  }

  return ALLOWED_DURATIONS.find((unit) => unit.duration === maxDuration) || null;
}
