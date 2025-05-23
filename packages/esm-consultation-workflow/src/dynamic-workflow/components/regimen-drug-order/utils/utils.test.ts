import { validateFullForm, handleError, displaySuccessSnackbar, ErrorType } from '../utils';
import { showSnackbar } from '@openmrs/esm-framework';

// Mock the dependencies
jest.mock('@openmrs/esm-framework', () => ({
  showSnackbar: jest.fn(),
}));

describe('Regimen Drug Order Utilities', () => {
  const mockT = jest.fn((key) => key);

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('validateFullForm', () => {
    it('should validate a valid complete form', () => {
      const regimenFormState = {
        selectedRegimen: { uuid: 'regimen-uuid', display: 'TDF+3TC+DTG' },
        selectedLine: { uuid: 'line-uuid', display: 'First Line' },
        changeLine: 'false',
        selectedJustification: null,
      };

      const prescriptions = [
        {
          drug: { uuid: 'drug-uuid', display: 'TDF' },
          frequency: 'QD',
          durationUnit: { uuid: 'duration-uuid', display: 'One Month', duration: 30 },
          amtPerTime: 1,
        },
      ];

      const selectedDispenseType = 'DM';

      const result = validateFullForm(regimenFormState, prescriptions, selectedDispenseType, mockT);

      expect(result.isValid).toBe(true);
      expect(result.errors).toEqual([]);
    });

    it('should invalidate a form with missing regimen', () => {
      const regimenFormState = {
        selectedRegimen: null,
        selectedLine: { uuid: 'line-uuid', display: 'First Line' },
        changeLine: 'false',
        selectedJustification: null,
      };

      const prescriptions = [
        {
          drug: { uuid: 'drug-uuid', display: 'TDF' },
          frequency: 'QD',
          durationUnit: { uuid: 'duration-uuid', display: 'One Month', duration: 30 },
          amtPerTime: 1,
        },
      ];

      const selectedDispenseType = 'DM';

      const result = validateFullForm(regimenFormState, prescriptions, selectedDispenseType, mockT);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'regimenError',
        message: expect.any(String),
      });
    });

    it('should invalidate a form with missing therapeutic line', () => {
      const regimenFormState = {
        selectedRegimen: { uuid: 'regimen-uuid', display: 'TDF+3TC+DTG' },
        selectedLine: null,
        changeLine: 'false',
        selectedJustification: null,
      };

      const prescriptions = [
        {
          drug: { uuid: 'drug-uuid', display: 'TDF' },
          frequency: 'QD',
          durationUnit: { uuid: 'duration-uuid', display: 'One Month', duration: 30 },
          amtPerTime: 1,
        },
      ];

      const selectedDispenseType = 'DM';

      const result = validateFullForm(regimenFormState, prescriptions, selectedDispenseType, mockT);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'lineError',
        message: expect.any(String),
      });
    });

    it('should invalidate a form when changeLine is true but no justification', () => {
      const regimenFormState = {
        selectedRegimen: { uuid: 'regimen-uuid', display: 'TDF+3TC+DTG' },
        selectedLine: { uuid: 'line-uuid', display: 'First Line' },
        changeLine: 'true',
        selectedJustification: null,
      };

      const prescriptions = [
        {
          drug: { uuid: 'drug-uuid', display: 'TDF' },
          frequency: 'QD',
          durationUnit: { uuid: 'duration-uuid', display: 'One Month', duration: 30 },
          amtPerTime: 1,
        },
      ];

      const selectedDispenseType = 'DM';

      const result = validateFullForm(regimenFormState, prescriptions, selectedDispenseType, mockT);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'justificationError',
        message: expect.any(String),
      });
    });

    it('should invalidate a form with no prescriptions', () => {
      const regimenFormState = {
        selectedRegimen: { uuid: 'regimen-uuid', display: 'TDF+3TC+DTG' },
        selectedLine: { uuid: 'line-uuid', display: 'First Line' },
        changeLine: 'false',
        selectedJustification: null,
      };

      const prescriptions = [];

      const selectedDispenseType = 'DM';

      const result = validateFullForm(regimenFormState, prescriptions, selectedDispenseType, mockT);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'prescriptionError',
        message: expect.any(String),
      });
    });

    it('should invalidate a form with no dispense type', () => {
      const regimenFormState = {
        selectedRegimen: { uuid: 'regimen-uuid', display: 'TDF+3TC+DTG' },
        selectedLine: { uuid: 'line-uuid', display: 'First Line' },
        changeLine: 'false',
        selectedJustification: null,
      };

      const prescriptions = [
        {
          drug: { uuid: 'drug-uuid', display: 'TDF' },
          frequency: 'QD',
          durationUnit: { uuid: 'duration-uuid', display: 'One Month', duration: 30 },
          amtPerTime: 1,
        },
      ];

      const selectedDispenseType = '';

      const result = validateFullForm(regimenFormState, prescriptions, selectedDispenseType, mockT);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContainEqual({
        field: 'dispenseTypeError',
        message: expect.any(String),
      });
    });
  });

  describe('handleError', () => {
    it('should show an API error snackbar', () => {
      const error = new Error('API error message');
      handleError(error, mockT, ErrorType.API_ERROR);

      expect(showSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: 'error',
          title: expect.any(String),
          subtitle: expect.stringContaining('API error message'),
        }),
      );
    });

    it('should show an external system error snackbar', () => {
      const error = new Error('External system error');
      handleError(error, mockT, ErrorType.EXTERNAL_SYSTEM_ERROR);

      expect(showSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: 'error',
          title: expect.any(String),
          subtitle: expect.stringContaining('External system error'),
        }),
      );
    });
  });

  describe('displaySuccessSnackbar', () => {
    it('should show a success snackbar with the provided message', () => {
      const message = 'Operation successful';
      displaySuccessSnackbar(message);

      expect(showSnackbar).toHaveBeenCalledWith(
        expect.objectContaining({
          kind: 'success',
          title: expect.stringContaining(message),
        }),
      );
    });
  });
});
