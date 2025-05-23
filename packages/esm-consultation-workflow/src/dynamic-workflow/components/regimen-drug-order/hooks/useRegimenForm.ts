import { useReducer, useCallback } from 'react';
import { Regimen, TherapeuticLine, Justification } from './types';

// Define state interface
interface RegimenFormState {
  selectedRegimen: Regimen | null;
  selectedLine: TherapeuticLine | null;
  changeLine: string;
  selectedJustification: Justification | null;
  regimenError: string;
  lineError: string;
  justificationError: string;
}

// Define action types
enum ActionTypes {
  SET_REGIMEN = 'SET_REGIMEN',
  SET_LINE = 'SET_LINE',
  SET_CHANGE_LINE = 'SET_CHANGE_LINE',
  SET_JUSTIFICATION = 'SET_JUSTIFICATION',
  SET_ERROR = 'SET_ERROR',
  CLEAR_ERRORS = 'CLEAR_ERRORS',
}

// Define action interface
type RegimenFormAction =
  | { type: ActionTypes.SET_REGIMEN; payload: Regimen | null }
  | { type: ActionTypes.SET_LINE; payload: TherapeuticLine | null }
  | { type: ActionTypes.SET_CHANGE_LINE; payload: string }
  | { type: ActionTypes.SET_JUSTIFICATION; payload: Justification | null }
  | {
      type: ActionTypes.SET_ERROR;
      payload: { field: 'regimenError' | 'lineError' | 'justificationError'; message: string };
    }
  | { type: ActionTypes.CLEAR_ERRORS };

// Initial state
const initialState: RegimenFormState = {
  selectedRegimen: null,
  selectedLine: null,
  changeLine: 'false',
  selectedJustification: null,
  regimenError: '',
  lineError: '',
  justificationError: '',
};

// Reducer function
function regimenFormReducer(state: RegimenFormState, action: RegimenFormAction): RegimenFormState {
  switch (action.type) {
    case ActionTypes.SET_REGIMEN:
      return {
        ...state,
        selectedRegimen: action.payload,
        selectedLine: null,
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
    case ActionTypes.SET_ERROR:
      return {
        ...state,
        [action.payload.field]: action.payload.message,
      };
    case ActionTypes.CLEAR_ERRORS:
      return {
        ...state,
        regimenError: '',
        lineError: '',
        justificationError: '',
      };
    default:
      return state;
  }
}

// Type for HTML select element events
type SelectEvent = React.ChangeEvent<HTMLSelectElement>;

// Custom hook
export function useRegimenForm() {
  const [state, dispatch] = useReducer(regimenFormReducer, initialState);

  // Handler for regimen change
  const handleRegimenChange = useCallback((event: SelectEvent) => {
    const selectedUuid = event.target.value;

    if (!selectedUuid) {
      dispatch({ type: ActionTypes.SET_REGIMEN, payload: null });
      return;
    }

    // Create a minimal regimen object with the selected UUID
    const selectedRegimen: Regimen = {
      uuid: selectedUuid,
      display: '', // In a real implementation, you would get this from your regimens array
    };

    dispatch({ type: ActionTypes.SET_REGIMEN, payload: selectedRegimen });
  }, []);

  // Handler for line change
  const handleLineChange = useCallback((event: SelectEvent) => {
    const selectedUuid = event.target ? event.target.value : event['uuid'];

    if (!selectedUuid) {
      dispatch({ type: ActionTypes.SET_LINE, payload: null });
      return;
    }

    // Create a minimal TherapeuticLine object with the selected UUID
    const selectedLine: TherapeuticLine = {
      uuid: selectedUuid,
      display: '',
      openMrsUuid: selectedUuid,
    };

    dispatch({ type: ActionTypes.SET_LINE, payload: selectedLine });
  }, []);

  // Handler for change line toggle
  const handleChangeLineChange = useCallback((value: string) => {
    dispatch({ type: ActionTypes.SET_CHANGE_LINE, payload: value });
  }, []);

  // Handler for justification change
  const handleJustificationChange = useCallback((event: SelectEvent) => {
    const selectedUuid = event.target.value;

    if (!selectedUuid) {
      dispatch({ type: ActionTypes.SET_JUSTIFICATION, payload: null });
      return;
    }

    // Create a minimal Justification object with the selected UUID
    const selectedJustification: Justification = {
      uuid: selectedUuid,
      display: '',
    };

    dispatch({ type: ActionTypes.SET_JUSTIFICATION, payload: selectedJustification });
  }, []);

  const setError = useCallback((field: 'regimenError' | 'lineError' | 'justificationError', message: string) => {
    dispatch({ type: ActionTypes.SET_ERROR, payload: { field, message } });
  }, []);

  const clearErrors = useCallback(() => {
    dispatch({ type: ActionTypes.CLEAR_ERRORS });
  }, []);

  // Validate just this part of the form
  const validateRegimenForm = useCallback(
    (t: (key: string, fallback: string) => string): boolean => {
      let isValid = true;

      if (!state.selectedRegimen) {
        setError('regimenError', t('regimenRequired', 'Regime TARV is required'));
        isValid = false;
      }

      if (!state.selectedLine) {
        setError('lineError', t('lineRequired', 'Linha Terapêutica is required'));
        isValid = false;
      }

      if (state.changeLine === 'true' && !state.selectedJustification) {
        setError('justificationError', t('justificationRequired', 'Motivo da alteração é obrigatório'));
        isValid = false;
      }

      return isValid;
    },
    [state.selectedRegimen, state.selectedLine, state.changeLine, state.selectedJustification, setError],
  );

  return {
    ...state,
    handleRegimenChange,
    handleLineChange,
    handleChangeLineChange,
    handleJustificationChange,
    setError,
    clearErrors,
    validateRegimenForm,
  };
}
