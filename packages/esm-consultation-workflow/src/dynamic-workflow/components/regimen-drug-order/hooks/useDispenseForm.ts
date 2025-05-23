import { useReducer, useCallback } from 'react';

// Define state interface
interface DispenseFormState {
  selectedDispenseType: string;
  dispenseTypeError: string;
}

// Define action types
enum ActionTypes {
  SET_DISPENSE_TYPE = 'SET_DISPENSE_TYPE',
  SET_ERROR = 'SET_ERROR',
  CLEAR_ERROR = 'CLEAR_ERROR',
}

// Define action interface
type DispenseFormAction =
  | { type: ActionTypes.SET_DISPENSE_TYPE; payload: string }
  | { type: ActionTypes.SET_ERROR; payload: string }
  | { type: ActionTypes.CLEAR_ERROR };

// Initial state
const initialState: DispenseFormState = {
  selectedDispenseType: '',
  dispenseTypeError: '',
};

// Reducer function
function dispenseFormReducer(state: DispenseFormState, action: DispenseFormAction): DispenseFormState {
  switch (action.type) {
    case ActionTypes.SET_DISPENSE_TYPE:
      return {
        ...state,
        selectedDispenseType: action.payload,
        dispenseTypeError: '',
      };
    case ActionTypes.SET_ERROR:
      return {
        ...state,
        dispenseTypeError: action.payload,
      };
    case ActionTypes.CLEAR_ERROR:
      return {
        ...state,
        dispenseTypeError: '',
      };
    default:
      return state;
  }
}

// Custom hook
export function useDispenseForm() {
  const [state, dispatch] = useReducer(dispenseFormReducer, initialState);

  // Handler functions
  const handleDispenseTypeChange = useCallback((dispenseType: string) => {
    dispatch({ type: ActionTypes.SET_DISPENSE_TYPE, payload: dispenseType });
  }, []);

  const setDispenseTypeError = useCallback((message: string) => {
    dispatch({ type: ActionTypes.SET_ERROR, payload: message });
  }, []);

  const clearDispenseTypeError = useCallback(() => {
    dispatch({ type: ActionTypes.CLEAR_ERROR });
  }, []);

  // Validate just this part of the form
  const validateDispenseForm = useCallback(
    (t: (key: string, fallback: string) => string): boolean => {
      let isValid = true;

      if (!state.selectedDispenseType) {
        setDispenseTypeError(t('dispenseTypeRequired', 'Dispense Type is required'));
        isValid = false;
      }

      return isValid;
    },
    [state.selectedDispenseType, setDispenseTypeError],
  );

  return {
    ...state,
    handleDispenseTypeChange,
    setDispenseTypeError,
    clearDispenseTypeError,
    validateDispenseForm,
  };
}
