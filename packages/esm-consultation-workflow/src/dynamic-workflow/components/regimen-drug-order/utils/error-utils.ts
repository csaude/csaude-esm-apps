import { showSnackbar } from '@openmrs/esm-framework';
import { TFunction } from 'react-i18next';

/**
 * Error types that can occur in the regimen drug order component
 */
export enum ErrorType {
  API_ERROR = 'API_ERROR',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  EXTERNAL_SYSTEM_ERROR = 'EXTERNAL_SYSTEM_ERROR',
  DUPLICATE_ORDER_ERROR = 'DUPLICATE_ORDER_ERROR',
  ACTIVE_ORDER_ERROR = 'ACTIVE_ORDER_ERROR',
  SERVER_ERROR = 'SERVER_ERROR',
  GENERIC_ERROR = 'GENERIC_ERROR',
}

/**
 * Parsed error object with standardized structure
 */
export interface ParsedError {
  type: ErrorType;
  title: string;
  message: string;
  originalError?: any;
}

/**
 * Parse API error responses from OpenMRS to a standardized format
 * @param error - The error object from the API
 * @param t - Translation function
 * @returns ParsedError - A standardized error object
 */
export function parseApiError(error: any, t: TFunction): ParsedError {
  let errorType = ErrorType.API_ERROR;
  let errorTitle = t('saveFailed', 'Failed to save regimen and prescriptions');
  let errorMessage = '';

  if (!error) {
    return {
      type: ErrorType.GENERIC_ERROR,
      title: errorTitle,
      message: t('unknownError', 'An unknown error occurred'),
      originalError: error,
    };
  }

  try {
    // Handle cases with responseBody
    if (error.responseBody) {
      const errorData = error.responseBody;

      // Check for duplicate order error
      if (errorData.error?.message?.includes('[Order.cannot.have.more.than.one]')) {
        errorType = ErrorType.DUPLICATE_ORDER_ERROR;
        errorTitle = t('duplicateOrderError', 'Medicamento duplicado');
        errorMessage = t(
          'duplicateOrderErrorMessage',
          'Um ou mais medicamentos já estão prescritos para este paciente. Verifique as prescrições existentes.',
        );
      }
      // Check for active order error
      else if (errorData.message?.includes('already has an active order')) {
        errorType = ErrorType.ACTIVE_ORDER_ERROR;
        const drugNameMatch = errorData.message.match(/for drug ([^(]+)/);
        const drugName = drugNameMatch ? drugNameMatch[1].trim() : 'selecionado';

        errorTitle = t('activeOrderError', 'Prescrição ativa existente');
        errorMessage = t(
          'activeOrderErrorMessage',
          `O medicamento ${drugName} já tem uma prescrição ativa para este paciente.`,
        );
      }
      // Handle other API errors with details
      else if (errorData.code && errorData.detail) {
        errorMessage = `${errorData.message} (${errorData.code})`;
      } else {
        errorMessage = errorData.message || error.message;
      }
    }
    // Handle server communication errors
    else if (error.message?.includes('failed with status')) {
      errorType = ErrorType.SERVER_ERROR;
      errorMessage = t(
        'serverCommunicationError',
        'Erro de comunicação com o servidor. Verifique sua conexão e tente novamente.',
      );
    }
    // Handle other errors
    else {
      errorMessage = error.message;
    }
  } catch (parseError) {
    console.error('Error parsing API error:', parseError);
    errorMessage = error.message || t('unknownError', 'An unknown error occurred');
  }

  return {
    type: errorType,
    title: errorTitle,
    message: errorMessage,
    originalError: error,
  };
}

/**
 * Parse external system error responses
 * @param error - The error from the external system
 * @param t - Translation function
 * @returns ParsedError - A standardized error object
 */
export function parseExternalSystemError(error: any, t: TFunction): ParsedError {
  return {
    type: ErrorType.EXTERNAL_SYSTEM_ERROR,
    title: t('externalSystemError', 'Failed to send data to external system'),
    message: error.message || t('unknownError', 'An unknown error occurred'),
    originalError: error,
  };
}

/**
 * Create a validation error object
 * @param field - The field with the validation error
 * @param message - The validation error message
 * @returns ParsedError - A standardized error object
 */
export function createValidationError(field: string, message: string): ParsedError {
  return {
    type: ErrorType.VALIDATION_ERROR,
    title: `Validation error: ${field}`,
    message,
  };
}

/**
 * Display an error using the snackbar component
 * @param error - The parsed error object
 */
export function displayErrorSnackbar(error: ParsedError): void {
  showSnackbar({
    title: error.title,
    subtitle: error.message,
    kind: 'error',
    isLowContrast: false,
  });
}

/**
 * Create a success notification
 * @param title - The title of the success message
 * @param message - Optional message details
 */
export function displaySuccessSnackbar(title: string, message?: string): void {
  showSnackbar({
    title,
    subtitle: message,
    kind: 'success',
    isLowContrast: false,
  });
}

/**
 * Centralized error handling function that parses and displays an error
 * @param error - The error object to handle
 * @param t - Translation function
 * @param errorType - Optional error type to help with parsing
 */
export function handleError(error: any, t: TFunction, errorType: ErrorType = ErrorType.API_ERROR): void {
  console.error('Error in RegimenDrugOrderStepRenderer:', error);

  let parsedError: ParsedError;

  switch (errorType) {
    case ErrorType.EXTERNAL_SYSTEM_ERROR:
      parsedError = parseExternalSystemError(error, t);
      break;
    case ErrorType.API_ERROR:
    default:
      parsedError = parseApiError(error, t);
      break;
  }

  displayErrorSnackbar(parsedError);
}
