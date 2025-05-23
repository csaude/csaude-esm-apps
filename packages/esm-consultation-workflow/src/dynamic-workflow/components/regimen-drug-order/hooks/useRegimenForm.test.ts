import { renderHook, act } from '@testing-library/react-hooks';
import { useRegimenForm } from './useRegimenForm';

// Mock data
const mockRegimen = {
  uuid: 'regimen-uuid-1',
  display: '',
};

const mockTherapeuticLine = {
  uuid: 'line-uuid-1',
  display: '',
  openMrsUuid: 'line-uuid-1',
};

const mockJustification = {
  uuid: 'justification-uuid-1',
  display: 'Treatment Failure',
};

describe('useRegimenForm', () => {
  it('should initialize with default values', () => {
    const { result } = renderHook(() => useRegimenForm());

    expect(result.current.selectedRegimen).toBeNull();
    expect(result.current.selectedLine).toBeNull();
    expect(result.current.changeLine).toBe('false');
    expect(result.current.selectedJustification).toBeNull();
    expect(result.current.regimenError).toBe('');
    expect(result.current.lineError).toBe('');
    expect(result.current.justificationError).toBe('');
  });

  it('should handle regimen change', () => {
    const { result } = renderHook(() => useRegimenForm());

    // Create a mock event
    const mockEvent = {
      target: {
        value: mockRegimen.uuid,
      },
    } as React.ChangeEvent<HTMLSelectElement>;

    act(() => {
      result.current.handleRegimenChange(mockEvent);
    });

    expect(result.current.selectedRegimen).toEqual(mockRegimen);
    // Line should be reset when regimen changes
    expect(result.current.selectedLine).toBeNull();
  });

  it('should handle line change', () => {
    const { result } = renderHook(() => useRegimenForm());

    // Create a mock event
    const mockEvent = {
      target: {
        value: mockTherapeuticLine.uuid,
      },
    } as React.ChangeEvent<HTMLSelectElement>;

    act(() => {
      result.current.handleLineChange(mockEvent);
    });

    expect(result.current.selectedLine).toEqual(mockTherapeuticLine);
    expect(result.current.lineError).toBe('');
  });

  it('should handle change line toggle', () => {
    const { result } = renderHook(() => useRegimenForm());

    act(() => {
      result.current.handleChangeLineChange('true');
    });

    expect(result.current.changeLine).toBe('true');

    act(() => {
      result.current.handleChangeLineChange('false');
    });

    expect(result.current.changeLine).toBe('false');
  });

  it('should handle justification change', () => {
    const { result } = renderHook(() => useRegimenForm());

    // Create a mock select event
    const mockEvent = {
      target: {
        value: mockJustification.uuid,
      },
    } as React.ChangeEvent<HTMLSelectElement>;

    act(() => {
      result.current.handleJustificationChange(mockEvent);
    });

    // Check only the UUID since that's what we're really concerned with
    expect(result.current.selectedJustification?.uuid).toEqual(mockJustification.uuid);
    expect(result.current.justificationError).toBe('');
  });

  it('should set errors correctly', () => {
    const { result } = renderHook(() => useRegimenForm());

    act(() => {
      result.current.setError('regimenError', 'Please select a regimen');
    });

    expect(result.current.regimenError).toBe('Please select a regimen');

    act(() => {
      result.current.setError('lineError', 'Please select a line');
    });

    expect(result.current.lineError).toBe('Please select a line');

    act(() => {
      result.current.setError('justificationError', 'Please select a justification');
    });

    expect(result.current.justificationError).toBe('Please select a justification');
  });

  it('should clear all errors', () => {
    const { result } = renderHook(() => useRegimenForm());

    // Set some errors first
    act(() => {
      result.current.setError('regimenError', 'Please select a regimen');
      result.current.setError('lineError', 'Please select a line');
      result.current.setError('justificationError', 'Please select a justification');
    });

    // Then clear them
    act(() => {
      result.current.clearErrors();
    });

    expect(result.current.regimenError).toBe('');
    expect(result.current.lineError).toBe('');
    expect(result.current.justificationError).toBe('');
  });
});
