import { ActionTypes, FormState } from './form-reducer';

// Helper function to validate the form
export function validateForm(
  state: FormState,
  dispatch: React.Dispatch<any>,
  t: (key: string, fallback: string) => string,
): boolean {
  let isValid = true;

  // Clear previous errors
  dispatch({ type: ActionTypes.CLEAR_ERRORS });

  if (!state.selectedRegimen) {
    dispatch({
      type: ActionTypes.SET_ERROR,
      payload: { field: 'regimenError', message: t('regimenRequired', 'Regime TARV is required') },
    });
    isValid = false;
  }

  if (!state.selectedLine) {
    dispatch({
      type: ActionTypes.SET_ERROR,
      payload: { field: 'lineError', message: t('lineRequired', 'Linha Terapêutica is required') },
    });
    isValid = false;
  }

  if (state.changeLine === 'true' && !state.selectedJustification) {
    dispatch({
      type: ActionTypes.SET_ERROR,
      payload: {
        field: 'justificationError',
        message: t('justificationRequired', 'Motivo da alteração é obrigatório'),
      },
    });
    isValid = false;
  }

  if (!state.selectedDispenseType) {
    dispatch({
      type: ActionTypes.SET_ERROR,
      payload: {
        field: 'dispenseTypeError',
        message: t('dispenseTypeRequired', 'Dispense Type is required'),
      },
    });
    isValid = false;
  }

  if (state.prescriptions.length === 0) {
    dispatch({
      type: ActionTypes.SET_ERROR,
      payload: {
        field: 'prescriptionError',
        message: t('medicationRequired', 'At least one prescription is required'),
      },
    });
    isValid = false;
  } else {
    for (const prescription of state.prescriptions) {
      if (!prescription.drug) {
        dispatch({
          type: ActionTypes.SET_ERROR,
          payload: {
            field: 'prescriptionError',
            message: t('invalidPrescription', 'Please select a drug for all prescriptions'),
          },
        });
        isValid = false;
        break;
      }

      if (!prescription.frequency) {
        dispatch({
          type: ActionTypes.SET_ERROR,
          payload: {
            field: 'prescriptionError',
            message: t('frequencyRequired', 'Por favor, selecione a toma para todas as prescrições'),
          },
        });
        isValid = false;
        break;
      }

      if (!prescription.durationUnit) {
        dispatch({
          type: ActionTypes.SET_ERROR,
          payload: {
            field: 'prescriptionError',
            message: t('durationRequired', 'Please select a duration for all prescriptions'),
          },
        });
        isValid = false;
        break;
      }
    }
  }

  return isValid;
}
