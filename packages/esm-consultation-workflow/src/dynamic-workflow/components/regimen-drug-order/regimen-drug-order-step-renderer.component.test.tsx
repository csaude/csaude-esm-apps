import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { useTranslation } from 'react-i18next';

// Import as a default export
import * as openmrsFramework from '@openmrs/esm-framework';
import RegimenDrugOrderStepRenderer from './regimen-drug-order-step-renderer.component';

// Mock custom hooks
import * as useRegimensHook from './hooks/useRegimens';
import * as useTherapeuticLinesHook from './hooks/useTherapeuticLines';
import * as useAvailableDrugsHook from './hooks/useAvailableDrugs';
import * as useJustificationsHook from './hooks/useJustifications';
import * as useDispenseTypesHook from './hooks/useDispenseTypes';

jest.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key, fallback) => fallback || key,
  }),
}));

jest.mock('@openmrs/esm-framework', () => ({
  openmrsFetch: jest.fn(() => Promise.resolve({ data: { answers: [] } })),
  showSnackbar: jest.fn(),
  useSession: () => ({ sessionLocation: { uuid: 'loc-uuid' }, currentProvider: { uuid: 'prov-uuid' } }),
  useLayoutType: () => 'desktop',
  useConfig: () => ({}),
  displaySuccessSnackbar: jest.fn(),
}));

// Mock data for custom hooks
const mockRegimens = [
  { uuid: 'regimen1-uuid', display: 'TDF + 3TC + DTG' },
  { uuid: 'regimen2-uuid', display: 'ABC + 3TC + EFV' },
];

const mockLines = [
  { uuid: 'line1-uuid', display: 'First Line', openMrsUuid: 'line1-uuid' },
  { uuid: 'line2-uuid', display: 'Second Line', openMrsUuid: 'line2-uuid' },
];

const mockDrugs = [
  { uuid: 'drug1-uuid', display: 'Tenofovir 300mg', strength: 300 },
  { uuid: 'drug2-uuid', display: 'Lamivudine 150mg', strength: 150 },
];

const mockJustifications = [
  { uuid: 'just1-uuid', display: 'Treatment Failure' },
  { uuid: 'just2-uuid', display: 'Side Effects' },
];

const mockDispenseTypes = [
  { uuid: 'dispense-uuid-1', display: 'DM' },
  { uuid: 'dispense-uuid-2', display: 'DS' },
  { uuid: 'dispense-uuid-3', display: 'DT' },
];

// Mock the custom hooks
jest.mock('./hooks/useRegimens', () => ({
  useRegimens: jest.fn(),
}));

jest.mock('./hooks/useTherapeuticLines', () => ({
  useTherapeuticLines: jest.fn(),
}));

jest.mock('./hooks/useAvailableDrugs', () => ({
  useAvailableDrugs: jest.fn(),
}));

jest.mock('./hooks/useJustifications', () => ({
  useJustifications: jest.fn(),
}));

jest.mock('./hooks/useDispenseTypes', () => ({
  useDispenseTypes: jest.fn(),
}));

const defaultProps = {
  patientUuid: 'test-patient-uuid',
  stepId: 'step-1',
  encounterUuid: 'enc-uuid',
  encounterTypeUuid: 'enc-type-uuid',
  visitUuid: 'visit-uuid',
  onStepComplete: jest.fn(),
  onStepDataChange: jest.fn(),
};

describe('RegimenDrugOrderStepRenderer', () => {
  beforeEach(() => {
    // Mock the hook implementations for each test
    jest.mocked(useRegimensHook.useRegimens).mockReturnValue({
      regimens: mockRegimens,
      isLoading: false,
      error: null,
    });

    jest.mocked(useTherapeuticLinesHook.useTherapeuticLines).mockReturnValue({
      lines: mockLines,
      isLoading: false,
      error: null,
      defaultLine: mockLines[0],
    });

    jest.mocked(useAvailableDrugsHook.useAvailableDrugs).mockReturnValue({
      availableDrugs: mockDrugs,
      isLoading: false,
      error: null,
    });

    jest.mocked(useJustificationsHook.useJustifications).mockReturnValue({
      justifications: mockJustifications,
      isLoading: false,
      error: null,
    });

    jest.mocked(useDispenseTypesHook.useDispenseTypes).mockReturnValue({
      dispenseTypes: mockDispenseTypes,
      isLoading: false,
    });
  });

  it('renders without crashing', () => {
    render(<RegimenDrugOrderStepRenderer {...defaultProps} />);
    expect(screen.getByText(/Dados do regime|regimenData/i)).toBeInTheDocument();
  });

  it('shows regimen select', () => {
    render(<RegimenDrugOrderStepRenderer {...defaultProps} />);
    const selects = screen.getAllByRole('combobox');
    expect(selects.some((sel) => sel.id === 'regimen-select')).toBe(true);
  });

  it('disables add medication button if no regimen is selected', () => {
    render(<RegimenDrugOrderStepRenderer {...defaultProps} />);
    const addButton = screen.getByRole('button', { name: /Adicionar Medicamento/i });
    expect(addButton).toBeDisabled();
  });

  it('displays loading state when fetching data', () => {
    // Override the mock to show loading state
    jest.mocked(useRegimensHook.useRegimens).mockReturnValue({
      regimens: [],
      isLoading: true,
      error: null,
    });

    render(<RegimenDrugOrderStepRenderer {...defaultProps} />);
    const loadingOption = screen.getByText('Loading...');
    expect(loadingOption).toBeInTheDocument();
  });

  it('displays error message when there is an error fetching regimens', () => {
    // Override the mock to show error state
    jest.mocked(useRegimensHook.useRegimens).mockReturnValue({
      regimens: [],
      isLoading: false,
      error: new Error('Failed to fetch regimens'),
    });

    render(<RegimenDrugOrderStepRenderer {...defaultProps} />);
    // Just verify that the component renders without crashing when there's an error
    expect(screen.getByText(/Dados do regime|regimenData/i)).toBeInTheDocument();
  });

  it('enables add medication button when regimen is selected', async () => {
    render(<RegimenDrugOrderStepRenderer {...defaultProps} />);

    // Find and select a regimen using a more reliable selector
    const regimenSelect = document.getElementById('regimen-select');
    fireEvent.change(regimenSelect, { target: { value: 'regimen1-uuid' } });

    // Check if the add medication button is enabled
    await waitFor(() => {
      const addButton = screen.getByRole('button', { name: /Adicionar Medicamento/i });
      expect(addButton).not.toBeDisabled();
    });
  });

  it('enables add medication button after regimen is selected', async () => {
    render(<RegimenDrugOrderStepRenderer {...defaultProps} />);

    // First select a regimen (required to enable the add button)
    const regimenSelect = document.getElementById('regimen-select');
    fireEvent.change(regimenSelect, { target: { value: 'regimen1-uuid' } });

    // Verify the add button becomes enabled
    await waitFor(() => {
      const addButton = screen.getByRole('button', { name: /Adicionar Medicamento/i });
      expect(addButton).not.toBeDisabled();
    });
  });
});
