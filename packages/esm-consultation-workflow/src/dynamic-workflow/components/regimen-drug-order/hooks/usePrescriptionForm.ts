import { useReducer, useCallback, useMemo } from 'react';
import { ALLOWED_DURATIONS, type AllowedDurationUnitType } from '../constants';

// Define types needed for the hook
interface Drug {
  uuid: string;
  display: string;
  strength?: number;
}

interface Prescription {
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

// Define state interface
interface PrescriptionFormState {
  prescriptions: Prescription[];
  currentDrugIndex: number | null;
  finalDuration: AllowedDurationUnitType | null;
  prescriptionError: string;
  emptyPrescription: Prescription;
}

// Define action types
enum ActionTypes {
  ADD_PRESCRIPTION = 'ADD_PRESCRIPTION',
  REMOVE_PRESCRIPTION = 'REMOVE_PRESCRIPTION',
  UPDATE_PRESCRIPTION = 'UPDATE_PRESCRIPTION',
  SET_CURRENT_DRUG_INDEX = 'SET_CURRENT_DRUG_INDEX',
  SET_FINAL_DURATION = 'SET_FINAL_DURATION',
  SET_ERROR = 'SET_ERROR',
  CLEAR_ERROR = 'CLEAR_ERROR',
}

// Define action interface
type PrescriptionFormAction =
  | { type: ActionTypes.ADD_PRESCRIPTION }
  | { type: ActionTypes.REMOVE_PRESCRIPTION; payload: number }
  | { type: ActionTypes.UPDATE_PRESCRIPTION; payload: { index: number; field: string; value: any } }
  | { type: ActionTypes.SET_CURRENT_DRUG_INDEX; payload: number | null }
  | { type: ActionTypes.SET_FINAL_DURATION; payload: any }
  | { type: ActionTypes.SET_ERROR; payload: string }
  | { type: ActionTypes.CLEAR_ERROR };

// Initial state
const initialState: PrescriptionFormState = {
  prescriptions: [],
  currentDrugIndex: null,
  finalDuration: null,
  prescriptionError: '',
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
};

// Reducer function
function prescriptionFormReducer(state: PrescriptionFormState, action: PrescriptionFormAction): PrescriptionFormState {
  switch (action.type) {
    case ActionTypes.ADD_PRESCRIPTION: {
      const defaultDuration = ALLOWED_DURATIONS.find((unit) => unit.display === 'Um Mês');

      return {
        ...state,
        prescriptions: [
          ...state.prescriptions,
          {
            ...state.emptyPrescription,
            durationUnit: defaultDuration || ALLOWED_DURATIONS[2],
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
        const selectedDrug = value as Drug | null;

        const defaultDuration = ALLOWED_DURATIONS.find((unit) => unit.display === 'Um Mês');

        updatedPrescriptions[index] = {
          ...updatedPrescriptions[index],
          drug: selectedDrug,
          durationUnit: updatedPrescriptions[index].durationUnit || defaultDuration || ALLOWED_DURATIONS[2],
        };
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
    case ActionTypes.SET_CURRENT_DRUG_INDEX:
      return {
        ...state,
        currentDrugIndex: action.payload,
      };
    case ActionTypes.SET_FINAL_DURATION:
      return {
        ...state,
        finalDuration: action.payload,
      };
    case ActionTypes.SET_ERROR:
      return {
        ...state,
        prescriptionError: action.payload,
      };
    case ActionTypes.CLEAR_ERROR:
      return {
        ...state,
        prescriptionError: '',
      };
    default:
      return state;
  }
}

// Custom hook
export function usePrescriptionForm() {
  const [state, dispatch] = useReducer(prescriptionFormReducer, initialState);

  // Use useMemo to derive finalDuration from prescriptions
  const finalDurationMemo = useMemo(() => {
    if (state.prescriptions.length === 0) {
      return null;
    }

    let maxDuration = 0;
    for (const prescription of state.prescriptions) {
      if (prescription.durationUnit?.uuid) {
        const currentDuration = ALLOWED_DURATIONS.find((unit) => unit.uuid === prescription.durationUnit.uuid);
        if (currentDuration) {
          maxDuration = Math.max(maxDuration, currentDuration.duration);
        }
      }
    }

    return ALLOWED_DURATIONS.find((unit) => unit.duration === maxDuration);
  }, [state.prescriptions]);

  // Handler functions
  const addEmptyPrescription = useCallback(() => {
    dispatch({ type: ActionTypes.ADD_PRESCRIPTION });
  }, []);

  const removePrescription = useCallback((index: number) => {
    dispatch({ type: ActionTypes.REMOVE_PRESCRIPTION, payload: index });
  }, []);

  const updatePrescription = useCallback((index: number, field: string, value: any) => {
    dispatch({
      type: ActionTypes.UPDATE_PRESCRIPTION,
      payload: { index, field, value },
    });
  }, []);

  const setPrescriptionError = useCallback((message: string) => {
    dispatch({ type: ActionTypes.SET_ERROR, payload: message });
  }, []);

  // Validate just this part of the form
  const validatePrescriptionForm = useCallback(
    (t: (key: string, fallback: string) => string): boolean => {
      let isValid = true;

      if (state.prescriptions.length === 0) {
        setPrescriptionError(t('medicationRequired', 'At least one prescription is required'));
        isValid = false;
      } else {
        for (const prescription of state.prescriptions) {
          if (!prescription.drug) {
            setPrescriptionError(t('invalidPrescription', 'Please select a drug for all prescriptions'));
            isValid = false;
            break;
          }

          if (!prescription.frequency) {
            setPrescriptionError(t('frequencyRequired', 'Por favor, selecione a toma para todas as prescrições'));
            isValid = false;
            break;
          }

          if (!prescription.durationUnit) {
            setPrescriptionError(t('durationRequired', 'Please select a duration for all prescriptions'));
            isValid = false;
            break;
          }
        }
      }

      return isValid;
    },
    [state.prescriptions, setPrescriptionError],
  );

  return {
    ...state,
    addEmptyPrescription,
    removePrescription,
    updatePrescription,
    setPrescriptionError,
    validatePrescriptionForm,
    calculateAndUpdateFinalDuration: useCallback(() => {
      // Update the state based on the memoized calculation when they differ
      if (finalDurationMemo !== state.finalDuration) {
        dispatch({ type: ActionTypes.SET_FINAL_DURATION, payload: finalDurationMemo });
      }
    }, [finalDurationMemo, state.finalDuration, dispatch]),
  };
}
