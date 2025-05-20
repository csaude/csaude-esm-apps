import { TFunction } from 'react-i18next';
import { createValidationError } from './error-utils';

/**
 * Validates the regimen form section
 * @param selectedRegimen - The selected regimen
 * @param selectedLine - The selected therapeutic line
 * @param changeLine - The change line selection
 * @param selectedJustification - The selected justification
 * @param t - Translation function
 * @returns Object containing validation result and error
 */
export function validateRegimenForm(
  selectedRegimen: any,
  selectedLine: any,
  changeLine: string,
  selectedJustification: any,
  t: TFunction,
): { isValid: boolean; error?: { field: string; message: string } } {
  if (!selectedRegimen) {
    return {
      isValid: false,
      error: {
        field: 'regimenError',
        message: t('regimenRequired', 'Regime TARV is required'),
      },
    };
  }

  if (!selectedLine) {
    return {
      isValid: false,
      error: {
        field: 'lineError',
        message: t('lineRequired', 'Linha Terapêutica is required'),
      },
    };
  }

  if (changeLine === 'true' && !selectedJustification) {
    return {
      isValid: false,
      error: {
        field: 'justificationError',
        message: t('justificationRequired', 'Motivo da alteração é obrigatório'),
      },
    };
  }

  return { isValid: true };
}

/**
 * Validates the prescription form section
 * @param prescriptions - The list of prescriptions
 * @param t - Translation function
 * @returns Object containing validation result and error
 */
export function validatePrescriptionForm(
  prescriptions: any[],
  t: TFunction,
): { isValid: boolean; error?: { field: string; message: string } } {
  if (prescriptions.length === 0) {
    return {
      isValid: false,
      error: {
        field: 'prescriptionError',
        message: t('medicationRequired', 'At least one prescription is required'),
      },
    };
  }

  for (const prescription of prescriptions) {
    if (!prescription.drug) {
      return {
        isValid: false,
        error: {
          field: 'prescriptionError',
          message: t('invalidPrescription', 'Please select a drug for all prescriptions'),
        },
      };
    }

    if (!prescription.frequency) {
      return {
        isValid: false,
        error: {
          field: 'prescriptionError',
          message: t('frequencyRequired', 'Por favor, selecione a toma para todas as prescrições'),
        },
      };
    }

    if (!prescription.durationUnit) {
      return {
        isValid: false,
        error: {
          field: 'prescriptionError',
          message: t('durationRequired', 'Please select a duration for all prescriptions'),
        },
      };
    }
  }

  return { isValid: true };
}

/**
 * Validates the dispense form section
 * @param selectedDispenseType - The selected dispense type
 * @param t - Translation function
 * @returns Object containing validation result and error
 */
export function validateDispenseForm(
  selectedDispenseType: string,
  t: TFunction,
): { isValid: boolean; error?: { field: string; message: string } } {
  if (!selectedDispenseType) {
    return {
      isValid: false,
      error: {
        field: 'dispenseTypeError',
        message: t('dispenseTypeRequired', 'Dispense Type is required'),
      },
    };
  }

  return { isValid: true };
}

/**
 * Validates the entire form
 * @param regimenFormState - The regimen form state
 * @param prescriptions - The list of prescriptions
 * @param selectedDispenseType - The selected dispense type
 * @param t - Translation function
 * @returns Object containing validation result and all errors
 */
export function validateFullForm(
  regimenFormState: {
    selectedRegimen: any;
    selectedLine: any;
    changeLine: string;
    selectedJustification: any;
  },
  prescriptions: any[],
  selectedDispenseType: string,
  t: TFunction,
): { isValid: boolean; errors: Array<{ field: string; message: string }> } {
  const errors: Array<{ field: string; message: string }> = [];

  // Validate regimen form
  const regimenValidation = validateRegimenForm(
    regimenFormState.selectedRegimen,
    regimenFormState.selectedLine,
    regimenFormState.changeLine,
    regimenFormState.selectedJustification,
    t,
  );

  if (!regimenValidation.isValid && regimenValidation.error) {
    errors.push(regimenValidation.error);
  }

  // Validate prescription form
  const prescriptionValidation = validatePrescriptionForm(prescriptions, t);
  if (!prescriptionValidation.isValid && prescriptionValidation.error) {
    errors.push(prescriptionValidation.error);
  }

  // Validate dispense form
  const dispenseValidation = validateDispenseForm(selectedDispenseType, t);
  if (!dispenseValidation.isValid && dispenseValidation.error) {
    errors.push(dispenseValidation.error);
  }

  return { isValid: errors.length === 0, errors };
}
