import { StepValidation } from '../types';

class ValidationService {
  // Validate a field against a specific validation rule
  validateField(value: any, validation: StepValidation): { valid: boolean; message?: string } {
    const { type, params, message } = validation;

    switch (type) {
      case 'required':
        return {
          valid: value !== undefined && value !== null && value !== '',
          message: !value ? message : undefined,
        };

      case 'format':
        if (!params || !params.pattern) {
          return { valid: true };
        }
        const regex = new RegExp(params.pattern);
        return {
          valid: regex.test(String(value)),
          message: !regex.test(String(value)) ? message : undefined,
        };

      case 'range':
        if (!params) {
          return { valid: true };
        }
        const { min, max } = params;
        const numValue = Number(value);
        const valid = (min === undefined || numValue >= min) && (max === undefined || numValue <= max);
        return { valid, message: !valid ? message : undefined };

      case 'custom':
        if (!params || !params.validatorFn) {
          return { valid: true };
        }
        try {
          // For custom validators, we could either:
          // 1. Use a function registry approach where custom validators are registered by name
          // 2. Support a string-based function that can be evaluated (with appropriate security measures)
          const validatorRegistry = this.getValidatorRegistry();
          const validator = validatorRegistry[params.validatorFn];
          if (!validator) {
            return { valid: true };
          }

          const isValid = validator(value, params.validatorParams);
          return { valid: isValid, message: !isValid ? message : undefined };
        } catch (error) {
          console.error('Error in custom validation:', error);
          return { valid: false, message: 'Validation error' };
        }

      default:
        return { valid: true };
    }
  }

  // Registry of predefined validator functions that can be referenced by name
  private getValidatorRegistry() {
    return {
      email: (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value),
      phone: (value: string) => /^\+?[0-9]{10,15}$/.test(value),
      dateAfter: (value: string, params: any) => {
        if (!params || !params.date) {
          return true;
        }
        const date1 = new Date(value);
        const date2 = new Date(params.date);
        return date1 > date2;
      },
      // Add more validators as needed
    };
  }

  // Validate all fields in a step
  validateStep(
    stepData: any,
    validations: StepValidation[],
  ): {
    valid: boolean;
    errors: { [field: string]: string };
  } {
    if (!validations || validations.length === 0) {
      return { valid: true, errors: {} };
    }

    const errors: { [field: string]: string } = {};
    let valid = true;

    // Group validations by field for more efficient processing
    const validationsByField = validations.reduce(
      (acc, validation) => {
        if (!acc[validation.field]) {
          acc[validation.field] = [];
        }
        acc[validation.field].push(validation);
        return acc;
      },
      {} as { [field: string]: StepValidation[] },
    );

    // Validate each field
    Object.entries(validationsByField).forEach(([field, fieldValidations]) => {
      const fieldValue = this.getNestedValue(stepData, field);

      // Apply validations in order until one fails
      for (const validation of fieldValidations) {
        const result = this.validateField(fieldValue, validation);
        if (!result.valid) {
          errors[field] = result.message || 'Invalid value';
          valid = false;
          break;
        }
      }
    });

    return { valid, errors };
  }

  // Support for nested field paths
  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((prev, curr) => prev && prev[curr], obj);
  }
}
