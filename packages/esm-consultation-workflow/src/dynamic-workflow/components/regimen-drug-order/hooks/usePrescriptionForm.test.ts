import { renderHook, act } from '@testing-library/react-hooks';
import { usePrescriptionForm } from './usePrescriptionForm';
import { ALLOWED_DURATIONS } from '../constants';

// Mock data
const mockDrugs = [
  {
    uuid: 'drug-uuid-1',
    display: 'Tenofovir 300mg',
    strength: 300,
  },
  {
    uuid: 'drug-uuid-2',
    display: 'Lamivudine 150mg',
    strength: 150,
  },
];

describe('usePrescriptionForm', () => {
  it('should initialize with empty prescriptions', () => {
    const { result } = renderHook(() => usePrescriptionForm(mockDrugs));

    expect(result.current.prescriptions).toEqual([]);
    expect(result.current.finalDuration).toBeNull();
  });

  it('should add an empty prescription with default duration', () => {
    const { result } = renderHook(() => usePrescriptionForm(mockDrugs));

    act(() => {
      result.current.addEmptyPrescription();
    });

    expect(result.current.prescriptions.length).toBe(1);

    // Check that default duration is set to "Um Mês" (One Month)
    const defaultDuration = ALLOWED_DURATIONS.find((unit) => unit.display === 'Um Mês');
    expect(result.current.prescriptions[0].durationUnit).toEqual(defaultDuration);
  });

  it('should remove a prescription', () => {
    const { result } = renderHook(() => usePrescriptionForm(mockDrugs));

    act(() => {
      result.current.addEmptyPrescription();
      result.current.addEmptyPrescription();
    });

    expect(result.current.prescriptions.length).toBe(2);

    act(() => {
      result.current.removePrescription(0);
    });

    expect(result.current.prescriptions.length).toBe(1);
  });

  it('should update a prescription drug field', () => {
    const { result } = renderHook(() => usePrescriptionForm(mockDrugs));

    act(() => {
      result.current.addEmptyPrescription();
    });

    act(() => {
      result.current.updatePrescription(0, 'drug', mockDrugs[0]);
    });

    expect(result.current.prescriptions[0].drug).toEqual(mockDrugs[0]);
  });

  it('should update amtPerTime as number', () => {
    const { result } = renderHook(() => usePrescriptionForm(mockDrugs));

    act(() => {
      result.current.addEmptyPrescription();
    });

    act(() => {
      result.current.updatePrescription(0, 'amtPerTime', '2');
    });

    expect(result.current.prescriptions[0].amtPerTime).toBe(2);
  });

  it('should calculate final duration based on maximum duration of prescriptions', () => {
    const { result } = renderHook(() => usePrescriptionForm(mockDrugs));

    // Add first prescription with "Um Mês" (30 days)
    act(() => {
      result.current.addEmptyPrescription();
    });

    // Add second prescription with "Dois Meses" (60 days)
    act(() => {
      result.current.addEmptyPrescription();
    });

    const twoMonthDuration = ALLOWED_DURATIONS.find((unit) => unit.display === 'Dois Meses');

    act(() => {
      result.current.updatePrescription(1, 'durationUnit', twoMonthDuration);
    });

    // This should trigger the finalDuration calculation
    act(() => {
      result.current.calculateAndUpdateFinalDuration();
    });

    // Final duration should be the maximum (60 days)
    expect(result.current.finalDuration).toEqual(twoMonthDuration);
  });

  it('should validate prescriptions correctly', () => {
    const mockT = jest.fn((key) => key);
    const { result } = renderHook(() => usePrescriptionForm(mockDrugs));

    // Should fail with no prescriptions
    let isValid = result.current.validatePrescriptionForm(mockT);
    expect(isValid).toBe(false);
    expect(mockT).toHaveBeenCalledWith('medicationRequired', expect.any(String));

    // Add a prescription but without required fields
    act(() => {
      result.current.addEmptyPrescription();
    });

    mockT.mockClear();
    isValid = result.current.validatePrescriptionForm(mockT);
    expect(isValid).toBe(false);
    expect(mockT).toHaveBeenCalledWith('invalidPrescription', expect.any(String));

    // Update with drug but still missing frequency
    act(() => {
      result.current.updatePrescription(0, 'drug', mockDrugs[0]);
    });

    mockT.mockClear();
    isValid = result.current.validatePrescriptionForm(mockT);
    expect(isValid).toBe(false);
    expect(mockT).toHaveBeenCalledWith('frequencyRequired', expect.any(String));

    // Add frequency - should be valid now since durationUnit is set by default
    act(() => {
      result.current.updatePrescription(0, 'frequency', 'QD');
    });

    mockT.mockClear();
    isValid = result.current.validatePrescriptionForm(mockT);
    expect(isValid).toBe(true);
  });
});
