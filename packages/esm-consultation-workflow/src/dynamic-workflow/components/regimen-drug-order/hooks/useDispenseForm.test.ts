import { renderHook, act } from '@testing-library/react-hooks';
import { useDispenseForm } from './useDispenseForm';

describe('useDispenseForm', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useDispenseForm());

    expect(result.current.selectedDispenseType).toBe('');
    expect(result.current.dispenseTypeError).toBe('');
  });

  it('should handle dispense type change', () => {
    const { result } = renderHook(() => useDispenseForm());

    const dispenseType = 'DM';

    act(() => {
      result.current.handleDispenseTypeChange(dispenseType);
    });

    expect(result.current.selectedDispenseType).toBe(dispenseType);
    // Error should be cleared when dispense type changes
    expect(result.current.dispenseTypeError).toBe('');
  });

  it('should set dispense type error', () => {
    const { result } = renderHook(() => useDispenseForm());

    const errorMessage = 'Please select a dispense type';

    act(() => {
      result.current.setDispenseTypeError(errorMessage);
    });

    expect(result.current.dispenseTypeError).toBe(errorMessage);
  });

  it('should clear dispense type error', () => {
    const { result } = renderHook(() => useDispenseForm());

    // First set an error
    act(() => {
      result.current.setDispenseTypeError('Some error');
    });

    // Then clear it
    act(() => {
      result.current.clearDispenseTypeError();
    });

    expect(result.current.dispenseTypeError).toBe('');
  });

  it('should validate dispense form correctly - invalid case', () => {
    const mockT = jest.fn((key) => key);
    const { result } = renderHook(() => useDispenseForm());

    // With empty selectedDispenseType, should fail validation
    let isValid = result.current.validateDispenseForm(mockT);

    expect(isValid).toBe(false);
    expect(mockT).toHaveBeenCalledWith('dispenseTypeRequired', expect.any(String));
    expect(result.current.dispenseTypeError).toBe('dispenseTypeRequired');
  });

  it('should validate dispense form correctly - valid case', () => {
    const mockT = jest.fn((key) => key);
    const { result } = renderHook(() => useDispenseForm());

    // Set a valid dispense type
    act(() => {
      result.current.handleDispenseTypeChange('DM');
    });

    let isValid = result.current.validateDispenseForm(mockT);

    expect(isValid).toBe(true);
    // The error should not be set
    expect(result.current.dispenseTypeError).toBe('');
  });
});
